"use client";

import { useEffect, useRef, useState } from "react";
import { ChatWindow, type ChatMessage } from "@/components/chat/chat-window";

type Bot = { id: string; name: string; greeting: string; accent: string; collectEmail: boolean };

const visitorKey = "chatline:visitor";

function visitorId() {
  let v = localStorage.getItem(visitorKey);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(visitorKey, v);
  }
  return v;
}

export function EmbeddedChat({ bot }: { bot: Bot }) {
  const conversation = useRef<string | null>(null);
  const [email, setEmail] = useState("");
  const [asked, setAsked] = useState(!bot.collectEmail);

  // Tell the parent page we are ready, so the launcher can stop showing a spinner.
  useEffect(() => {
    window.parent?.postMessage({ type: "chatline:ready", botId: bot.id }, "*");
  }, [bot.id]);

  async function send(history: ChatMessage[]): Promise<ChatMessage> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(window.chatlineSettings?.visitorHash ? { "x-visitor-hash": window.chatlineSettings.visitorHash } : {}),
      },
      body: JSON.stringify({
        chatbotId: bot.id,
        conversationId: conversation.current ?? undefined,
        visitorId: window.chatlineSettings?.visitorId ?? visitorId(),
        visitorMail: email || undefined,
        message: history.at(-1)!.content,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
      return { role: "assistant", content: error };
    }

    conversation.current = res.headers.get("x-conversation-id") ?? conversation.current;

    // Render the stream as it arrives.
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

  if (!asked) {
    return (
      <div className="bg-card flex h-dvh flex-col justify-center gap-4 p-6">
        <div>
          <h1 className="font-medium">Before we start</h1>
          <p className="text-muted-foreground mt-1 text-sm">Leave an email so the team can follow up if the answer is not here.</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="border-input focus:ring-ring rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
        />
        <div className="flex gap-2">
          <button onClick={() => setAsked(true)} className="bg-primary text-primary-foreground press rounded-lg px-4 py-2 text-sm" style={{ background: bot.accent }}>
            Start chat
          </button>
          <button onClick={() => setAsked(true)} className="text-muted-foreground px-3 py-2 text-sm">
            Skip
          </button>
        </div>
      </div>
    );
  }

  return <ChatWindow className="h-dvh" greeting={bot.greeting} accent={bot.accent} send={send} />;
}

declare global {
  interface Window {
    chatlineSettings?: { visitorId?: string; visitorHash?: string };
  }
}
