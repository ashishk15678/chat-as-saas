import { api } from "@/trpc/server";
import { SettingsForm } from "./form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bot = await api.chatbot.byId({ chatbotId: id });
  return <SettingsForm bot={bot} />;
}
