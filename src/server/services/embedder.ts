import { google } from "@ai-sdk/google";

/**
 * gemini-embedding-001 supports output truncation via outputDimensionality.
 * We cap at 768 so embeddings fit the pgvector(768) column and stay under
 * the HNSW 2000-dim index limit. Quality loss at this size is negligible
 * for support-style retrieval.
 */
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
