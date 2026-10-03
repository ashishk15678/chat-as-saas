// Fix: use better-auth/react so useSession() returns a proper React hook,
// not the vanilla store API which does not work as a React hook.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Fix: omit baseURL when not set — better-auth uses same-origin requests by default,
  // so this never accidentally targets localhost:3000 on a deployed visitor's machine.
  // Only set it explicitly when a value is actually configured.
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { baseURL: process.env.NEXT_PUBLIC_APP_URL }
    : {}),
});

export const { signIn, signOut, signUp, useSession } = authClient;
