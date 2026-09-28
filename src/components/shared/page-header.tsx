import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-[-0.04em]">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-prose text-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
