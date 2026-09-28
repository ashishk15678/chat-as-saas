import { cn } from "@/lib/utils";

const CONFIG: Record<string, { dot: string; label: string; pill: string }> = {
  LIVE:       { dot: "bg-success",           label: "Live",         pill: "bg-success/15 text-success" },
  READY:      { dot: "bg-success",           label: "Ready",        pill: "bg-success/15 text-success" },
  ACTIVE:     { dot: "bg-success",           label: "Active",       pill: "bg-success/15 text-success" },
  DRAFT:      { dot: "bg-muted-foreground",  label: "Draft",        pill: "bg-secondary text-muted-foreground" },
  QUEUED:     { dot: "bg-warning",           label: "Queued",       pill: "bg-warning/15 text-warning" },
  PROCESSING: { dot: "bg-warning animate-pulse", label: "Processing", pill: "bg-warning/15 text-warning" },
  PAUSED:     { dot: "bg-warning",           label: "Paused",       pill: "bg-warning/15 text-warning" },
  PAST_DUE:   { dot: "bg-destructive",       label: "Payment due",  pill: "bg-destructive/10 text-destructive" },
  FAILED:     { dot: "bg-destructive",       label: "Failed",       pill: "bg-destructive/10 text-destructive" },
  CANCELLED:  { dot: "bg-muted-foreground",  label: "Cancelled",    pill: "bg-secondary text-muted-foreground" },
};

/** Inline dot + label */
export function StatusDot({ status, className }: { status: string; className?: string }) {
  const c = CONFIG[status] ?? { dot: "bg-muted-foreground", label: status, pill: "" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("size-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

/** Pill badge variant */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const c = CONFIG[status] ?? { dot: "bg-muted-foreground", label: status, pill: "bg-secondary text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", c.pill, className)}>
      <span className={cn("size-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}
