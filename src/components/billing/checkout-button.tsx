"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { PlanId } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Not in browser"));
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay SDK failed to load. Check your network."));
    document.head.appendChild(s);
  });
}

/**
 * Security notes:
 * - The subscription ID and key are minted server-side; the client never
 *   sets or overrides the price or plan.
 * - Signature verification (HMAC-SHA256) happens in confirmCheckout on the
 *   server before any plan upgrade is applied.
 * - The webhook is the authoritative source of truth; this mutation only
 *   provides a fast-path UX improvement.
 */
export function CheckoutButton({
  plan,
  label,
  variant = "default",
  className,
}: {
  plan: Exclude<PlanId, "free">;
  label: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const trpc = useTRPC();
  const [busy, setBusy] = useState(false);

  const start   = useMutation(trpc.billing.startCheckout.mutationOptions());
  const confirm = useMutation(trpc.billing.confirmCheckout.mutationOptions());

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    try {
      await loadRazorpay();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load payment SDK.");
      setBusy(false);
      return;
    }

    let checkoutData: Awaited<ReturnType<typeof start.mutateAsync>>;
    try {
      checkoutData = await start.mutateAsync({ plan });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(false);
      return;
    }

    const { subscriptionId, keyId, plan: p } = checkoutData;

    new window.Razorpay!({
      key: keyId,
      subscription_id: subscriptionId,
      name: "Chatline",
      description: `${p.name} plan · billed monthly`,
      image: "",
      theme: { color: "#5de000" },
      modal: {
        escape: true,
        ondismiss: () => setBusy(false),
      },
      handler: async (res: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
        try {
          await confirm.mutateAsync({ plan, ...res });
          toast.success(`You're on ${p.name}. New limits are live immediately.`);
          // Hard reload so all server components re-fetch the updated plan
          window.location.href = "/dashboard/billing";
        } catch {
          // Webhook will apply the plan within ~60 s — don't alarm the user
          toast.success("Payment received. Your plan will update within a minute.");
          setBusy(false);
        }
      },
    }).open();
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
      className={cn(
        "press inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default"
          ? "bg-foreground text-background hover:bg-accent hover:text-foreground"
          : "border border-border hover:border-accent/60",
        className,
      )}
    >
      {busy ? (
        <span className="flex items-center gap-2">
          <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Opening checkout…
        </span>
      ) : (
        label
      )}
    </button>
  );
}
