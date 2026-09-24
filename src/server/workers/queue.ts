import { Redis } from "@upstash/redis";
import { ingestSource } from "../services/ingest";

const redis = Redis.fromEnv();
const QUEUE = "ingest:queue";

/**
 * Ingestion is slow and bursty, so requests never wait on it.
 * In development there is no worker running, so we process inline.
 */
export async function enqueueIngest(sourceId: string) {
  if (process.env.NODE_ENV !== "production") {
    void ingestSource(sourceId);
    return;
  }
  await redis.lpush(QUEUE, sourceId);
}

export async function dequeueIngest(): Promise<string | null> {
  return (await redis.rpop<string>(QUEUE)) ?? null;
}
