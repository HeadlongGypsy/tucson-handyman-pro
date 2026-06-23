import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router";
import heroImage from "../../imports/Gates_THP_Header_Crop.jpg";
import { ContactSection } from "./Home";
import BookingModal from "../../components/BookingModal";

const INCLUDED = [
  {
    title: "Grab Bar Installation",
    desc: "Strategically placed bars in bathrooms, hallways, and stairways for steady support.",
    photo: "https://images.unsplash.com/photo-1569597967185-cd6120712154?w=600&h=400&fit=crop&auto=format",
    alt: "Clean white toilet in bathroom",
  },
  {
    title: "Non-Slip Flooring",
    desc: "Anti-slip treatments and secure area rug anchoring to reduce fall risk.",
    photo: "https://images.unsplash.com/photo-1548268364-3acee266b695?w=600&h=400&fit=crop&auto=format",
    alt: "Hardwood flooring texture",
  },
  {
    title: "Threshold Ramps",
    desc: "Smooth transitions between rooms to accommodate walkers, canes, and wheelchairs.",
    photo: "https://images.unsplash.com/photo-1604300920737-6f99c57f6df8?w=600&h=400&fit=crop&auto=format",
    alt: "Home doorway entrance",
  },
  {
    title: "Improved Lighting",
    desc: "Brighter bulbs, added fixtures, and night-light placement in high-traffic areas.",
    photo: "https://images.unsplash.com/photo-1778731525590-5340fadf00c5?w=600&h=400&fit=crop&auto=format",
    alt: "Modern hallway with recessed lighting",
  },
  {
    title: "Stair Handrail Reinforcement",
    desc: "Inspect and secure existing railings or install new ones to code.",
    photo: "https://images.unsplash.com/photo-1580911498851-4999ad5327b6?w=600&h=400&fit=crop&auto=format",
    alt: "Wooden staircase with white railings",
  },
  {
    title: "Door Hardware Upgrades",
    desc: "Lever-style handles replacing knobs for easier grip and reduced hand strain.",
    photo: "https://images.unsplash.com/photo-1523350889744-31aaf7d71c08?w=600&h=400&fit=crop&auto=format",
    alt: "Close up of door handle hardware",
  },
  {
    title: "Bathroom Safety Kit",
    desc: "Tub transfer bench fitting, raised toilet seat installation, and shower chair setup.",
    photo: "https://images.unsplash.com/photo-1695002817411-203c7f19dfa3?w=600&h=400&fit=crop&auto=format",
    alt: "Clean modern bathroom",
  },
  {
    title: "Home Safety Assessment",
    desc: "A thorough walkthrough to identify hazards and prioritize your personalized modification plan.",
    photo: "https://images.unsplash.com/photo-1769776400238-cd24612240ea?w=600&h=400&fit=crop&auto=format",
    alt: "Magnifying glass over house model",
  },
];

function Hero() {
  return (
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
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-[1.1] mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Safe at Home.
        </h1>
        <p className="text-base text-primary-foreground/75 leading-relaxed max-w-lg mb-10">
          A custom-tailored program of home safety modifications designed to support independent living — for seniors and the families who love them.
        </p>
        <div className="self-start">
          <BookingModal />
        </div>
      </div>
    </section>
  );
}

function Overview() {
  return (
    <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* Left — copy */}
        <div className="order-2 md:order-1">
          <h2
            className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Staying home shouldn&apos;t mean risking it.
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Most home accidents happen in familiar places — the bathroom, the hallway, the stairs. For seniors, a single fall can have life-changing consequences. The Safe at Home package is designed to eliminate those risks before they happen.
            </p>
            <p>
              Our experienced team specializes in high quality, senior-friendly upgrades that help clients age in place safely. We start with a thorough walkthrough of your living space, identifying hazards and talking through your daily routines. From there, we build a personalized modification plan and complete the work in one or two focused visits.
            </p>
            <p>
              With over 35 years of experience, Tucson Handyman Pro provides reliable, affordable small home repairs and maintenance. We work closely with in-home care providers, occupational therapists, and family members to make sure every modification fits the individual — not just the average. The goal is a home that feels the same, just safer.
            </p>
          </div>
        </div>

        {/* Right — package image */}
        <div className="order-1 md:order-2 w-full aspect-square overflow-hidden bg-secondary md:sticky md:top-24">
          <img
            src="https://images.unsplash.com/photo-1758686254555-9bcaba0dd46d?w=800&h=800&fit=crop&auto=format"
            alt="Elderly couple dancing joyfully in their living room"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function WhereWeStart() {
  return (
    <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
      <div className="max-w-2xl">
        <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-4">The Process</p>
        <h2
          className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Path to a Safer Home
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            You want your loved one to stay safe and independent at home — without the constant worry that something could happen.
          </p>
          <p>
            Most falls occur in the familiar places they use every day. That&apos;s why we start by walking through their actual living space with you (and any care providers who want to be part of the conversation).
          </p>
        </div>

        <p className="mt-6 mb-4 text-sm font-semibold text-foreground">Here&apos;s how we help:</p>
        <ul className="space-y-3 mb-6">
          {[
            "We identify real hazards together in the bathroom, hallways, stairs, and high-traffic areas",
            "We create a clear, personalized plan focused only on what truly matters",
            "We complete the work quickly and cleanly — usually in one or two focused visits",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Based on 35 years of home repair experience, we make modifications that let the home feel natural — not clinical or overwhelming. The goal is simple: a home that supports their independence while giving everyone peace of mind.
        </p>
      </div>
    </section>
  );
}

function WhatIsIncluded() {
  return (
    <section className="bg-secondary/40 py-8">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-4">What&apos;s Included</p>
        <h2
          className="text-3xl md:text-4xl font-semibold text-foreground mb-12"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Every modification. One trusted pro.
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {INCLUDED.map((item) => (
            <div key={item.title} className="bg-background flex flex-col hover:bg-card transition-colors group">
              <div className="w-full aspect-video overflow-hidden bg-secondary">
                <img
                  src={item.photo}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
      <div className="max-w-2xl">
        <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-4">Who It&apos;s For</p>
        <h2
          className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Designed for independence. Built for peace of mind.
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            The Safe at Home package is ideal for seniors who want to remain in their own home as long as possible — and for the adult children and caregivers helping make that happen. It&apos;s also a natural fit for anyone recovering from surgery or managing a mobility challenge.
          </p>
          <p>
            Not sure where to start? Give us a call. We&apos;re happy to talk through your situation, answer questions, and help you figure out what makes sense — no pressure, just a real conversation.
          </p>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-accent mb-2">Ready to get started?</p>
          <p className="text-xl text-primary-foreground font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            Give us a call — we&apos;d love to talk through your needs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 flex-shrink-0">
          <a
            href="tel:+15206009872"
            className="bg-accent text-accent-foreground px-7 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            Call Today
          </a>
          <a href="tel:+15206009872" className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors text-sm">
            <Phone size={14} />
            (520) 600-9872
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SafeAtHome() {
  return (
    <>
      <Hero />
      <Overview />
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <WhereWeStart />
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <WhatIsIncluded />
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
        <BookingModal />
      </div>
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <WhoItsFor />
      <hr className="border-t border-border mx-12 md:mx-20 lg:mx-28" />
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
        <BookingModal />
      </div>
      <CallToAction />
      <ContactSection />
    </>
  );
}
