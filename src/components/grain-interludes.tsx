"use client";

import { ArrowUpRight, AudioWaveform, Sparkles } from "lucide-react";

export function GrainInterludes() {
  return (
    <section className="grain-interludes" aria-label="Sonora capabilities">
      <div className="grain-panel grain-panel-signal">
        <div className="grain-panel-meta">
          <span>01 / signal</span>
          <span>always on</span>
        </div>
        <div className="grain-signal-mark" aria-hidden="true">
          <AudioWaveform />
        </div>
        <div className="grain-panel-copy">
          <p className="eyebrow">The signal layer</p>
          <h2>
            Hear the
            <br />
            <em>whole picture.</em>
          </h2>
          <p>One clear layer for every voice note, call, and idea in motion.</p>
          <a href="#demo">
            Explore signal <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="grain-panel grain-panel-context">
        <div className="grain-panel-meta">
          <span>02 / context</span>
          <span>ai-native</span>
        </div>
        <div className="grain-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="grain-panel-copy">
          <p className="eyebrow">The context layer</p>
          <h2>
            Make meaning
            <br />
            <em>move faster.</em>
          </h2>
          <p>
            Sonora connects the dots between what was said and what should
            happen next.
          </p>
          <a href="#solutions">
            See how it works <Sparkles aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function GrainQuote() {
  return (
    <section className="grain-quote section-rule">
      <div className="grain-quote-noise" aria-hidden="true" />
      <blockquote className="text-6xl">
        “The best interface for an idea is still a human voice.”
      </blockquote>
      <span className="grain-quote-caption">
        SONORA / AUDIO INTELLIGENCE FOR THE REST OF US
      </span>
    </section>
  );
}
