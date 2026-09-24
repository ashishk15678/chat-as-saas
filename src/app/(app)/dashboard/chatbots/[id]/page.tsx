import { api } from "@/trpc/server";
import { Playground } from "./playground";

export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bot = await api.chatbot.byId({ chatbotId: id });
  return <Playground chatbotId={id} greeting={bot.greeting} accent={bot.accent} />;
}
