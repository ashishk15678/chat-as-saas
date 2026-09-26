"use client";

import { useMutation } from "@tanstack/react-query";
import { ChatWindow, type ChatMessage } from "@/components/chat/chat-window";
import { useTRPC } from "@/trpc/client";

/** Same retrieval as production, but it never touches the message quota. */
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

  async function send(messages: ChatMessage[]): Promise<ChatMessage> {
    const res = await preview.mutateAsync({
      chatbotId,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
    return { role: "assistant", content: res.text, citations: res.citations };
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="panel h-[560px] overflow-hidden">
        <ChatWindow
          className="h-full"
          greeting={greeting}
          accent={accent}
          send={send}
          onReset={() => preview.reset()}
        />
      </div>
      <aside className="panel-pad h-fit space-y-3 text-sm">
        <h2 className="font-medium">Testing here is free</h2>
        <p className="text-muted-foreground leading-relaxed">
          Playground replies use the same sources and settings as the live
          widget, and are not counted against your monthly messages.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          If an answer is wrong, the fix is almost always a missing source or a
          vague system prompt — both are on the Settings tab.
        </p>
      </aside>
    </div>
  );
}
