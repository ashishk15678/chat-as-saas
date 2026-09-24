import { randomUUID, createHmac } from "crypto";
import { UPLOAD } from "@/lib/constants";

/**
 * Uploads never pass through the Next.js server. The browser PUTs straight to
 * object storage with a short-lived presigned URL, so a 25 MB file costs us nothing.
 */
export function objectKey(userId: string, chatbotId: string, filename: string) {
  const safe = filename.replace(/[^\w.\- ]+/g, "_").slice(-120);
  return `u/${userId}/b/${chatbotId}/${randomUUID()}-${safe}`;
}

export function assertUploadable(file: { type: string; size: number }) {
  if (!UPLOAD.accept[file.type]) throw new Error("That file type is not supported. Use PDF, DOCX, TXT, MD or CSV.");
  if (file.size > UPLOAD.maxBytes) throw new Error("Files can be up to 25 MB. Split the document and upload the parts.");
}

type Presigned = { url: string; key: string; expiresIn: number };

/**
 * Minimal S3-compatible presigner (works with S3, R2, Wasabi, MinIO).
 * Swap for @aws-sdk/s3-request-presigner if you prefer the official client.
 */
export async function presignPut(key: string, contentType: string, expiresIn = 300): Promise<Presigned> {
  const endpoint = process.env.S3_ENDPOINT!;
  const bucket = process.env.S3_BUCKET!;
  const host = new URL(endpoint).host;
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const date = stamp.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const q = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${process.env.S3_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": stamp,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });
  const canonical = [
    "PUT",
    `/${bucket}/${key}`,
    q.toString(),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const sha = (s: string) => require("crypto").createHash("sha256").update(s).digest("hex");
  const sign = (k: Buffer | string, m: string) => createHmac("sha256", k).update(m).digest();
  const toSign = ["AWS4-HMAC-SHA256", stamp, scope, sha(canonical)].join("\n");
  let key0: Buffer | string = `AWS4${process.env.S3_SECRET_ACCESS_KEY}`;
  for (const part of [date, "auto", "s3", "aws4_request"]) key0 = sign(key0, part);
  q.set("X-Amz-Signature", createHmac("sha256", key0).update(toSign).digest("hex"));
  return { url: `${endpoint}/${bucket}/${key}?${q}`, key, expiresIn };
}

export async function fetchObject(key: string): Promise<Buffer> {
  const res = await fetch(`${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`);
  if (!res.ok) throw new Error(`Could not read ${key}`);
  return Buffer.from(await res.arrayBuffer());
}
