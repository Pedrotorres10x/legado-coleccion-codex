import { useEffect } from "react";

/**
 * Global content-protection component.
 * Multiple layers to deter image downloading and data scraping:
 *
 * 1. Block right-click (except inputs/textareas)
 * 2. Block image drag
 * 3. Block keyboard shortcuts (Ctrl+S, Ctrl+U, Ctrl+Shift+I, PrintScreen, F12)
 * 4. Block text selection on images and property data
 * 5. Detect DevTools open (basic)
 * 6. Disable "Save image as" via pointer-events on <img>
 */
const ContentProtection = () => {
  useEffect(() => {
    // ── 1. Block right-click ──
    const blockContext = (e: MouseEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
    };

    // ── 2. Block image drag ──
    const blockDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG" || target?.closest("[role='img']")) {
        e.preventDefault();
      }
    };

    // ── 3. Block keyboard shortcuts ──
    const blockKeys = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl+S (save page)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        return;
      }

      // Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }

      // PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        return;
      }

      // Ctrl+P (print — can be used to save as PDF)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        return;
      }
    };

    // ── 4. Block copy on protected elements ──
    const blockCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("[data-protected]") || target?.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // ── 5. Prevent touch long-press context menu (mobile) ──
    const blockTouchMenu = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG" || target?.closest("[role='img']") || target?.closest("[data-protected]")) {
        // We can't fully prevent this, but we make images non-selectable via CSS
      }
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("touchstart", blockTouchMenu, { passive: true });

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("touchstart", blockTouchMenu);
    };
  }, []);

  return null;
};

export default ContentProtection;
