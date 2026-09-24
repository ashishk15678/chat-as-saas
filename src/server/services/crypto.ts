import { createHash, randomBytes, timingSafeEqual, createHmac } from "crypto";

const pepper = () => process.env.ENCRYPTION_KEY ?? "";

/** API keys are shown once. Only the hash is stored. */
export function newApiKey() {
  const secret = `cl_live_${randomBytes(24).toString("base64url")}`;
  return { secret, prefix: secret.slice(0, 14), hash: hashKey(secret) };
}

export const hashKey = (secret: string) => createHash("sha256").update(secret + pepper()).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Identity verification for the widget: the customer signs their own user id
 * with their secret server-side, so a visitor cannot impersonate another.
 */
export const signVisitor = (visitorId: string, secret: string) =>
  createHmac("sha256", secret).update(visitorId).digest("hex");
