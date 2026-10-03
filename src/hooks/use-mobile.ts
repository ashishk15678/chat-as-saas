import { useSyncExternalStore } from "react";

const BREAKPOINT = 768;

function subscribe(cb: () => void) {
  const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.innerWidth < BREAKPOINT;
}

function getServerSnapshot() {
  return false; // SSR: assume desktop
}

/** Zero-effect, SSR-safe mobile breakpoint hook. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
