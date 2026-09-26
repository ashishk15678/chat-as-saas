"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyField({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1_600);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="bg-muted/60 border-border flex items-start gap-2 rounded-lg border p-3">
        <pre className="text-foreground/90 flex-1 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {value}
        </pre>
        <Button
          variant="ghost"
          size="icon"
          onClick={copy}
          className="press shrink-0"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
