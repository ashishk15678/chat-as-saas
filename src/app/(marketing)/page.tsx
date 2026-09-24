import Link from "next/link";
import { FileText, Globe, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { PricingTable } from "@/components/marketing/pricing-table";
import { DemoChat } from "./demo-chat";
import { APP } from "@/lib/constants";

const STEPS = [
  { title: "Add what you already have", body: "PDFs, help-centre pages, a spreadsheet of FAQs, or plain text pasted in. Processing starts the moment a file lands." },
  { title: "Check the answers yourself", body: "The playground runs the same retrieval as the live widget, so what you read is what your customers will get." },
  { title: "Paste one line of script", body: "The widget loads in under 15 KB, matches your site's light or dark theme, and only runs on domains you allow." },
];

const SOURCES = [
  { icon: FileText, title: "Documents", body: "PDF, DOCX, Markdown, TXT and CSV up to 25 MB each, uploaded straight to storage." },
  { icon: Globe, title: "Pages", body: "Point at a help-centre URL and the readable text is pulled in and kept as its own source." },
  { icon: MessageSquare, title: "Question and answer pairs", body: "Write the exact wording you want for the questions that matter most." },
  { icon: ShieldCheck, title: "Nothing beyond that", body: "Answers are drawn only from your sources. When the answer is not there, the bot says so instead of guessing." },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <h1 className="text-4xl font-semibold text-balance sm:text-6xl sm:leading-[1.05]">
              Your documents, answering customers at 2am.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty">
              {APP.name} reads the files you already wrote and turns them into a support chat you can put on any page. No
              retraining, no rules to maintain, no answers invented out of thin air.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button render={<Link href="/signup" />} size="lg" className="press">Start free</Button>
              <Button render={<Link href="/pricing" />} size="lg" variant="outline" className="press">See pricing</Button>
            </div>
            <p className="text-muted-foreground text-sm">100 messages a month on the free plan. No card needed.</p>
          </div>

          {/* The hero is the product itself: a working chat, not a screenshot. */}
          <DemoChat />
        </div>
      </section>

      <Section id="how" title="Three steps, about ten minutes" description="Most teams go from signing up to a live widget inside one sitting.">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel-pad space-y-2">
              <span className="text-primary text-sm font-medium tabular-nums">Step {i + 1}</span>
              <h3 className="font-medium">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="sources" title="It only knows what you give it" description="Every answer is traced back to the source it came from, and shown to you in the conversation log.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOURCES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel-pad flex gap-4">
              <span className="bg-primary-muted text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <div className="space-y-1">
                <h3 className="font-medium">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Pricing that stops at what you use" description="Every plan is monthly and cancels from the dashboard. Billing runs on Razorpay in rupees.">
        <PricingTable />
      </Section>

      <Section className="py-16">
        <div className="panel flex flex-wrap items-center justify-between gap-6 px-8 py-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Put it on your site tonight</h2>
            <p className="text-muted-foreground">One script tag. Works with any framework, or none.</p>
          </div>
          <Button render={<Link href="/signup" />} size="lg" className="press">Create your first chatbot</Button>
        </div>
      </Section>
    </>
  );
}
