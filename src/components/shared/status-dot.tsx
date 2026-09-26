import { cn } from "@/lib/utils";

const TONE = {
  LIVE: "bg-success",
  READY: "bg-success",
  ACTIVE: "bg-success",
  DRAFT: "bg-muted-foreground",
  QUEUED: "bg-muted-foreground",
  PAUSED: "bg-warning",
  PROCESSING: "bg-warning",
  PAST_DUE: "bg-warning",
  FAILED: "bg-destructive",
  CANCELLED: "bg-destructive",
} as Record<string, string>;

const WORD = {
  LIVE: "Live",
  DRAFT: "Draft",
  PAUSED: "Paused",
  QUEUED: "Queued",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
  ACTIVE: "Active",
  PAST_DUE: "Payment due",
  CANCELLED: "Cancelled",
} as Record<string, string>;

export function StatusDot({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          TONE[status] ?? "bg-muted-foreground",
        )}
      />
      {WORD[status] ?? status}
    </span>
  );
}
