"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Headings and paragraphs inside page content and the footer. Skipped:
// screen-reader-only text, dialog content, the header mega menu, and
// descendants of hardcoded [data-reveal] containers (those sections animate
// as one block; tagging their children too would compound the motion).
const TARGETS =
  "main :is(h1,h2,h3,h4,h5,h6,p), .global-footer :is(h1,h2,h3,h4,h5,h6,p)";
const EXCLUDE = ".sr-only, dialog *, .jobs-mega-menu *, [data-reveal] *";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // The media-query rules in globals.css force [data-reveal] visible;
      // arming just retires the pre-hydration hide rule.
      html.classList.add("ei-reveal-armed");
      return;
    }
    // Normally set pre-paint by the inline script in layout.tsx; idempotent.
    html.classList.add("ei-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.style.setProperty(
              "--reveal-delay",
              el.dataset.revealDelay ?? "0ms",
            );
            el.classList.add("is-visible");
          } else {
            // Reset only once fully off-screen so nothing blinks out at the
            // viewport edge; the element re-animates from either direction.
            const box = entry.boundingClientRect;
            if (box.bottom <= 0 || box.top >= window.innerHeight) {
              el.style.setProperty("--reveal-delay", "0ms");
              el.classList.remove("is-visible");
            }
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    const observed = new WeakSet<Element>();

    const scan = () => {
      // Hardcoded [data-reveal] blocks (home page sections) join the same
      // observer, upgrading them from reveal-once to toggle-both-ways.
      for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        if (!observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      }
      const fresh = Array.from(
        document.querySelectorAll<HTMLElement>(TARGETS),
      ).filter((el) => !el.hasAttribute("data-reveal") && !el.matches(EXCLUDE));
      // Siblings tagged in the same pass reveal with a short cascade.
      const perParent = new Map<Element, number>();
      for (const el of fresh) {
        const parent = el.parentElement ?? document.body;
        const index = perParent.get(parent) ?? 0;
        perParent.set(parent, index + 1);
        el.dataset.revealDelay = `${Math.min(index * 80, 320)}ms`;
        el.setAttribute("data-reveal", el.tagName === "P" ? "p" : "h");
        observed.add(el);
        observer.observe(el);
      }
      // Hand the pre-hydration hide rule over to per-element hiding.
      html.classList.add("ei-reveal-armed");
    };

    scan();

    // The jobs page re-renders its result grid client-side and server payloads
    // stream in after this effect runs. childList only — tagging writes
    // attributes, and observing those would loop the callback forever. Timer
    // debounce rather than rAF: rAF stalls in backgrounded tabs, which would
    // leave nodes added there untagged.
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const mutations = new MutationObserver((records) => {
      if (!records.some((record) => record.addedNodes.length)) return;
      clearTimeout(debounce);
      debounce = setTimeout(scan, 100);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(debounce);
      mutations.disconnect();
      observer.disconnect();
      // ei-motion-ready stays: the hidden-state CSS depends on it, and this
      // effect re-runs on navigation — removing it would flash every
      // hardcoded [data-reveal] element visible.
    };
    // Re-scan per navigation so a freshly swapped <main> is tagged even if the
    // MutationObserver ever misses it.
  }, [pathname]);

  return null;
}
