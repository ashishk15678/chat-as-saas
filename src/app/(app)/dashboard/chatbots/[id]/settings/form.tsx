"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";

type Bot = {
  id: string; name: string; status: string; systemPrompt: string; model: string; temperature: number;
  greeting: string; accent: string; themeMode: string; position: string; allowedDomains: string[];
  collectEmail: boolean; rateLimitRpm: number;
};

/** One form, one mutation. Every field writes into the same `patch` object. */
export function SettingsForm({ bot }: { bot: Bot }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [draft, setDraft] = useState(bot);
  const set = <K extends keyof Bot>(key: K, value: Bot[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const update = useMutation(
    trpc.chatbot.update.mutationOptions({
      onSuccess: () => {
        toast.success("Changes saved");
        router.refresh();
      },
      onError: (e) => toast.error(e.message),
    }),
  );
  const remove = useMutation(
    trpc.chatbot.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Chatbot deleted");
        router.push("/dashboard/chatbots");
      },
    }),
  );

  function save() {
    const { id, ...rest } = draft;
    update.mutate({
      chatbotId: bot.id,
      patch: {
        ...rest,
        status: rest.status as "DRAFT" | "LIVE" | "PAUSED",
        model: rest.model as "llama-3.3-70b-versatile",
        themeMode: rest.themeMode as "system",
        position: rest.position as "right",
      },
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Field label="Name">
        <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
      </Field>

      <Field label="Status" hint="Paused chatbots keep their sources but stop answering on your site.">
        <Select value={draft.status} onValueChange={(v) => set("status", v ?? draft.status)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Instructions" hint="Tell it who it works for and how to behave when it does not know something.">
        <Textarea rows={6} value={draft.systemPrompt} onChange={(e) => set("systemPrompt", e.target.value)} />
      </Field>

      <Field label="Opening message">
        <Input value={draft.greeting} onChange={(e) => set("greeting", e.target.value)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Model">
          <Select value={draft.model} onValueChange={(v) => set("model", v ?? draft.model)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (smart)</SelectItem>
              <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (fast)</SelectItem>
              <SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
              <SelectItem value="mixtral-8x7b-32768">Mixtral 8×7B</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Accent colour">
          <div className="flex gap-2">
            <input type="color" value={draft.accent} onChange={(e) => set("accent", e.target.value)} className="border-input h-9 w-12 cursor-pointer rounded-md border bg-transparent" aria-label="Accent colour" />
            <Input value={draft.accent} onChange={(e) => set("accent", e.target.value)} className="font-mono" />
          </div>
        </Field>
        <Field label="Widget theme">
          <Select value={draft.themeMode} onValueChange={(v) => set("themeMode", v ?? draft.themeMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Follow the visitor</SelectItem>
              <SelectItem value="light">Always light</SelectItem>
              <SelectItem value="dark">Always dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Bubble position">
          <Select value={draft.position} onValueChange={(v) => set("position", v ?? draft.position)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="right">Bottom right</SelectItem>
              <SelectItem value="left">Bottom left</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Domains allowed to load this chatbot" hint="One per line. Requests from anywhere else are refused. Leave empty only while developing.">
        <Textarea
          rows={3}
          value={draft.allowedDomains.join("\n")}
          onChange={(e) => set("allowedDomains", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          placeholder={"example.com\nshop.example.com"}
        />
      </Field>

      <Field label="Messages a minute per visitor" hint="Protects your quota from a script hammering the widget.">
        <Input type="number" min={1} max={120} value={draft.rateLimitRpm} onChange={(e) => set("rateLimitRpm", Number(e.target.value))} />
      </Field>

      <div className="panel-pad flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Ask for an email before chatting</p>
          <p className="text-muted-foreground text-sm">Useful when you want to follow up on unanswered questions.</p>
        </div>
        <Switch checked={draft.collectEmail} onCheckedChange={(v) => set("collectEmail", v)} />
      </div>

      <div className="flex items-center gap-3">
        <Button className="press" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="ghost" onClick={() => setDraft(bot)} disabled={update.isPending}>
          Discard
        </Button>
      </div>

      <div className="border-destructive/30 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5">
        <div>
          <p className="text-sm font-medium">Delete this chatbot</p>
          <p className="text-muted-foreground text-sm">Sources, conversations and the embed stop working immediately.</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => confirm(`Delete ${bot.name}? This cannot be undone.`) && remove.mutate({ chatbotId: bot.id })}
        >
          Delete chatbot
        </Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>}
    </div>
  );
}
