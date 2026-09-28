import Link from "next/link";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { Stat, Meter } from "@/components/shared/stat";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateChatbot } from "@/components/dashboard/create-chatbot";
import { count, when } from "@/lib/format";

export default async function OverviewPage() {
  const { usage, bots, conversations, messages, recent } =
    await api.chatbot.overview();

  return (
    <>
      <PageHeader
        title="Overview"
        description="Activity across every chatbot on your account — last 30 days."
        action={<CreateChatbot />}
      />

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Chatbots"
          value={count(bots)}
          hint={`${usage.limits.bots} on ${usage.limits.name}`}
        />
        <Stat
          label="Conversations"
          value={count(conversations)}
          hint="Started this month"
        />
        <Stat
          label="Messages answered"
          value={count(messages)}
          hint="Counts toward quota"
        />
      </div>

      {/* Usage meters */}
      <div className="panel-pad mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">This month</p>
          <Link
            href="/dashboard/billing"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            View plan →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Meter
            label={`Messages — ${count(usage.messages)} of ${count(usage.limits.messages)}`}
            value={usage.messages}
            max={usage.limits.messages}
          />
          <Meter
            label={`Sources — ${usage.storedMb} of ${usage.limits.storageMb} MB`}
            value={usage.storedMb}
            max={usage.limits.storageMb}
          />
        </div>
      </div>

      {/* Recent conversations */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold">Recent conversations</p>
        {recent.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            body="Once your widget is live, visitor questions will appear here."
            action={<CreateChatbot label="Create a chatbot" />}
          />
        ) : (
          <ul className="panel divide-y divide-border overflow-hidden">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/chatbots/${c.chatbot.id}/conversations`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {c.messages[0]?.content ?? "Conversation started"}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {c.chatbot.name} · {c.origin ?? "direct"}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {when(c.lastAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
