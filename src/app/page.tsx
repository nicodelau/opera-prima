"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AudioPlayer from "@/components/AudioPlayer";
import TicketModal from "@/components/TicketModal";

interface BillboardShow {
  id: number | string;
  title: string;
  composer: string;
  tag?: string | null;
  desc: string;
  image: string;
}

const BILLBOARD_SHOWS: BillboardShow[] = [
  {
    id: 1,
    title: "Carmen",
    composer: "Georges Bizet",
    tag: "ÓPERA PRINCIPAL",
    desc: "Amor, traición y libertad se entrelazan en la producción más aclamada de la temporada. Una puesta en escena dramática con el vestuario original de Sevilla y la dirección musical de nuestra prestigiosa maestra residente.",
    image: "/images/hero_carmen.png",
  },
  {
    id: 2,
    title: "La Traviata",
    composer: "Giuseppe Verdi",
    tag: "OBRA MAESTRA LÍRICA",
    desc: "La trágica historia de amor de Violetta Valéry cobra vida en una opulenta recreación de los salones de París del siglo XIX. Disfruta del célebre brindis y arias que han emocionado a generaciones enteras.",
    image: "/images/hero_traviata.png",
  },
  {
    id: 3,
    title: "El Lago de los Cisnes",
    composer: "Pyotr Ilyich Tchaikovsky",
    tag: "BALLET ESTELAR",
    desc: "La máxima expresión de la danza clásica. Nuestra compañía estable de ballet presenta la inmortal leyenda del príncipe Sigfrido y Odette bajo una mágica iluminación lunar y con la coreografía original restaurada.",
    image: "/images/hero_lake_swans.png",
  },
];

interface CalendarShow {
  id: number | string;
  title: string;
  composer: string;
  category: string;
  dates?: string | null;
  price?: string | null;
  desc: string;
  image: string;
}

