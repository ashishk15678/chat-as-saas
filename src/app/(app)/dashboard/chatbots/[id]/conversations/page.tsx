import { ConversationBrowser } from "./browser";

export default async function ConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConversationBrowser chatbotId={id} />;
}
