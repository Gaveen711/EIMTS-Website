"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: ReactNode;
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateHeight = () => setHeight(element.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return <section className="project-timeline" ref={containerRef} aria-labelledby="project-timeline-title">
    <div className="container project-timeline-heading">
      <h2 id="project-timeline-title">Our projects</h2>
    </div>

    <div className="container project-timeline-body" ref={ref}>
      {data.map((item) => <article className="project-timeline-entry" key={item.title}>
        <div className="project-timeline-marker">
          <div className="project-timeline-dot" aria-hidden="true"><span /></div>
          <h3>{item.title}</h3>
        </div>

        <div className="project-timeline-content">
          <h3>{item.title}</h3>
          {item.content}
        </div>
      </article>)}

      <div className="project-timeline-track" style={{ height }} aria-hidden="true">
        <motion.div
          className="project-timeline-progress"
          style={{
            height: reduceMotion ? height : heightTransform,
            opacity: reduceMotion ? 1 : opacityTransform,
          }}
        />
      </div>
    </div>
  </section>;
}
