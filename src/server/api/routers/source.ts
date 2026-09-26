import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, botProcedure, enforceQuota } from "../trpc";
import { sourceCreate, id, page } from "@/lib/validators";
import {
  objectKey,
  presignPut,
  assertUploadable,
  presignGet,
} from "../../services/storage";
import { recordUsage } from "../../services/usage";
import { UPLOAD } from "@/lib/constants";

export const sourceRouter = router({
  list: botProcedure
    .input(z.object({ chatbotId: id }).merge(page.partial()))
    .query(async ({ ctx }) => {
      const sources = await ctx.db.source.findMany({
        where: { chatbotId: ctx.chatbot.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          bytes: true,
          tokens: true,
          status: true,
          error: true,
          createdAt: true,
          location: true, // Required to build the S3 URL
        },
      });

      // Map over sources and generate full URLs for files
      return Promise.all(
        sources.map(async (source) => {
          let url = source.location;

          // If it's a file, generate a secure pre-signed GET URL (valid for 1 hour)
          if (source.type === "FILE") {
            try {
              url = await presignGet(source.location, 3600);
            } catch {
              url = ""; // Fallback if the file is missing from storage
            }
          }

          return {
            id: source.id,
            type: source.type,
            title: source.title,
            bytes: source.bytes,
            tokens: source.tokens,
            status: source.status,
            error: source.error,
            createdAt: source.createdAt,
            url, // This will now contain the full S3 pre-signed GET URL for files!
          };
        }),
      );
    }),

  /** Step 1 of an upload: check the quota, then hand back a short-lived PUT url. */
  presign: botProcedure
    .input(
      z.object({
        chatbotId: id,
        filename: z.string().min(1).max(200),
        contentType: z.string(),
        size: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        assertUploadable({ type: input.contentType, size: input.size });
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (e as Error).message,
        });
      }
      await enforceQuota(
        ctx.user.id,
        "storageMb",
        Math.ceil(input.size / 1024 / 1024),
      );
      const key = objectKey(ctx.user.id, ctx.chatbot.id, input.filename);
      const { url } = await presignPut(key, input.contentType);
      return { url, key, accept: UPLOAD.accept };
    }),

  /** Step 2: register the source. Ingestion happens in the worker. */
  create: botProcedure.input(sourceCreate).mutation(async ({ ctx, input }) => {
    const data =
      input.type === "FILE"
        ? {
            type: "FILE" as const,
            title: input.title,
            location: input.key,
            bytes: input.bytes,
          }
        : input.type === "URL"
          ? {
              type: "URL" as const,
              title: new URL(input.url).hostname + new URL(input.url).pathname,
              location: input.url,
            }
          : input.type === "TEXT"
            ? {
                type: "TEXT" as const,
                title: input.title,
                location: input.body,
                bytes: input.body.length,
              }
            : {
                type: "FAQ" as const,
                title: input.question,
                location: `Q: ${input.question}\nA: ${input.answer}`,
                bytes: input.answer.length,
              };

    const source = await ctx.db.source.create({
      data: { ...data, chatbotId: ctx.chatbot.id },
      select: { id: true },
    });
    if (data.bytes)
      await recordUsage(ctx.user.id, {
        storedMb: Math.ceil(data.bytes / 1024 / 1024),
      });

    const { enqueueIngest } = await import("../../workers/queue");
    await enqueueIngest(source.id);
    return source;
  }),

  retry: botProcedure
    .input(z.object({ chatbotId: id, sourceId: id }))
    .mutation(async ({ ctx, input }) => {
      const { enqueueIngest } = await import("../../workers/queue");
      await ctx.db.source.update({
        where: { id: input.sourceId, chatbotId: ctx.chatbot.id },
        data: { status: "QUEUED", error: null },
      });
      await enqueueIngest(input.sourceId);
      return { ok: true };
    }),

  remove: botProcedure
    .input(z.object({ chatbotId: id, sourceId: id }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.source.delete({
        where: { id: input.sourceId, chatbotId: ctx.chatbot.id },
      });
      return { id: input.sourceId };
    }),
});
