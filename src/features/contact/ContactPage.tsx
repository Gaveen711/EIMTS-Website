"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { PageHero } from "../../components/ui/PageHero";

const BranchMap = dynamic(
  () => import("./BranchMap").then((module) => module.BranchMap),
  { ssr: false },
);

// ============================================================================
// LOCAL OFFICE DIRECTORY DATA
// Edit, add, or remove office entries, addresses, and phone numbers here.
// ============================================================================
type Office = {
  name: string;
  address: string;
  phone: string;
  phoneHref: string;
};

const offices: Office[] = [
  {
    name: "Head Office",
    address: "198 Galle Road, Dehiwala–Mount Lavinia 10370, Colombo",
    phone: "+94 11 433 5444",
    phoneHref: "tel:+94114335444",
  },
  {
    name: "Kurunegala",
    address: "No. 72/1, 2nd Floor, Colombo Road, Kurunegala",
    phone: "+94 77 189 1890",
    phoneHref: "tel:+94771891890",
  },
  {
    name: "Batticaloa",
    address: "186 1/1, Fathima Building, Trinco Road, Batticaloa",
    phone: "+94 65 222 8448",
    phoneHref: "tel:+94652228448",
  },
  {
    name: "Kandy",
    address: "420/1 Kehelwala Rd, Kiribathkumbura 20442, Kandy",
    phone: "+94 11 433 5444",
    phoneHref: "tel:+94114335444",
  },
];

export default function ContactPage() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const jumpToTarget = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        }
      };
      jumpToTarget();
      const timer = setTimeout(jumpToTarget, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  return <main id="main">
    {/* ====================================================================== */}
    {/* PAGE HERO HEADER                                                       */}
    {/* ====================================================================== */}
    <PageHero
      eyebrow="We are here to help"
      title="Tell us where you want to go next."
      description="Reach our recruitment and employer teams. Choose the nearest office or send us a message."
    />

    {/* ====================================================================== */}
    {/* CONTACT SECTION: OFFICES DIRECTORY & INQUIRY FORM                      */}
    {/* ====================================================================== */}
    <section className="content-section alt">
      <div className="container contact-details">
        {/* Left Column: Local Offices List */}
        <div>
          <p className="section-kicker">Our offices</p>
          <h2>Speak with a local team</h2>
          <div className="contact-panel">
            {offices.map((office) => (
              <article className="contact-card" key={office.name}>
                <h2>{office.name}</h2>
                <p>{office.address}</p>
                <a href={office.phoneHref}>{office.phone}</a>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column: Send an Inquiry Form (Width expanded in globals.css)   */}
        {/* To integrate backend/API: change action URL or handle submit event   */}
        <form className="contact-route-form" action="mailto:info@emeraldisle.lk" method="post" encType="text/plain">
          <div>
            <p className="section-kicker">Send an inquiry</p>
            <h2>How can we help?</h2>
          </div>
          <div className="form-row">
            <label><span>Name</span><input required name="name" autoComplete="name" /></label>
            <label><span>Email</span><input required type="email" name="email" autoComplete="email" /></label>
          </div>
          <div className="form-row">
            <label><span>Subject</span><input required name="subject" /></label>
            <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
          </div>
          <label><span>Comment</span><textarea required name="comment" rows={7} /></label>
          <button className="primary-button" type="submit">Send message</button>
          <p>Or email <a href="mailto:info@emeraldisle.lk">info@emeraldisle.lk</a></p>
        </form>
      </div>
    </section>

    {/* ====================================================================== */}
    {/* INTERACTIVE SRI LANKA BRANCH MAP WITH PINS & MOBILE TOUCH SLIDER       */}
    {/* Map settings and pins defined in ./BranchMap.tsx                      */}
    {/* ====================================================================== */}
    <BranchMap />
  </main>;
}
