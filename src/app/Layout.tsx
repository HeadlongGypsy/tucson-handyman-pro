import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Phone, ChevronDown, Search, Menu, X } from "lucide-react";
import logoImg from "../imports/logo-transparent.png";

export const SERVICES = [
  {
    label: "Safe at Home",
    href: "/safe-at-home",
    shortDesc: "Custom safety modifications for seniors",
    description: "Designed with seniors in mind, our Safe at Home package provides a custom-tailored assessment of your living space followed by targeted modifications that support independent living. From grab bar installation and threshold ramp fitting to improved lighting and non-slip flooring, we work closely with families and in-home care providers to make every room safer — without sacrificing comfort or style. Peace of mind, delivered by a trusted local team.",
    photo: "https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=320&h=320&fit=crop&auto=format",
    photoAlt: "Caregiver assisting elderly woman with walker",
  },
  {
    label: "The Handyman Special",
    href: "/handyman-special",
    shortDesc: "Bundled repairs done in one efficient visit",
    description: "Got a list of repairs that never seems to shrink? The Handyman Special bundles your most common home maintenance tasks into one efficient visit. Leaky faucets, loose hinges, patched drywall, stuck doors — we knock them all out in a single appointment so you get your weekends back. A practical, cost-effective package for homeowners who want one reliable pro handling it all.",
    photo: "https://images.unsplash.com/photo-1765518440022-10242cc86895?w=320&h=320&fit=crop&auto=format",
    photoAlt: "Tool belt with hand tools",
  },
  {
    label: "General Services",
    href: "/#general-services",
    shortDesc: "Browse our full list of home services",
    description: "From small repairs to weekend projects, our general services catalog covers the full range of home maintenance and improvement tasks. Browse what we offer, then reach out to schedule — we'll handle the rest.",
    photo: "https://images.unsplash.com/photo-1726090401458-7abb00f7450c?w=320&h=320&fit=crop&auto=format",
    photoAlt: "Cozy American living room with fireplace",
  },
];

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleServiceClick(href: string) {
    setOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/", { state: { scrollTo: id } });
      }
    } else {
      navigate(href);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium tracking-wide text-foreground/80 hover:text-accent transition-colors duration-200 py-2"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Services
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-card border border-border shadow-2xl z-50">
          <ul className="py-2">
            {SERVICES.map((service, i) => (
              <li key={service.label}>
                <button
                  onClick={() => handleServiceClick(service.href)}
                  className="w-full text-left flex flex-col px-5 py-3.5 hover:bg-secondary/60 transition-colors group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {service.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {service.shortDesc}
                  </span>
                </button>
                {i < SERVICES.length - 1 && <div className="mx-5 border-b border-border" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function scrollToContact() {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "contact" } });
    }
  }

  function handleServiceClick(href: string) {
    setOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/", { state: { scrollTo: id } });
      }
    } else {
      navigate(href);
    }
  }

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen((v) => !v)} className="p-2 text-foreground" aria-label="Toggle menu">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg z-50">
          <nav className="px-6 py-4 space-y-1">
            <button
              className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground/80 border-b border-border/50"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
              <ChevronDown size={14} className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>

            {servicesOpen && (
              <div className="pl-4 pb-2 space-y-1">
                {SERVICES.map((service) => (
                  <button
                    key={service.label}
                    onClick={() => handleServiceClick(service.href)}
                    className="block w-full text-left py-2 text-sm text-foreground/70 hover:text-accent transition-colors"
                  >
                    {service.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={scrollToContact}
              className="block w-full text-left py-3 text-sm font-medium text-foreground/80 border-b border-border/50"
            >
              Contact
            </button>

            <a
              href="tel:+15206009872"
              className="flex items-center gap-2 py-3 text-sm font-medium text-accent"
              onClick={() => setOpen(false)}
            >
              <Phone size={14} />
              (520) 600-9872
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function scrollToContact(e: React.MouseEvent) {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "contact" } });
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src={logoImg} alt="Tucson Handyman Pro" className="h-11 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <ServicesDropdown />
          <a
            href="#contact"
            onClick={scrollToContact}
            className="text-sm font-medium tracking-wide text-foreground/80 hover:text-accent transition-colors duration-200"
          >
            Contact
          </a>
          <a
            href="tel:+15206009872"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-accent transition-colors duration-200"
          >
            <Phone size={13} />
            (520) 600-9872
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-2 bg-secondary/60 border border-border px-3 py-1.5 w-48 cursor-not-allowed opacity-60" title="AI Search — coming soon">
          <Search size={13} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">AI Search — soon</span>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground/40 px-8 md:px-16 lg:px-24 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wide">
        <span className="text-primary-foreground/60" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tucson Handyman Pro
        </span>
        <span>© {new Date().getFullYear()} All rights reserved.</span>
      </div>
    </footer>
  );
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
