"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { ChatWindow, type ChatMessage } from "@/components/chat/chat-window";
import { useTRPC } from "@/trpc/client";

const STORAGE_KEY = (id: string) => `chatline:playground:${id}`;
const MAX_STORED = 40;

function loadSession(chatbotId: string): ChatMessage[] {
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY(chatbotId))
        : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSession(chatbotId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY(chatbotId),
      JSON.stringify(messages.slice(-MAX_STORED)),
    );
  } catch {
    /* localStorage full — silently ignore */
  }
}

function clearSession(chatbotId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY(chatbotId));
  } catch {}
}

export function Playground({
  chatbotId,
  greeting,
  accent,
}: {
  chatbotId: string;
  greeting: string;
  accent: string;
}) {
  const trpc = useTRPC();
  const preview = useMutation(trpc.chatbot.preview.mutationOptions());

  // Lazy initialiser — runs once, no extra render, no useEffect needed.
  // Pass a `key` to ChatWindow to force a full remount on clear.
  const [sessionKey, setSessionKey] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>(() =>
    loadSession(chatbotId),
  );

  function handleMessagesChange(messages: ChatMessage[]) {
    saveSession(chatbotId, messages);
  }

  function handleReset() {
    clearSession(chatbotId);
    preview.reset();
  }

  function handleClear() {
    clearSession(chatbotId);
    preview.reset();
    setInitialMessages([]);
    setSessionKey((k) => k + 1);
  }

  async function send(messages: ChatMessage[]): Promise<ChatMessage> {
    const res = await preview.mutateAsync({
      chatbotId,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
    return { role: "assistant", content: res.text, citations: res.citations };
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_260px]">
      {/* Chat window — full height on desktop, fixed shorter on mobile */}
      <div className="panel h-[480px] overflow-hidden sm:h-[540px] lg:h-[580px]">
        <ChatWindow
          key={sessionKey}
          className="h-full"
          greeting={greeting}
          accent={accent}
          send={send}
          initialMessages={initialMessages}
          onMessagesChange={handleMessagesChange}
          onReset={handleReset}
        />
      </div>

      <aside className="panel-pad space-y-4 text-sm lg:h-fit">
        <div className="space-y-1.5">
          <h2 className="font-semibold">Playground</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Free to test — never counts against your monthly messages.
          </p>
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <p className="text-xs font-medium">Session saved</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your conversation is kept in this browser. Refresh and it will still
            be here.
          </p>
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <p className="text-xs font-medium">Not getting good answers?</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            The fix is almost always a missing source or a vague system prompt —
            both live on the Settings tab.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3" />
            Clear saved session
          </button>
        </div>
      </aside>
    </div>
  );
}
