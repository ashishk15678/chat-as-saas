import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh token once per day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  plugins: [nextCookies()],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await db.subscription.upsert({
              where: { userId: user.id },
              update: {},
              create: { userId: user.id, plan: "free" },
            });
          } catch (err) {
            console.error(
              `[auth] failed to seed subscription for ${user.id}:`,
              err,
            );
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
