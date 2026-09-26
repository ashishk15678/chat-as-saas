import { z } from "zod";

/** Shared by tRPC inputs, REST routes and client forms. One definition, three consumers. */
export const id = z.string().cuid();

export const hexColor = z
  .string()
  .regex(/^#([0-9a-f]{6})$/i, "Use a six-digit hex colour");

export const domain = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/,
    "Enter a hostname such as app.example.com",
  );

export const chatbotCreate = z.object({
  name: z.string().trim().min(2).max(60),
});

export const chatbotUpdate = z.object({
  chatbotId: id,
  patch: z
    .object({
      name: z.string().trim().min(2).max(60),
      status: z.enum(["DRAFT", "LIVE", "PAUSED"]),
      systemPrompt: z.string().trim().max(4_000),
      model: z.enum([
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
        "mixtral-8x7b-32768",
      ]),
      temperature: z.number().min(0).max(1),
      greeting: z.string().trim().max(200),
      accent: hexColor,
      themeMode: z.enum(["system", "light", "dark"]),
      position: z.enum(["left", "right"]),
      allowedDomains: z.array(domain).max(25),
      collectEmail: z.boolean(),
      rateLimitRpm: z.number().int().min(1).max(120),
    })
    .partial(),
});

export const sourceCreate = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("FILE"),
    chatbotId: id,
    title: z.string().min(1),
    key: z.string().min(1),
    bytes: z.number().int().positive(),
  }),
  z.object({ type: z.literal("URL"), chatbotId: id, url: z.string().url() }),
  z.object({
    type: z.literal("TEXT"),
    chatbotId: id,
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(200_000),
  }),
  z.object({
    type: z.literal("FAQ"),
    chatbotId: id,
    question: z.string().min(3).max(300),
    answer: z.string().min(1).max(10_000),
  }),
]);

export const chatRequest = z.object({
  chatbotId: id,
  conversationId: id.optional(),
  visitorId: z.string().min(8).max(64),
  message: z.string().trim().min(1).max(2_000),
  visitorMail: z.string().email().optional(),
});

export const page = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(50).default(20),
});
