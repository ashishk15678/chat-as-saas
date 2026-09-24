import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { db } from "../db";
import { fetchObject } from "./storage";
import { RAG } from "@/lib/constants";

const embedder = openai.embedding(process.env.EMBEDDING_MODEL ?? "text-embedding-3-small");

/** Rough token estimate; good enough for quota display, cheap enough for every chunk. */
export const estimateTokens = (s: string) => Math.ceil(s.length / 4);

export function chunk(text: string) {
  const clean = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + RAG.chunkChars, clean.length);
    if (end < clean.length) {
      const brk = clean.lastIndexOf("\n\n", end);
      if (brk > i + RAG.chunkChars * 0.5) end = brk;
    }
    const piece = clean.slice(i, end).trim();
    if (piece) out.push(piece);
    i = end - RAG.chunkOverlap;
    if (i < 0) i = 0;
    if (end === clean.length) break;
  }
  return out;
}

async function extract(source: { type: string; location: string; title: string }) {
  switch (source.type) {
    case "FILE": {
      const buf = await fetchObject(source.location);
      if (source.title.toLowerCase().endsWith(".pdf")) {
        const pdfParse = await import("pdf-parse");
        const pdf = (pdfParse as any).default ?? pdfParse;
        return (await pdf(buf)).text;
      }
      return buf.toString("utf8");
    }
    case "URL": {
      const res = await fetch(source.location, { headers: { "user-agent": "ChatlineBot/1.0" } });
      const html = await res.text();
      return html
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ");
    }
    default:
      return source.location; // TEXT and FAQ store their content inline
  }
}

/**
 * Idempotent: deletes prior chunks first, so a retry never duplicates context.
 * Runs in the worker, not in a request.
 */
export async function ingestSource(sourceId: string) {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  if (!source) return;
  await db.source.update({ where: { id: sourceId }, data: { status: "PROCESSING", error: null } });

  try {
    const text = await extract(source);
    const pieces = chunk(text);
    if (!pieces.length) throw new Error("No readable text found in this source.");

    await db.chunk.deleteMany({ where: { sourceId } });

    let tokens = 0;
    for (let i = 0; i < pieces.length; i += 96) {
      const batch = pieces.slice(i, i + 96);
      const { embeddings } = await embedMany({ model: embedder, values: batch });
      await db.$transaction(
        batch.map((content, n) =>
          db.$executeRaw`INSERT INTO "Chunk" (id, "sourceId", "chatbotId", content, tokens, embedding)
            VALUES (gen_random_uuid()::text, ${sourceId}, ${source.chatbotId}, ${content}, ${estimateTokens(content)},
                    ${JSON.stringify(embeddings[n])}::vector)`,
        ),
      );
      tokens += batch.reduce((a, c) => a + estimateTokens(c), 0);
    }

    await db.source.update({ where: { id: sourceId }, data: { status: "READY", tokens } });
  } catch (e) {
    await db.source.update({
      where: { id: sourceId },
      data: { status: "FAILED", error: e instanceof Error ? e.message : "Processing failed" },
    });
  }
}
