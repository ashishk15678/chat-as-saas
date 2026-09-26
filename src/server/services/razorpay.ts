import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { safeEqual } from "./crypto";
import { PLANS, type PlanId } from "@/lib/constants";

export const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/** Create (or reuse) the Razorpay customer that mirrors our user. */
export async function ensureCustomer(u: {
  id: string;
  email: string;
  name?: string | null;
  existingId?: string | null;
}) {
  if (u.existingId) return u.existingId;
  const customer = await rzp.customers.create({
    name: u.name ?? u.email,
    email: u.email,
    fail_existing: 0,
    notes: { userId: u.id },
  });
  return customer.id;
}

export async function createSubscription(params: {
  plan: PlanId;
  customerId: string;
  userId: string;
}) {
  const planId = PLANS[params.plan].razorpayPlanId;
  if (!planId)
    throw new Error(`No Razorpay plan configured for ${params.plan}`);
  return rzp.subscriptions.create({
    plan_id: planId,
    customer_id: params.customerId,
    total_count: 120,
    quantity: 1,
    customer_notify: 1,
    notes: { userId: params.userId, plan: params.plan },
  } as Parameters<typeof rzp.subscriptions.create>[0]);
}

export const cancelSubscription = (subId: string, atCycleEnd = true) =>
  rzp.subscriptions.cancel(subId, atCycleEnd);

/** Checkout handshake: signature = HMAC(payment_id + '|' + subscription_id). */
export function verifyCheckout(p: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}) {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${p.razorpay_payment_id}|${p.razorpay_subscription_id}`)
    .digest("hex");
  return safeEqual(expected, p.razorpay_signature);
}

/** Webhook: signature is over the exact raw body. Never parse before verifying. */
export function verifyWebhook(rawBody: string, signature: string) {
  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
}

export const planFromRazorpayPlanId = (planId?: string): PlanId =>
  (Object.values(PLANS).find((p) => p.razorpayPlanId === planId)
    ?.id as PlanId) ?? "free";
