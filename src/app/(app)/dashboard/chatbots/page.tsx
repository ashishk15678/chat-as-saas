import Link from "next/link";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-dot";
import { CreateChatbot } from "@/components/dashboard/create-chatbot";
import { count, when } from "@/lib/format";

export default async function ChatbotsPage() {
  const bots = await api.chatbot.list();

  return (
    <>
      <PageHeader
        title="Chatbots"
        description="Each chatbot has its own sources, appearance and embed snippet."
        action={<CreateChatbot />}
      />

      {bots.length === 0 ? (
        <EmptyState
          title="No chatbots yet"
          body="Create one, add a document or a help page, and you will have something to test in minutes."
          action={<CreateChatbot label="Create your first chatbot" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bots.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/chatbots/${b.id}`}
              className="panel press group flex flex-col gap-4 p-5 transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3 shrink-0 rounded-md"
                    style={{ background: b.accent }}
                    aria-hidden
                  />
                  <h2 className="font-semibold tracking-[-0.02em]">{b.name}</h2>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {count(b._count.sources)} sources ·{" "}
                  {count(b._count.conversations)} conversations
                </span>
                <span>{when(b.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
