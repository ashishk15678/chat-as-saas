"use client";

import { useEffect, useState } from "react";

const frames = [
  ["  ...    ", "  /_\\    "],
  ["  .:.    ", " /::\\    "],
  ["  ::::   ", " //::\\   "],
  ["  /\\     ", " /::\\    "],
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
    <div
      className="ascii-fire"
      aria-label="Animated ASCII fire"
      role="img"
      title="copied from firecrawl because it look s cool"
      style={{ display: "inline-block", cursor: "pointer" }}
    >
      <pre
        aria-hidden="true"
        style={{
          color: "#ff7300",
          fontFamily: "monospace",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {frames[frame].join("\n")}
      </pre>
    </div>
  );
}
