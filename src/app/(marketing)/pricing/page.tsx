import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

const FAQ = [
  [
    "What counts as a message?",
    "One reply from your chatbot to a visitor. Your own testing in the playground is not counted.",
  ],
  [
    "What happens when I run out?",
    "The widget keeps loading and tells visitors the team will follow up, and you get an email. Nothing is deleted.",
  ],
  [
    "Can I change plans mid-month?",
    "Yes. Upgrades apply immediately and Razorpay prorates the next cycle. Downgrades take effect at the end of the current cycle.",
  ],
  [
    "Do you train models on my documents?",
    "No. Your sources are used to retrieve context for your own chatbot and nothing else.",
  ],
  [
    "How do refunds work?",
    "Write to us within 7 days of a charge and we refund the full cycle to the original payment method.",
  ],
];

export default function PricingPage() {
  return (
    <>
      <Section
        title="Pick a size, change it whenever"
        description="All plans include every feature. What changes is how many chatbots, messages and megabytes you get."
      >
        <PricingTable />
      </Section>
      <Section title="Questions people ask before paying" className="pt-0">
        <dl className="max-w-2xl divide-y">
          {FAQ.map(([q, a]) => (
            <div key={q} className="py-5">
              <dt className="font-medium">{q}</dt>
              <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
