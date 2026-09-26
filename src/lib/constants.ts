export const APP = {
  name: "Chatline",
  tagline: "Support answers from your own documents, on your own site.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type PlanId = "free" | "starter" | "growth" | "scale";

export type Plan = {
  id: PlanId;
  name: string;
  inr: number; // per month, in rupees
  bots: number;
  messages: number; // per month
  storageMb: number;
  seats: number;
  perks: string[];
  razorpayPlanId?: string;
};

/** Single source of truth for pricing, limits and quota checks. */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    inr: 0,
    bots: 1,
    messages: 100,
    storageMb: 10,
    seats: 1,
    perks: [
      "1 chatbot",
      "100 messages a month",
      "10 MB of sources",
      "Chatline badge on the widget",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    inr: 999,
    bots: 3,
    messages: 3_000,
    storageMb: 200,
    seats: 2,
    perks: [
      "3 chatbots",
      "3,000 messages a month",
      "200 MB of sources",
      "Remove the badge",
      "Email support",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER,
  },
  growth: {
    id: "growth",
    name: "Growth",
    inr: 2999,
    bots: 10,
    messages: 15_000,
    storageMb: 2_000,
    seats: 5,
    perks: [
      "10 chatbots",
      "15,000 messages a month",
      "2 GB of sources",
      "Website crawling",
      "Conversation export",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_GROWTH,
  },
  scale: {
    id: "scale",
    name: "Scale",
    inr: 9999,
    bots: 50,
    messages: 100_000,
    storageMb: 20_000,
    seats: 25,
    perks: [
      "50 chatbots",
      "100,000 messages a month",
      "20 GB of sources",
      "Bring your own model key",
      "99.9% uptime terms",
    ],
    razorpayPlanId: process.env.RAZORPAY_PLAN_SCALE,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "growth", "scale"];

export const UPLOAD = {
  maxBytes: 25 * 1024 * 1024,
  accept: {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "text/csv": ".csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
  } as Record<string, string>,
};

export const RAG = {
  chunkChars: 1_200,
  chunkOverlap: 150,
  topK: 6,
  minScore: 0.2,
  maxContextChars: 8_000,
} as const;
