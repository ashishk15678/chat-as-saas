"use client";

/**
 * Draws an animated SVG rectangle that traces the border of its parent.
 * Position the parent `relative` and drop this inside — it fills the parent
 * exactly (absolute inset-0) and the stroke runs around the perimeter.
 *
 * The stroke-dashoffset animation gives a clean "chasing light" effect:
 * one short bright segment runs endlessly around all four edges.
 */
export function ProcessingBorder({ rounded = 12 }: { rounded?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      <rect
        x={1}
        y={1}
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx={rounded}
        ry={rounded}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary"
        strokeLinecap="round"
        strokeDasharray="60 1000"
        strokeDashoffset={0}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="0"
          dur="0s"
        />
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-1060"
          dur="1.6s"
          repeatCount="indefinite"
          calcMode="linear"
        />
      </rect>
    </svg>
  );
}
