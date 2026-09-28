import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Globe,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { APP, PLANS, PLAN_ORDER } from "@/lib/constants";
import { money } from "@/lib/format";

/* ─── Pixel 2×2 decoration (green squares, Proofmode signature) ─── */
function Pixels({ className = "" }: { className?: string }) {
  return (
    <div className={`pixel-deco ${className}`} aria-hidden>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

/* ─── Eyebrow tag like "CASE STUDY" in Proofmode ─── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
      {children}
    </span>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Documents",
    body: "PDF, DOCX, Markdown, TXT, CSV — up to 25 MB each. Stored directly, never passed through our server.",
  },
  {
    icon: Globe,
    title: "Web pages",
    body: "Paste a URL. The readable text is fetched, stripped and kept as its own source.",
  },
  {
    icon: MessageSquare,
    title: "Q&A pairs",
    body: "Write the exact phrasing for the questions that matter most, paired with the right answers.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded only",
    body: "When the answer isn't in your documents, the bot says so rather than guessing.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Add what you already have",
    body: "PDFs, help pages, FAQs, or plain text. Processing starts the moment a file lands.",
  },
  {
    n: "02",
    title: "Test it yourself first",
    body: "The playground uses the same retrieval as the live widget — what you see is exactly what visitors get.",
  },
  {
    n: "03",
    title: "Paste one line of script",
    body: "Under 15 KB, matches your site's theme, and only runs on the domains you allow.",
  },
];

const STATS = [
  { value: "2.4×", label: "faster answers for everyday questions" },
  { value: "94%", label: "of answers include a source citation" },
  { value: "1 day", label: "from sign-up to a live support widget" },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0f0f0e]">
      {/* ══════════════════════════════════════════
          HERO — two-column grid separated by hairline
          Left: headline + CTA   Right: live product mockup
          ══════════════════════════════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid min-h-[80vh] lg:grid-cols-[1fr_1fr]">
            {/* ── Left ── */}
            <div className="flex flex-col justify-center border-b border-border py-16 lg:border-b-0 lg:border-r lg:py-24 lg:pr-14">
              <div className="mb-5 flex items-center gap-3">
                <Pixels />
                <Tag>AI-powered support</Tag>
              </div>

              <h1 className="max-w-[480px] text-5xl font-semibold leading-[.96] tracking-[-0.06em] sm:text-6xl lg:text-[4.25rem]">
                Make your docs{" "}
                <span className="text-[#4f46e5]">do&nbsp;more.</span>
              </h1>

              <p className="mt-6 max-w-[400px] text-sm leading-6 text-muted-foreground">
                {APP.name} turns scattered company knowledge into a clear,
                useful assistant that answers questions with sources attached —
                ready in minutes, not weeks.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-primary press">
                  Start free <ArrowRight className="size-3.5" />
                </Link>
                <Link href="/docs" className="btn-secondary press">
                  Read the docs
                </Link>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                100 messages / month on the free plan. No credit card needed.
              </p>
            </div>

            {/* ── Right — product mockup ── */}
            <div className="relative flex items-center justify-center overflow-hidden bg-surface py-12 lg:py-0">
              {/* Corner pixel decorations */}
              <Pixels className="absolute left-5 top-5" />
              <Pixels className="absolute bottom-5 right-5" />

              {/* Glass card mockup */}
              <div className="glass mx-6 w-full max-w-[360px] p-5">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-md">
                      <MessageSquare className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold">
                        Northstar assistant
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Grounded in 24 sources
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-semibold text-[#16a34a]">
                    <span className="size-1.5 rounded-full bg-[#16a34a]" />
                    Live
                  </span>
                </div>

                {/* Fake chat */}
                <div className="space-y-2.5">
                  <div className="flex justify-end">
                    <div className="max-w-[76%] rounded-2xl rounded-br-sm bg-[#0f0f0e] px-3.5 py-2.5 text-[11px] leading-5 text-white">
                      What's our policy on client meals?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-border bg-white px-3.5 py-2.5 text-[11px] leading-5">
                      Client meals are reimbursable up to ₹2,500 per person with
                      a receipt attached to the expense report.
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-medium text-[#4f46e5]">
                        <FileText className="size-2.5" />
                        Travel &amp; Expenses Policy · p.14
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[76%] rounded-2xl rounded-br-sm bg-[#0f0f0e] px-3.5 py-2.5 text-[11px] leading-5 text-white">
                      How many days for WFH per week?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-border bg-white px-3.5 py-2.5 text-[11px] leading-5">
                      Up to 3 days per week after completing 90 days with the
                      company.
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-medium text-[#4f46e5]">
                        <FileText className="size-2.5" />
                        Employee Handbook · p.7
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <span className="flex-1 text-[11px] text-muted-foreground">
                    Ask anything…
                  </span>
                  <div className="flex size-6 items-center justify-center rounded-lg bg-[#4f46e5] text-white">
                    <ArrowRight className="size-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST BAR
          ══════════════════════════════════════════ */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
            Trusted by teams who ship
          </p>
          <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold text-muted-foreground">
            <span className="text-sm font-bold tracking-[-0.04em] text-foreground">
              northstar
            </span>
            <span className="italic">fieldnotes</span>
            <span>atlas / co</span>
            <span>makerspace</span>
            <span>orbit labs</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STEPS — 3-col grid with dividers (Proofmode "ecosystem" section)
          ══════════════════════════════════════════ */}
      <section className="border-b border-border" id="how">
        <div className="mx-auto max-w-6xl px-5">
          {/* Section header */}
          <div className="border-b border-border py-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#4f46e5]">
              How it works
            </p>
            <h2 className="max-w-[520px] text-3xl font-semibold sm:text-4xl">
              From your docs to a live support chat in one afternoon.
            </h2>
          </div>

          {/* 3-col grid separated by border lines */}
          <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex flex-col gap-4 px-0 py-10 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#4f46e5]">
                  Step {s.n}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — left text + right 2×2 cards
          ══════════════════════════════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            {/* Left */}
            <div className="border-b border-border py-14 lg:border-b-0 lg:border-r lg:py-20 lg:pr-14">
              <Tag>Knowledge sources</Tag>
              <h2 className="mt-5 max-w-[340px] text-3xl font-semibold sm:text-4xl">
                It only knows what you give it.
              </h2>
              <p className="mt-5 max-w-[360px] text-sm leading-7 text-muted-foreground">
                Every answer traces back to the exact document it came from. No
                hallucinations. No guessing. When the answer isn't in your
                sources, the bot says so.
              </p>
              <div className="mt-8 flex flex-col gap-3 text-sm">
                {[
                  "Citations on every answer",
                  "Private by default",
                  "Updates without retraining",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#eef2ff]">
                      <Check className="size-3 text-[#4f46e5]" />
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — 2×2 feature cards */}
            <div className="grid grid-cols-2 divide-x divide-y divide-border">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 p-6 transition-colors hover:bg-surface"
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#eef2ff]">
                    <Icon className="size-4 text-[#4f46e5]" />
                  </div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS — 3-col split with pixel decorations
          ══════════════════════════════════════════ */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0 px-5">
          {STATS.map((s) => (
            <div
              key={s.value}
              className="flex flex-col gap-3 py-12 md:px-8 first:md:pl-0 last:md:pr-0"
            >
              <Pixels />
              <p className="text-4xl font-semibold tracking-[-0.06em]">
                {s.value}
              </p>
              <p className="max-w-[180px] text-xs leading-5 text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════ */}
      <section className="border-b border-border" id="pricing">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-2 flex items-center gap-3">
            <Pixels />
            <Tag>Pricing</Tag>
          </div>
          <h2 className="mb-2 mt-5 text-3xl font-semibold sm:text-4xl">
            Start small. Grow with your knowledge.
          </h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Monthly billing. Cancel any time from the dashboard. All prices
            include GST.
          </p>

          <div className="grid gap-4 lg:grid-cols-4">
            {PLAN_ORDER.map((id) => {
              const plan = PLANS[id];
              const featured = id === "growth";
              return (
                <div
                  key={id}
                  className={`flex flex-col rounded-2xl border p-6 transition-[border-color] hover:border-[#4f46e5]/40 ${
                    featured
                      ? "border-[#4f46e5] shadow-[0_0_0_4px_#eef2ff]"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {featured && (
                      <span className="rounded-full bg-[#4f46e5] px-2 py-0.5 text-[10px] font-bold text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                    {money(plan.inr)}
                    {plan.inr > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /mo
                      </span>
                    )}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs">
                        <Check className="mt-0.5 size-3 shrink-0 text-[#4f46e5]" />
                        <span className="text-muted-foreground">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={id === "free" ? "/signup" : `/signup?plan=${id}`}
                    className={`press mt-6 block rounded-xl px-4 py-2.5 text-center text-xs font-semibold transition-colors ${
                      featured
                        ? "bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                        : "border border-border hover:border-[#4f46e5]/60 hover:text-[#4f46e5]"
                    }`}
                  >
                    {id === "free" ? "Start free" : `Choose ${plan.name}`}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA — dark band like Proofmode's footer CTA
          ══════════════════════════════════════════ */}
      <section className="border-b border-border bg-[#0f0f0e] text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center">
            <div>
              <Pixels className="mb-5" />
              <h2 className="max-w-[500px] text-4xl font-semibold leading-tight sm:text-5xl">
                Let your knowledge do the talking.
              </h2>
            </div>
            <Link
              href="/signup"
              className="press shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4338ca]"
            >
              Build your chatbot <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
