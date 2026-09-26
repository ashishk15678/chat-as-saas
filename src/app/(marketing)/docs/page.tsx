import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { CopyField } from "@/components/shared/copy-field";
import { APP } from "@/lib/constants";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <Section
      title="Docs"
      description="Everything the widget and the API expect, on one page."
    >
      <div className="max-w-2xl space-y-10">
        <article className="space-y-3">
          <h2 className="font-medium">Install the widget</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Paste this before the closing body tag. Replace the id with the one
            on your chatbot&apos;s Embed tab.
          </p>
          <CopyField
            value={`<script src="${APP.url}/widget.js" data-chatline-id="YOUR_BOT_ID" defer></script>`}
          />
        </article>

        <article className="space-y-3">
          <h2 className="font-medium">Control it from your page</h2>
          <CopyField
            value={`chatline.open();\nchatline.close();\nchatline.destroy();`}
          />
        </article>

        <article className="space-y-3">
          <h2 className="font-medium">Send a message over HTTP</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The reply streams back as plain text. The conversation id comes back
            in the x-conversation-id header; send it on the next request to keep
            the thread.
          </p>
          <CopyField
            value={`curl -N ${APP.url}/api/chat \\
  -H "content-type: application/json" \\
  -d '{"chatbotId":"YOUR_BOT_ID","visitorId":"visitor-123","message":"How long is the warranty?"}'`}
          />
        </article>

        <article className="space-y-3">
          <h2 className="font-medium">Errors you may see</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              403 — the page&apos;s domain is not on the chatbot&apos;s allowed
              list.
            </li>
            <li>404 — the chatbot is paused or in draft.</li>
            <li>
              429 — the visitor exceeded the per-minute limit set on the
              Settings tab.
            </li>
            <li>402 — the account reached its monthly message quota.</li>
          </ul>
        </article>
      </div>
    </Section>
  );
}
