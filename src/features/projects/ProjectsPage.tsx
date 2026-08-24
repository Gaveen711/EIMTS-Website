import Link from "../../components/ui/Link";
import ProjectShowcase, { type ProjectShowcaseItem } from "../../components/ui/3d-interactive-timeline";

// ============================================================================
// PROJECT SHOWCASE DATA
// Modify project names and images here.
// Image files are stored in: /public/assets/
// `country` + `client` label the hero panels; `hero` picks the panel photo
// and its crop focus (CSS object-position) for the tall hero slice.
// ============================================================================
type Project = ProjectShowcaseItem & {
  country: string;
  client: string;
  hero: { src: string; position: string };
};

const projects: Project[] = [
  {
    id: "al-mahmal",
    name: "Saudi Arabia Al Mahmal",
    country: "Saudi Arabia",
    client: "Al Mahmal",
    hero: { src: "/assets/projects/saudi-al-mahmal/training.JPG", position: "30% 45%" },
    images: [
      { src: "/assets/projects/saudi-al-mahmal/training.JPG", alt: "Saudi Arabia Al Mahmal workforce training" },
      { src: "/assets/projects/saudi-al-mahmal/interview.JPG", alt: "Saudi Arabia Al Mahmal project interview" },
    ],
  },
  {
    id: "mcdonalds-kuwait",
    name: "McDonalds Kuwait",
    country: "Kuwait",
    client: "McDonalds",
    hero: { src: "/assets/projects/mcdonalds-kuwait/interview.JPG", position: "42% 40%" },
    images: [
      { src: "/assets/projects/mcdonalds-kuwait/interview.JPG", alt: "McDonalds Kuwait candidate interview" },
      { src: "/assets/projects/mcdonalds-kuwait/briefing-1.JPG", alt: "McDonalds Kuwait candidate briefing" },
      { src: "/assets/projects/mcdonalds-kuwait/team-1.jpg", alt: "McDonalds Kuwait project team" },
      { src: "/assets/projects/mcdonalds-kuwait/team-2.JPG", alt: "McDonalds Kuwait recruitment team" },
      { src: "/assets/projects/mcdonalds-kuwait/team-3.JPG", alt: "McDonalds Kuwait project group" },
      { src: "/assets/projects/mcdonalds-kuwait/team-4.JPG", alt: "McDonalds Kuwait project participants" },
      { src: "/assets/projects/mcdonalds-kuwait/briefing-2.JPG", alt: "McDonalds Kuwait group briefing" },
    ],
  },
  {
    id: "qatar-compass",
    name: "Qatar Compass",
    country: "Qatar",
    client: "Qatar Compass",
    hero: { src: "/assets/projects/qatar-compass/briefing.JPG", position: "28% 45%" },
    images: [
      { src: "/assets/projects/qatar-compass/arrival.JPG", alt: "Qatar Compass workforce arrival" },
      { src: "/assets/projects/qatar-compass/briefing.JPG", alt: "Qatar Compass project briefing" },
      { src: "/assets/projects/qatar-compass/team-1.JPG", alt: "Qatar Compass project team" },
      { src: "/assets/projects/qatar-compass/team-2.JPG", alt: "Qatar Compass project group" },
      { src: "/assets/projects/qatar-compass/team-3.JPG", alt: "Qatar Compass candidates" },
      { src: "/assets/projects/qatar-compass/team-4.JPG", alt: "Qatar Compass project participants" },
    ],
  },
  {
    id: "uae-almasaood",
    name: "UAE AL Masaood",
    country: "United Arab Emirates",
    client: "AL Masaood",
    hero: { src: "/assets/projects/uae-almasaood/site.JPG", position: "72% 40%" },
    images: [
      { src: "/assets/projects/uae-almasaood/briefing.JPG", alt: "UAE AL Masaood project briefing" },
      { src: "/assets/projects/uae-almasaood/workshop.JPG", alt: "UAE AL Masaood workplace workshop" },
      { src: "/assets/projects/uae-almasaood/inspection.JPG", alt: "UAE AL Masaood vehicle inspection" },
      { src: "/assets/projects/uae-almasaood/site.JPG", alt: "UAE ALMasaood project site visit" },
    ],
  },
];

const photoCount = projects.reduce((count, project) => count + project.images.length, 0);

export default function ProjectsPage() {
  return <main id="main" className="projects-page">
    {/* ====================================================================== */}
    {/* DESTINATION WALL HERO                                                  */}
    {/* Four full-height photo panels, one per project. Hovering a panel       */}
    {/* widens it; clicking jumps to that project's gallery below. Panel       */}
    {/* photos and crop focus come from each project's `hero` field above.     */}
    {/* ====================================================================== */}
    <section className="projects-hero" aria-labelledby="projects-hero-title">
      <header className="container projects-hero-top">
        <div>
          <p className="eyebrow">Global recruitment &amp; mobilisation</p>
          <h1 id="projects-hero-title">From Colombo <span>to the world.</span></h1>
        </div>
        <p className="projects-hero-note">
          {projects.length} flagship deployments, {photoCount} photographs. Every crew below was
          recruited, prepared and flown out by Emerald Isle.
        </p>
      </header>
      <nav className="projects-hero-wall" aria-label="Browse projects" data-reveal>
        {projects.map((project) => (
          <a className="projects-hero-panel" key={project.id} href={`#${project.id}`}>
            <img
              src={project.hero.src}
              alt=""
              width="3840"
              height="2160"
              style={{ objectPosition: project.hero.position }}
            />
            <span className="projects-hero-country">{project.country}</span>
            <span className="projects-hero-client">
              {project.client}
              <span className="projects-hero-cue" aria-hidden="true">See the photos ↓</span>
            </span>
          </a>
        ))}
      </nav>
    </section>

    {/* ====================================================================== */}
    {/* PROJECT PHOTO SHOWCASE                                                 */}
    {/* ====================================================================== */}
    <ProjectShowcase projects={projects} />

    {/* ====================================================================== */}
    {/* BOTTOM CALL-TO-ACTION BAND                                             */}
    {/* Modify heading, paragraph copy, or button destination                  */}
    {/* ====================================================================== */}
    <section className="cta-band" aria-labelledby="projects-cta-title">
      <div className="container cta-band-inner">
        <div>
          <h2 id="projects-cta-title">Have a workforce project in mind?</h2>
          <p>Tell us what you need, where you need it and when your team should be ready.</p>
        </div>
        <Link className="primary-button inverse-button" href="/contact/">Start a conversation</Link>
      </div>
    </section>
  </main>;
}
