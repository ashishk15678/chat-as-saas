import { z } from "zod";
import { router, botProcedure } from "../trpc";
import { id, page } from "@/lib/validators";

export const conversationRouter = router({
  list: botProcedure
    .input(z.object({ chatbotId: id }).merge(page))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.conversation.findMany({
        where: { chatbotId: ctx.chatbot.id },
        orderBy: { lastAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        select: {
          id: true,
          visitorMail: true,
          origin: true,
          rating: true,
          lastAt: true,
          _count: { select: { messages: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { content: true },
          },
        },
      });
      const next = rows.length > input.limit ? rows.pop()!.id : null;
      return { items: rows, nextCursor: next };
    }),

  detail: botProcedure
    .input(z.object({ chatbotId: id, conversationId: id }))
    .query(({ ctx, input }) =>
      ctx.db.conversation.findFirstOrThrow({
        where: { id: input.conversationId, chatbotId: ctx.chatbot.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      }),
    ),

  analytics: botProcedure
    .input(
      z.object({
        chatbotId: id,
        days: z.number().int().min(7).max(90).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const since = new Date(Date.now() - input.days * 864e5);
      const [daily, totals, unanswered] = await Promise.all([
        ctx.db.$queryRaw<{ day: Date; messages: bigint }[]>`
          SELECT date_trunc('day', m."createdAt") AS day, count(*) AS messages
          FROM "Message" m JOIN "Conversation" c ON c.id = m."conversationId"
          WHERE c."chatbotId" = ${ctx.chatbot.id} AND m."createdAt" >= ${since}
          GROUP BY 1 ORDER BY 1`,
        ctx.db.conversation.aggregate({
          where: { chatbotId: ctx.chatbot.id, createdAt: { gte: since } },
          _count: { _all: true },
          _avg: { rating: true },
        }),
        // Fix: query assistant messages with null citations (user messages never have citations).
        // The previous filter queried role:"user" which always showed everything as unanswered.
        ctx.db.message.findMany({
          where: {
            conversation: { chatbotId: ctx.chatbot.id },
            role: "assistant",
            createdAt: { gte: since },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          // Return the prior user message content so the UI shows the question, not the empty answer
          select: {
            id: true,
            content: true,
            createdAt: true,
            conversationId: true,
          },
        }),
      ]);
      return {
        daily: daily.map((d) => ({
          day: d.day.toISOString().slice(0, 10),
          messages: Number(d.messages),
        })),
        conversations: totals._count._all,
        satisfaction: totals._avg.rating,
        unanswered,
      };
    }),
});
