"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyField } from "@/components/shared/copy-field";
import { useTRPC } from "@/trpc/client";
import { when } from "@/lib/format";

export function ApiKeys() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);

  const keys = useQuery(trpc.key.list.queryOptions());
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: trpc.key.list.queryKey() });

  const create = useMutation(
    trpc.key.create.mutationOptions({
      onSuccess: ({ secret }) => {
        setFresh(secret);
        setName("");
        void invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );
  const revoke = useMutation(
    trpc.key.revoke.mutationOptions({ onSuccess: invalidate }),
  );

  return (
    <div className="panel-pad space-y-4">
      <div>
        <h2 className="font-medium">API keys</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Use these to create chatbots and push sources from your own systems.
          Treat them like passwords.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Production server"
          className="max-w-xs"
        />
        <Button
          className="press"
          disabled={name.trim().length < 2 || create.isPending}
          onClick={() => create.mutate({ name: name.trim() })}
        >
          Create key
        </Button>
      </div>

      {fresh && (
        <div className="border-primary/40 bg-primary-muted/40 space-y-2 rounded-xl border p-4">
          <p className="text-sm font-medium">
            Copy this now. It will not be shown again.
          </p>
          <CopyField value={fresh} />
          <button
            onClick={() => setFresh(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            I have stored it
          </button>
        </div>
      )}

      {keys.isLoading ? (
        <Skeleton className="h-16" />
      ) : keys.data?.length === 0 ? (
        <p className="text-muted-foreground text-sm">No keys yet.</p>
      ) : (
        <ul className="divide-y">
          {keys.data?.map((k) => (
            <li key={k.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{k.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {k.prefix}… ·{" "}
                  {k.lastUsed ? `used ${when(k.lastUsed)}` : "never used"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => revoke.mutate({ keyId: k.id })}
                aria-label={`Revoke ${k.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
