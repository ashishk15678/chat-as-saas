"use client";

import { useRef, useState } from "react";
import { ChatWindow, type ChatMessage } from "@/components/chat/chat-window";

type Bot = {
  id: string;
  name: string;
  greeting: string;
  accent: string;
  collectEmail: boolean;
};

const VISITOR_KEY = "chatline:visitor";

function getVisitorId(): string {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  } catch {
    return crypto.randomUUID();
  }
}

export function EmbeddedChat({ bot }: { bot: Bot }) {
  const conversation = useRef<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(!bot.collectEmail);

  async function send(history: ChatMessage[]): Promise<ChatMessage> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(window.chatlineSettings?.visitorHash
          ? { "x-visitor-hash": window.chatlineSettings.visitorHash }
          : {}),
      },
      body: JSON.stringify({
        chatbotId: bot.id,
        conversationId: conversation.current ?? undefined,
        visitorId: window.chatlineSettings?.visitorId ?? getVisitorId(),
        visitorMail: email || undefined,
        message: history.at(-1)!.content,
      }),
    });

    if (!res.ok) {
      const { error } = await res
        .json()
        .catch(() => ({ error: "Something went wrong." }));
      return { role: "assistant", content: error };
    }

    conversation.current =
      res.headers.get("x-conversation-id") ?? conversation.current;

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    return { role: "assistant", content: text };
  }

  // Email gate
  if (!emailSubmitted) {
    return (
      <div className="flex h-dvh flex-col justify-center gap-4 bg-card p-6">
        <div>
          <h1 className="font-semibold">{bot.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Leave an email so the team can follow up if the answer isn't here.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmailSubmitted(true);
          }}
          className="space-y-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="border-input focus:ring-ring w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: bot.accent }}
            >
              Start chat
            </button>
            <button
              type="button"
              onClick={() => setEmailSubmitted(true)}
              className="text-muted-foreground px-3 py-2 text-sm"
            >
              Skip
            </button>
          </div>
        </form>
        <p className="text-muted-foreground text-[10px]">Powered by Chatline</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh flex-col bg-card">
      <ChatWindow
        className="flex-1"
        greeting={bot.greeting}
        accent={bot.accent}
        send={send}
      />
      {/* Attribution */}
      <p className="text-muted-foreground border-t border-border py-1.5 text-center text-[10px]">
        Powered by Chatline
      </p>
    </div>
  );
}

declare global {
  interface Window {
    chatlineSettings?: { visitorId?: string; visitorHash?: string };
  }
}
