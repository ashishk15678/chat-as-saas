"use client";

import { useState } from "react";
import { AsciiFire } from "@/components/ascii-fire";
import { GrainInterludes, GrainQuote } from "@/components/grain-interludes";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  CirclePlay,
  Command,
  FileAudio,
  Headphones,
  Mic,
  Pause,
  Play,
  Quote,
  Sparkles,
  Volume2,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme";

const features = [
  {
    icon: AudioLines,
    title: "Voice intelligence",
    body: "Turn every conversation into a searchable, usable source of truth.",
  },
  {
    icon: WandSparkles,
    title: "Instant production",
    body: "Clean up, summarize, and shape raw audio into something your team can use.",
  },
  {
    icon: Command,
    title: "One prompt away",
    body: "Ask anything about your calls, clips, and customer conversations.",
  },
  {
    icon: FileAudio,
    title: "Audio, organized",
    body: "Every recording, transcript, and insight in one calm, focused workspace.",
  },
  {
    icon: Sparkles,
    title: "AI that listens",
    body: "Find the moments that matter without scrubbing through an hour of audio.",
  },
  {
    icon: Zap,
    title: "Ship faster",
    body: "Move from a raw recording to a polished asset in a few seconds.",
  },
];

const faqs = [
  "What is Sonora?",
  "How does the audio AI work?",
  "Can I bring my own recordings?",
  "Who is Sonora built for?",
];

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      <nav
        className="flex w-full space-x-10 justify-between border-b border-border px-4 py-1 fixed top-0 backdrop-blur-2xl"
        aria-label="Main navigation"
      >
        <a className="wordmark" href="#top" aria-label="Sonora home">
          <AsciiFire />
          <span className="wordmark-dot" />
          Sonora<span className="wordmark-ai">.ai</span>
        </a>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#company">Company</a>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <a href="/login">Log in</a>
          <a href="#demo">
            <Button>
              Start now <ArrowUpRight aria-hidden="true" />
            </Button>{" "}
          </a>
        </div>
        <button className="mobile-menu" aria-label="Open menu">
          <span />
          <span />
        </button>
      </nav>

      <main className=" w-full max-w-7xl mx-auto flex flex-col space-y-8">
        <section className="flex w-full space-x-10 justify-between  mt-30">
          <div className="p-8 w-full h-full flex flex-col justify-center my-auto bg-card ">
            <h1 className="text-4xl">
              Make every
              { " "}<em>conversation</em> {" "}
              count.
            </h1>
            <p className="text-2xl text-muted-foreground my-7">
              Sonora turns spoken ideas into clear, useful work. Record,
              understand, and create with an AI that actually listens.
            </p>
            <Button className={"w-full flex flex-row space-x-3 py-2 text-4xl"}>
              <a href="/dashboard">Start listening</a>{" "}
              <ArrowUpRight aria-hidden="true" />
            </Button>
            <p className="hero-note">No credit card required</p>
          </div>
          {/*<Card className="w-full">*/}

            <AudioStudio isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          {/*</Card>*/}
        </section>

        <div className="logo-strip" aria-label="Trusted by teams at">
          <span>northstar</span>
          <span>notion</span>
          <span>Linear</span>
          <span>loom</span>
          <span>ARC</span>
          <span>superhuman</span>
        </div>

        <div className="my-16">
          <p className="text-4xl">
            Less listening.
            More doing.
          </p>
        <p className="text-2xl text-muted-foreground my-7">
          Between client calls, team syncs, and the ideas that happen in
          between, your best work is already spoken. Sonora captures the signal,
          removes the noise, and gives you back the good part.
        </p>
        <section className="grid grid-cols-3 border border-border " id="solutions">
          {features.map(({ icon: Icon, title, body }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon aria-hidden="true" />
              </div>
              <div>
                <p className="feature-number">0{index + 1}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </section>
        </div>
        <GrainInterludes />
        <section className="flex justify-between w-full space-x-12">
          <div className="split-copy border border-border p-8 w-full">
            <p className="eyebrow">People + AI</p>
            <h2>
              Say it once.
            <br />
              <em>Ship it forever. </em>
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
          <h2 className="text-4xl">
            The math behind
            better conversations.
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
              <strong>∞</strong>
            </div>
            <div>
              <span>Meetings you never need to re-listen to</span>
              <strong>100%</strong>
            </div>
          </div>
        </section>
        <section className="my-12 w-full section-rule" id="company">
          <h2 className="text-4xl">
            Frequently asked
            questions .
          </h2>
          <div className="text-xl flex flex-col mt-6">
            {faqs.map((faq, index) => (
              <button
                className="text-xl w-full flex justify-between py-4 border-b border-border"
                key={faq}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                aria-expanded={activeFaq === index}
              >
                <span>{faq}</span>
                <ChevronDown
                  className={activeFaq === index ? "rotated" : ""}
                  aria-hidden="true"
                />
                {/*{activeFaq === index && (
                  <small>
                    We&apos;re building Sonora for thoughtful teams who want to
                    spend less time managing audio and more time making work
                    that matters.
                  </small>
                )}*/}
              </button>
            ))}
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
    <div className="w-full h-full studio-card ">
      <div className="studio-top">
        <span>
          <span className="live-dot" /> live capture
        </span>
        <span>00:42:18</span>
      </div>
      <div className="studio-screen">
        <div className="studio-heading">
          <div className="avatar">JD</div>
          <div>
            <strong>Product sync — Tuesday</strong>
            <span>Just now · 6 participants</span>
          </div>
          <button aria-label="More options">•••</button>
        </div>
        <div className="waveform" aria-label="Audio waveform">
          {Array.from({ length: 48 }, (_, i) => (
            <i key={i} style={{ height: `${18 + ((i * 17) % 50)}%` }} />
          ))}
        </div>
        <div className="studio-transcript">
          <span className="speaker-label">
            <span className="speaker-dot" /> Jordan · 10:42
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
      <div className="visualizer-glow" />
      <div className="visualizer-top">
        <span>
          <Headphones aria-hidden="true" /> sonora / focus mode
        </span>
        <span>AI ACTIVE</span>
      </div>
      <div className="orb">
        <div className="orb-core" />
        <div className="orb-ring ring-one" />
        <div className="orb-ring ring-two" />
        <div className="orb-ring ring-three" />
      </div>
      <div className="visualizer-caption">
        <strong>Listening for the signal</strong>
        <span>Understanding context across 4 conversations</span>
      </div>
      <div className="visualizer-bars">
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
            <span className="mini-avatar">MC</span>
            <small>Maya&apos;s workspace</small>
          </div>
        </div>
        <div className="workflow-main">
          <div className="workflow-toolbar">
            <span>Customer research / May 14</span>
            <span className="status-pill">
              <span /> analyzed
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
            <button aria-label="More options">•••</button>
          </div>
          <div className="workflow-wave">
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
    <section className="w-full flex justify-between my-16">
      <div className="w-full ">
        <p className="eyebrow">The people who use it</p>
        <p className="text-6xl">
          Good words from
          <br />
          <em>busy minds.</em>
        </p>
      </div>
      <div className="testimonial-grid">
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
        <a className="wordmark" href="#top">
          <span className="wordmark-dot" />
          Sonora<span className="wordmark-ai">.ai</span>
        </a>
        <p>Your ideas, in focus.</p>
        <a className="button button-light" href="#demo">
          Join the waitlist <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Sonora AI, Inc.</span>
        <div>
          <a href="#product">Product</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#company">Company</a>
        </div>
        <span>Built for better listening.</span>
      </div>
    </footer>
  );
}
