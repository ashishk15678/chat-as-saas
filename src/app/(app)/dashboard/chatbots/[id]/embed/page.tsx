import { api } from "@/trpc/server";
import { CopyField } from "@/components/shared/copy-field";
import { APP } from "@/lib/constants";

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bot = await api.chatbot.byId({ chatbotId: id });

  const script = `<script
  src="${APP.url}/widget.js"
  data-chatline-id="${bot.id}"
  defer
></script>`;

  const iframe = `<iframe
  src="${APP.url}/embed/${bot.id}"
  style="width:100%;height:600px;border:0;border-radius:14px"
  title="${bot.name}"
></iframe>`;

  const identity = `// On your server, per signed-in user:
const hash = crypto
  .createHmac("sha256", process.env.CHATLINE_SECRET)
  .update(user.id)
  .digest("hex");

// Then in the page:
window.chatlineSettings = { visitorId: user.id, visitorHash: hash };`;

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="font-medium">Add it to your site</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Paste this before the closing body tag on any page. The bubble appears on the {bot.position} and follows your visitor&apos;s
          light or dark preference.
        </p>
        <CopyField value={script} />
        {bot.allowedDomains.length === 0 ? (
          <p className="text-warning text-sm">
            This chatbot currently answers on any domain. Add your domains on the Settings tab before going live.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">Answering on: {bot.allowedDomains.join(", ")}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Or place it inline</h2>
        <p className="text-muted-foreground text-sm">Useful for a dedicated help page where the chat should fill the column.</p>
        <CopyField value={iframe} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Identify signed-in users</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Optional. Signing the visitor id on your server stops one customer from loading another customer&apos;s history, and lets
          you see who asked what.
        </p>
        <CopyField value={identity} />
      </section>
    </div>
  );
}
