"use client";

import { useEffect, useState } from "react";

const frames = [
  [
    "        .  ",
    "       /\\ ",
    "      /  \\",
    "     / /\\ \\",
    "    /_/  \\_\\",
  ],
  [
    "       .   ",
    "      .:.  ",
    "     /\\: \\",
    "    / /\\  \\",
    "   /_/  \\_\\",
  ],
  [
    "      .:.  ",
    "     ::::  ",
    "    /\\::\\ ",
    "   / /\\  \\",
    "  /_/  \\_\\",
  ],
  [
    "       .   ",
    "      /\\  ",
    "     /::\\ ",
    "    / /\\  \\",
    "   /_/  \\_\\",
  ],
];

export function AsciiFire() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      260,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="ascii-fire" aria-label="Animated ASCII fire" role="img">
      <pre aria-hidden="true">{frames[frame].join("\n")}</pre>
      <span>signal detected</span>
    </div>
  );
}
