"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { UPLOAD } from "@/lib/constants";
import { bytes } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Presign, PUT direct to storage, then register the source.
 * The file never travels through our server, so a big PDF costs one round trip.
 */
export function FileDropzone({ chatbotId }: { chatbotId: string }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const presign = useMutation(trpc.source.presign.mutationOptions());
  const create = useMutation(trpc.source.create.mutationOptions());

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      try {
        setProgress((p) => ({ ...p, [file.name]: 5 }));
        const { url, key } = await presign.mutateAsync({
          chatbotId,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });
        const put = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "content-type": file.type },
        });
        if (!put.ok) throw new Error("Upload rejected by storage");
        setProgress((p) => ({ ...p, [file.name]: 80 }));
        await create.mutateAsync({
          type: "FILE",
          chatbotId,
          title: file.name,
          key,
          bytes: file.size,
        });
        setProgress((p) => ({ ...p, [file.name]: 100 }));
        toast.success(`${file.name} ready.`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : `${file.name} could not be uploaded`,
        );
      } finally {
        setTimeout(
          () => setProgress(({ [file.name]: _, ...rest }) => rest),
          1_200,
        );
      }
    }
    await qc.invalidateQueries({
      queryKey: trpc.source.list.queryKey({ chatbotId }),
    });
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
          over
            ? "border-primary bg-primary-muted/50"
            : "border-border hover:border-primary/50",
        )}
      >
        <UploadCloud className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">Drop files here, or browse</p>
        <p className="text-muted-foreground text-xs">
          {Object.values(UPLOAD.accept).join(", ")} · up to{" "}
          {bytes(UPLOAD.maxBytes)} each
        </p>
      </div>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={Object.keys(UPLOAD.accept).join(",")}
        onChange={(e) => void upload(e.target.files)}
      />
      {Object.entries(progress).map(([name, pct]) => (
        <div key={name} className="mt-3 space-y-1">
          <p className="text-muted-foreground truncate text-xs">
            {name} —{" "}
            {pct < 80 ? "Uploading…" : pct < 100 ? "Processing…" : "Done"}
          </p>
          <div className="bg-secondary h-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
