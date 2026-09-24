"use client";

import { ChatWindow, type ChatMessage } from "@/components/chat/chat-window";

/** Canned, on purpose: the landing page must never depend on a model call. */
const SCRIPT: Record<string, string> = {
  refund: "Refunds are issued to the original payment method within 5 to 7 working days of approval. Orders can be returned up to 30 days after delivery.",
  shipping: "Standard delivery inside India takes 3 to 5 working days. Express is next-day for orders placed before 2pm.",
  default: "I answer from the documents this team uploaded. Try asking about refunds or delivery times.",
};

export function DemoChat() {
  async function send(history: ChatMessage[]): Promise<ChatMessage> {
    const q = history.at(-1)?.content.toLowerCase() ?? "";
    const key = Object.keys(SCRIPT).find((k) => q.includes(k)) ?? "default";
    await new Promise((r) => setTimeout(r, 550));
    return { role: "assistant", content: SCRIPT[key], citations: key === "default" ? undefined : [{ sourceId: "demo", title: "policies.pdf" }] };
  }

  return (
    <div className="panel h-[440px] overflow-hidden shadow-[var(--shadow-lift)]">
      <div className="hairline-0 flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-primary size-2 rounded-full" />
        <p className="text-sm font-medium">Acme help desk</p>
        <span className="text-muted-foreground ml-auto text-xs">Live demo</span>
      </div>
      <ChatWindow className="h-[calc(100%-49px)]" greeting="Ask me about refunds or delivery. This demo answers from a sample policy document." send={send} />
    </div>
  );
}
