import { dequeueIngest } from "./queue";
import { ingestSource } from "../services/ingest";

/**
 * Run this as a separate always-on process (`npm run worker`).
 * Scale horizontally by starting more of them; the queue is the coordinator.
 */
const CONCURRENCY = Number(process.env.INGEST_CONCURRENCY ?? 4);
let running = 0;

async function loop() {
  while (true) {
    if (running >= CONCURRENCY) {
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }
    const sourceId = await dequeueIngest();
    if (!sourceId) {
      await new Promise((r) => setTimeout(r, 1_000));
      continue;
    }
    running++;
    ingestSource(sourceId)
      .catch((e) => console.error("ingest failed", sourceId, e))
      .finally(() => running--);
  }
}

loop();
