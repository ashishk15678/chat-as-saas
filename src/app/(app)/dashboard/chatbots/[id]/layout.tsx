import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { StatusDot } from "@/components/shared/status-dot";
import { BotTabs } from "./tabs";

export default async function ChatbotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bot = await api.chatbot.byId({ chatbotId: id }).catch(() => null);
  if (!bot) notFound();

  return (
    <>
      <Link
        href="/dashboard/chatbots"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Chatbots
      </Link>
      <div className="flex flex-wrap items-center gap-2 pb-5">
        <span
          className="size-3 shrink-0 rounded-md"
          style={{ background: bot.accent }}
          aria-hidden
        />
        <h1 className="min-w-0 truncate text-xl font-semibold sm:text-2xl">
          {bot.name}
        </h1>
        <StatusDot status={bot.status} />
      </div>
      <BotTabs id={id} />
      <div className="pt-6">{children}</div>
    </>
  );
}
