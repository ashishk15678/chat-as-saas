"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useTRPC } from "@/trpc/client";
import { when } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ConversationBrowser({ chatbotId }: { chatbotId: string }) {
  const trpc = useTRPC();
  const [selected, setSelected] = useState<string | null>(null);

  const list = useInfiniteQuery(
    trpc.conversation.list.infiniteQueryOptions(
      { chatbotId, limit: 20 },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );
  const detail = useQuery({
    ...trpc.conversation.detail.queryOptions({ chatbotId, conversationId: selected! }),
    enabled: !!selected,
  });

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];

  if (list.isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!items.length)
    return (
      <EmptyState
        title="No conversations yet"
        body="Conversations appear here as soon as a visitor asks the live widget a question."
        action={null}
      />
    );

  return (
    // Mobile: one panel at a time. Desktop: side-by-side.
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">

      {/* List column — hidden on mobile when a conversation is selected */}
      <div className={cn("space-y-2", selected && "hidden lg:block")}>
        <ul className="panel divide-y">
          {items.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelected(c.id)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                  selected === c.id && "bg-primary-muted/50",
                )}
              >
                <p className="truncate text-sm">{c.messages[0]?.content ?? "Conversation"}</p>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                  {c._count.messages} messages · {when(c.lastAt)}
                  {c.rating === 1  && <ThumbsUp  className="text-success size-3" />}
                  {c.rating === -1 && <ThumbsDown className="text-destructive size-3" />}
                </p>
              </button>
            </li>
          ))}
        </ul>
        {list.hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => list.fetchNextPage()}
            disabled={list.isFetchingNextPage}
          >
            {list.isFetchingNextPage ? "Loading…" : "Load older"}
          </Button>
        )}
      </div>

      {/* Detail column */}
      <div className={cn("panel-pad min-h-64", !selected && "hidden lg:block")}>
        {!selected ? (
          <p className="text-muted-foreground text-sm">Pick a conversation to read the full exchange.</p>
        ) : detail.isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="space-y-4">
            {/* Mobile back button */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1 text-xs lg:hidden"
            >
              <ChevronLeft className="size-3.5" /> All conversations
            </button>

            <p className="text-muted-foreground text-xs">
              {detail.data?.visitorMail ?? "Anonymous visitor"} · {detail.data?.origin ?? "unknown page"}
            </p>

            {detail.data?.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[88%] rounded-xl px-3 py-2.5 text-sm sm:max-w-[80%] sm:px-3.5",
                    m.role === "user" ? "bg-foreground text-background" : "bg-muted",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {Array.isArray(m.citations) && m.citations.length > 0 && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      From {(m.citations as { title: string }[]).map((c) => c.title).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
