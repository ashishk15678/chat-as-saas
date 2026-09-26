"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import type { PlanId } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SDK = "https://checkout.razorpay.com/v1/checkout.js";

function loadSdk() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = SDK;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay could not be reached"));
    document.body.appendChild(s);
  });
}

/**
 * Checkout runs entirely against ids minted on our server, so the price can
 * never be tampered with in the browser. The webhook is what finally grants access.
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
  const start = useMutation(trpc.billing.startCheckout.mutationOptions());
  const confirm = useMutation(trpc.billing.confirmCheckout.mutationOptions());

  async function pay() {
    setBusy(true);
    try {
      await loadSdk();
      const {
        subscriptionId,
        keyId,
        plan: p,
      } = await start.mutateAsync({ plan });
      new window.Razorpay!({
        key: keyId,
        subscription_id: subscriptionId,
        name: "Chatline",
        description: `${p.name} plan, billed monthly`,
        theme: { color: "#4F46E5" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (res: any) => {
          try {
            await confirm.mutateAsync({ plan, ...res });
            toast.success(`You are on ${p.name}. New limits are live.`);
            window.location.reload();
          } catch {
            toast.error(
              "Payment received. Access will unlock within a minute.",
            );
          }
        },
      }).open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout could not start");
      setBusy(false);
    }
  }

  return (
    <Button
      onClick={pay}
      disabled={busy}
      variant={variant}
      className={className}
    >
      {busy ? "Opening checkout…" : label}
    </Button>
  );
}
