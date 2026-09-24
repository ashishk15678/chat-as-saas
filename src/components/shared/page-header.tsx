import { cn } from "@/lib/utils";

/** Every dashboard screen opens with this. One definition keeps the rhythm identical. */
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
    <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground max-w-prose text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
