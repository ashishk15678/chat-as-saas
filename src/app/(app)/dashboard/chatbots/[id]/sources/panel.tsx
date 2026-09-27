"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusDot } from "@/components/shared/status-dot";
import { ProcessingBorder } from "@/components/shared/processing-border";
import { FileDropzone } from "@/components/dashboard/file-dropzone";
import { useTRPC } from "@/trpc/client";
import { bytes, count, when } from "@/lib/format";

export function SourcesPanel({ chatbotId }: { chatbotId: string }) {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const list = useQuery(trpc.source.list.queryOptions({ chatbotId }));

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: trpc.source.list.queryKey({ chatbotId }),
    });

  const create = useMutation(
    trpc.source.create.mutationOptions({
      onSuccess: () => {
        toast.success("Source added and ready.");
        void invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );
  const remove = useMutation(
    trpc.source.remove.mutationOptions({ onSuccess: invalidate }),
  );
  const retry = useMutation(
    trpc.source.retry.mutationOptions({
      onSuccess: () => {
        toast.success("Reprocessed successfully.");
        void invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [question, setQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="file">
        <TabsList>
          <TabsTrigger value="file">Files</TabsTrigger>
          <TabsTrigger value="url">Web page</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="faq">Question</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="pt-4">
          <FileDropzone chatbotId={chatbotId} />
        </TabsContent>

        <TabsContent value="url" className="panel-pad mt-4 space-y-3">
          <Label htmlFor="src-url">Page address</Label>
          <Input
            id="src-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://help.example.com/returns"
          />
          <Button
            className="press"
            disabled={!url.startsWith("http") || create.isPending}
            onClick={() =>
              create.mutate(
                { type: "URL", chatbotId, url },
                { onSuccess: () => setUrl("") },
              )
            }
          >
            {create.isPending ? "Processing…" : "Add page"}
          </Button>
        </TabsContent>

        <TabsContent value="text" className="panel-pad mt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="src-title">Title</Label>
            <Input
              id="src-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Shipping policy"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="src-body">Content</Label>
            <Textarea
              id="src-body"
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the text you want the chatbot to know."
            />
          </div>
          <Button
            className="press"
            disabled={!title || !body || create.isPending}
            onClick={() =>
              create.mutate(
                { type: "TEXT", chatbotId, title, body },
                {
                  onSuccess: () => {
                    setTitle("");
                    setBody("");
                  },
                },
              )
            }
          >
            {create.isPending ? "Processing…" : "Add text"}
          </Button>
        </TabsContent>

        <TabsContent value="faq" className="panel-pad mt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="src-q">Question</Label>
            <Input
              id="src-q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="How long does delivery take?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="src-a">Answer</Label>
            <Textarea
              id="src-a"
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write it exactly as you want it said."
            />
          </div>
          <Button
            className="press"
            disabled={!question || !answerText || create.isPending}
            onClick={() =>
              create.mutate(
                { type: "FAQ", chatbotId, question, answer: answerText },
                {
                  onSuccess: () => {
                    setQuestion("");
                    setAnswerText("");
                  },
                },
              )
            }
          >
            {create.isPending ? "Processing…" : "Add question"}
          </Button>
        </TabsContent>
      </Tabs>

      {list.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : list.data?.length === 0 ? (
        <EmptyState
          title="Nothing to learn from yet"
          body="Add a document, a help page or a few questions. Sources are processed immediately."
          action={null}
        />
      ) : (
        <ul className="panel divide-y overflow-hidden">
          {list.data?.map((s) => {
            const isActive = s.status === "QUEUED" || s.status === "PROCESSING";
            return (
              <li
                key={s.id}
                className="relative flex items-center gap-4 px-5 py-3.5"
              >
                {/* Animated border traces the row when processing */}
                {isActive && <ProcessingBorder rounded={0} />}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <StatusDot status={s.status} />
                    <span>·</span>
                    <span>
                      {s.bytes ? bytes(s.bytes) : `${count(s.tokens)} tokens`}
                    </span>
                    <span>·</span>
                    <span>{when(s.createdAt)}</span>
                  </p>
                  {s.error && (
                    <p className="text-destructive mt-1 text-xs">{s.error}</p>
                  )}
                </div>

                {s.status === "FAILED" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={retry.isPending}
                    onClick={() => retry.mutate({ chatbotId, sourceId: s.id })}
                    aria-label="Try processing again"
                  >
                    <RotateCcw
                      className={
                        retry.isPending ? "animate-spin size-4" : "size-4"
                      }
                    />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove.mutate({ chatbotId, sourceId: s.id })}
                  aria-label={`Remove ${s.title}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
