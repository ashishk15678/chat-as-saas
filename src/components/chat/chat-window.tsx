"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatMessage = { role: "user" | "assistant"; content: string; citations?: { sourceId: string; title: string }[] };

/**
 * The only chat surface in the product. The playground and the embedded widget
 * both render this and differ solely in the `send` function they pass in.
 */
export function ChatWindow({
  greeting,
  accent,
  send,
  className,
  onReset,
}: {
  greeting: string;
  accent?: string;
  send: (history: ChatMessage[]) => Promise<ChatMessage>;
  className?: string;
  onReset?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function submit() {
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    try {
      setMessages([...next, await send(next)]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong reaching the assistant. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  const style = accent ? ({ "--primary": accent } as React.CSSProperties) : undefined;

  return (
    <div style={style} className={cn("bg-card flex h-full flex-col overflow-hidden", className)}>
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4">
        <Bubble role="assistant" content={greeting} />
        {messages.map((m, i) => (
          <Bubble key={i} {...m} />
        ))}
        {busy && (
          <div className="text-muted-foreground flex gap-1 px-1 py-2" aria-label="Assistant is typing">
            {[0, 150, 300].map((d) => (
              <span key={d} className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
      </div>

      <div className="hairline p-3">
        <div className="border-input focus-within:ring-ring flex items-end gap-2 rounded-lg border p-1.5 focus-within:ring-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            placeholder="Ask a question"
            aria-label="Message"
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
          />
          <Button size="icon" className="press size-8 shrink-0 rounded-md" onClick={submit} disabled={!draft.trim() || busy} aria-label="Send message">
            <ArrowUp className="size-4" />
          </Button>
        </div>
        {onReset && messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              onReset();
            }}
            className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1.5 text-xs"
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
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {citations && citations.length > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            From {citations.map((c) => c.title).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
