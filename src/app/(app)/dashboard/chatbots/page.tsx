import Link from "next/link";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusDot } from "@/components/shared/status-dot";
import { CreateChatbot } from "@/components/dashboard/create-chatbot";
import { count, when } from "@/lib/format";

export default async function ChatbotsPage() {
  const bots = await api.chatbot.list();

  return (
    <>
      <PageHeader title="Chatbots" description="Each chatbot has its own sources, appearance and embed snippet." action={<CreateChatbot />} />

      {bots.length === 0 ? (
        <EmptyState
          title="No chatbots yet"
          body="Create one, add a document or a help page, and you will have something to test in a few minutes."
          action={<CreateChatbot label="Create your first chatbot" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bots.map((b) => (
            <Link key={b.id} href={`/dashboard/chatbots/${b.id}`} className="panel-pad press hover:shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-3 rounded-md" style={{ background: b.accent }} aria-hidden />
                  <h2 className="font-medium">{b.name}</h2>
                </div>
                <StatusDot status={b.status} />
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                {count(b._count.sources)} sources · {count(b._count.conversations)} conversations
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Edited {when(b.updatedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
