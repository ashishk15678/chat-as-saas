import { dequeueIngest } from "./queue";
import { ingestSource } from "../services/ingest";

const rawConcurrency = process.env.INGEST_CONCURRENCY ?? "4";
const CONCURRENCY = parseInt(rawConcurrency, 10);

// Fix: validate concurrency before starting — reject NaN, 0, or negatives.
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1) {
  console.error(
    `[worker] INGEST_CONCURRENCY="${rawConcurrency}" is not a positive integer. Exiting.`,
  );
  process.exit(1);
}

let running = 0;

async function loop(): Promise<void> {
  while (true) {
    if (running >= CONCURRENCY) {
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    let sourceId: string | null;
    try {
      sourceId = await dequeueIngest();
    } catch (e) {
      // Fix: catch dequeue errors so a temporary queue outage doesn't kill the worker.
      console.error("[worker] dequeue error — retrying in 5 s:", e);
      await new Promise((r) => setTimeout(r, 5_000));
      continue;
    }

    if (!sourceId) {
      await new Promise((r) => setTimeout(r, 1_000));
      continue;
    }

    running++;
    ingestSource(sourceId)
      .catch((e) => console.error("[worker] ingest failed", sourceId, e))
      .finally(() => running--);
  }
}

// Fix: catch a top-level loop rejection (shouldn't happen now, but belt-and-suspenders).
loop().catch((e) => {
  console.error("[worker] fatal loop error:", e);
  process.exit(1);
});
