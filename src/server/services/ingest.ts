import { embedMany } from "ai";
import { db } from "../db";
import { embedder, EMBED_BATCH, pace } from "./embedder";
import { RAG } from "@/lib/constants";

export const estimateTokens = (s: string) => Math.ceil(s.length / 4);

export function chunk(text: string): string[] {
  const clean = text
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

async function embedWithRetry(
  values: string[],
  attempt = 0,
): Promise<number[][]> {
  try {
    const { embeddings } = await embedMany({ model: embedder, values });
    return embeddings;
  } catch (e) {
    if (attempt >= 3) throw e;
    await new Promise((r) => setTimeout(r, 2 ** attempt * 1_000));
    return embedWithRetry(values, attempt + 1);
  }
}

/**
 * Extract plain text from a source row.
 * For FILE sources the caller must pass the raw buffer directly — the file is
 * already in memory and we never re-fetch it from S3 during in-memory processing.
 */
export async function extractText(
  source: { type: string; location: string; title: string },
  fileBuffer?: Buffer,
): Promise<string> {
  switch (source.type) {
    case "FILE": {
      const buf = fileBuffer ?? Buffer.alloc(0);
      if (source.title.toLowerCase().endsWith(".pdf")) {
        const pdfParse = await import("pdf-parse");
        const pdf = (pdfParse as any).default ?? pdfParse;
        return (await pdf(buf)).text;
      }
      return buf.toString("utf8");
    }
    case "URL": {
      const res = await fetch(source.location, {
        headers: { "user-agent": "ChatlineBot/1.0" },
      });
      const html = await res.text();
      return html
        .replace(
          /<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>/gi,
          " ",
        )
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ");
    }
    default:
      return source.location; // TEXT and FAQ store content inline
  }
}

/**
 * Process a source entirely in memory: extract → chunk → embed.
 * Returns the pieces and their embeddings. Throws on any failure.
 * Nothing is written to the DB or S3 until the caller decides to commit.
 */
export async function processSource(
  source: { type: string; location: string; title: string },
  fileBuffer?: Buffer,
): Promise<{ pieces: string[]; embeddings: number[][] }> {
  const text = await extractText(source, fileBuffer);
  const pieces = chunk(text);
  if (!pieces.length) throw new Error("No readable text found in this source.");

  const allEmbeddings: number[][] = [];
  for (let i = 0; i < pieces.length; i += EMBED_BATCH) {
    const batch = pieces.slice(i, i + EMBED_BATCH);
    const batchEmbeddings = await embedWithRetry(batch);
    allEmbeddings.push(...batchEmbeddings);
    if (i + EMBED_BATCH < pieces.length) await pace();
  }

  return { pieces, embeddings: allEmbeddings };
}

/**
 * Commit pre-processed chunks to the database.
 * Called only after processSource() succeeds.
 */
export async function commitChunks(
  sourceId: string,
  chatbotId: string,
  pieces: string[],
  embeddings: number[][],
): Promise<number> {
  await db.chunk.deleteMany({ where: { sourceId } });
  let tokens = 0;
  for (let i = 0; i < pieces.length; i += EMBED_BATCH) {
    const batch = pieces.slice(i, i + EMBED_BATCH);
    await db.$transaction(
      batch.map(
        (content, n) =>
          db.$executeRaw`INSERT INTO "Chunk" (id, "sourceId", "chatbotId", content, tokens, embedding)
          VALUES (gen_random_uuid()::text, ${sourceId}, ${chatbotId}, ${content}, ${estimateTokens(content)},
                  ${JSON.stringify(embeddings[i + n])}::vector)`,
      ),
    );
    tokens += batch.reduce((a, c) => a + estimateTokens(c), 0);
  }
  return tokens;
}

/**
 * Legacy worker path: re-process a source that already exists in the DB/S3.
 * Used by the retry button and the background ingest worker.
 */
export async function ingestSource(sourceId: string) {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  if (!source) return;
  await db.source.update({
    where: { id: sourceId },
    data: { status: "PROCESSING", error: null },
  });

  try {
    // For FILE sources, fetch from S3 here (the file was already committed on creation)
    let fileBuffer: Buffer | undefined;
    if (source.type === "FILE") {
      const { fetchObject } = await import("./storage");
      fileBuffer = await fetchObject(source.location);
    }

    const { pieces, embeddings } = await processSource(source, fileBuffer);
    const tokens = await commitChunks(
      sourceId,
      source.chatbotId,
      pieces,
      embeddings,
    );
    await db.source.update({
      where: { id: sourceId },
      data: { status: "READY", tokens },
    });
  } catch (e) {
    await db.source.update({
      where: { id: sourceId },
      data: {
        status: "FAILED",
        error: e instanceof Error ? e.message : "Processing failed",
      },
    });
  }
}
