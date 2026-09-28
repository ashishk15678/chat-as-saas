import { cn } from "@/lib/utils";

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
        "panel flex flex-col items-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      {/* Decorative pixel grid */}
      <div className="mb-1 grid grid-cols-3 gap-1.5 opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="block size-2 rounded-sm bg-foreground" />
        ))}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm leading-6">{body}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
