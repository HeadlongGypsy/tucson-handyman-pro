import { Link } from "react-router";
import { ArrowRight, Phone, Clock } from "lucide-react";
import heroImage from "../../imports/Gates_THP_Header_Crop.jpg";
import { ContactSection } from "./Home";

export default function HandymanSpecial() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 h-[38vh] min-h-[280px] overflow-hidden">
        <img
          src={heroImage}
          alt="Tucson mountain landscape"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/70 to-primary/25" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.15em] uppercase font-semibold text-accent mb-6 hover:gap-3 transition-all group"
          >
            <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-primary-foreground/50 mb-3">
            Featured Package
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Handyman Special.
          </h1>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={18} className="text-accent" />
            <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent">Coming Soon</p>
          </div>
          <h2
            className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We&apos;re putting the finishing touches on this one.
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-10">
            <p>
              The Handyman Special is a bundled repair package designed to knock out your entire to-do list in a single, efficient visit. We&apos;re finalizing the details and will have this page ready shortly.
            </p>
            <p>
              In the meantime, give us a call — we&apos;re happy to talk through what you need and get something scheduled.
            </p>
          </div>
          <a
            href="tel:+15206009872"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            <Phone size={14} />
            Call (520) 600-9872
          </a>
        </div>
      </section>

      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <ContactSection />
    </>
  );
}
