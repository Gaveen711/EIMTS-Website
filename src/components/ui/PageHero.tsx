"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

// ============================================================================
// PAGE HERO REUSABLE COMPONENT
// Props:
// - eyebrow: Kicker text above main title
// - title: Main page headline (h1)
// - description: Subheading / intro paragraph
// - videoSrc: Optional background .mp4 video path (e.g. "/assets/video.mp4")
// - posterSrc: Optional fallback image if video is loading/unsupported
// - isFullHeight: Set to true for 100vh full-screen hero height
// - children: Custom hero items (e.g. stat counters, action buttons)
// ============================================================================
export type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  videoSrc?: string;
  posterSrc?: string;
  isFullHeight?: boolean;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  videoSrc,
  posterSrc,
  isFullHeight = false,
  children,
}: PageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoSrc]);

  return (
    <section
      className={`page-hero page-hero-animated ${
        isFullHeight ? "page-hero--full-height" : ""
      } ${videoSrc && !hasVideoError ? "page-hero--has-video" : ""}`}
    >
      {videoSrc && !hasVideoError && (
        <div className="page-hero-video-wrapper" aria-hidden="true">
          <video
            ref={videoRef}
            className="page-hero-video"
            autoPlay
            loop
            muted
            playsInline
            poster={posterSrc}
            onError={() => setHasVideoError(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="page-hero-video-overlay" />
        </div>
      )}

      <div className="page-hero-atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="page-hero-orb" aria-hidden="true" />

      <div className="container page-hero-content">
        <span className="page-hero-line" aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>

      {videoSrc && !hasVideoError && (
        <div className="page-hero-video-controls">
          <span className="video-status-pill">
            <span className={`status-dot ${isPlaying ? "is-active" : ""}`} />
            Showcase Video
          </span>
          <button
            type="button"
            className="video-ctrl-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause background video" : "Play background video"}
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="video-ctrl-btn"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            title={isMuted ? "Unmute Video" : "Mute Video"}
          >
            {isMuted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {isFullHeight && (
        <div className="page-hero-scroll-indicator" aria-hidden="true">
          <span>Explore Projects</span>
          <div className="scroll-arrow" />
        </div>
      )}
    </section>
  );
}
