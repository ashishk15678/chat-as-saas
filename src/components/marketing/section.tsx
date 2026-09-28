import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto max-w-6xl border-x border-b border-border px-8 py-20 sm:py-28",
        className,
      )}
    >
      {(title || description || eyebrow) && (
        <div className="mb-10 max-w-2xl space-y-3">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground text-sm leading-7">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
