import { cn } from "@/lib/utils";

/** Empty screens are an invitation to act, so the action is required. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel flex flex-col items-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm">{body}</p>
      <div className="pt-2">{action}</div>
    </div>
  );
}
