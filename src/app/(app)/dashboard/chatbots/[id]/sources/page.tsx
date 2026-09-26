import { SourcesPanel } from "./panel";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SourcesPanel chatbotId={id} />;
}
