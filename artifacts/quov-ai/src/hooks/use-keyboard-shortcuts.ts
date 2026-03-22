import { useEffect } from "react";

type Shortcut = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
};

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const metaMatch = s.meta ? (e.metaKey || e.ctrlKey) : true;
        const ctrlMatch = s.ctrl ? e.ctrlKey : true;
        const shiftMatch = s.shift ? e.shiftKey : true;
        if (
          e.key.toLowerCase() === s.key.toLowerCase() &&
          metaMatch && ctrlMatch && shiftMatch &&
          !((e.target as HTMLElement)?.tagName === "TEXTAREA" ||
            (e.target as HTMLElement)?.tagName === "INPUT")
        ) {
          e.preventDefault();
          s.action();
          break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
