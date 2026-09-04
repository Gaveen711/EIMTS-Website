"use client";

import { useEffect, useRef } from "react";

// Canvas 2D works where the former WebGL2-only effect silently rendered
// nothing, including browsers and devices that block GPU contexts.
function cellNoise(column: number, row: number) {
  const value = Math.sin(column * 127.1 + row * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

export function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const authCanvas = canvas;
    const drawingContext = context;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(authCanvas.clientWidth * dpr));
      height = Math.max(1, Math.floor(authCanvas.clientHeight * dpr));
      if (authCanvas.width !== width || authCanvas.height !== height) {
        authCanvas.width = width;
        authCanvas.height = height;
      }
    }

    function draw(time = 0) {
      const gridSize = 10 * dpr;
      const pixelSize = Math.max(2, Math.round(2.6 * dpr));
      const columns = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;
      const centerX = columns / 2;
      const centerY = rows / 2;
      const seconds = time / 1000;

      drawingContext.clearRect(0, 0, width, height);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const noise = cellNoise(column, row);
          const distance = Math.hypot(column - centerX, row - centerY);
          const pulse = reduceMotion
            ? 0.65
            : 0.46 + 0.54 * Math.sin(seconds * 2.25 - distance * 0.11 + noise * 8);
          const opacity = (0.16 + noise * 0.34) * Math.max(0.24, pulse);

          drawingContext.fillStyle = noise > 0.88
            ? `rgba(84, 230, 157, ${opacity * 1.55})`
            : `rgba(224, 245, 233, ${opacity})`;
          drawingContext.fillRect(
            column * gridSize + (gridSize - pixelSize) / 2,
            row * gridSize + (gridSize - pixelSize) / 2,
            pixelSize,
            pixelSize,
          );
        }
      }
    }

    resize();
    draw(0);

    function animate(time: number) {
      draw(time);
      frame = requestAnimationFrame(animate);
    }

    if (!reduceMotion) frame = requestAnimationFrame(animate);

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(authCanvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas className="auth-canvas" ref={canvasRef} aria-hidden="true" />;
}
