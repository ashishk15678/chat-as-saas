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
        description="The last 30 days across every chatbot on your account."
        action={<CreateChatbot />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Chatbots"
          value={count(bots)}
          hint={`${usage.limits.bots} included on ${usage.limits.name}`}
        />
        <Stat
          label="Conversations"
          value={count(conversations)}
          hint="Started in the last 30 days"
        />
        <Stat
          label="Messages answered"
          value={count(messages)}
          hint="Counts toward your monthly quota"
        />
      </div>

      <div className="panel-pad mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">This month</h2>
          <Link
            href="/dashboard/billing"
            className="text-primary text-sm hover:underline"
          >
            Plan and usage
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Meter
            label={`Messages (${count(usage.messages)} of ${count(usage.limits.messages)})`}
            value={usage.messages}
            max={usage.limits.messages}
          />
          <Meter
            label={`Sources (${usage.storedMb} of ${usage.limits.storageMb} MB)`}
            value={usage.storedMb}
            max={usage.limits.storageMb}
          />
        </div>
      </div>

      <h2 className="mt-8 mb-3 font-medium">Recent conversations</h2>
      {recent.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          body="Once your widget is live on a page, the questions visitors ask will appear here."
          action={<CreateChatbot label="Create a chatbot" />}
        />
      ) : (
        <ul className="panel divide-y">
          {recent.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/chatbots/${c.chatbot.id}/conversations`}
                className="hover:bg-secondary/60 flex items-center gap-4 px-5 py-3.5 transition-colors"
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
    </>
  );
}
