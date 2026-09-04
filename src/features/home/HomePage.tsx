"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroContent } from "../../lib/hero";
import Link from "../../components/ui/Link";
import { EmployerInquiryForm } from "../../components/ui/EmployerInquiryForm";
import ClientGlobe from "../../components/visuals/ClientGlobe";

// ============================================================================
// 1. RECRUITMENT CATEGORIES DATA
// Edit job category titles and descriptions displayed on the Home page
// ============================================================================
const categories = [
  ["Engineering & Technical", "Skilled roles across complex industries"],
  ["Hospitality & Culinary", "Hotels, restaurants and guest experiences"],
  ["Automotive & Transport", "Mobility, maintenance and logistics"],
  ["Construction & Trades", "Experienced hands for ambitious projects"],
  ["Healthcare", "Care professionals for global organisations"],
  ["Retail & Administration", "People who keep businesses moving"],
];

// ============================================================================
// 2. CLIENT TESTIMONIALS DATA
// Edit quotes, client names, companies, and locations shown in the quote grid.
// All entries render at once; the last entry gets the inverted accent cell.
// ============================================================================
const testimonials = [
  { quote: "Always the best support, whenever it is required. A recruitment partner we genuinely value.", name: "Mohammed Haneefa", company: "Apparel Group", place: "Saudi Arabia", avatar: "" },
  { quote: "Professional staff, a welcoming environment and service that makes every requirement feel carefully handled.", name: "Rajakumar", company: "Thabat", place: "Saudi Arabia", avatar: "" },
  { quote: "From the first day, the team took our requirements seriously. I truly appreciate the partnership.", name: "Sultan Rashid", company: "Alshaheen Arabic Modern", place: "Muscat, Oman", avatar: "" },
  { quote: "A fantastic experience from start to finish. The communication, care and candidate support were excellent.", name: "Taniya Perera", company: "Raffles & Fairmont", place: "Qatar", avatar: "" },
];

// ============================================================================
// 3. HOME HERO SLIDES
// Slides are managed from the staff dashboard (Hero section) and passed in as
// the `hero` prop by src/app/page.tsx. Fallback copies live in src/lib/hero.ts.
// ============================================================================

const companyStory = [
  {
    year: "1995",
    title: "A Sri Lankan promise with a global horizon.",
    copy: "Emerald Isle began with a simple belief: overseas opportunity should improve a person’s life without leaving them to navigate uncertainty alone.",
    image: "/assets/home-story/career-guidance.webp",
    marker: "Founded in Sri Lanka",
  },
  {
    year: "Responsible recruitment",
    title: "Trust became the way we work.",
    copy: "Careful screening, honest communication and accountable processes shaped every placement. Today we continue that standard as an SLBFE-licensed recruitment partner.",
    image: "/assets/home-story/responsible-screening.webp",
    marker: "SLBFE License No. 1162",
  },
  {
    year: "One journey",
    title: "Recruitment does not end with an offer letter.",
    copy: "Our teams connect recruitment, documentation and travel guidance into one continuous experience, supporting candidates and employers from first conversation to arrival.",
    image: "/assets/home-story/travel-support.webp",
    marker: "Recruitment · documents · travel",
  },
  {
    year: "Today",
    title: "32 years on, the promise still travels.",
    copy: "Five recognitions, regional partnerships and long-standing client relationships reflect a reputation built one responsible placement at a time.",
    image: "/assets/home-story/global-partnership.webp",
    marker: "5 awards · 32+ years",
  },
];

