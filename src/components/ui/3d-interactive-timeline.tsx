"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface ProjectShowcaseItem {
  id: string;
  name: string;
  images: Array<{ src: string; alt: string }>;
}

interface ProjectShowcaseProps {
  projects: ProjectShowcaseItem[];
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="project-showcase" aria-labelledby="project-showcase-title">
      <div className="container project-showcase-heading">
        <p>Selected partnerships</p>
        <h2 id="project-showcase-title">Our projects</h2>
      </div>

      <div className="container project-showcase-grid">
        {projects.map((project, index) => (
          <motion.article
            className="project-showcase-card"
            key={project.id}
            id={project.id}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.12), ease: [0.22, 1, 0.36, 1] }}
          >
            <h3>{project.name}</h3>
            <div className={`project-showcase-gallery project-showcase-gallery--${project.images.length}`}>
              {project.images.map((image, imageIndex) => (
                <div className="project-showcase-image" key={image.src}>
                  <motion.img
                    src={image.src}
                    alt={image.alt}
                    width="1600"
                    height="1067"
                    loading={index === 0 && imageIndex === 0 ? "eager" : "lazy"}
                    whileHover={reduceMotion ? undefined : { scale: 1.035 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default ProjectShowcase;
