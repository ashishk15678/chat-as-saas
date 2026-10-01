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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { BOT_TYPES, type BotType } from "@/lib/validators";

/* ── Bot-type presets ─────────────────────────────────────────────────────
   Each preset seeds systemPrompt + greeting. Users can still edit freely
   after applying. Shown as selectable cards in the form.
   ──────────────────────────────────────────────────────────────────────── */
const BOT_TYPE_META: Record<
  BotType,
  {
    label: string;
    description: string;
    icon: string;
    systemPrompt: string;
    greeting: string;
  }
> = {
  support: {
    label: "Customer support",
    description: "Answers product and service questions from customers.",
    icon: "🎧",
    systemPrompt:
      "You are a friendly and knowledgeable customer support assistant. Your job is to answer customers' questions accurately and helpfully using only the provided documentation. Always be polite and empathetic. If you cannot find the answer, direct the customer to the support team.",
    greeting: "Hi! How can I help you today?",
  },
  sales: {
    label: "Sales assistant",
    description: "Qualifies leads and answers pre-purchase questions.",
    icon: "💼",
    systemPrompt:
      "You are an enthusiastic sales assistant. Your goal is to help prospective customers understand our product's value, answer their pre-purchase questions, and guide them toward making a confident buying decision. Focus on benefits and use cases. Be honest about limitations.",
    greeting: "Hi there! Looking to learn more? I'm here to help.",
  },
  onboarding: {
    label: "Onboarding guide",
    description: "Walks new users through setup and key features.",
    icon: "🚀",
    systemPrompt:
      "You are a helpful onboarding guide. Your job is to help new users get started quickly by walking them through setup steps, explaining key features, and answering common getting-started questions. Keep instructions clear and concise.",
    greeting:
      "Welcome! I'll help you get set up. Where would you like to start?",
  },
  faq: {
    label: "FAQ bot",
    description: "Answers frequently asked questions directly.",
    icon: "❓",
    systemPrompt:
      "You are a concise FAQ assistant. Answer questions directly and briefly using only the provided knowledge base. If the question isn't covered, say so clearly and suggest where the user can find more help.",
    greeting: "Ask me anything — I'll do my best to answer.",
  },
};

type Bot = {
  id: string;
  name: string;
  botType: string;
  status: string;
  systemPrompt: string;
  fallbackMessage: string;
  model: string;
  temperature: number;
  greeting: string;
  accent: string;
  themeMode: string;
  position: string;
  allowedDomains: string[];
  collectEmail: boolean;
  rateLimitRpm: number;
};

export function SettingsForm({ bot }: { bot: Bot }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [draft, setDraft] = useState(bot);
  const set = <K extends keyof Bot>(key: K, value: Bot[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

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

  function applyPreset(type: BotType) {
    const p = BOT_TYPE_META[type];
    setDraft((d) => ({
      ...d,
      botType: type,
      systemPrompt: p.systemPrompt,
      greeting: p.greeting,
    }));
  }

  function save() {
    const { id, ...rest } = draft;
    update.mutate({
      chatbotId: bot.id,
      patch: {
        ...rest,
        botType: rest.botType as BotType,
        status: rest.status as "DRAFT" | "LIVE" | "PAUSED",
        model: rest.model as "llama-3.3-70b-versatile",
        themeMode: rest.themeMode as "system",
        position: rest.position as "right",
      },
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* ── Bot type ── */}
      <div className="space-y-3">
        <Label>Bot type</Label>
        <p className="text-muted-foreground text-xs">
          Choosing a type applies a starter system prompt and greeting. You can
          still edit them below.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {BOT_TYPES.map((type) => {
            const meta = BOT_TYPE_META[type];
            const active = draft.botType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => applyPreset(type)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                    : "border-border hover:border-accent/40 hover:bg-surface"
                }`}
              >
                <span className="text-xl leading-none">{meta.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-4">
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Basic info ── */}
      <Field label="Name">
        <Input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>

      <Field
        label="Status"
        hint="Paused chatbots keep their sources but stop answering."
      >
        <Select
          value={draft.status}
          onValueChange={(v) => set("status", v ?? draft.status)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="System instructions"
        hint="Tell it who it works for and how to behave."
      >
        <Textarea
          rows={6}
          value={draft.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value)}
        />
      </Field>

      <Field
        label="Fallback message"
        hint="Shown verbatim when the bot has no matching information. Make it actionable — give visitors somewhere to go."
      >
        <Textarea
          rows={3}
          value={draft.fallbackMessage}
          onChange={(e) => set("fallbackMessage", e.target.value)}
          placeholder="I don't have information on that yet. Please contact support@example.com and we'll get back to you shortly."
        />
      </Field>

      <Field label="Opening message">
        <Input
          value={draft.greeting}
          onChange={(e) => set("greeting", e.target.value)}
        />
      </Field>

      {/* ── Model + appearance ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Model">
          <Select
            value={draft.model}
            onValueChange={(v) => set("model", v ?? draft.model)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llama-3.3-70b-versatile">
                Llama 3.3 70B (smart)
              </SelectItem>
              <SelectItem value="llama-3.1-8b-instant">
                Llama 3.1 8B (fast)
              </SelectItem>
              <SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
              <SelectItem value="mixtral-8x7b-32768">Mixtral 8×7B</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Accent colour">
          <div className="flex gap-2">
            <input
              type="color"
              value={draft.accent}
              onChange={(e) => set("accent", e.target.value)}
              className="border-input h-9 w-12 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Accent colour"
            />
            <Input
              value={draft.accent}
              onChange={(e) => set("accent", e.target.value)}
              className="font-mono"
            />
          </div>
        </Field>

        <Field label="Widget theme">
          <Select
            value={draft.themeMode}
            onValueChange={(v) => set("themeMode", v ?? draft.themeMode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Follow the visitor</SelectItem>
              <SelectItem value="light">Always light</SelectItem>
              <SelectItem value="dark">Always dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Bubble position">
          <Select
            value={draft.position}
            onValueChange={(v) => set("position", v ?? draft.position)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="right">Bottom right</SelectItem>
              <SelectItem value="left">Bottom left</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Allowed domains"
        hint="One per line. Requests from anywhere else are refused. Leave empty while developing."
      >
        <Textarea
          rows={3}
          value={draft.allowedDomains.join("\n")}
          onChange={(e) =>
            set(
              "allowedDomains",
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={"example.com\nshop.example.com"}
        />
      </Field>

      <Field
        label="Rate limit (messages / minute per visitor)"
        hint="Protects your quota from scripts hammering the widget."
      >
        <Input
          type="number"
          min={1}
          max={120}
          value={draft.rateLimitRpm}
          onChange={(e) => set("rateLimitRpm", Number(e.target.value))}
        />
      </Field>

      <div className="panel-pad flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Ask for email before chatting</p>
          <p className="text-muted-foreground text-sm">
            Useful when you want to follow up on unanswered questions.
          </p>
        </div>
        <Switch
          checked={draft.collectEmail}
          onCheckedChange={(v) => set("collectEmail", v)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button className="press" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setDraft(bot)}
          disabled={update.isPending}
        >
          Discard
        </Button>
      </div>

      {/* ── Danger zone ── */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-destructive/30 p-5">
        <div>
          <p className="text-sm font-semibold">Delete this chatbot</p>
          <p className="text-muted-foreground text-sm">
            Sources, conversations and the embed stop working immediately.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() =>
            confirm(`Delete "${bot.name}"? This cannot be undone.`) &&
            remove.mutate({ chatbotId: bot.id })
          }
        >
          Delete chatbot
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && (
        <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
