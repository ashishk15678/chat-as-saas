import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export const auth = betterAuth({
  // Fix: fail fast in production when auth URL is missing rather than silently
  // using localhost:3000, which would redirect OAuth callbacks to the wrong host.
  baseURL: (() => {
    const url = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (!url && process.env.NODE_ENV === "production") {
      throw new Error(
        "[auth] BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL must be set in production.",
      );
    }
    return url ?? "http://localhost:3000";
  })(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: "Ashish <ashish@chatbot.ashishkr.com>",
        to: user.email,
        subject: "Reset your password",
        html: `Click <a href="${url}">here</a> to reset your password.`,
      });
    },
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

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      resend.emails.send({
        from: "Ashish <ashish@chatbot.ashishkr.com>",
        to: user.email,
        subject: "Verify your email address",
        html: `Click <a href="${url}">here</a> to verify your email.`,
      });
    },
  },

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
