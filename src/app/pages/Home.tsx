import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Phone } from "lucide-react";
import heroImage from "../../imports/Gates_THP_Header_Crop.jpg";
import { SERVICES } from "../Layout";

/*
 * FORM SETUP — takes about 2 minutes:
 * 1. Go to https://formspree.io and create a free account
 * 2. Create a new form and copy your Form ID (looks like "xpwzgkla")
 * 3. Open the file .env in the project root (create it if it doesn't exist)
 * 4. Add this line:  VITE_FORMSPREE_ID=your_form_id_here
 * 5. Restart the dev server — form submissions will arrive in your email
 */
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!FORMSPREE_ID) {
      // No Formspree ID set yet — just show success so the UI works during dev
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.currentTarget),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-primary py-12 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-4">Contact</p>
          <h2
            className="text-3xl md:text-4xl font-semibold text-primary-foreground mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Let&apos;s get your project started.
          </h2>
          <p className="text-sm text-primary-foreground/60 leading-relaxed mb-8">
            Describe what you need and we&apos;ll follow up within one business day to schedule a visit.
          </p>
          <a href="tel:+15206009872" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
            <Phone size={15} />
            <span className="text-sm font-medium">(520) 600-9872</span>
          </a>
        </div>

        <div>
          {status === "sent" ? (
            <div className="h-full flex flex-col justify-center">
              <p className="text-2xl text-primary-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Message received.
              </p>
              <p className="text-sm text-primary-foreground/60">We&apos;ll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] tracking-widest uppercase text-primary-foreground/50 mb-1.5">First Name</label>
                  <input required name="first_name" type="text" className="w-full bg-primary-foreground/5 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-[12px] tracking-widest uppercase text-primary-foreground/50 mb-1.5">Last Name</label>
                  <input required name="last_name" type="text" className="w-full bg-primary-foreground/5 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Smith" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] tracking-widest uppercase text-primary-foreground/50 mb-1.5">Email</label>
                <input required name="email" type="email" className="w-full bg-primary-foreground/5 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="jane@company.com" />
              </div>
              <div>
                <label className="block text-[12px] tracking-widest uppercase text-primary-foreground/50 mb-1.5">Phone <span className="normal-case tracking-normal font-normal opacity-60">— optional</span></label>
                <input name="phone" type="tel" className="w-full bg-primary-foreground/5 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="*much easier to call you back!" />
              </div>
              <div>
                <label className="block text-[12px] tracking-widest uppercase text-primary-foreground/50 mb-1.5">Message</label>
                <textarea required name="message" rows={4} className="w-full bg-primary-foreground/5 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="Tell us about your project..." />
              </div>
              {status === "error" && (
                <p className="text-sm text-red-400">Something went wrong — please try again or call us directly.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-accent text-accent-foreground px-8 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative pt-16 h-[50vh] min-h-[360px] overflow-hidden">
      <img src={heroImage} alt="Tucson mountain landscape" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-primary/20" />
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-4xl">
        <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-6">
          Serving Tucson &amp; Surrounding Areas
        </p>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-[1.1] mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tucson&apos;s trusted
          <br />
          handyman service.
        </h1>
        <p className="text-base text-primary-foreground/75 leading-relaxed max-w-md mb-10">
          From quick repairs to full room upgrades — insured, experienced, and ready to tackle your to-do list.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
            className="bg-accent text-accent-foreground px-7 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity duration-200"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const featured = SERVICES.slice(0, 2);
  const general = SERVICES[2];

  return (
    <section id="services">
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-2">
              Tucson&apos;s Trusted Local Pros
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tucson Handyman Pro
            </h2>
          </div>
          <p className="text-sm text-primary-foreground/50 max-w-xs leading-relaxed">
            Insured, locally owned, and backed by 35 years in the trades — serving Tucson and surrounding areas.
          </p>
        </div>
      </div>

      <div className="border-b border-border">
        {featured.map((service, i) => (
          <div key={service.label} className={i === 0 ? "border-b border-border" : ""}>
            <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
              <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-6">Featured Package</p>
              <div className="flex flex-col sm:flex-row gap-8 max-w-2xl">
                <Link to={service.href} className="w-full aspect-square sm:w-40 sm:h-40 sm:aspect-auto flex-shrink-0 overflow-hidden bg-secondary hover:opacity-90 transition-opacity">
                  <img src={service.photo} alt={service.photoAlt} className="w-full h-full object-cover" />
                </Link>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {service.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                  <Link to={service.href} className="mt-5 self-start flex items-center gap-2 text-sm font-medium text-accent hover:gap-4 transition-all duration-200 group">
                    Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div id="general-services" className="bg-secondary/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
          <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-muted-foreground mb-6">Browse All</p>
          <div className="flex flex-col sm:flex-row gap-8 max-w-5xl">
            <div className="w-full aspect-square sm:w-40 sm:h-40 sm:aspect-auto flex-shrink-0 overflow-hidden bg-secondary">
              <img src={general.photo} alt={general.photoAlt} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {general.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-xl">{general.description}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0 pl-4">
                {[
                  "Drywall & Patching", "Door & Window Repair", "Flooring Repairs",
                  "Furniture Assembly", "Minor Plumbing Repairs", "Minor Electrical Fixes",
                  "HVAC Filter Service", "Caulking & Sealing", "Painting & Staining",
                  "Cabinet Installation", "Deck & Patio Work", "Fixture Upgrades",
                ].map((item) => (
                  <a
                    key={item}
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="flex items-center gap-2.5 py-2.5 border-b border-border/60 text-sm text-foreground/70 hover:text-foreground hover:border-accent transition-all group"
                  >
                    <span className="w-1 h-1 bg-accent rounded-full flex-shrink-0 group-hover:scale-150 transition-transform" />
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="px-8 md:px-16 lg:px-24 py-12 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-8 mb-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your home deserves someone you can trust.
        </h2>
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border overflow-hidden flex items-center justify-center text-muted-foreground/40">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-dashed border-muted-foreground/30 rounded-full mx-auto mb-1" />
              <span className="text-[10px] tracking-widest uppercase">Photo</span>
            </div>
          </div>
          <span className="text-[12px] text-muted-foreground tracking-wide">John</span>
        </div>
      </div>
      <div className="max-w-2xl">
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>Tucson Handyman Pro was built on a simple idea: homeowners deserve a reliable, skilled professional they can call without hesitation. No upsells, no no-shows, no guesswork — just honest work done right the first time.</p>
          <p>We serve Tucson and the surrounding areas with the kind of care and attention you&apos;d expect from a neighbor. Whether it&apos;s a long list of deferred repairs or a single job that&apos;s been nagging you for months, we show up prepared, treat your home with respect, and leave it better than we found it.</p>
          <p>We&apos;re not licensed contractors — but we are fully insured, and John brings 35 years of hands-on experience in the trades. That means honest work, realistic expectations, and the kind of craftsmanship that only comes from decades on the job.</p>
        </div>
        <a
          href="#contact"
          onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-4 transition-all duration-200 group"
        >
          Get in touch <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <AboutSection />
      <div className="py-4" />
      <hr className="border-t border-foreground/20 mx-12 md:mx-20 lg:mx-28" />
      <div className="py-4" />
      <ContactSection />
    </>
  );
}
