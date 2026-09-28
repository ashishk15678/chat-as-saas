"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function CancelPlan() {
  const trpc = useTRPC();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const cancel = useMutation(
    trpc.billing.cancel.mutationOptions({
      onSuccess: () => {
        toast.success("Your plan ends at the close of this billing cycle. You keep full access until then.");
        setConfirming(false);
        router.refresh();
      },
      onError: (e) => {
        toast.error(e.message ?? "Something went wrong. Try again or contact support.");
        setConfirming(false);
      },
    }),
  );

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-destructive hover:underline"
      >
        Cancel plan at period end
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">Cancel your plan?</p>
      <p className="mt-1 text-xs text-muted-foreground leading-5">
        You'll keep access until the end of the current billing cycle. After that your account
        reverts to the free plan and chatbots over the free limit will be paused.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => cancel.mutate()}
          disabled={cancel.isPending}
          className="rounded-lg bg-destructive px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancel.isPending ? "Cancelling…" : "Yes, cancel plan"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={cancel.isPending}
          className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
        >
          Keep plan
        </button>
      </div>
    </div>
  );
}
