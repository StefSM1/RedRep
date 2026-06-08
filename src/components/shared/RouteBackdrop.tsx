import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ConstellationField } from "./ConstellationField";

/**
 * Route-specific background overlay.
 * - On /preview* routes: renders a constellation field (real
 *   constellation shapes, glowing stars — dark mode only), plus a
 *   dot-grid pattern and a top-warm → bottom-cool dimmer.
 * - On / (Home): renders nothing extra (AppShell's orbs + vines
 *   handle it).
 */
export function RouteBackdrop() {
  const { pathname } = useLocation();
  const isPreview = pathname.startsWith("/preview");

  // Watch the <html> element's class list for dark-mode toggles.
  // This reacts instantly regardless of which component toggled
  // the theme (no shared React state needed).
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Constellation layer — only on Preview routes in dark mode.
          Stars are a night-sky element, invisible in light mode. */}
      <ConstellationField active={isPreview && isDark} />

      {/* Dimmer layer — dims the organic orbs/vines on Preview.
          Uses .bg-preview-tint (idea I) for a top-warm → bottom-cool
          gradient in dark mode so the page has depth instead of a
          flat sheet. */}
      <div
        className={`fixed inset-0 z-[1] pointer-events-none bg-preview-tint transition-opacity duration-500 ${
          isPreview ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Dot-grid overlay — only on Preview routes (above dimmer) */}
      <div
        className={`fixed inset-0 z-[1] pointer-events-none bg-dot-grid transition-opacity duration-500 ${
          isPreview ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </>
  );
}
