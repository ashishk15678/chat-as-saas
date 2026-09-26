import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const cache = new Map<string, Ratelimit>();

/** Sliding window, shared across instances. One limiter object per (name, rpm). */
function limiter(name: string, rpm: number) {
  const key = `${name}:${rpm}`;
  let l = cache.get(key);
  if (!l) {
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(rpm, "1 m"),
      prefix: `rl:${name}`,
      analytics: true,
    });
    cache.set(key, l);
  }
  return l;
}

export async function takeToken(name: string, subject: string, rpm: number) {
  const { success, reset, remaining } = await limiter(name, rpm).limit(subject);
  return {
    ok: success,
    remaining,
    retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };
}

export const LIMITS = { chat: 20, mutation: 60, upload: 20, auth: 10 } as const;
