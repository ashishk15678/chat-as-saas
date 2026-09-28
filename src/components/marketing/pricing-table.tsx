"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/constants";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

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
              "panel flex flex-col p-6 transition-[border-color]",
              featured && "border-foreground",
              current && "bg-primary-muted/40",
              !current && "hover:border-accent/50",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{plan.name}</h3>
              {featured && !current && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-foreground">Popular</span>
              )}
              {current && <span className="eyebrow text-accent">Current</span>}
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              {money(plan.inr)}
              {plan.inr > 0 && <span className="text-muted-foreground text-sm font-normal"> /mo</span>}
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-xs">
                  <Check className="mt-0.5 size-3 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {current ? (
                <div className="rounded-lg border border-border px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">
                  Current plan
                </div>
              ) : id === "free" ? (
                <Link
                  href="/signup"
                  className="press block rounded-lg border border-border px-4 py-2.5 text-center text-xs font-semibold transition-colors hover:border-accent/60"
                >
                  Start free
                </Link>
              ) : signedIn ? (
                <CheckoutButton
                  plan={id as Exclude<PlanId, "free">}
                  label={`Move to ${plan.name}`}
                  className={cn("press w-full rounded-lg px-4 py-2.5 text-xs font-semibold", featured ? "bg-foreground text-background hover:bg-accent hover:text-foreground" : "border border-border hover:border-accent/60")}
                  variant={featured ? "default" : "outline"}
                />
              ) : (
                <Link
                  href={`/signup?plan=${id}`}
                  className={cn(
                    "press block rounded-lg px-4 py-2.5 text-center text-xs font-semibold transition-colors",
                    featured
                      ? "bg-foreground text-background hover:bg-accent hover:text-foreground"
                      : "border border-border hover:border-accent/60",
                  )}
                >
                  Choose {plan.name}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
