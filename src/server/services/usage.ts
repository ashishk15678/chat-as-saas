import { db } from "../db";
import { PLANS, type PlanId } from "@/lib/constants";
import { period } from "@/lib/format";

export async function planFor(userId: string): Promise<PlanId> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  if (!sub || sub.status === "CANCELLED") return "free";
  return (sub.plan as PlanId) ?? "free";
}

export async function usageFor(userId: string) {
  const [plan, counter, bots] = await Promise.all([
    planFor(userId),
    db.usageCounter.findUnique({
      where: { userId_period: { userId, period: period() } },
    }),
    db.chatbot.count({ where: { ownerId: userId } }),
  ]);
  const limits = PLANS[plan];
  return {
    plan,
    limits,
    messages: counter?.messages ?? 0,
    storedMb: counter?.storedMb ?? 0,
    bots,
  };
}

/** Atomic increment. Never read-modify-write a counter. */
export async function recordUsage(
  userId: string,
  delta: { messages?: number; storedMb?: number },
) {
  const p = period();
  await db.usageCounter.upsert({
    where: { userId_period: { userId, period: p } },
    create: {
      userId,
      period: p,
      messages: delta.messages ?? 0,
      storedMb: delta.storedMb ?? 0,
    },
    update: {
      messages: { increment: delta.messages ?? 0 },
      storedMb: { increment: delta.storedMb ?? 0 },
    },
  });
}

export type Quota = "bots" | "messages" | "storageMb";

/** Returns null when allowed, or a human sentence when the plan is exhausted. */
export async function quotaError(userId: string, quota: Quota, adding = 1) {
  const u = await usageFor(userId);
  const used =
    quota === "bots" ? u.bots : quota === "messages" ? u.messages : u.storedMb;
  const cap =
    quota === "bots"
      ? u.limits.bots
      : quota === "messages"
        ? u.limits.messages
        : u.limits.storageMb;
  if (used + adding <= cap) return null;
  const noun =
    quota === "bots"
      ? "chatbots"
      : quota === "messages"
        ? "messages this month"
        : "MB of sources";
  return `The ${u.limits.name} plan includes ${cap} ${noun}. Upgrade to add more.`;
}
