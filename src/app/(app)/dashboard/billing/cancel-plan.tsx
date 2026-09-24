"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

export function CancelPlan() {
  const trpc = useTRPC();
  const router = useRouter();
  const cancel = useMutation(
    trpc.billing.cancel.mutationOptions({
      onSuccess: () => {
        toast.success("Your plan ends at the close of this cycle.");
        router.refresh();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <button
      onClick={() => confirm("Cancel at the end of this billing cycle? You keep access until then.") && cancel.mutate()}
      disabled={cancel.isPending}
      className="text-muted-foreground hover:text-destructive text-sm transition-colors"
    >
      Cancel plan
    </button>
  );
}
