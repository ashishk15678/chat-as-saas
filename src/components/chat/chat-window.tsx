"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: { sourceId: string; title: string }[];
};

// ── Browser API type declarations ──────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
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

// ── useVoice hook ───────────────────────────────────────────────────────────
// Encapsulates SpeechRecognition + speechSynthesis so the component stays clean.
function useVoice({
  onFinalTranscript,
  onInterimTranscript,
}: {
  onFinalTranscript: (text: string) => void;
  onInterimTranscript: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR && !!window.speechSynthesis);
  }, []);

  // Stop TTS immediately
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  // Start listening; if TTS is playing, interrupt it first
  const startListening = useCallback(() => {
    stopSpeaking();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Clean up any previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const rec = new SR();
    rec.continuous = false;       // one utterance at a time
    rec.interimResults = true;    // show live transcript while speaking
    rec.lang = "en-US";

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final   = "";
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
  }, [stopSpeaking, onFinalTranscript, onInterimTranscript]);

  // Stop microphone
  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  // Toggle: if speaking → interrupt; if listening → stop; else → start
  const toggle = useCallback(() => {
    if (speaking) { stopSpeaking(); return; }
    if (listening) { stopListening(); return; }
    startListening();
  }, [speaking, listening, stopSpeaking, stopListening, startListening]);

  // Speak text aloud
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();

    // Strip markdown-ish formatting so TTS doesn't say "asterisk asterisk"
    const clean = text
      .replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "")
      .replace(/`[^`]*`/g, "").replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ");

    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate  = 1.05;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    // Chrome bug: utterances > ~250 chars can silently stop — chunk them
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }, [stopSpeaking]);

  return { listening, speaking, supported, toggle, speak, stopSpeaking };
}

// ── ChatWindow ──────────────────────────────────────────────────────────────
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

  const voice = useVoice({
    // Live transcript → update textarea while user speaks
    onInterimTranscript: (t) => setDraft(t),
    // Final transcript → replace textarea and auto-submit
    onFinalTranscript: (t) => {
      setDraft(t);
      // Small delay so the textarea visually shows the text before submitting
      setTimeout(() => submitText(t), 80);
    },
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function pushMessages(next: ChatMessage[]) {
    setMessages(next);
    onMessagesChange?.(next);
  }

  // Core send function — takes explicit text so voice can pass transcript directly
  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    // If assistant is speaking, interrupt before answering a new question
    voice.stopSpeaking();

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    pushMessages(next);
    setDraft("");
    setBusy(true);
    try {
      const reply = await send(next);
      pushMessages([...next, reply]);
      // Speak the reply aloud
      voice.speak(reply.content);
    } catch {
      pushMessages([...next, { role: "assistant", content: "Something went wrong. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  function submit() { void submitText(draft); }

  function reset() {
    voice.stopSpeaking();
    pushMessages([]);
    onReset?.();
  }

  const cssVars = accent ? ({ "--chat-accent": accent } as React.CSSProperties) : undefined;

  // Mic button state
  const micActive  = voice.listening || voice.speaking;
  const micLabel   = voice.speaking  ? "Stop speaking"
                   : voice.listening ? "Stop listening"
                   : "Start voice input";

  return (
    <div style={cssVars} className={cn("bg-card flex h-full flex-col overflow-hidden", className)}>

      {/* Message list */}
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
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

      {/* Input bar */}
      <div className="hairline p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="focus-within:ring-ring border-input flex items-end gap-2 rounded-xl border p-1.5 focus-within:ring-2"
        >
          {/* Mic button — leftmost */}
          {voice.supported && (
            <button
              type="button"
              onClick={voice.toggle}
              aria-label={micLabel}
              title={micLabel}
              className={cn(
                "press size-8 shrink-0 rounded-lg transition-colors",
                voice.speaking
                  ? "bg-amber-500 text-white"
                  : voice.listening
                    ? "bg-red-500 text-white"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Pulse ring while listening */}
              <span className="relative flex items-center justify-center">
                {voice.listening && (
                  <span className="absolute inline-flex size-8 animate-ping rounded-lg bg-red-400 opacity-50" />
                )}
                {voice.listening ? (
                  <MicOff className="relative size-4" />
                ) : voice.speaking ? (
                  <VolumeX className="relative size-4" />
                ) : (
                  <Mic className="relative size-4" />
                )}
              </span>
            </button>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            rows={1}
            placeholder={voice.listening ? "Listening…" : "Ask a question…"}
            aria-label="Message"
            readOnly={voice.listening}
            className={cn(
              "max-h-32 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none",
              voice.listening && "text-muted-foreground",
            )}
          />

          <Button
            type="submit"
            size="icon"
            className="press size-8 shrink-0 rounded-lg"
            style={accent ? { background: accent, color: "#fff" } : undefined}
            disabled={!draft.trim() || busy || voice.listening}
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        </form>

        <div className="mt-1.5 flex items-center justify-between">
          {onReset && messages.length > 0 && (
            <button type="button" onClick={reset}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors">
              <RotateCcw className="size-3" /> Start over
            </button>
          )}

          {/* Voice status hint */}
          {voice.supported && (
            <span className={cn(
              "ml-auto text-[10px] tabular-nums transition-colors",
              voice.listening ? "text-red-500" : voice.speaking ? "text-amber-500" : "text-muted-foreground/50",
            )}>
              {voice.listening ? "● Listening" : voice.speaking ? "● Speaking" : "○ Voice ready"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function Bubble({ role, content, citations, onSpeak }: ChatMessage & { onSpeak?: (t: string) => void }) {
  const mine = role === "user";
  return (
    <div className={cn("flex", mine && "justify-end")}>
      <div className={cn(
        "group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
        mine
          ? "rounded-br-sm bg-foreground text-background"
          : "rounded-bl-sm border border-border bg-muted text-foreground",
      )}>
        <p className="whitespace-pre-wrap">{content}</p>

        {citations && citations.length > 0 && (
          <p className="mt-2 text-xs opacity-60">
            From {citations.map((c) => c.title).join(", ")}
          </p>
        )}

        {/* Speaker button on assistant bubbles */}
        {onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(content)}
            aria-label="Read aloud"
            className="absolute -bottom-1 -right-1 hidden size-6 items-center justify-center rounded-full border border-border bg-card opacity-0 shadow-sm transition-opacity group-hover:flex group-hover:opacity-100"
          >
            <Volume2 className="size-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
