"use client";

import { useEffect, useState } from "react";
import type { PublicPopup } from "@/lib/popups";

export type UrgentJobItem = {
  id: string;
  slug?: string;
  title: string;
  location: string;
  category: string;
  image?: string;
};

type Props = {
  popup: PublicPopup | null;
  urgentJobs?: UrgentJobItem[];
};

export function PromoPopup({ popup, urgentJobs = [] }: Props) {
  const mode = popup ? "custom" : urgentJobs.length ? "urgent" : "none";
  const [open, setOpen] = useState(false);

  // The popup greets every visit to the find-jobs page.
  useEffect(() => {
    if (mode === "none") return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [mode]);

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

  if (!open || mode === "none") return null;

  return (
    <div
      className="promo-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={popup ? popup.title : "Urgent vacancies available now"}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="promo-popup-card">
        <button
          type="button"
          className="promo-popup-close"
          aria-label="Close announcement"
          onClick={dismiss}
        >
          ×
        </button>

        {mode === "custom" ? (
          <>
            {popup!.image_url && (
              <img className="promo-popup-image" src={popup!.image_url} alt="" />
            )}
            <div className="promo-popup-body">
              <h2>{popup!.title}</h2>
              {popup!.message && <p>{popup!.message}</p>}
              {popup!.link_url && (
                <a
                  className="promo-popup-cta"
                  href={popup!.link_url}
                  onClick={dismiss}
                >
                  {popup!.link_label || "Learn more"}
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="promo-popup-body promo-popup-urgent">
            <span className="promo-popup-flag">
              <i aria-hidden="true" />
              Hiring urgently
            </span>
            <h2>
              {urgentJobs.length === 1
                ? "1 urgent vacancy available now"
                : `${urgentJobs.length} urgent vacancies available now`}
            </h2>
            <p>These roles are closing fast — apply while they are open.</p>
            <ul className="promo-popup-jobs">
              {urgentJobs.map((job) => {
                const content = (
                  <>
                    {job.image && (
                      <img
                        className="promo-popup-job-image"
                        src={job.image}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <span className="promo-popup-job-text">
                      <strong>{job.title}</strong>
                      <small>
                        {job.location} · {job.category}
                      </small>
                    </span>
                    <b aria-hidden="true">→</b>
                  </>
                );
                return (
                  <li key={job.id}>
                    {job.slug ? (
                      <a
                        href={`/foreign-job-vacancies/${job.slug}/`}
                        onClick={dismiss}
                      >
                        {content}
                      </a>
                    ) : (
                      <button type="button" onClick={dismiss}>
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" className="promo-popup-cta" onClick={dismiss}>
              Browse all vacancies
            </button>
          </div>
        )}
      </div>
      <style>{`
        .promo-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          display: grid;
          place-items: center;
          padding: 1.25rem;
          background: rgba(9, 20, 15, 0.55);
          backdrop-filter: blur(6px);
          animation: promo-fade 0.35s ease both;
        }
        .promo-popup-card {
          position: relative;
          width: min(460px, 100%);
          max-height: min(84vh, 640px);
          overflow: auto;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,249,244,0.94));
          box-shadow: 0 40px 90px rgba(9, 20, 15, 0.4), inset 0 1px 0 rgba(255,255,255,0.95);
          animation: promo-rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .promo-popup-close {
          position: absolute;
          top: 0.7rem;
          right: 0.7rem;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 999px;
          background: rgba(9, 20, 15, 0.55);
          color: #fff;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .promo-popup-close:hover {
          background: rgba(9, 20, 15, 0.8);
          transform: rotate(90deg);
        }
        .promo-popup-image {
          display: block;
          width: 100%;
          max-height: 220px;
          object-fit: cover;
        }
        .promo-popup-body {
          display: grid;
          gap: 0.7rem;
          padding: 1.6rem 1.7rem 1.8rem;
          text-align: center;
        }
        .promo-popup-body h2 {
          margin: 0;
          color: #15231d;
          font-size: 1.45rem;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .promo-popup-body p {
          margin: 0;
          color: #5c6b64;
          font-size: 0.95rem;
          line-height: 1.55;
        }
        .promo-popup-flag {
          justify-self: center;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          background: rgba(198, 44, 44, 0.1);
          color: #b32424;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .promo-popup-flag i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d92f2f;
          animation: promo-pulse 1.4s ease infinite;
        }
        .promo-popup-jobs {
          display: grid;
          gap: 0.55rem;
          margin: 0.4rem 0 0;
          padding: 0;
          list-style: none;
          text-align: left;
        }
        .promo-popup-jobs a,
        .promo-popup-jobs button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem;
          width: 100%;
          padding: 0.75rem 0.95rem;
          border: 1px solid rgba(8, 121, 93, 0.16);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.85);
          color: inherit;
          font: inherit;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .promo-popup-jobs a:hover,
        .promo-popup-jobs button:hover {
          transform: translateY(-2px);
          border-color: rgba(8, 121, 93, 0.45);
          box-shadow: 0 10px 22px rgba(8, 121, 93, 0.16);
        }
        .promo-popup-job-image {
          flex: 0 0 auto;
          width: 52px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
        }
        .promo-popup-job-text {
          display: grid;
          gap: 0.2rem;
          min-width: 0;
          flex: 1;
        }
        .promo-popup-job-text strong {
          color: #15231d;
          font-size: 0.95rem;
          line-height: 1.25;
        }
        .promo-popup-job-text small {
          color: #67766f;
          font-size: 0.8rem;
        }
        .promo-popup-jobs b {
          color: #08795d;
          font-weight: 800;
        }
        .promo-popup-cta {
          justify-self: center;
          margin-top: 0.5rem;
          padding: 0.8rem 1.6rem;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #067a4b, #035c38);
          color: #fff;
          font: inherit;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(6, 122, 75, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .promo-popup-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(6, 122, 75, 0.45);
        }
        @keyframes promo-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes promo-rise {
          from { opacity: 0; transform: translateY(26px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes promo-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.45; }
        }
        @media (prefers-reduced-motion: reduce) {
          .promo-popup-overlay,
          .promo-popup-card,
          .promo-popup-flag i {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
