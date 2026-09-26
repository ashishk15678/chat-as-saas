"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";

export function CreateChatbot({ label = "New chatbot" }: { label?: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const create = useMutation(
    trpc.chatbot.create.mutationOptions({
      onSuccess: async ({ id }) => {
        await qc.invalidateQueries({ queryKey: trpc.chatbot.list.queryKey() });
        toast.success("Chatbot created. Add a source to teach it.");
        setOpen(false);
        setName("");
        router.push(`/dashboard/chatbots/${id}/sources`);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="press gap-1.5">
            <Plus className="size-4" /> {label}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a chatbot</DialogTitle>
          <DialogDescription>
            Name it after the site or product it will answer for. You can change
            this later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="bot-name">Name</Label>
          <Input
            id="bot-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme help desk"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="press"
            disabled={name.trim().length < 2 || create.isPending}
            onClick={() => create.mutate({ name: name.trim() })}
          >
            {create.isPending ? "Creating…" : "Create chatbot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
