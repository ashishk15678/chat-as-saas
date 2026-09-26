import { randomUUID, createHmac, createHash } from "crypto";
import { UPLOAD } from "@/lib/constants";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Uploads never pass through the Next.js server. The browser PUTs straight to
 * object storage with a short-lived presigned URL, so a 25 MB file costs us nothing.
 */
export function objectKey(userId: string, chatbotId: string, filename: string) {
  const safe = filename.replace(/[^\w.\- ]+/g, "_").slice(-120);
  return `u/${userId}/b/${chatbotId}/${randomUUID()}-${safe}`;
}

export function assertUploadable(file: { type: string; size: number }) {
  if (!UPLOAD.accept[file.type])
    throw new Error(
      "That file type is not supported. Use PDF, DOCX, TXT, MD or CSV.",
    );
  if (file.size > UPLOAD.maxBytes)
    throw new Error(
      "Files can be up to 25 MB. Split the document and upload the parts.",
    );
}

type Presigned = { url: string; key: string; expiresIn: number };

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  // endpoint: process.env.S3_ENDPOINT, // e.g., https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  // forcePathStyle: true, // often required for MinIO/custom S3 endpoints
});

export async function presignPut(
  key: string,
  contentType: string,
  expiresIn = 300,
) {
  const bucket = process.env.S3_BUCKET!;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType, // Automatically signed into the request headers!
  });

  // Generate the official pre-signed URL securely
  const url = await getSignedUrl(s3Client, command, { expiresIn });

  return { url, key, expiresIn };
}

export async function fetchObject(key: string): Promise<Buffer> {
  const res = await fetch(
    `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
  );
  if (!res.ok) throw new Error(`Could not read ${key}`);
  return Buffer.from(await res.arrayBuffer());
}

import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function presignGet(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}
