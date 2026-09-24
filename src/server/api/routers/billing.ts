import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, writeProcedure } from "../trpc";
import { ensureCustomer, createSubscription, cancelSubscription, verifyCheckout } from "../../services/razorpay";
import { usageFor } from "../../services/usage";
import { PLANS } from "@/lib/constants";

const paidPlan = z.enum(["starter", "growth", "scale"]);

export const billingRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const [usage, sub] = await Promise.all([
      usageFor(ctx.user.id),
      ctx.db.subscription.findUnique({ where: { userId: ctx.user.id } }),
    ]);
    return { usage, subscription: sub };
  }),

  /** Opens a Razorpay subscription. The client hands the id to Checkout. */
  startCheckout: writeProcedure.input(z.object({ plan: paidPlan })).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUniqueOrThrow({ where: { id: ctx.user.id }, include: { subscription: true } });
    if (user.subscription?.plan === input.plan && user.subscription.status === "ACTIVE")
      throw new TRPCError({ code: "BAD_REQUEST", message: `You are already on ${PLANS[input.plan].name}.` });

    const customerId = await ensureCustomer({
      id: user.id, email: user.email, name: user.name, existingId: user.subscription?.razorpayCustomerId,
    });
    const sub = await createSubscription({ plan: input.plan, customerId, userId: user.id }) as { id: string };

    await ctx.db.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, plan: "free", razorpayCustomerId: customerId },
      update: { razorpayCustomerId: customerId },
    });

    return { subscriptionId: sub.id, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, plan: PLANS[input.plan] };
  }),

  /**
   * Called when Checkout closes. This only improves the user's wait —
   * the webhook remains the authority on what the subscription actually is.
   */
  confirmCheckout: writeProcedure
    .input(z.object({
      plan: paidPlan,
      razorpay_payment_id: z.string(),
      razorpay_subscription_id: z.string(),
      razorpay_signature: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!verifyCheckout(input)) throw new TRPCError({ code: "BAD_REQUEST", message: "We could not verify that payment." });
      await ctx.db.subscription.update({
        where: { userId: ctx.user.id },
        data: { plan: input.plan, status: "ACTIVE", razorpaySubId: input.razorpay_subscription_id, cancelAtPeriodEnd: false },
      });
      return { plan: input.plan };
    }),

  cancel: writeProcedure.mutation(async ({ ctx }) => {
    const sub = await ctx.db.subscription.findUnique({ where: { userId: ctx.user.id } });
    if (!sub?.razorpaySubId) throw new TRPCError({ code: "BAD_REQUEST", message: "There is no paid plan to cancel." });
    await cancelSubscription(sub.razorpaySubId, true);
    await ctx.db.subscription.update({ where: { userId: ctx.user.id }, data: { cancelAtPeriodEnd: true } });
    return { ok: true };
  }),
});
