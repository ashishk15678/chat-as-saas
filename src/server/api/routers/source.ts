import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, botProcedure, enforceQuota } from "../trpc";
import { sourceCreate, id, page } from "@/lib/validators";
import {
  objectKey,
  presignPut,
  assertUploadable,
  presignGet,
  fetchObject,
} from "../../services/storage";
import { recordUsage } from "../../services/usage";
import {
  processSource,
  commitChunks,
  ingestSource,
  estimateTokens,
} from "../../services/ingest";
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
          location: true,
        },
      });
      return Promise.all(
        sources.map(async (source) => {
          let url = source.location;
          if (source.type === "FILE") {
            try {
              url = await presignGet(source.location, 3600);
            } catch {
              url = "";
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
            url,
          };
        }),
      );
    }),

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

  /**
   * Create a source and process it entirely before returning.
   * If processing fails, nothing is saved — the caller gets a TRPC error.
   * This means status goes from non-existent straight to READY (or throws),
   * so the UI never shows a stuck PROCESSING row.
   */
  create: botProcedure.input(sourceCreate).mutation(async ({ ctx, input }) => {
    // Build the raw source descriptor (not saved yet)
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
              bytes: 0,
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

    // For FILE sources, fetch from S3 (already uploaded by the dropzone)
    let fileBuffer: Buffer | undefined;
    if (input.type === "FILE") {
      try {
        fileBuffer = await fetchObject(input.key);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not read the uploaded file from storage.",
        });
      }
    }

    // Process entirely in memory: extract → chunk → embed. Throws on failure.
    let pieces: string[];
    let embeddings: number[][];
    try {
      ({ pieces, embeddings } = await processSource(data, fileBuffer));
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          e instanceof Error
            ? e.message
            : "Processing failed — check the source content and try again.",
      });
    }

    // Only now write to the database — status goes straight to READY
    const tokens = pieces.reduce((a, c) => a + estimateTokens(c), 0);
    const source = await ctx.db.source.create({
      data: { ...data, chatbotId: ctx.chatbot.id, status: "READY", tokens },
      select: { id: true },
    });

    if (data.bytes)
      await recordUsage(ctx.user.id, {
        storedMb: Math.ceil(data.bytes / 1024 / 1024),
      });

    // Commit chunks with the pre-computed embeddings
    await commitChunks(source.id, ctx.chatbot.id, pieces, embeddings);

    return source;
  }),

  retry: botProcedure
    .input(z.object({ chatbotId: id, sourceId: id }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.source.update({
        where: { id: input.sourceId, chatbotId: ctx.chatbot.id },
        data: { status: "QUEUED", error: null },
      });
      // Run inline so the mutation doesn't return until it's done
      await ingestSource(input.sourceId);
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
