"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/constants";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Used on the marketing page (signed out) and in billing (signed in). */
export function PricingTable({ currentPlan, signedIn = false }: { currentPlan?: PlanId; signedIn?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id];
        const current = currentPlan === id;
        const featured = id === "growth";
        return (
          <div
            key={id}
            className={cn(
              "panel flex flex-col p-6",
              featured && "border-primary ring-primary/15 ring-1",
              current && "bg-primary-muted/40",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{plan.name}</h3>
              {featured && !current && <span className="bg-primary-muted text-accent-foreground rounded-md px-2 py-0.5 text-xs">Most chosen</span>}
              {current && <span className="text-muted-foreground text-xs">Your plan</span>}
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
              {money(plan.inr)}
              {plan.inr > 0 && <span className="text-muted-foreground text-sm font-normal"> /month</span>}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex gap-2.5 text-sm">
                  <Check className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <div className="pt-6">
              {current ? (
                <Button disabled variant="outline" className="w-full">
                  Current plan
                </Button>
              ) : id === "free" ? (
                <Button render={<Link href="/signup" />} variant="outline" className="press w-full">Start free</Button>
              ) : signedIn ? (
                <CheckoutButton plan={id as Exclude<PlanId, "free">} label={`Move to ${plan.name}`} className="press w-full" variant={featured ? "default" : "outline"} />
              ) : (
                <Button render={<Link href={`/signup?plan=${id}`} />} variant={featured ? "default" : "outline"} className="press w-full">Choose {plan.name}</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
