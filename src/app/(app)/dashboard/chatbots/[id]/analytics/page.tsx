import { AnalyticsPanel } from "./panel";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalyticsPanel chatbotId={id} />;
}