export default function Home({ hero }: { hero: HeroContent }) {
  const heroSlides = hero.slides;
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeStory, setActiveStory] = useState(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const inquiryDialogRef = useRef<HTMLDialogElement>(null);
  const activeHero = heroSlides[activeSlide] ?? heroSlides[0];

  // Testimonial cells carry an amber spotlight that follows the pointer.
  // Pointer events cover mouse, touch and pen: move tracks the cursor,
  // down places the glow under a finger before the press style shows it.
  const placeQuoteSpotlight = (event: React.PointerEvent<HTMLElement>) => {
    const cell = event.currentTarget;
    const rect = cell.getBoundingClientRect();
    cell.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    cell.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  // Reveal-on-scroll for [data-reveal] sections is handled globally by
  // ScrollReveal in the root layout.

  useEffect(() => {
    const dialog = inquiryDialogRef.current;
    if (!dialog) return;

    if (isInquiryOpen && !dialog.open) dialog.showModal();
    if (!isInquiryOpen && dialog.open) dialog.close();
  }, [isInquiryOpen]);

  useEffect(() => {
    // An occasion takeover (or a single slide) shows statically — no rotation.
    if (hero.takeover || heroSlides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [hero.takeover, heroSlides.length]);

  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-story-step]"));
    if (steps.length === 0) return;

    let ticking = false;

    const updateActiveStory = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestStep = 0;
      let minDistance = Infinity;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestStep = index;
        }
      });

      setActiveStory(closestStep);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveStory);
        ticking = true;
      }
    };

    updateActiveStory();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return <main id="main" className="ei-home">
    {/* ====================================================================== */}
    {/* SECTION 1: HERO SLIDER WITH CALLS-TO-ACTION                            */}
    {/* Slide content controlled by heroSlides array at top of file             */}
    {/* ====================================================================== */}
    <section className="ei-hero ei-hero-slider" aria-labelledby="home-title">
      <div className="ei-hero-slides" aria-hidden="true">
        {heroSlides.map((slide, index) => <img
          className={"ei-hero-image ei-hero-slide" + (index === activeSlide ? " is-active" : "")}
          src={slide.image}
          alt=""
          width="1824"
          height="1024"
          fetchPriority={index === 0 ? "high" : "auto"}
          loading={index === 0 ? "eager" : "lazy"}
          key={index}
        />)}
      </div>
      <div className="ei-hero-shade" />
      <div className="container ei-hero-content">
        <div className="ei-hero-copy" key={activeSlide}>
          {activeHero.kicker && <p className="ei-kicker">{activeHero.kicker}</p>}
          <h1 id="home-title">{activeHero.title}</h1>
          <p>{activeHero.copy}</p>
          {(activeHero.ctaLabel && activeHero.ctaUrl) || (activeHero.cta2Label && activeHero.cta2Url) ? (
            <div className="ei-actions">
              {activeHero.ctaLabel && activeHero.ctaUrl && (
                <Link className="ei-button ei-button-bright" href={activeHero.ctaUrl}>
                  {activeHero.ctaLabel}
                  <span className="ei-button__icon-wrapper">
                    <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ei-button__icon-svg" width={10} height={10}>
                      <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
                    </svg>
                    <svg viewBox="0 0 14 15" fill="none" width={10} height={10} xmlns="http://www.w3.org/2000/svg" className="ei-button__icon-svg ei-button__icon-svg--copy">
                      <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
                    </svg>
                  </span>
                </Link>
              )}
              {activeHero.cta2Label && activeHero.cta2Url && (
                <Link className="ei-text-action" href={activeHero.cta2Url}>{activeHero.cta2Label} <span aria-hidden="true">→</span></Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="container ei-hero-foot" aria-label="Company credentials"><span>Licensed by SLBFE</span><span>License No. 1162</span><span>Europe · Middle East · Asia · Africa</span></div>
    </section>

    {/* ====================================================================== */}
    {/* SECTION 2: VISION, MISSION & VALUES FLIP CARDS                        */}
    {/* Edit card titles, descriptions, and flip reveal content below          */}
    {/* ====================================================================== */}
    <section className="ei-intro" aria-label="Our vision, mission and core values" data-reveal>
      <div className="container ei-vision-cards">
        <button
          className="ei-belief-card ei-belief-card-vision"
          type="button"
          aria-label="Vision: To be recognised globally as an innovative and efficient human capital solutions partner."
        >
          <span className="ei-belief-card-front" aria-hidden="true">
            <span className="ei-belief-card-number">01</span>
            <strong>Vision</strong>
            <span className="ei-belief-card-hint"><b>↗</b></span>
          </span>
          <span className="ei-belief-card-reveal" aria-hidden="true">
            <small>Vision</small>
            <span>To be recognised globally as an innovative and efficient human capital solutions partner.</span>
          </span>
        </button>

        <button
          className="ei-belief-card ei-belief-card-mission"
          type="button"
          aria-label="Mission: We enhance every client’s success and improve every employee’s quality of life through the dignity and power of gainful employment, delivering best-in-class human capital solutions."
        >
          <span className="ei-belief-card-front" aria-hidden="true">
            <span className="ei-belief-card-number">02</span>
            <strong>Mission</strong>
            <span className="ei-belief-card-hint"><b>↗</b></span>
          </span>
          <span className="ei-belief-card-reveal" aria-hidden="true">
            <small>Mission</small>
            <span>We enhance every client’s success and improve every employee’s quality of life through the dignity and power of gainful employment, delivering best-in-class human capital solutions.</span>
          </span>
        </button>

        <button
          className="ei-belief-card ei-belief-card-values"
          type="button"
          aria-label="Core Values: Respect, Diversity, Teamwork, Empowerment and Community."
        >
          <span className="ei-belief-card-front" aria-hidden="true">
            <span className="ei-belief-card-number">03</span>
            <strong>Core Values</strong>
            <span className="ei-belief-card-hint"><b>↗</b></span>
          </span>
          <span className="ei-belief-card-reveal" aria-hidden="true">
            <small>Core Values</small>
            <span className="ei-core-values">
              <b>Respect</b>
              <b>Diversity</b>
              <b>Teamwork</b>
              <b>Empowerment</b>
              <b>Community</b>
            </span>
          </span>
        </button>
      </div>
    </section>

    <section className="ei-company-story" aria-labelledby="company-story-title">
      <div className="container ei-story-heading" data-reveal>
        <div className="ei-story-heading-intro">
          <p>Our story</p>
          <span>Three decades of opening doors responsibly.</span>
          <strong>Since 1995</strong>
        </div>
        <h2 id="company-story-title">Built one responsible <span>journey at a time.</span></h2>
      </div>
      <div className="container ei-story-layout">
        <div className="ei-story-stage" aria-hidden="true">
          <div className="ei-story-images">
            {companyStory.map((chapter, index) => <img className={index === activeStory ? "is-active" : ""} src={chapter.image} alt="" width="900" height="1125" loading="lazy" key={chapter.title} />)}
            <div className="ei-story-image-shade" />
            <p>{companyStory[activeStory].marker}</p>
          </div>
          <div className="ei-story-progress">
            <span>{String(activeStory + 1).padStart(2, "0")}</span>
            <div>{companyStory.map((chapter, index) => <i className={index <= activeStory ? "is-active" : ""} key={chapter.title} />)}</div>
            <span>{String(companyStory.length).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="ei-story-chapters">
          {companyStory.map((chapter, index) => <article className={"ei-story-chapter" + (index === activeStory ? " is-active" : "")} data-story-step={index} key={chapter.title}>
            <img className="ei-story-mobile-image" src={chapter.image} alt="" width="900" height="650" loading="lazy" />
            <span>{chapter.year}</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.copy}</p>
            {index === companyStory.length - 1 && <Link href="/about-us-emerald-isle-manpower/">Discover our company <b aria-hidden="true">→</b></Link>}
          </article>)}
        </div>
      </div>
    </section>

    <section className="ei-paths" aria-labelledby="paths-title"><div className="container">
      <div className="ei-title-row" data-reveal><h2 id="paths-title">Built for both sides of the journey.</h2><Link href="/about-us-emerald-isle-manpower/">Why Emerald Isle <span aria-hidden="true">→</span></Link></div>
      <div className="ei-path-grid"><article className="ei-path ei-path-candidate" data-reveal><span>For candidates</span><h3>Find work that takes your life forward.</h3><p>Verified vacancies, honest guidance and personal support from application to departure.</p><Link href="/foreign-job-vacancies/">Find your opportunity <b className="ei-path__icon-wrapper"><svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ei-path__icon-svg" width={10} height={10}><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg><svg viewBox="0 0 14 15" fill="none" width={10} height={10} xmlns="http://www.w3.org/2000/svg" className="ei-path__icon-svg ei-path__icon-svg--copy"><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg></b></Link></article><article className="ei-path ei-path-employer" data-reveal><span>For employers</span><h3>Build teams ready to make an impact.</h3><p>Industry-focused sourcing, rigorous screening and dependable deployment across borders.</p><button type="button" className="ei-path-action" onClick={() => setIsInquiryOpen(true)}>Start recruiting <b className="ei-path__icon-wrapper"><svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ei-path__icon-svg" width={10} height={10}><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg><svg viewBox="0 0 14 15" fill="none" width={10} height={10} xmlns="http://www.w3.org/2000/svg" className="ei-path__icon-svg ei-path__icon-svg--copy"><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg></b></button></article></div>
    </div></section>

    <dialog
      ref={inquiryDialogRef}
      className="employer-inquiry-dialog"
      aria-labelledby="home-employer-inquiry-title"
      onClose={() => setIsInquiryOpen(false)}
      onCancel={(event) => { event.preventDefault(); setIsInquiryOpen(false); }}
      onClick={(event) => { if (event.target === event.currentTarget) setIsInquiryOpen(false); }}
    >
      <button className="employer-inquiry-dialog-close" type="button" onClick={() => setIsInquiryOpen(false)} aria-label="Close inquiry form">×</button>
      <EmployerInquiryForm headingId="home-employer-inquiry-title" />
    </dialog>

    {/* ====================================================================== */}
    {/* SECTION 5: RECRUITMENT CATEGORIES GRID                                */}
    {/* Category items populated from categories array at top of file           */}
    {/* ====================================================================== */}
    <section className="ei-categories" aria-labelledby="categories-title"><div className="container ei-categories-layout">
      <div className="ei-categories-copy" data-reveal><p className="ei-kicker">Where talent travels</p><h2 id="categories-title">Careers for every kind of ambition.</h2><p>Specialist teams understand the skills, standards and cultures behind every placement.</p><Link className="ei-button ei-button-dark" href="/foreign-job-vacancies/">View every vacancy <span className="ei-button__icon-wrapper"><svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ei-button__icon-svg" width={10} height={10}><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg><svg viewBox="0 0 14 15" fill="none" width={10} height={10} xmlns="http://www.w3.org/2000/svg" className="ei-button__icon-svg ei-button__icon-svg--copy"><path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" /></svg></span></Link></div>
      <div className="ei-category-list">{categories.map(([name, copy], index) => <Link data-reveal href="/foreign-job-vacancies/" key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{name}</strong><small>{copy}</small></div><b aria-hidden="true">↗</b></Link>)}</div>
    </div></section>

    {/* ====================================================================== */}
    {/* SECTION 6: INTERACTIVE 3D CLIENT NETWORK GLOBE                        */}
    {/* Static initial focus set to Pakistan; component code in ClientGlobe.tsx */}
    {/* ====================================================================== */}
    <ClientGlobe />

    {/* ====================================================================== */}
    {/* SECTION 7: PROOF & AWARDS CREDENTIALS                                 */}
    {/* ====================================================================== */}
    <section className="ei-proof" aria-labelledby="proof-title"><div className="container ei-proof-grid">
      <div className="ei-award-statement" data-reveal><span className="ei-award-number">5</span><div><p className="ei-kicker">Awards and recognitions</p><h2 id="proof-title">Excellence is not a claim. It is a record.</h2><p>Five Star recognition, employer-brand honours and decades of responsible recruitment reflect the standard we protect every day.</p><Link href="/about-us-emerald-isle-manpower/">See our credentials <span aria-hidden="true">→</span></Link></div></div>
      <div className="ei-proof-facts" data-reveal><div><strong>32+</strong><span>years serving people and organisations</span></div><div><strong>8</strong><span>regional partner and branch markets</span></div><div><strong>One</strong><span>team from recruitment to travel</span></div></div>
    </div></section>

    {/* ====================================================================== */}
    {/* SECTION 8: CLIENT TESTIMONIALS \u2014 QUOTE LEDGER                          */}
    {/* All entries from the testimonials array render at once in a hairline   */}
    {/* grid of uniform white cells.                                           */}
    {/* ====================================================================== */}
    <section className="ei-testimonials" aria-labelledby="testimonial-title">
      <div className="container">
        <div className="ei-testimonial-heading" data-reveal>
          <p>Client testimonials</p>
          <h2 id="testimonial-title">Trusted by worldwide clients</h2>
        </div>
        {/* data-reveal sits on the grid (not the cells) so all four quotes
            appear together — per-cell reveal can strand the bottom row
            hidden when the section is the last thing above the footer. */}
        <div className="ei-quote-grid" data-reveal>
          {testimonials.map((testimonial) => (
            <figure
              className="ei-quote"
              key={testimonial.name}
              onPointerMove={placeQuoteSpotlight}
              onPointerDown={placeQuoteSpotlight}
            >
              <div className="ei-quote-top">
                <span className="ei-quote-place">{testimonial.place}</span>
                <span className="ei-quote-stars" aria-label="Five-star client testimonial"><span aria-hidden="true">{"\u2605\u2605\u2605\u2605\u2605"}</span></span>
              </div>
              <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <figcaption>
                <span className="ei-quote-avatar" aria-hidden="true">
                  {testimonial.avatar ? <img src={testimonial.avatar} alt="" /> : testimonial.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="ei-quote-who"><strong>{testimonial.name}</strong><small>{testimonial.company}</small></span>
                <em className="ei-quote-verified">Verified client</em>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  </main>;
}
