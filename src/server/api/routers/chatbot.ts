import { z } from "zod";
import { router, protectedProcedure, writeProcedure, botProcedure, enforceQuota } from "../trpc";
import { chatbotCreate, chatbotUpdate, id } from "@/lib/validators";
import { usageFor } from "../../services/usage";

export const chatbotRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.chatbot.findMany({
      where: { ownerId: ctx.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, name: true, status: true, accent: true, updatedAt: true,
        _count: { select: { sources: true, conversations: true } },
      },
    }),
  ),

  byId: botProcedure.query(({ ctx }) => ctx.chatbot),

  overview: protectedProcedure.query(async ({ ctx }) => {
    const since = new Date(Date.now() - 30 * 864e5);
    const [usage, bots, conversations, messages, recent] = await Promise.all([
      usageFor(ctx.user.id),
      ctx.db.chatbot.count({ where: { ownerId: ctx.user.id } }),
      ctx.db.conversation.count({ where: { chatbot: { ownerId: ctx.user.id }, createdAt: { gte: since } } }),
      ctx.db.message.count({ where: { conversation: { chatbot: { ownerId: ctx.user.id } }, createdAt: { gte: since } } }),
      ctx.db.conversation.findMany({
        where: { chatbot: { ownerId: ctx.user.id } },
        orderBy: { lastAt: "desc" },
        take: 6,
        select: {
          id: true, lastAt: true, origin: true,
          chatbot: { select: { id: true, name: true } },
          messages: { take: 1, orderBy: { createdAt: "asc" }, select: { content: true } },
        },
      }),
    ]);
    return { usage, bots, conversations, messages, recent };
  }),

  create: writeProcedure.input(chatbotCreate).mutation(async ({ ctx, input }) => {
    await enforceQuota(ctx.user.id, "bots");
    return ctx.db.chatbot.create({ data: { ...input, ownerId: ctx.user.id }, select: { id: true } });
  }),

  update: botProcedure.input(chatbotUpdate).mutation(({ ctx, input }) =>
    ctx.db.chatbot.update({ where: { id: ctx.chatbot.id }, data: input.patch }),
  ),

  remove: botProcedure.mutation(async ({ ctx }) => {
    await ctx.db.chatbot.delete({ where: { id: ctx.chatbot.id } });
    return { id: ctx.chatbot.id };
  }),

  /** Playground answer. Same retrieval path as the public widget, no quota cost. */
  preview: botProcedure
    .input(z.object({ chatbotId: id, messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const { answer } = await import("../../services/rag");
      const { result, citations, grounded } = await answer(ctx.chatbot, input.messages);
      return { text: await result.text, citations, grounded };
    }),
});
