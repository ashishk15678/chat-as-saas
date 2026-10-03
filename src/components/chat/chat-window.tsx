"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: { sourceId: string; title: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Web Speech API declarations (not in lib.dom yet)
// ─────────────────────────────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string; confidence: number };
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Waveform canvas — draws a live bar visualizer from an AnalyserNode.
// Starts/stops its own rAF loop; no useEffect needed.
// ─────────────────────────────────────────────────────────────────────────────
function WaveformCanvas({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  // Kick off / tear down the draw loop whenever analyser changes
  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx  = canvas.getContext("2d");
    if (!ctx) return;

    const buf = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      if (!canvas || !analyser || !ctx) return;
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(buf);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bars  = 32;
      const gap   = 2;
      const bw    = (W - gap * (bars - 1)) / bars;
      const step  = Math.floor(buf.length / bars);

      for (let i = 0; i < bars; i++) {
        const v  = buf[i * step] / 255;
        const h  = Math.max(2, v * H);
        const x  = i * (bw + gap);
        const y  = (H - h) / 2;

        // Fade from accent (bottom) to lighter (top)
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, "rgba(255,255,255,0.5)");
        grad.addColorStop(1, "currentColor");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, h, 2);
        ctx.fill();
      }
    }
    draw();
  }, [analyser]);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // When analyser arrives start, when it's gone stop
  useEffect(() => {
    if (analyser) startLoop(); else stopLoop();
    return stopLoop;
  }, [analyser, startLoop, stopLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={32}
      className="h-8 w-full"
      aria-hidden
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useVoice — SpeechRecognition + speechSynthesis + AnalyserNode
// ─────────────────────────────────────────────────────────────────────────────
function useVoice({
  onFinalTranscript,
  onInterimTranscript,
}: {
  onFinalTranscript: (text: string) => void;
  onInterimTranscript: (text: string) => void;
}) {
  // Lazy init — no useEffect needed for capability detection
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis;
  });

  const [listening, setListening] = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [analyser,  setAnalyser]  = useState<AnalyserNode | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);

  // ── TTS stop ──────────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  // ── Mic teardown ──────────────────────────────────────────────────────────
  const teardownAudio = useCallback(() => {
    setAnalyser(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
    teardownAudio();
  }, [teardownAudio]);

  // ── Mic start ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    stopSpeaking();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try { recognitionRef.current?.abort(); } catch {}

    // Set up Web Audio for the waveform visualizer
    navigator.mediaDevices?.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream;
      const ctx  = new AudioContext();
      const src  = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      src.connect(node);
      audioCtxRef.current = ctx;
      setAnalyser(node);
    }).catch(() => { /* mic permission denied — waveform just won't show */ });

    const rec = new SR();
    rec.continuous    = false;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onstart  = () => setListening(true);
    rec.onend    = () => { setListening(false); teardownAudio(); };
    rec.onerror  = () => { setListening(false); teardownAudio(); };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim) onInterimTranscript(interim);
      if (final)   onFinalTranscript(final.trim());
    };

    recognitionRef.current = rec;
    rec.start();
  }, [stopSpeaking, teardownAudio, onFinalTranscript, onInterimTranscript]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (speaking)  { stopSpeaking();   return; }
    if (listening) { stopListening(); return; }
    startListening();
  }, [speaking, listening, stopSpeaking, stopListening, startListening]);

  // ── TTS speak ─────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();

    const clean = text
      .replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "")
      .replace(/`[^`]*`/g, "").replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ");

    const utt     = new SpeechSynthesisUtterance(clean);
    utt.rate      = 1.05;
    utt.pitch     = 1;
    utt.onstart   = () => setSpeaking(true);
    utt.onend     = () => setSpeaking(false);
    utt.onerror   = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }, [stopSpeaking]);

  return { listening, speaking, supported, analyser, toggle, speak, stopSpeaking };
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatWindow
// ─────────────────────────────────────────────────────────────────────────────
export function ChatWindow({
  greeting,
  accent,
  send,
  className,
  onReset,
  initialMessages = [],
  onMessagesChange,
}: {
  greeting: string;
  accent?: string;
  send: (history: ChatMessage[]) => Promise<ChatMessage>;
  className?: string;
  onReset?: () => void;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft]       = useState("");
  const [busy, setBusy]         = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Track whether the last question came via voice so we only speak back then
  const lastInputWasVoiceRef = useRef(false);

  const voice = useVoice({
    onInterimTranscript: (t) => setDraft(t),
    onFinalTranscript: (t) => {
      setDraft(t);
      lastInputWasVoiceRef.current = true;
      setTimeout(() => submitText(t, true), 80);
    },
  });

  // Only legitimate DOM side-effect in this component — scroll to bottom
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function pushMessages(next: ChatMessage[]) {
    setMessages(next);
    onMessagesChange?.(next);
  }

  async function submitText(text: string, fromVoice = false) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    voice.stopSpeaking();
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    pushMessages(next);
    setDraft("");
    setBusy(true);

    try {
      const reply = await send(next);
      pushMessages([...next, reply]);
      // Only speak back if the question was asked by voice
      if (fromVoice) voice.speak(reply.content);
    } catch {
      pushMessages([...next, { role: "assistant", content: "Something went wrong. Try again in a moment." }]);
    } finally {
      setBusy(false);
      lastInputWasVoiceRef.current = false;
    }
  }

  function submit() { void submitText(draft, false); }

  function reset() {
    voice.stopSpeaking();
    pushMessages([]);
    onReset?.();
  }

  const cssVars = accent ? ({ "--chat-accent": accent } as React.CSSProperties) : undefined;
  const micLabel = voice.speaking  ? "Stop speaking"
                 : voice.listening ? "Stop listening"
                 : "Voice input";

  return (
    <div style={cssVars} className={cn("bg-card flex h-full flex-col overflow-hidden", className)}>

      {/* ── Message list ── */}
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        <Bubble role="assistant" content={greeting} onSpeak={voice.speak} />
        {messages.map((m, i) => (
          <Bubble key={i} {...m} onSpeak={m.role === "assistant" ? voice.speak : undefined} />
        ))}
        {busy && (
          <div className="flex gap-1 px-1 py-2" aria-label="Assistant is thinking">
            {[0, 150, 300].map((d) => (
              <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div className="hairline shrink-0 p-2 sm:p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className={cn(
            "focus-within:ring-ring border-input flex items-end gap-1.5 rounded-xl border p-1.5 transition-colors focus-within:ring-2",
            voice.listening && "border-red-400 bg-red-50/40 dark:bg-red-950/20",
            voice.speaking  && "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20",
          )}
        >
          {/* Mic button */}
          {voice.supported && (
            <button
              type="button"
              onClick={voice.toggle}
              aria-label={micLabel}
              title={micLabel}
              className={cn(
                "press relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                voice.speaking  ? "bg-amber-500 text-white"
                : voice.listening ? "bg-red-500 text-white"
                : "text-muted-foreground hover:text-foreground",
              )}
            >
              {voice.listening && (
                <span className="absolute inset-0 animate-ping rounded-lg bg-red-400 opacity-40" />
              )}
              {voice.listening ? <MicOff className="relative size-4" />
               : voice.speaking ? <VolumeX className="relative size-4" />
               : <Mic className="relative size-4" />}
            </button>
          )}

          {/* Waveform OR textarea */}
          {voice.listening ? (
            <div className="flex flex-1 items-center px-2 py-1 text-red-600 dark:text-red-400">
              <WaveformCanvas analyser={voice.analyser} />
            </div>
          ) : (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              rows={1}
              placeholder="Ask a question…"
              aria-label="Message"
              className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            />
          )}

          <Button
            type="submit"
            size="icon"
            className="press size-8 shrink-0 rounded-lg"
            style={accent ? { background: accent, color: "#fff" } : undefined}
            disabled={(!draft.trim() && !voice.listening) || busy || voice.listening}
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        </form>

        <div className="mt-1 flex items-center justify-between px-1">
          {onReset && messages.length > 0 && (
            <button type="button" onClick={reset}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors">
              <RotateCcw className="size-3" /> Start over
            </button>
          )}
          {voice.supported && (
            <span className={cn(
              "ml-auto text-[10px] transition-colors",
              voice.listening ? "text-red-500 font-medium"
              : voice.speaking  ? "text-amber-500 font-medium"
              : "text-muted-foreground/40",
            )}>
              {voice.listening ? "● Listening" : voice.speaking ? "● Speaking" : "○ Voice"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bubble
// ─────────────────────────────────────────────────────────────────────────────
function Bubble({ role, content, citations, onSpeak }: ChatMessage & { onSpeak?: (t: string) => void }) {
  const mine = role === "user";
  return (
    <div className={cn("flex", mine && "justify-end")}>
      <div className={cn(
        "group relative max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:max-w-[85%] sm:px-3.5",
        mine
          ? "rounded-br-sm bg-foreground text-background"
          : "rounded-bl-sm border border-border bg-muted text-foreground",
      )}>
        <p className="whitespace-pre-wrap">{content}</p>
        {citations && citations.length > 0 && (
          <p className="mt-1.5 text-xs opacity-60">
            From {citations.map((c) => c.title).join(", ")}
          </p>
        )}
        {onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(content)}
            aria-label="Read aloud"
            className="absolute -bottom-1 -right-1 hidden size-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-opacity group-hover:flex group-hover:opacity-100 opacity-0"
          >
            <Volume2 className="size-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
