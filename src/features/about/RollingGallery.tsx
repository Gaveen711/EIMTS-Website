"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export type RollingGalleryItem = {
  title: string;
  image: string;
  alt?: string;
};

type RollingGalleryProps = {
  items: RollingGalleryItem[];
  autoplay?: boolean;
  pauseOnHover?: boolean;
};

export default function RollingGallery({
  items,
  autoplay = true,
  pauseOnHover = true,
}: RollingGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  const dragStartRef = useRef({ x: 0, rotation: 0 });
  const lastPointerRef = useRef({ x: 0, time: 0 });
  const velocityRef = useRef(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const applyRotation = useCallback((rotation: number) => {
    rotationRef.current = rotation;
    if (trackRef.current) {
      trackRef.current.style.transform = `rotateY(${rotation}deg)`;
    }
  }, []);

  useEffect(() => {
    const smallScreenQuery = window.matchMedia("(max-width: 640px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreferences = () => {
      setIsSmallScreen(smallScreenQuery.matches);
      setReduceMotion(reducedMotionQuery.matches);
    };

    updatePreferences();
    smallScreenQuery.addEventListener("change", updatePreferences);
    reducedMotionQuery.addEventListener("change", updatePreferences);
    return () => {
      smallScreenQuery.removeEventListener("change", updatePreferences);
      reducedMotionQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;
      const hoverPaused = pauseOnHover && hoveringRef.current;

      if (autoplay && !hoverPaused && !draggingRef.current && !reduceMotion) {
        applyRotation(rotationRef.current - elapsed * 0.012);
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [applyRotation, autoplay, pauseOnHover, reduceMotion]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    dragStartRef.current = { x: event.clientX, rotation: rotationRef.current };
    lastPointerRef.current = { x: event.clientX, time: performance.now() };
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const now = performance.now();
    const elapsed = Math.max(now - lastPointerRef.current.time, 1);
    velocityRef.current = (event.clientX - lastPointerRef.current.x) / elapsed;
    lastPointerRef.current = { x: event.clientX, time: now };
    applyRotation(dragStartRef.current.rotation + (event.clientX - dragStartRef.current.x) * 0.16);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    applyRotation(rotationRef.current + velocityRef.current * 72);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    applyRotation(rotationRef.current + (event.key === "ArrowLeft" ? 18 : -18));
  };

  const faceCount = Math.max(items.length, 1);
  const faceWidth = isSmallScreen ? 176 : 232;
  const radius = Math.round(
    Math.max(
      isSmallScreen ? 190 : 254,
      faceWidth / (2 * Math.tan(Math.PI / Math.max(faceCount, 3))) + 44,
    ),
  );

  return (
    <div className="ei-rolling-gallery">
      <div
        className="ei-rolling-gallery-viewport"
        role="region"
        aria-roledescription="carousel"
        aria-label="Emerald Isle awards"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerEnter={() => { hoveringRef.current = true; }}
        onPointerLeave={() => { hoveringRef.current = false; }}
      >
        <div className="ei-rolling-gallery-scene">
          <div className="ei-rolling-gallery-track" ref={trackRef}>
            {items.map((item, index) => (
              <figure
                className="ei-award-gallery-item"
                key={`${item.title}-${index}`}
                style={{
                  width: `${faceWidth}px`,
                  transform: `translate(-50%, -50%) rotateY(${(360 / faceCount) * index}deg) translateZ(${radius}px)`,
                }}
              >
                <div className="ei-award-gallery-media">
                  <img src={item.image} alt={item.alt ?? item.title} loading="lazy" />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
