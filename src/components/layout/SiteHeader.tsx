"use client";

import { useState, useEffect, useRef } from "react";

const routes = {
  home: "/",
  about: "/about-us-emerald-isle-manpower/",
  jobs: "/foreign-job-vacancies/",
  employer: "/client-recruitment-solutions/",
  projects: "/projects/",
  blog: "/insightful-and-engaging-blog-posts-discover-our-latest-articles/",
  faq: "/emerald-isle-manpower-faq/",
  contact: "/contact/",
};

const jobGroups = [
  { title: "Engineering", links: ["Automotive / Vehicle Maintenance / Service & Repair", "Marine / Aviation / Watersports", "Construction / Skilled Trades", "General Labour / Cleaners", "Agricultural / Gardening", "Engineering / Technical", "Transport / Driving", "Security / Safety"] },
  { title: "Retail, Admin & Accounts", links: ["Accounting / Auditing / Finance", "Logistic / Warehouse / Transport", "Sales / Marketing / Merchandise", "Secretary / Admin", "HR / Training", "Retail"] },
  { title: "Hospitality & Healthcare", links: ["Hotel / Restaurant / Food", "Spa / Beauty / Salon", "Healthcare"] },
];

function Caret() {
  return <span className="nav-caret" aria-hidden="true" />;
}

function JobMegaMenu({ onClose }: { onClose?: () => void }) {
  return (
    <div className="jobs-mega-menu" aria-label="Job categories">
      <div className="jobs-mega-grid">
        {jobGroups.map((group) => (
          <section className="mega-column" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((label) => (
              <a
                href={routes.jobs + "?filter-category=" + encodeURIComponent(label)}
                key={label}
                onClick={onClose}
              >
                {label}
              </a>
            ))}
          </section>
        ))}
        <section className="mega-column mega-candidate-desk">
          <h2>Candidate desk</h2>
          <a className="mega-highlight" href={routes.blog} onClick={onClose}>Career advice</a>
          <a href={routes.jobs} onClick={onClose}>All foreign vacancies</a>
          <a href="https://registration.emeraldislemanpower.com/" onClick={onClose}>Register as a job seeker</a>
        </section>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const headerHasFocus = headerRef.current?.contains(document.activeElement);
      const menuIsOpen = isOpen || isMobileMenuOpen;

      if (currentScrollY <= 80 || delta < -6 || headerHasFocus || menuIsOpen) {
        setIsHidden(false);
      } else if (delta > 6 && currentScrollY > 140) {
        setIsHidden(true);
        setIsOpen(false);
        setIsMobileMenuOpen(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return <header ref={headerRef} className={"global-header" + (isHidden ? " is-hidden" : "")}>
    <div className="wide-container nav-shell">
      <a className="global-brand" href={routes.home} aria-label="Emerald Isle Manpower home"><img src="/assets/emerald-isle-logo.webp" width="214" height="55" alt="Emerald Isle Manpower" /></a>
      <nav className="top-nav" aria-label="Primary navigation">
        <a href={routes.home}>Home</a>
        <a href={routes.about}>About us</a>
        <div
          className={"nav-group jobs-nav-group" + (isOpen ? " is-open" : "")}
          ref={menuRef}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <a
            className="nav-group-trigger"
            href={routes.jobs}
            aria-label="View all foreign job vacancies"
          >
            Find jobs <Caret />
          </a>
          <JobMegaMenu />
        </div>
        <a href={routes.employer}>Employer</a>
        <a href={routes.projects}>Projects</a>
        <a href={routes.blog}>Blogs</a>
        <a href={routes.contact}>Contact Us</a>
      </nav>
      <a className="register-pill" href="https://registration.emeraldislemanpower.com/">
        <span className="register-pill__icon-wrapper">
          <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="register-pill__icon-svg" width={10} height={10}>
            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 14 15" fill="none" width={10} height={10} xmlns="http://www.w3.org/2000/svg" className="register-pill__icon-svg register-pill__icon-svg--copy">
            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
          </svg>
        </span>
        Register now
      </a>
      <details className="global-mobile-menu">
        <summary aria-label="Open navigation"><span className="menu-lines" aria-hidden="true" /></summary>
        <nav aria-label="Mobile navigation">
          <a href={routes.home}>Home</a>
          <a href={routes.about}>About us</a>
          <details className="mobile-job-menu">
            <summary>Find jobs <Caret /></summary>
            <a className="mobile-all-jobs" href={routes.jobs}>All foreign vacancies</a>
            {jobGroups.map((group) => <div className="mobile-job-group" key={group.title}><p>{group.title}</p>{group.links.map((label) => <a href={routes.jobs + "?filter-category=" + encodeURIComponent(label)} key={label}>{label}</a>)}</div>)}
          </details>
          <a href={routes.employer}>Employers</a>
          <a href={routes.projects}>Projects</a>
          <a href={routes.blog}>Blogs</a>
          <a href={routes.faq}>FAQ</a>
          <a href={routes.contact}>Contact</a>
          <a href="https://registration.emeraldislemanpower.com/">Register now</a>
        </nav>
      </details>
    </div>
  </header>;
}