const CALENDAR_SHOWS: CalendarShow[] = [
  {
    id: 1,
    title: "Carmen (Ópera)",
    composer: "Georges Bizet",
    category: "opera",
    dates: "Mayo 30 - Junio 5",
    price: "$4.000",
    desc: "La sensual y apasionada cigarrera Carmen desafía las normas sociales en una puesta monumental con coro de niños y solistas internacionales.",
    image: "/images/hero_carmen.png",
  },
  {
    id: 2,
    title: "La Traviata (Ópera)",
    composer: "Giuseppe Verdi",
    category: "opera",
    dates: "Junio 11 - Junio 17",
    price: "$4.000",
    desc: "La conmovedora tragedia romántica de Verdi que explora el sacrificio, la redención y las divisiones de la alta sociedad parisina.",
    image: "/images/hero_traviata.png",
  },
  {
    id: 3,
    title: "El Lago de los Cisnes",
    composer: "P. I. Tchaikovsky",
    category: "ballet",
    dates: "Junio 26 - Junio 28",
    price: "$4.000",
    desc: "La desgarradora fantasía lírica y coreográfica donde se libra la eterna batalla entre el amor puro y el hechizo del brujo Rothbart.",
    image: "/images/hero_lake_swans.png",
  },
  {
    id: 4,
    title: "Gala Lírica de Invierno",
    composer: "Puccini, Verdi, Mozart",
    category: "concierto",
    dates: "Julio 4 - 20:00",
    price: "$3.000",
    desc: "Las arias y dúos de amor más famosos del repertorio operístico universal, interpretados por los mejores cantantes solistas de nuestra academia.",
    image: "/images/academy_orchestra.png",
  },
  {
    id: 5,
    title: "Mozart para Niños",
    composer: "W. A. Mozart",
    category: "infantil",
    dates: "Julio 12 - 15:00",
    price: "$2.000",
    desc: "Una adaptación lúdica y mágica de 'La Flauta Mágica' pensada especialmente para introducir a los más pequeños al mundo maravilloso de la lírica.",
    image: "/images/hero_traviata.png", // Recycled beautifully
  },
  {
    id: 6,
    title: "Novena Sinfonía de Beethoven",
    composer: "Ludwig van Beethoven",
    category: "concierto",
    dates: "Julio 18 - 20:30",
    price: "$3.000",
    desc: "El monumental canto a la hermandad humana interpretado por la Orquesta Filarmónica Opera Prima y nuestro Coro Estable de 80 voces.",
    image: "/images/academy_orchestra.png",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"todos" | "opera" | "ballet" | "concierto" | "infantil">("todos");

  const [billboardShows, setBillboardShows] = useState<BillboardShow[]>(BILLBOARD_SHOWS);
  const [calendarShows, setCalendarShows] = useState<CalendarShow[]>(CALENDAR_SHOWS);

  // Load shows from database
  useEffect(() => {
    async function loadShows() {
      try {
        const res = await fetch("/api/shows");
        if (res.ok) {
          const data = await res.json();
          const billboard = data.filter((s: any) => s.type === "billboard");
          const calendar = data.filter((s: any) => s.type === "calendar");
          
          if (billboard.length > 0) setBillboardShows(billboard);
          if (calendar.length > 0) setCalendarShows(calendar);
        }
      } catch (err) {
        console.error("Failed to load shows from DB:", err);
      }
    }
    loadShows();
  }, []);

  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Booking Modal State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingShow, setBookingShow] = useState("Carmen");

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-theme");
      } else {
        document.documentElement.classList.remove("light-theme");
      }
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  };

  // Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carousel AutoPlay
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % billboardShows.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlide, billboardShows.length]);

  const openBooking = (showName: string) => {
    // Standardize show name to match modal options
    let modalShow = "Carmen";
    if (showName.includes("Traviata")) modalShow = "La Traviata";
    if (showName.includes("Lago") || showName.includes("Cisnes")) modalShow = "El Lago de los Cisnes";

    setBookingShow(modalShow);
    setBookingOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  // Filter shows based on category
  const filteredShows = activeTab === "todos"
    ? calendarShows
    : calendarShows.filter((s) => s.category === activeTab);

  return (
    <div className="theater-bg min-h-screen">

      {/* 1. HEADER / NAVIGATION */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/silencio.svg"
            alt="Silencio Logo"
            width={120}
            height={40}
            className="h-10 w-auto md:h-12 object-contain transparent-logo rounded-sm"
            priority
          />
        </a>

        <nav>
          <ul className="nav-links">
            <li><a href="#cartelera">Cartelera</a></li>
            <li><a href="#calendario">Temporada</a></li>
            <li><a href="#academia">Academia</a></li>
            <li><a href="#compania">La Compañía</a></li>
          </ul>
        </nav>

        <div className="navbar-actions">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              // Venezuela dark mode icon: Starry Moon with yellow/white colors
              <span className="theme-toggle-icon animate-fade">
                <svg width="20" height="20" className="text-[var(--camel)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.3 22h-.1c-5.5-.2-9.9-4.8-9.7-10.3C2.7 6.3 7.1 2 12.5 2c.6 0 1.2.1 1.8.2.4.1.7.5.6.9-.1.4-.4.7-.8.7-3.9.4-6.8 3.8-6.4 7.8.4 3.5 3.3 6.3 6.9 6.6.5 0 .9.3.9.8v.1c-.2.5-.6.9-1.2.9zm.6-18.4c-4.3 1.1-7.2 5.1-6.7 9.6.5 4 3.7 7.1 7.7 7.6.6.1 1.2.1 1.7 0-3.3-1.8-5-5.6-4.1-9.3.8-3.3 3.6-5.8 7-6.5-.5-.1-1.1-.1-1.6-.1-.3-.4-.7-.4-1-.3z" />
                  <circle cx="17" cy="6" r="1.2" fill="#FFFFFF" className="animate-pulse" />
                  <circle cx="20" cy="9" r="1.5" fill="#FFFFFF" className="animate-pulse" />
                  <circle cx="16" cy="12" r="0.9" fill="#FFFFFF" className="animate-pulse" />
                </svg>
              </span>
            ) : (
              // Argentina light mode icon: Sol de Mayo (Sun with rays)
              <span className="theme-toggle-icon animate-fade">
                <svg width="20" height="20" className="text-[var(--camel)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </span>
            )}
          </button>

          <button
            onClick={() => openBooking("Carmen")}
            className="btn-primary"
          >
            Boletería
          </button>
        </div>
      </header>

      {/* 2. CINEMATIC BILLBOARD / HERO CAROUSEL */}
      <section id="cartelera" className="billboard">
        {billboardShows.map((show, idx) => (
          <div
            key={show.id}
            className={`billboard-slide ${idx === activeSlide ? "active" : ""}`}
          >
            <div
              className="billboard-image"
              style={{ backgroundImage: `url(${show.image})` }}
            >
              <div className="billboard-overlay" />
            </div>

            <div className="billboard-container">
              <div className="billboard-meta">
                <span className="billboard-tag">{show.tag}</span>
                <span className="billboard-composer">{show.composer}</span>
              </div>
              <h1 className="billboard-title font-serif">{show.title}</h1>
              <p className="billboard-desc">{show.desc}</p>
              <div className="billboard-actions">
                <button
                  onClick={() => openBooking(show.title as string)}
                  className="btn-primary"
                >
                  Comprar Entradas
                </button>
                <a
                  href="#calendario"
                  className="btn-secondary flex items-center justify-center"
                >
                  Ver Programación
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Dots */}
        <div className="billboard-dots">
          {billboardShows.map((_, idx) => (
            <button
              key={idx}
              className={`billboard-dot ${idx === activeSlide ? "active" : ""}`}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Ir a diapositiva ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 3. SEASON CALENDAR SECTION */}
      <section id="calendario" className="section-padding">
        <div className="section-header">
          <span className="section-subtitle">PROGRAMACIÓN OFICIAL</span>
          <h2 className="section-title font-serif">Temporada Lírica</h2>
        </div>

        {/* Category Filters */}
        <div className="filter-tabs">
          {(["todos", "opera", "ballet", "concierto", "infantil"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "todos" ? "Todos" : tab === "infantil" ? "Niños" : tab}
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {filteredShows.map((show) => (
            <article key={show.id} className="show-card glass-panel">
              <div className="show-card-img-container">
                <div
                  className="show-card-img"
                  style={{ backgroundImage: `url(${show.image})` }}
                />
                <div className="show-card-tag">
                  <span className="billboard-tag text-[9px] px-2 py-0.5">
                    {show.category}
                  </span>
                </div>
              </div>

              <div className="show-card-body">
                <span className="show-card-date">{show.dates}</span>
                <h3 className="show-card-title font-serif">{show.title}</h3>
                <span className="show-card-composer">{show.composer}</span>
                <p className="show-card-desc">{show.desc}</p>

                <div className="show-card-footer">
                  <div className="show-card-price">
                    Desde <span>{show.price}</span>
                  </div>
                  <button
                    onClick={() => openBooking(show.title)}
                    className="show-card-btn"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ACADEMIA / INSTITUTO DE ARTE */}
      <section id="academia" className="section-padding bg-gradient-to-b from-transparent to-[rgba(10,2,3,0.85)]">
        <div className="split-column-container">
          <div className="split-column-content animate-slide-up">
            <span className="section-subtitle" style={{ textAlign: "left" }}>EXCELENCIA LÍRICA</span>
            <h2 className="split-column-title font-serif">Instituto Superior de Arte</h2>
            <p className="split-column-desc">
              El foso de ópera y el escenario son el examen final. La academia de altos estudios de <strong>Ópera Prima</strong> forma a la próxima generación de cantantes, músicos de cámara, bailarines clásicos y artesanos escenográficos bajo la tutela de figuras consagradas de la lírica mundial.
            </p>

            <div className="features-grid">
              <div className="feature-box">
                <h4>Cátedra de Canto Lírico</h4>
                <p>Clases magistrales de técnica vocal, repertorio e interpretación escénica.</p>
              </div>
              <div className="feature-box">
                <h4>Orquesta Escuela</h4>
                <p>Práctica orquestal intensiva en el foso bajo directores de trayectoria internacional.</p>
              </div>
              <div className="feature-box">
                <h4>Conservatorio de Ballet</h4>
                <p>Perfeccionamiento técnico en repertorio clásico y danza contemporánea.</p>
              </div>
              <div className="feature-box">
                <h4>Oficios del Teatro</h4>
                <p>Especialización técnica en escenografía, vestuario, caracterización y luminotecnia.</p>
              </div>
            </div>
          </div>

          <div className="split-column-img-frame">
            <div
              className="split-column-img"
              style={{ backgroundImage: "url('/images/academy_orchestra.png')" }}
            />
          </div>
        </div>
      </section>

      {/* 5. LA COMPAÑÍA / NOSOTROS */}
      <section id="compania" className="section-padding relative">
        {/* Spotlight aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[rgba(115,28,43,0.06)] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="section-subtitle">NUESTRA IDENTIDAD</span>
          <h2 className="section-title font-serif mb-6">La Compañía Ópera Prima</h2>
          <p className="text-base md:text-lg leading-relaxed text-[var(--eggshell)]/80 font-light mb-8 max-w-3xl mx-auto">
            Fundada con la premisa de devolver el misticismo e intimidad dramática a la ópera clásica, <strong>Ópera Prima</strong> reúne a la <em>Orquesta Filarmónica Opera Prima</em>, el <em>Coro Estable</em> y la <em>Compañía de Ballet Lírico</em>. Con producciones que cuidan cada detalle acústico e interpretativo, revivimos la gloria histórica de los grandes compositores en puestas en escena monumentales.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center mt-12 max-w-2xl mx-auto">
            <div className="p-4 border-r border-[rgba(186,154,99,0.15)]">
              <span className="block text-3xl font-serif font-bold text-[var(--camel)]">80+</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)]">Músicos Estables</span>
            </div>
            <div className="p-4 border-r border-[rgba(186,154,99,0.15)]">
              <span className="block text-3xl font-serif font-bold text-[var(--camel)]">12</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)]">Óperas al Año</span>
            </div>
            <div className="p-4">
              <span className="block text-3xl font-serif font-bold text-[var(--camel)]">15k</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)]">Espectadores</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="footer relative z-10">
        <div className="footer-grid">

          {/* Logo & About Column */}
          <div className="footer-col">
            <div className="footer-logo-container">
              <Image
                src="/images/silencio_isotipo.svg"
                alt="Silencio Isotipo"
                width={150}
                height={87}
                className="h-10 w-auto object-contain transparent-logo rounded-sm"
              />
            </div>
            <p className="footer-about">
              Ópera Prima Compañía de Ópera es un espacio consagrado a revivir las grandes joyas líricas y musicales universales con excelencia acústica y escenográfica.
            </p>
          </div>

          {/* Season links */}
          <div className="footer-col">
            <h4>Temporadas</h4>
            <ul className="footer-links">
              <li><a href="#cartelera" onClick={() => openBooking("Carmen")}>Carmen (Bizet)</a></li>
              <li><a href="#cartelera" onClick={() => openBooking("La Traviata")}>La Traviata (Verdi)</a></li>
              <li><a href="#cartelera" onClick={() => openBooking("El Lago de los Cisnes")}>Lago de los Cisnes</a></li>
              <li><a href="#calendario">Gala Lírica Especial</a></li>
            </ul>
          </div>

          {/* Navigation links */}
          <div className="footer-col">
            <h4>Institucional</h4>
            <ul className="footer-links">
              <li><a href="#compania">La Compañía</a></li>
              <li><a href="#academia">El Instituto de Arte</a></li>
              <li><a href="#calendario">Comprar Entradas</a></li>
              <li><a href="#">Contacto y Prensa</a></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="footer-col">
            <h4>Elenco & Noticias</h4>
            <p className="text-xs text-[var(--smoky-rose)]">
              Suscríbete para recibir anuncios de preventa y estrenos exclusivos de la temporada.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="footer-input-group">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="footer-input"
              />
              <button type="submit" className="footer-btn">
                Suscripción
              </button>
            </form>
            {newsletterSuccess && (
              <span className="text-[10px] text-emerald-500 font-semibold animate-fade">
                ¡Gracias! Te has suscrito al círculo lírico oficial.
              </span>
            )}
          </div>
        </div>

        {/* Footer bottom details */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Ópera Prima Compañía de Ópera. Todos los derechos reservados.
          </p>

          {/* Isotype in Center-Bottom of footer */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/images/silencio_isotipo.svg"
              alt="Silencio Isotipo"
              width={32}
              height={22}
              className="h-5 w-auto opacity-40 hover:opacity-100 transition-opacity transparent-logo rounded-sm"
            />
            <span className="text-[9px] uppercase tracking-widest text-[var(--smoky-rose)] font-semibold">
              OPERA PRIMA
            </span>
          </div>

          {/* Social connections */}
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Facebook">
              F
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              I
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              Y
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Audio player for classical streaming */}
      <AudioPlayer />

      {/* Interactive Seating Selections for ticketing */}
      <TicketModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialShow={bookingShow}
      />

      {/* Floating premium Home / Back to Top Button */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="back-to-top-btn"
          aria-label="Volver al inicio"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="18 15 12 9 6 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
