import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { Meter } from "@/components/shared/stat";
import { StatusDot } from "@/components/shared/status-dot";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CancelPlan } from "./cancel-plan";
import { count } from "@/lib/format";

export default async function BillingPage() {
  const { usage, subscription } = await api.billing.summary();

  return (
    <>
      <PageHeader
        title="Plan and usage"
        description="Billing runs on Razorpay. Invoices are emailed after each charge."
      />

      <div className="panel-pad space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-medium">{usage.limits.name}</p>
            <p className="text-muted-foreground text-sm">
              {subscription?.currentPeriodEnd
                ? `${subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} on ${subscription.currentPeriodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                : "No renewal scheduled"}
            </p>
          </div>
          <StatusDot status={subscription?.status ?? "ACTIVE"} />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Meter
            label={`Messages (${count(usage.messages)} of ${count(usage.limits.messages)})`}
            value={usage.messages}
            max={usage.limits.messages}
          />
          <Meter
            label={`Sources (${usage.storedMb} of ${usage.limits.storageMb} MB)`}
            value={usage.storedMb}
            max={usage.limits.storageMb}
          />
          <Meter
            label={`Chatbots (${usage.bots} of ${usage.limits.bots})`}
            value={usage.bots}
            max={usage.limits.bots}
          />
        </div>

        {usage.plan !== "free" && !subscription?.cancelAtPeriodEnd && (
          <CancelPlan />
        )}
      </div>

      <h2 className="mt-10 mb-4 font-medium">Change plan</h2>
      <PricingTable currentPlan={usage.plan} signedIn />
    </>
  );
}
