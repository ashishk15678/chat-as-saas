"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";

const referenceImage =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1bu9vSupnT45jUm35yDlSaEtfeGDnt.png";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-xl bg-indigo-500 text-white shadow-[0_4px_0_#312e81]">
        <MessageCircle className="size-4" strokeWidth={2.5} />
      </div>
      <span className="text-[17px] font-semibold tracking-[-.05em]">
        chatline
      </span>
    </div>
  );
}

function Landing({ onLaunch }: { onLaunch: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f8f6] text-[#17171b]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {menuOpen && (
          <div className="flex flex-col gap-4 border-b border-black/10 py-5 text-sm font-semibold sm:hidden">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <button
              onClick={onLaunch}
              className="w-fit rounded-lg bg-[#17171b] px-4 py-2 text-white"
            >
              Open dashboard
            </button>
          </div>
        )}

        <section className="grid border-b border-black/10 lg:grid-cols-[.82fr_1.18fr]">
          <div className="flex flex-col justify-center border-r-0 py-16 lg:border-r lg:py-24 lg:pr-14">
            <p className="mb-7 text-[11px] font-medium text-black/45">
              Knowledge work, without the busywork
            </p>
            <h1 className="max-w-[490px] text-5xl font-medium leading-[.98] tracking-[-.075em] sm:text-7xl">
              Make your docs <span className="text-indigo-500">do more.</span>
            </h1>
            <p className="mt-7 max-w-[420px] text-sm leading-6 text-black/55">
              Chatline turns scattered company knowledge into a clear, useful
              assistant that answers questions with sources attached.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onLaunch}
                className="press rounded-lg bg-[#17171b] px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Build your chatbot{" "}
                <ArrowRight className="ml-2 inline size-3.5" />
              </button>
              <a
                href="#product"
                className="rounded-lg border border-black/15 bg-white px-4 py-3 text-xs font-semibold transition hover:border-indigo-300 hover:text-indigo-600"
              >
                See how it works
              </a>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-[#e9e8e5] lg:min-h-0">
            <img
              src={referenceImage}
              alt="Chatline workspace interface"
              className="absolute inset-0 size-full object-cover object-left opacity-70 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-[#f5f4f0]/40" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,.12)] sm:left-12 sm:right-12">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-indigo-500 text-white">
                    <MessageCircle className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">
                      Northstar assistant
                    </p>
                    <p className="text-[9px] text-black/40">
                      Grounded in 24 sources
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600">
                  ● Live
                </span>
              </div>
              <div className="rounded-xl border border-black/8 bg-[#fafafa] p-3 text-[11px] leading-5 text-black/65">
                What is our policy for client meals?
                <div className="mt-3 border-t border-black/8 pt-2 text-[10px] text-indigo-600">
                  <BookOpen className="mr-1 inline size-3" /> Travel &amp;
                  expenses · page 14
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-5 border-b border-black/10 py-7 text-[10px] font-bold uppercase tracking-[.18em] text-black/30">
          <span>Trusted by teams who ship</span>
          <span className="tracking-[-.08em] text-sm normal-case">
            northstar
          </span>
          <span className="italic">fieldnotes</span>
          <span>atlas / co</span>
          <span className="normal-case tracking-normal">makerspace</span>
          <span>orbit</span>
        </section>

        <section
          id="product"
          className="border-b border-black/10 py-20 sm:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
                Why Chatline?
              </p>
              <h2 className="max-w-[360px] text-3xl font-medium leading-[1.05] tracking-[-.06em] sm:text-4xl">
                Your team should find answers, not people.
              </h2>
            </div>
            <p className="max-w-[520px] text-sm leading-7 text-black/55">
              Chatline keeps your best thinking close at hand. Give every team
              member a reliable starting point, without adding another meeting
              or another tab to search.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard
              imagePosition="object-left"
              icon={Users}
              title="One place for all things people"
              text="Handbooks, onboarding, policies, and team rituals in one calm, searchable home."
            />
            <FeatureCard
              imagePosition="object-center"
              icon={Sparkles}
              title="Answers that show their work"
              text="Every response points back to the source, so people can move quickly and trust what they find."
            />
            <FeatureCard
              imagePosition="object-right"
              icon={BarChart3}
              title="Know what your team needs"
              text="See what people ask, where your docs fall short, and what to improve next."
            />
          </div>
        </section>

        <section
          id="solutions"
          className="grid gap-12 border-b border-black/10 py-20 sm:py-28 lg:grid-cols-[1fr_1fr] lg:items-center"
        >
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_45px_rgba(0,0,0,.06)]">
            <div className="grid grid-cols-[140px_1fr] overflow-hidden rounded-xl border border-black/8">
              <div className="bg-[#f3f3f1] p-3">
                <div className="mb-5 text-[10px] font-bold">Chatline</div>
                <div className="flex flex-col gap-2 text-[9px] text-black/45">
                  <span className="rounded bg-indigo-100 px-2 py-1 font-semibold text-indigo-600">
                    Overview
                  </span>
                  <span>Chatbots</span>
                  <span>Sources</span>
                  <span>Analytics</span>
                </div>
              </div>
              <div className="bg-white p-5">
                <p className="text-[10px] text-black/35">
                  Tuesday, September 25
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-.04em]">
                  Good morning, Ashish.
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-black/8 p-3">
                    <p className="text-[9px] text-black/40">Helpful answers</p>
                    <p className="mt-2 text-xl font-semibold">94.8%</p>
                  </div>
                  <div className="rounded-lg border border-black/8 p-3">
                    <p className="text-[9px] text-black/40">Active sources</p>
                    <p className="mt-2 text-xl font-semibold">24</p>
                  </div>
                </div>
                <div className="mt-3 h-24 rounded-lg border border-black/8 p-3">
                  <div className="flex h-full items-end gap-1">
                    {[25, 38, 30, 48, 42, 60, 52, 70, 62, 77, 65, 82].map(
                      (h, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-t bg-indigo-200 transition hover:bg-indigo-500"
                          style={{ height: `${h}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
              Built for momentum
            </p>
            <h2 className="max-w-[420px] text-3xl font-medium leading-[1.05] tracking-[-.06em] sm:text-4xl">
              Less searching. More doing.
            </h2>
            <p className="mt-6 max-w-[430px] text-sm leading-7 text-black/55">
              A simple workspace for the work around your work. Ship a helpful
              assistant today, then keep making it better as your team uses it.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-sm font-medium">
              <span>
                <Check className="mr-2 inline size-4 text-indigo-500" />
                Citations on every answer
              </span>
              <span>
                <Check className="mr-2 inline size-4 text-indigo-500" />
                Private by default
              </span>
              <span>
                <Check className="mr-2 inline size-4 text-indigo-500" />
                Updates without retraining
              </span>
            </div>
          </div>
        </section>

        <section
          id="resources"
          className="border-b border-black/10 py-20 sm:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
                A calmer way to work
              </p>
              <h2 className="max-w-[390px] text-3xl font-medium leading-[1.05] tracking-[-.06em] sm:text-4xl">
                The small details make the big difference.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-indigo-200">
                <p className="text-2xl font-semibold tracking-[-.06em]">2.4×</p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  faster answers for everyday questions
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-indigo-200">
                <p className="text-2xl font-semibold tracking-[-.06em]">94%</p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  of answers include a source
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-indigo-200">
                <p className="text-2xl font-semibold tracking-[-.06em]">
                  1 day
                </p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  to go from docs to useful assistant
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="pricing"
          className="border-b border-black/10 py-20 text-center sm:py-28"
        >
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
            Simple pricing
          </p>
          <h2 className="text-3xl font-medium tracking-[-.06em] sm:text-4xl">
            Start small. Grow with your knowledge.
          </h2>
          <div className="mx-auto mt-10 grid max-w-[820px] gap-4 text-left md:grid-cols-2">
            <PriceCard
              name="Starter"
              price="$0"
              detail="For small teams getting organized."
              features={[
                "1 chatbot",
                "5,000 messages / month",
                "Unlimited sources",
              ]}
            />
            <PriceCard
              featured
              name="Team"
              price="$49"
              detail="For teams ready to move faster."
              features={[
                "Unlimited chatbots",
                "50,000 messages / month",
                "Analytics and embeds",
              ]}
            />
          </div>
        </section>

        <section
          id="resources"
          className="flex flex-col items-start justify-between gap-6 py-20 sm:flex-row sm:items-center sm:py-24"
        >
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
              Ready when you are
            </p>
            <h2 className="max-w-[600px] text-4xl font-medium leading-[1] tracking-[-.07em] sm:text-6xl">
              Let your knowledge do the talking.
            </h2>
          </div>
          <button
            onClick={onLaunch}
            className="press shrink-0 rounded-lg bg-[#17171b] px-5 py-3.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            Join the waitlist <ArrowRight className="ml-2 inline size-3.5" />
          </button>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  imagePosition,
}: {
  icon: typeof Users;
  title: string;
  text: string;
  imagePosition: string;
}) {
  return (
    <article className="group">
      <div className="relative mb-4 h-48 overflow-hidden rounded-xl border border-black/10 bg-[#e9e8e5]">
        <img
          src={referenceImage}
          alt="Chatline product detail"
          className={`size-full object-cover ${imagePosition} grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0`}
        />
        <div className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-lg border border-white/60 bg-white/90 text-indigo-500">
          <Icon className="size-4" />
        </div>
      </div>
      <h3 className="text-sm font-semibold tracking-[-.02em]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-black/50">{text}</p>
    </article>
  );
}
function PriceCard({
  name,
  price,
  detail,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  detail: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${featured ? "border-indigo-300 bg-indigo-50" : "border-black/10 bg-white"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-2 text-xs text-black/45">{detail}</p>
        </div>
        {featured && (
          <span className="rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-semibold text-white">
            Popular
          </span>
        )}
      </div>
      <p className="mt-8 text-4xl font-semibold tracking-[-.06em]">
        {price}
        <span className="text-sm font-normal text-black/40">
          {price !== "$0" && "/ month"}
        </span>
      </p>
      <button
        className={`mt-6 w-full rounded-lg px-4 py-3 text-xs font-semibold ${featured ? "bg-indigo-500 text-white hover:bg-indigo-600" : "border border-black/15 hover:border-indigo-300 hover:text-indigo-600"}`}
      >
        Get started <ChevronRight className="ml-1 inline size-3" />
      </button>
      <div className="mt-6 flex flex-col gap-3 text-xs text-black/60">
        {features.map((feature) => (
          <span key={feature}>
            <Check className="mr-2 inline size-3.5 text-indigo-500" />
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ onExit }: { onExit: () => void }) {
  const [active, setActive] = useState("Overview");
  const nav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Chatbots", icon: MessageCircle },
    { label: "Sources", icon: FileText },
    { label: "Analytics", icon: BarChart3 },
  ];
  return (
    <div className="flex min-h-screen bg-[#f8f8f6] text-[#17171b]">
      <aside className="hidden w-[240px] flex-col border-r border-black/10 bg-[#f4f3ef] p-4 md:flex">
        <button onClick={onExit} className="mb-10 px-2 text-left">
          <Logo />
        </button>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-black/35">
          Workspace
        </p>
        <nav className="flex flex-col gap-1">
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active === label ? "bg-indigo-50 text-indigo-600" : "text-black/50 hover:bg-black/[.03]"}`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs font-semibold">Starter plan</p>
          <p className="mt-1 text-[11px] text-black/45">
            2,180 of 5,000 messages
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-indigo-200">
            <div className="h-full w-[44%] rounded-full bg-indigo-500" />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-black/10 bg-[#f8f8f6] px-5 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-black/35">
            <span>Workspace</span>
            <ChevronRight className="size-3" />
            <span className="font-medium text-black/70">{active}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid size-9 place-items-center rounded-xl border border-black/8 text-black/45">
              <CircleHelp className="size-4" />
            </button>
            <div className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              AK
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1180px] p-5 sm:p-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-indigo-500">
                Tuesday, September 25
              </p>
              <h1 className="text-3xl font-semibold tracking-[-.06em] sm:text-4xl">
                Good morning, Ashish.
              </h1>
              <p className="mt-2 text-sm text-black/45">
                Here&apos;s what&apos;s happening with your knowledge base.
              </p>
            </div>
            <button
              onClick={onExit}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold hover:border-indigo-300"
            >
              Back to site
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total chats", "2,397", "+18.6%", MessageCircle],
              ["Helpful answers", "94.8%", "+4.2%", Sparkles],
              ["Active sources", "24", "+3 this week", FileText],
              ["Avg. response", "1.2s", "-0.4s faster", ZapIcon],
            ].map(([label, value, change, Icon]) => (
              <div
                key={label as string}
                className="rounded-2xl border border-black/8 bg-white p-5"
              >
                <div className="flex justify-between">
                  <p className="text-xs text-black/45">{label as string}</p>
                  <div className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-500">
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="mt-5 text-2xl font-semibold">{value as string}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">
                  {change as string}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.8fr]">
            <section className="rounded-2xl border border-black/8 bg-white p-5">
              <h2 className="font-semibold">Chat activity</h2>
              <p className="mt-1 text-xs text-black/40">
                Messages across all chatbots
              </p>
              <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-black/8 px-3">
                {[
                  42, 56, 48, 67, 51, 76, 69, 84, 62, 92, 79, 96, 73, 88, 100,
                  85, 92, 81, 94, 108, 97, 112, 102, 118,
                ].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-indigo-200 transition hover:bg-indigo-500"
                    style={{ height: `${height / 1.1}px` }}
                  />
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-black/8 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Your chatbots</h2>
                  <p className="mt-1 text-xs text-black/40">Quick access</p>
                </div>
                <Plus className="size-4 text-indigo-500" />
              </div>
              <div className="mt-5 flex flex-col gap-2">
                {[
                  "Northstar Help Center",
                  "Makerspace Handbook",
                  "Acme Onboarding",
                ].map((bot, i) => (
                  <button
                    key={bot}
                    className="flex items-center gap-3 rounded-xl border border-black/8 p-3 text-left hover:border-indigo-200"
                  >
                    <span
                      className={`size-2.5 rounded-full ${i === 1 ? "bg-amber-400" : "bg-emerald-500"}`}
                    />
                    <span className="flex-1 text-sm font-medium">{bot}</span>
                    <ChevronRight className="size-3 text-black/30" />
                  </button>
                ))}
              </div>
            </section>
          </div>
          <section className="mt-5 rounded-2xl border border-black/8 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white">
                <Code2 className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold">Your widget is ready to ship</h2>
                <p className="mt-1 text-xs text-black/45">
                  Paste this into your site to make Northstar live.
                </p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl bg-[#191722] px-4 py-3 font-mono text-xs text-indigo-200">
              &lt;script src=&quot;chatline.ai/widget.js&quot;
              data-bot=&quot;northstar&quot;&gt;&lt;/script&gt;
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
function ZapIcon() {
  return <Sparkles className="size-4" />;
}
export default function Page() {
  const [dashboard, setDashboard] = useState(false);
  return dashboard ? (
    <Dashboard onExit={() => setDashboard(false)} />
  ) : (
    <Landing onLaunch={() => setDashboard(true)} />
  );
}
