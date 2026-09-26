import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { EmbeddedChat } from "./embedded-chat";

export const dynamic = "force-dynamic";

/** The page inside the widget iframe. Deliberately minimal: no nav, no analytics, no session. */
export default async function EmbedPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const bot = await db.chatbot.findUnique({
    where: { id: botId },
    select: {
      id: true,
      name: true,
      greeting: true,
      accent: true,
      themeMode: true,
      status: true,
      collectEmail: true,
    },
  });
  if (!bot || bot.status !== "LIVE") notFound();

  return (
    <div className={bot.themeMode === "dark" ? "dark" : undefined}>
      <EmbeddedChat bot={bot} />
    </div>
  );
}
