import { router, createCallerFactory, createTRPCContext } from "./trpc";
import { chatbotRouter } from "./routers/chatbot";
import { sourceRouter } from "./routers/source";
import { conversationRouter } from "./routers/conversation";
import { billingRouter } from "./routers/billing";
import { keyRouter } from "./routers/key";

export const appRouter = router({
  chatbot: chatbotRouter,
  source: sourceRouter,
  conversation: conversationRouter,
  billing: billingRouter,
  key: keyRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
export { createTRPCContext };
