import { NextResponse } from "next/server";
import { db } from "@/server/db";
import {
  verifyWebhook,
  planFromRazorpayPlanId,
} from "@/server/services/razorpay";

export const runtime = "nodejs";

type Status = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED";

const STATUS_BY_EVENT: Record<string, Status> = {
  "subscription.activated": "ACTIVE",
  "subscription.charged": "ACTIVE",
  "subscription.resumed": "ACTIVE",
  "subscription.pending": "PAST_DUE",
  "subscription.halted": "PAST_DUE",
  "subscription.paused": "PAUSED",
  "subscription.cancelled": "CANCELLED",
  "subscription.completed": "CANCELLED",
};

/**
 * The webhook, not the browser, is the source of truth for entitlements.
 * Raw body is verified before parsing, and the event id is the idempotency key,
 * so Razorpay's retries are harmless.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhook(raw, signature))
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });

  const event = JSON.parse(raw) as {
    event: string;
    payload: { subscription?: { entity: any } };
  };
  const eventId =
    req.headers.get("x-razorpay-event-id") ?? `${event.event}:${Date.now()}`;

  const sub = event.payload.subscription?.entity;
  const status = STATUS_BY_EVENT[event.event];
  if (!sub || !status)
    return NextResponse.json({ ok: true, ignored: event.event });

  const userId: string | undefined = sub.notes?.userId;
  if (!userId)
    return NextResponse.json({ ok: true, ignored: "no userId in notes" });

  await db.subscription.update({
    where: { userId },
    data: {
      status,
      plan:
        status === "CANCELLED" ? "free" : planFromRazorpayPlanId(sub.plan_id),
      razorpaySubId: sub.id,
      currentPeriodEnd: sub.current_end
        ? new Date(sub.current_end * 1000)
        : null,
      cancelAtPeriodEnd: Boolean(sub.end_at) && status !== "CANCELLED",
    },
  });

  try {
    await db.paymentEvent.create({
      data: { id: eventId, type: event.event, payload: event as any },
    });
  } catch (e: any) {
    // Fix: only treat a unique-constraint violation (P2002) as a duplicate.
    // Other database errors should propagate so Razorpay retries.
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
