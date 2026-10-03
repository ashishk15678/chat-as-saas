"use client";

import { useEffect, useState } from "react";
import { AsciiFire } from "@/components/ascii-fire";
import { GrainInterludes, GrainQuote } from "@/components/grain-interludes";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  CirclePlay,
  Headphones,
  Mic,
  Pause,
  Quote,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#company", label: "Company" },
];

const faqs = [
  {
    q: "What is Sonora?",
    a: "Sonora turns your recordings into searchable, usable work: summaries, decisions, and next steps.",
  },
  {
    q: "How does the audio AI work?",
    a: "It listens to the whole conversation, understands context across speakers, and surfaces the moments that matter.",
  },
  {
    q: "Can I bring my own recordings?",
    a: "Yes. Upload existing audio or capture new calls, meetings, and voice notes directly in Sonora.",
  },
  {
    q: "Who is Sonora built for?",
    a: "Thoughtful teams who want to spend less time managing audio and more time making work that matters.",
  },
];

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#top">
        Skip to content
      </a>

      <header>
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav-bar">
            <a className="wordmark" href="#top" aria-label="Sonora home">
              <span aria-hidden="true" className="contents">
                <AsciiFire />
              </span>
              <span className="wordmark-dot" aria-hidden="true" />
              Sonora<span className="wordmark-ai">.ai</span>
            </a>

            <div className="nav-links">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="nav-actions">
              <ThemeToggle />
              <a className="nav-login" href="/login">
                Log in
              </a>
              <a href="/dashboard">
                <Button>
                  Start now <ArrowUpRight aria-hidden="true" />
                </Button>
              </a>
            </div>

            <div className="mobile-bar">
              <ThemeToggle />
              <button
                type="button"
                className="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu-panel"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>

          <div
            id="mobile-menu-panel"
            className="mobile-panel"
            data-open={menuOpen}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </a>
            <a href="/dashboard" onClick={() => setMenuOpen(false)}>
              <Button className={"w-full text-2xl"} size={"lg"}>
                Start now <ArrowUpRight aria-hidden="true" />
              </Button>
            </a>
          </div>
        </nav>
      </header>

      <main
        id="top"
        className="w-full max-w-7xl mx-auto flex flex-col space-y-8 px-4 sm:px-6 xl:px-0"
      >
        <section
          aria-labelledby="hero-title"
          className="flex w-full flex-col lg:flex-row gap-8 lg:gap-10 justify-between mt-24 lg:mt-30"
        >
          <div className="p-5 sm:p-8 w-full flex flex-col justify-center my-auto bg-card">
            <h1 id="hero-title" className="text-4xl">
              Make every <em>conversation</em> count.
            </h1>
            <p className="text-lg sm:text-2xl text-muted-foreground my-7">
              Sonora turns spoken ideas into clear, useful work. Record,
              understand, and create with an AI that actually listens.
            </p>

            <a href="/dashboard">
              <Button className={"flex justify-center gap-x-2 text-2xl w-full"}>
                Start listening <ArrowUpRight aria-hidden="true" />
              </Button>
            </a>
            <p className="hero-note">No credit card required</p>
          </div>

          <AudioStudio isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </section>

        <ul className="logo-strip" aria-label="Trusted by teams at">
          <li>northstar</li>
          <li>notion</li>
          <li>Linear</li>
          <li>loom</li>
          <li>ARC</li>
          <li>superhuman</li>
        </ul>

        <section id="product" className="my-10 lg:my-16">
          <h2 className="text-3xl sm:text-4xl">Less listening. More doing.</h2>
          <p className="text-lg sm:text-2xl text-muted-foreground my-7">
            Between client calls, team syncs, and the ideas that happen in
            between, your best work is already spoken. Sonora captures the
            signal, removes the noise, and gives you back the good part.
          </p>
        </section>

        <GrainInterludes />

        <section
          id="solutions"
          className="flex flex-col lg:flex-row justify-between w-full gap-8 lg:gap-12"
        >
          <div className="split-copy border border-border p-5 sm:p-8 w-full">
            <p className="eyebrow">People + AI</p>
            <h2>
              Say it once.
              <br />
              <em>Ship it forever.</em>
            </h2>
            <p>
              Sonora makes the distance between a thought and a finished thing
              feel wonderfully small.
            </p>
            <ul className="check-list">
              <li>
                <Check aria-hidden="true" /> Capture meetings, notes, and
                spontaneous ideas
              </li>
              <li>
                <Check aria-hidden="true" /> Turn conversations into drafts and
                decisions
              </li>
              <li>
                <Check aria-hidden="true" /> Search your entire audio memory in
                plain English
              </li>
            </ul>
          </div>
          <AudioVisualizer />
        </section>

        <WorkflowShowcase />
        <GrainQuote />
        <Testimonials />

        <section className="w-full section-rule" id="pricing">
          <p className="eyebrow">By the numbers</p>
          <h2 className="text-3xl sm:text-4xl">
            The math behind better conversations.
          </h2>
          <div className="number-list text-xl">
            <div>
              <span>Average time saved per call</span>
              <strong>
                42<small>min</small>
              </strong>
            </div>
            <div>
              <span>Faster from idea to first draft</span>
              <strong>6×</strong>
            </div>
            <div>
              <span>Words understood, not just transcribed</span>
              <strong>
                <span aria-label="infinite">∞</span>
              </strong>
            </div>
            <div>
              <span>Meetings you never need to re-listen to</span>
              <strong>100%</strong>
            </div>
          </div>
        </section>

        <section className="my-12 w-full section-rule" id="company">
          <h2 className="text-3xl sm:text-4xl">Frequently asked questions</h2>
          <div className="flex flex-col mt-6">
            {faqs.map(({ q, a }, index) => {
              const open = activeFaq === index;
              return (
                <div key={q} className="border-b border-border">
                  <h3 className="text-lg sm:text-xl">
                    <button
                      type="button"
                      id={`faq-btn-${index}`}
                      className="w-full min-h-12 flex items-center justify-between gap-4 py-4 text-left"
                      onClick={() => setActiveFaq(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${index}`}
                    >
                      <span>{q}</span>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 transition-transform",
                          open && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    hidden={!open}
                    className="pb-5 max-w-prose text-base text-muted-foreground"
                  >
                    {a}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

function AudioStudio({
  isPlaying,
  setIsPlaying,
}: {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
}) {
  return (
    <div className="w-full studio-card">
      <div className="studio-top">
        <span>
          <span className="live-dot" aria-hidden="true" /> live capture
        </span>
        <span>00:42:18</span>
      </div>
      <div className="studio-screen">
        <div className="studio-heading">
          <div className="avatar" aria-hidden="true">
            JD
          </div>
          <div>
            <strong>Product sync — Tuesday</strong>
            <span>Just now · 6 participants</span>
          </div>
          <button type="button" aria-label="More options">
            •••
          </button>
        </div>
        <div className="waveform" role="img" aria-label="Audio waveform">
          {Array.from({ length: 48 }, (_, i) => (
            <i key={i} style={{ height: `${18 + ((i * 17) % 50)}%` }} />
          ))}
        </div>
        <div className="studio-transcript">
          <span className="speaker-label">
            <span className="speaker-dot" aria-hidden="true" /> Jordan · 10:42
          </span>
          <p>
            “The thing we keep hearing is that people don&apos;t need more
            dashboards. They need a second brain that can hear the whole story.”
          </p>
        </div>
        <div className="studio-prompt">
          <Sparkles aria-hidden="true" />
          <span>Ask Sonora anything about this call...</span>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause recording" : "Play recording"}
          >
            {isPlaying ? (
              <Pause aria-hidden="true" />
            ) : (
              <CirclePlay aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="studio-bottom">
        <span>
          <Mic aria-hidden="true" /> Recording in progress
        </span>
        <span>
          <Volume2 aria-hidden="true" /> Voice clarity: high
        </span>
      </div>
    </div>
  );
}

function AudioVisualizer() {
  return (
    <div className="visualizer-card w-full">
      <div className="visualizer-glow" aria-hidden="true" />
      <div className="visualizer-top">
        <span>
          <Headphones aria-hidden="true" /> sonora / focus mode
        </span>
        <span>AI ACTIVE</span>
      </div>
      <div className="orb" aria-hidden="true">
        <div className="orb-core" />
        <div className="orb-ring ring-one" />
        <div className="orb-ring ring-two" />
        <div className="orb-ring ring-three" />
      </div>
      <div className="visualizer-caption">
        <strong>Listening for the signal</strong>
        <span>Understanding context across 4 conversations</span>
      </div>
      <div className="visualizer-bars" aria-hidden="true">
        {Array.from({ length: 32 }, (_, i) => (
          <i key={i} style={{ height: `${20 + ((i * 29) % 70)}%` }} />
        ))}
      </div>
    </div>
  );
}

function WorkflowShowcase() {
  return (
    <section className="workflow-section section-rule" id="demo">
      <div className="workflow-copy">
        <p className="eyebrow">Made for momentum</p>
        <h2>
          Works where
          <br />
          your team already does.
        </h2>
        <p>
          Bring the whole conversation into one place. Sonora turns a raw
          recording into a brief, a decision log, and next steps your team can
          act on.
        </p>
        <div className="workflow-points">
          <span>
            <Check aria-hidden="true" /> Capture from any source
          </span>
          <span>
            <Check aria-hidden="true" /> Search every spoken idea
          </span>
          <span>
            <Check aria-hidden="true" /> Create work from context
          </span>
        </div>
      </div>
      <div className="workflow-ui">
        <div className="workflow-sidebar">
          <span className="sidebar-label">Your library</span>
          <strong>All conversations</strong>
          <span>
            Customer calls <b>24</b>
          </span>
          <span>
            Team meetings <b>18</b>
          </span>
          <span>
            Voice notes <b>42</b>
          </span>
          <span>
            Saved insights <b>09</b>
          </span>
          <div className="sidebar-bottom">
            <span className="mini-avatar" aria-hidden="true">
              MC
            </span>
            <small>Maya&apos;s workspace</small>
          </div>
        </div>
        <div className="workflow-main">
          <div className="workflow-toolbar">
            <span>Customer research / May 14</span>
            <span className="status-pill">
              <span aria-hidden="true" /> analyzed
            </span>
          </div>
          <div className="workflow-title">
            <span className="audio-icon">
              <AudioLines aria-hidden="true" />
            </span>
            <div>
              <strong>Onboarding feedback — Acme</strong>
              <small>42:18 · 6 speakers · recorded today</small>
            </div>
            <button type="button" aria-label="More options">
              •••
            </button>
          </div>
          <div className="workflow-wave" aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <i key={i} style={{ height: `${22 + ((i * 23) % 62)}%` }} />
            ))}
          </div>
          <div className="workflow-columns">
            <div>
              <span className="column-label">AI summary</span>
              <p>
                Customers want fewer dashboards and a clearer path from insight
                to action.
              </p>
              <div className="tag-row">
                <span>product signal</span>
                <span>high confidence</span>
              </div>
            </div>
            <div>
              <span className="column-label">Next steps</span>
              <p>
                <b>03</b> tasks found from this conversation
              </p>
              <div className="task-line">
                <Check aria-hidden="true" /> Share onboarding brief
              </div>
              <div className="task-line">
                <Check aria-hidden="true" /> Review activation drop-off
              </div>
            </div>
          </div>
          <div className="workflow-prompt">
            <Sparkles aria-hidden="true" />
            <span>Ask anything about this conversation...</span>
            <ArrowUpRight aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote:
        "Sonora gave our team back the part of meetings we actually wanted: the decisions.",
      name: "Maya Chen",
      role: "Head of Product, Northstar",
    },
    {
      quote:
        "It feels less like transcription and more like having a brilliant producer in the room.",
      name: "Theo Martin",
      role: "Founder, Field Notes",
    },
    {
      quote:
        "The fastest way we have found to turn a messy conversation into a clear next step.",
      name: "Ari Williams",
      role: "Creative Director, ARC",
    },
  ];
  return (
    <section className="w-full flex flex-col lg:flex-row justify-between gap-10 lg:gap-12 my-12 lg:my-16">
      <div className="w-full lg:w-1/3 lg:shrink-0">
        <p className="eyebrow">The people who use it</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl">
          Good words from
          <br />
          <em>busy minds.</em>
        </h2>
      </div>
      <div className="testimonial-grid w-full">
        {quotes.map(({ quote, name, role }) => (
          <article className="testimonial-card" key={name}>
            <Quote aria-hidden="true" />
            <p>“{quote}”</p>
            <div>
              <strong>{name}</strong>
              <span>{role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <a className="wordmark" href="#top" aria-label="Sonora home">
          <span className="wordmark-dot" aria-hidden="true" />
          Sonora<span className="wordmark-ai">.ai</span>
        </a>
        <p>Your ideas, in focus.</p>
        <a
          className="inline-flex items-center gap-2 min-h-11 underline-offset-4 hover:underline"
          href="#demo"
        >
          Join the waitlist <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Sonora AI, Inc.</span>
        <nav aria-label="Footer">
          <div>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        <span>Built for better listening.</span>
      </div>
    </footer>
  );
}
