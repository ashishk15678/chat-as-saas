import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createCaller, createTRPCContext } from "@/server/api/root";

/** Server Components call procedures directly — no HTTP hop, no waterfall. */
const context = cache(async () =>
  createTRPCContext({ headers: await headers() }),
);
export const api = createCaller(context);
