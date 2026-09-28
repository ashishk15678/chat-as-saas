import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { Meter } from "@/components/shared/stat";
import { StatusPill } from "@/components/shared/status-dot";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CancelPlan } from "./cancel-plan";
import { count } from "@/lib/format";

export default async function BillingPage() {
  const { usage, subscription } = await api.billing.summary();

  const renewLabel = subscription?.currentPeriodEnd
    ? `${subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} ${subscription.currentPeriodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
    : "No renewal scheduled";

  return (
    <>
      <PageHeader
        title="Plan & usage"
        description="Billing runs on Razorpay. Invoices are emailed after each charge."
      />

      {/* Current plan card */}
      <div className="panel-pad space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">{usage.limits.name} plan</p>
            <p className="text-muted-foreground mt-0.5 text-sm">{renewLabel}</p>
          </div>
          <StatusPill status={subscription?.status ?? "ACTIVE"} />
        </div>

        {/* Usage meters */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Meter
            label={`Messages — ${count(usage.messages)} / ${count(usage.limits.messages)}`}
            value={usage.messages}
            max={usage.limits.messages}
          />
          <Meter
            label={`Sources — ${usage.storedMb} / ${usage.limits.storageMb} MB`}
            value={usage.storedMb}
            max={usage.limits.storageMb}
          />
          <Meter
            label={`Chatbots — ${usage.bots} / ${usage.limits.bots}`}
            value={usage.bots}
            max={usage.limits.bots}
          />
        </div>

        {/* Cancel — only shown when on a paid active plan */}
        {usage.plan !== "free" && !subscription?.cancelAtPeriodEnd && (
          <div className="border-t border-border pt-4">
            <CancelPlan />
          </div>
        )}
      </div>

      {/* Plan picker */}
      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold">Change plan</p>
        <PricingTable currentPlan={usage.plan} signedIn />
      </div>
    </>
  );
}
