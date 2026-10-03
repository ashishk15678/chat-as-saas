import { groq } from "@ai-sdk/groq";
import { embed, streamText } from "ai";
import { db } from "../db";
import { embedder } from "./embedder";
import { RAG } from "@/lib/constants";

export type Citation = { sourceId: string; title: string };
type Retrieved = {
  content: string;
  sourceId: string;
  title: string;
  score: number;
};

export async function retrieve(
  chatbotId: string,
  query: string,
): Promise<Retrieved[]> {
  const { embedding } = await embed({
    model: embedder,
    value: query,
    providerOptions: { google: { outputDimensionality: 768 } },
  });
  const vec = JSON.stringify(embedding);
  const rows = await db.$queryRaw<Retrieved[]>`
    SELECT c.content, c."sourceId", s.title, 1 - (c.embedding <=> ${vec}::vector) AS score
    FROM "Chunk" c
    JOIN "Source" s ON s.id = c."sourceId"
    WHERE c."chatbotId" = ${chatbotId} AND s.status = 'READY'
    ORDER BY c.embedding <=> ${vec}::vector
    LIMIT ${RAG.topK}`;
  return rows.filter((r) => r.score >= RAG.minScore);
}

export function buildContext(rows: Retrieved[]) {
  let used = 0;
  const parts: string[] = [];
  const citations: Citation[] = [];
  for (const r of rows) {
    // Fix: skip oversized chunks instead of breaking so later smaller chunks can still be included.
    if (r.content.length > RAG.maxContextChars) continue;
    if (used + r.content.length > RAG.maxContextChars) continue;
    parts.push(`[${r.title}]\n${r.content}`);
    used += r.content.length;
    if (!citations.some((c) => c.sourceId === r.sourceId))
      citations.push({ sourceId: r.sourceId, title: r.title });
  }
  return { context: parts.join("\n\n---\n\n"), citations };
}

export async function answer(
  bot: {
    id: string;
    systemPrompt: string;
    fallbackMessage: string;
    model: string;
    temperature: number;
  },
  history: { role: "user" | "assistant"; content: string }[],
) {
  const question = history.at(-1)?.content ?? "";
  const rows = await retrieve(bot.id, question);
  const { context, citations } = buildContext(rows);
  // Fix: derive grounded from whether any chunks were actually included in context,
  // not just whether rows were retrieved (a retrieved-but-skipped chunk is not grounded).
  const grounded = citations.length > 0;

  const result = streamText({
    model: groq(bot.model),
    temperature: bot.temperature,
    maxOutputTokens: 700,
    system: `${bot.systemPrompt}

Use only the context below to answer. If the context does not contain the answer, respond with this exact fallback message — do not modify it: "${bot.fallbackMessage}"

Never say you were given context. Keep answers under six sentences.

Context:
${context || "(no matching documents)"}`,
    messages: history,
  });

  return { result, citations, grounded: citations.length > 0 };
}
