"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: { sourceId: string; title: string }[];
};

export function ChatWindow({
  greeting,
  accent,
  send,
  className,
  onReset,
  // initialMessages is only read on mount; changes after mount are ignored.
  // Use the `key` prop on ChatWindow to fully reset it instead of passing
  // new initialMessages — this avoids the setState-in-useEffect anti-pattern.
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
  // Initialised once from the prop — no sync effect needed.
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or while streaming.
  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  function pushMessages(next: ChatMessage[]) {
    setMessages(next);
    onMessagesChange?.(next);
  }

  async function submit() {
    const text = draft.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    pushMessages(next);
    setDraft("");
    setBusy(true);
    try {
      const reply = await send(next);
      pushMessages([...next, reply]);
    } catch {
      pushMessages([
        ...next,
        {
          role: "assistant",
          content: "Something went wrong. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    pushMessages([]);
    onReset?.();
  }

  const cssVars = accent
    ? ({ "--chat-accent": accent } as React.CSSProperties)
    : undefined;

  return (
    <div
      style={cssVars}
      className={cn("bg-card flex h-full flex-col overflow-hidden", className)}
    >
      {/* Message list */}
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
        <Bubble role="assistant" content={greeting} />
        {messages.map((m, i) => (
          <Bubble key={i} {...m} />
        ))}
        {busy && (
          <div
            className="flex gap-1 px-1 py-2"
            aria-label="Assistant is thinking"
          >
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input — uses a form so Enter submits */}
      <div className="hairline p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="focus-within:ring-ring border-input flex items-end gap-2 rounded-xl border p-1.5 focus-within:ring-2"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Shift+Enter adds a newline; plain Enter submits.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            placeholder="Ask a question…"
            aria-label="Message"
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="press size-8 shrink-0 rounded-lg"
            style={accent ? { background: accent, color: "#fff" } : undefined}
            disabled={!draft.trim() || busy}
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        </form>

        {onReset && messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <RotateCcw className="size-3" /> Start over
          </button>
        )}
      </div>
    </div>
  );
}

function Bubble({ role, content, citations }: ChatMessage) {
  const mine = role === "user";
  return (
    <div className={cn("flex", mine && "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          mine
            ? "rounded-br-sm bg-foreground text-background"
            : "rounded-bl-sm border border-border bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {citations && citations.length > 0 && (
          <p className="mt-2 text-xs opacity-60">
            From {citations.map((c) => c.title).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
