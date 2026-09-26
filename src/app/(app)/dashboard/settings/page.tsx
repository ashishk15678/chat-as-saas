import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ApiKeys } from "./api-keys";

export default async function AccountSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your account and the keys that talk to the Chatline API."
      />

      <div className="panel-pad space-y-4">
        <h2 className="font-medium">Account</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="mt-0.5">{session?.user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5">{session?.user?.email}</dd>
          </div>
        </dl>
        <p className="text-muted-foreground text-xs">
          Your name and email come from Google. Change them there and sign in
          again.
        </p>
      </div>

      <div className="mt-4">
        <ApiKeys />
      </div>
    </>
  );
}
