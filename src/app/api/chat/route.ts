import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { answer } from "@/server/services/rag";
import { takeToken } from "@/server/services/rate-limit";
import { quotaError, recordUsage } from "@/server/services/usage";
import { signVisitor, safeEqual } from "@/server/services/crypto";
import { chatRequest } from "@/lib/validators";

export const runtime = "nodejs";
export const maxDuration = 60;

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "content-type, x-visitor-hash",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req.headers.get("origin") ?? "*") });
}

/**
 * The only unauthenticated write path in the product. Order matters:
 * origin → rate limit → quota → retrieval → stream. Each gate is cheap
 * relative to the one after it.
 */
export async function POST(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const headers = cors(origin || "*");

  const body = chatRequest.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  const { chatbotId, conversationId, visitorId, message, visitorMail } = body.data;

  const bot = await db.chatbot.findUnique({
    where: { id: chatbotId },
    select: { id: true, ownerId: true, status: true, systemPrompt: true, model: true, temperature: true, allowedDomains: true, rateLimitRpm: true },
  });
  if (!bot || bot.status !== "LIVE") return NextResponse.json({ error: "This assistant is not available." }, { status: 404, headers });

  // Origin allowlist. Host only, so a path cannot be used to slip past it.
  if (bot.allowedDomains.length) {
    const host = origin ? new URL(origin).hostname : "";
    const allowed = bot.allowedDomains.some((d) => (d.startsWith("*.") ? host.endsWith(d.slice(1)) : host === d));
    if (!allowed) return NextResponse.json({ error: "This assistant is not enabled on this domain." }, { status: 403, headers });
  }

  // Optional identity check for customers who sign their visitor ids.
  const hash = req.headers.get("x-visitor-hash");
  if (hash) {
    const secret = process.env.ENCRYPTION_KEY ?? "";
    if (!safeEqual(signVisitor(visitorId, secret), hash))
      return NextResponse.json({ error: "Visitor could not be verified." }, { status: 401, headers });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const gate = await takeToken("chat", `${bot.id}:${ip}`, bot.rateLimitRpm);
  if (!gate.ok)
    return NextResponse.json({ error: "Too many messages. Give it a moment." }, { status: 429, headers: { ...headers, "Retry-After": String(gate.retryAfter) } });

  const overQuota = await quotaError(bot.ownerId, "messages");
  if (overQuota) return NextResponse.json({ error: "This assistant has reached its monthly limit. The team has been notified." }, { status: 402, headers });

  // Conversations are keyed by visitor, so a refresh does not orphan the thread.
  const conversation = conversationId
    ? await db.conversation.update({ where: { id: conversationId, chatbotId: bot.id }, data: { lastAt: new Date(), visitorMail } })
    : await db.conversation.create({ data: { chatbotId: bot.id, visitorId, origin, visitorMail } });

  const history = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 12,
    select: { role: true, content: true },
  });

  await db.message.create({ data: { conversationId: conversation.id, role: "user", content: message } });

  const { result, citations } = await answer(bot, [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message },
  ]);

  // Persist and meter after the stream finishes, so the visitor never waits on writes.
  void result.text.then(async (text) => {
    await db.message.create({
      data: { conversationId: conversation.id, role: "assistant", content: text, citations: citations.length ? citations : undefined },
    });
    await recordUsage(bot.ownerId, { messages: 1 });
  });

  const res = result.toTextStreamResponse();
  Object.entries({ ...headers, "x-conversation-id": conversation.id }).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
