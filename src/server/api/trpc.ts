import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "../db";
import { takeToken, LIMITS } from "../services/rate-limit";
import { quotaError, type Quota } from "../services/usage";
import { id } from "@/lib/validators";

export async function createTRPCContext(opts?: { headers?: Headers }) {
  const h = opts?.headers ?? (await headers());
  const session = await auth.api.getSession({ headers: h });
  return {
    db,
    session,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0",
  };
}
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        fieldErrors:
          error.cause instanceof ZodError
            ? error.cause.flatten().fieldErrors
            : null,
      },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/** Requires a session and narrows ctx.session to a non-null type. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sign in to continue.",
    });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

/** Per-user write throttle. Applied to every mutation router-wide. */
export const writeProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { ok, retryAfter } = await takeToken(
    "mutation",
    ctx.user.id,
    LIMITS.mutation,
  );
  if (!ok)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many changes at once. Try again in ${retryAfter}s.`,
    });
  return next();
});

export const botProcedure = protectedProcedure
  .input((raw) => {
    const parsed = (raw ?? {}) as { chatbotId?: unknown };
    id.parse(parsed.chatbotId);
    return raw as { chatbotId: string };
  })
  .use(async ({ ctx, input, next }) => {
    const chatbot = await ctx.db.chatbot.findFirst({
      where: { id: input.chatbotId, ownerId: ctx.user.id },
    });
    if (!chatbot)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "That chatbot no longer exists.",
      });
    return next({ ctx: { ...ctx, chatbot } });
  });

/** Guard a plan limit inside any procedure. */
export async function enforceQuota(userId: string, quota: Quota, adding = 1) {
  const message = await quotaError(userId, quota, adding);
  if (message) throw new TRPCError({ code: "FORBIDDEN", message });
}
