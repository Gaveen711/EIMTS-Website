"use client";

import { useEffect, useState } from "react";
import type { PublicPopup } from "@/lib/popups";

type Props = {
  popup: PublicPopup | null;
};

export function PromoPopup({ popup }: Props) {
  const hasImage = Boolean(popup?.image_url);
  const hasLink = Boolean(popup?.link_url);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasImage) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [hasImage]);

  function dismiss() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !hasImage || !popup) return null;

  const image = (
    <img
      className="promo-popup-image"
      src={popup.image_url!}
      alt={popup.title || "Promotional popup"}
    />
  );

  return (
    <div
      className="promo-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || "Promotional popup"}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="promo-popup-card">
        <button
          type="button"
          className="promo-popup-close"
          aria-label="Close popup"
          onClick={dismiss}
        >
          ×
        </button>
        {hasLink ? (
          <a
            className="promo-popup-link"
            href={popup.link_url!}
            aria-label={popup.title || "Open popup destination"}
            onClick={dismiss}
          >
            {image}
          </a>
        ) : (
          <div className="promo-popup-image-frame">{image}</div>
        )}
      </div>
      <style>{`
        .promo-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(7, 16, 12, 0.68);
          backdrop-filter: blur(8px);
          animation: promo-fade 0.3s ease both;
        }
        .promo-popup-card {
          position: relative;
          display: grid;
          place-items: center;
          width: min(900px, 100%);
          max-height: 92vh;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 22px;
          background: #09150f;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255, 255, 255, 0.08);
          animation: promo-rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .promo-popup-link,
        .promo-popup-image-frame {
          display: block;
          max-width: 100%;
          max-height: 92vh;
          line-height: 0;
          cursor: pointer;
        }
        .promo-popup-image {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          max-height: 92vh;
          object-fit: contain;
          transition: transform 0.35s ease, filter 0.35s ease;
        }
        .promo-popup-link:hover .promo-popup-image {
          transform: scale(1.015);
          filter: brightness(1.04);
        }
        .promo-popup-close {
          position: absolute;
          top: 0.7rem;
          right: 0.7rem;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 999px;
          background: rgba(7, 16, 12, 0.62);
          color: #fff;
          font-size: 1.3rem;
          line-height: 1;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .promo-popup-close:hover {
          background: rgba(7, 16, 12, 0.9);
          transform: rotate(90deg);
        }
        @keyframes promo-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes promo-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .promo-popup-overlay,
          .promo-popup-card {
            animation: none;
          }
          .promo-popup-image {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
