"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat } from "@/components/shared/stat";
import { useTRPC } from "@/trpc/client";
import { count, when } from "@/lib/format";

export function AnalyticsPanel({ chatbotId }: { chatbotId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.conversation.analytics.queryOptions({ chatbotId, days: 30 }),
  );

  if (isLoading || !data) return <Skeleton className="h-72 rounded-xl" />;

  const peak = Math.max(1, ...data.daily.map((d) => d.messages));
  const total = data.daily.reduce((a, d) => a + d.messages, 0);
  const happy =
    data.satisfaction === null
      ? "Not rated yet"
      : `${Math.round(((data.satisfaction + 1) / 2) * 100)}%`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Messages" value={count(total)} hint="Last 30 days" />
        <Stat
          label="Conversations"
          value={count(data.conversations)}
          hint="Last 30 days"
        />
        <Stat
          label="Rated helpful"
          value={happy}
          hint="From thumbs in the widget"
        />
      </div>

      <div className="panel-pad">
        <h2 className="mb-4 text-sm font-medium">Daily messages</h2>
        <div className="flex h-28 items-end gap-px sm:h-40 sm:gap-[3px]">
          {data.daily.map((d) => (
            <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.messages}`}>
              <div
                className="bg-primary/85 hover:bg-primary rounded-t-sm transition-colors"
                style={{ height: `${(d.messages / peak) * 100}%`, minHeight: "2px" }}
              />
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>{data.daily[0]?.day}</span>
          <span>{data.daily.at(-1)?.day}</span>
        </div>
      </div>

      <div className="panel-pad">
        <h2 className="font-medium">Questions your sources could not answer</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Each of these is a document you have not written yet.
        </p>
        {data.unanswered.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Nothing went unanswered in this period.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {data.unanswered.map((m) => (
              <li
                key={m.id}
                className="flex items-baseline justify-between gap-4 py-2.5"
              >
                <span className="text-sm">{m.content}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {when(m.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
