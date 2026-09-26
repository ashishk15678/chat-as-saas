import { google } from "@ai-sdk/google";

/**
 * gemini-embedding-001 on Google's free tier: no card on file, 100 requests a
 * minute, 30,000 tokens a minute, 1,000 requests a day, 2,048 tokens per text.
 * Output is truncated to 768 dimensions — smaller than the 3072 default, which
 * halves storage and keeps pgvector's HNSW index fast, at a negligible quality
 * cost for support-style retrieval. This is one line to swap for a paid
 * provider later; nothing else in the ingestion or retrieval path changes.
 */
export const EMBED_DIMENSIONS = 768;

export const embedder = google.textEmbeddingModel("gemini-embedding-001");

/** Chunks per embedding request. Tuned to stay under the free tier's per-minute token ceiling. */
export const EMBED_BATCH = 24;

/**
 * A short pause between ingestion batches. Cheap insurance against the free
 * tier's 100 requests/minute cap when a large document produces many batches
 * back to back; a paid tier can drop this to 0.
 */
const PACE_MS = Number(process.env.EMBED_PACE_MS ?? 650);
export const pace = () => new Promise((r) => setTimeout(r, PACE_MS));
