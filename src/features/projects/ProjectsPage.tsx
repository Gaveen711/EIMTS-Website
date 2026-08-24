import Image from "next/image";
import Link from "../../components/ui/Link";
import ProjectShowcase from "../../components/ui/3d-interactive-timeline";
import type { PublicProject } from "../../lib/projects";

export default function ProjectsPage({ projects }: { projects: PublicProject[] }) {
  const photoCount = projects.reduce(
    (count, project) => count + project.images.length,
    0,
  );

  return (
    <main id="main" className="projects-page">
      <section className="projects-hero" aria-labelledby="projects-hero-title">
        <header className="container projects-hero-top">
          <div>
            <p className="eyebrow">Global recruitment &amp; mobilisation</p>
            <h1 id="projects-hero-title">
              From Colombo <span>to the world.</span>
            </h1>
          </div>
          <p className="projects-hero-note">
            {projects.length} flagship deployments, {photoCount} photographs.
            Every crew below was recruited, prepared and flown out by Emerald Isle.
          </p>
        </header>
        {projects.length > 0 ? (
          <nav className="projects-hero-wall" aria-label="Browse projects" data-reveal>
            {projects.map((project, index) => (
              <a className="projects-hero-panel" key={project.id} href={`#${project.id}`}>
                <Image
                  src={project.hero.src}
                  alt=""
                  fill
                  sizes="(max-width: 860px) 50vw, 25vw"
                  quality={78}
                  preload={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  style={{ objectFit: "cover", objectPosition: project.hero.position }}
                />
                <span className="projects-hero-country">{project.country}</span>
                <span className="projects-hero-client">
                  {project.client}
                  <span className="projects-hero-cue" aria-hidden="true">
                    See the photos ↓
                  </span>
                </span>
              </a>
            ))}
          </nav>
        ) : (
          <div className="container projects-empty">
            <p>Our latest project stories are being prepared.</p>
          </div>
        )}
      </section>

      {projects.length > 0 && <ProjectShowcase projects={projects} />}

      <section className="cta-band" aria-labelledby="projects-cta-title">
        <div className="container cta-band-inner">
          <div>
            <h2 id="projects-cta-title">Have a workforce project in mind?</h2>
            <p>Tell us what you need, where you need it and when your team should be ready.</p>
          </div>
          <Link className="primary-button inverse-button" href="/contact/">
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
