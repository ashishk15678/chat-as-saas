import { cn } from "@/lib/utils";

/** One section wrapper for the whole marketing site keeps vertical rhythm consistent. */
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
      className={cn("mx-auto max-w-6xl px-5 py-20 sm:py-28", className)}
    >
      {(title || description) && (
        <div className="mb-12 max-w-2xl space-y-3">
          {eyebrow && (
            <p className="text-primary text-sm font-medium">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
