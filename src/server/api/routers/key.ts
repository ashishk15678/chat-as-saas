import { z } from "zod";
import { router, protectedProcedure, writeProcedure } from "../trpc";
import { id } from "@/lib/validators";
import { newApiKey } from "../../services/crypto";

export const keyRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.apiKey.findMany({
      where: { userId: ctx.user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, prefix: true, lastUsed: true, createdAt: true },
    }),
  ),

  /** The secret is returned exactly once, here, and never stored in plain text. */
  create: writeProcedure.input(z.object({ name: z.string().trim().min(2).max(40) })).mutation(async ({ ctx, input }) => {
    const { secret, prefix, hash } = newApiKey();
    await ctx.db.apiKey.create({ data: { userId: ctx.user.id, name: input.name, prefix, hash } });
    return { secret };
  }),

  revoke: writeProcedure.input(z.object({ keyId: id })).mutation(async ({ ctx, input }) => {
    await ctx.db.apiKey.updateMany({ where: { id: input.keyId, userId: ctx.user.id }, data: { revokedAt: new Date() } });
    return { id: input.keyId };
  }),
});
