"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuiltLogo } from "./BuiltLogo";

const SLIDES = [
  {
    title: "Valley homes",
    subtitle: "Premium valley living",
    gradient: "linear-gradient(135deg, #0d2136 0%, #153350 45%, #1f4a6e 100%)",
    emoji: "🏔️",
  },
  {
    title: "Modern flats",
    subtitle: "Premium city living",
    gradient: "linear-gradient(135deg, #1c2530 0%, #153350 55%, #a9793f 100%)",
    emoji: "🏢",
  },
  {
    title: "Family rentals",
    subtitle: "Space, comfort & location",
    gradient: "linear-gradient(135deg, #5c4a2e 0%, #153350 40%, #f0e2cd 120%)",
    emoji: "🏡",
  },
  {
    title: "Your next home",
    subtitle: "Across Kathmandu Valley",
    gradient: "linear-gradient(135deg, #0d2136 0%, #153350 50%, #1c2530 100%)",
    emoji: "🏠",
  },
];

const MARQUEE_ITEMS = [
  "Premium Rentals",
  "Verified Listings",
  "Valley Living",
  "Find Your Home",
];

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="home-page mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 lg:max-w-2xl">
      <section className="hero-shell relative overflow-hidden rounded-3xl shadow-xl">
        <div className="hero-slider" aria-hidden>
          {SLIDES.map((slide, index) => (
            <div
              key={slide.title}
              className={`hero-slide ${index === activeSlide ? "is-active" : ""}`}
              style={{ background: slide.gradient }}
            >
              <div className="hero-slide-glow" />
              <span className="hero-slide-emoji">{slide.emoji}</span>
              <div className="hero-house-svg">
                <svg viewBox="0 0 120 100" fill="none" aria-hidden>
                  <path
                    d="M60 12 L108 52 V88 H12 V52 Z"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="3"
                    fill="rgba(255,255,255,0.08)"
                  />
                  <rect
                    x="48"
                    y="58"
                    width="24"
                    height="30"
                    rx="2"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <path
                    d="M30 88 H90"
                    stroke="rgba(176,141,87,0.6)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-float-icons" aria-hidden>
          <span className="hero-float-icon hero-float-1">🏠</span>
          <span className="hero-float-icon hero-float-2">🏡</span>
          <span className="hero-float-icon hero-float-3">🏢</span>
        </div>

        <div className="relative z-10 px-6 pb-6 pt-8 text-[var(--bg)]">
          <div
            className={`hero-fade-in flex justify-center ${mounted ? "is-visible" : ""}`}
            style={{ transitionDelay: "100ms" }}
          >
            <BuiltLogo size="lg" />
          </div>

          <h1
            className={`hero-fade-in mt-6 text-center text-2xl font-semibold leading-tight sm:text-3xl ${mounted ? "is-visible" : ""}`}
            style={{ transitionDelay: "250ms" }}
          >
            Find or list premium rental homes
          </h1>
          <p
            className={`hero-fade-in mt-3 text-center text-sm text-[var(--support)] sm:text-base ${mounted ? "is-visible" : ""}`}
            style={{ transitionDelay: "400ms" }}
          >
            Across Kathmandu Valley
          </p>

          <div
            className={`hero-fade-in mt-5 flex justify-center gap-2 ${mounted ? "is-visible" : ""}`}
            style={{ transitionDelay: "500ms" }}
          >
            {SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`hero-dot ${index === activeSlide ? "is-active" : ""}`}
                aria-label={`Show ${slide.title}`}
              />
            ))}
          </div>

          <p
            className={`hero-fade-in mt-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent-light)] ${mounted ? "is-visible" : ""}`}
            style={{ transitionDelay: "550ms" }}
          >
            {SLIDES[activeSlide].title} · {SLIDES[activeSlide].subtitle}
          </p>
        </div>

        <div className="hero-marquee border-t border-white/10 bg-black/20 py-2.5">
          <div className="hero-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={`${item}-${i}`} className="hero-marquee-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`hero-fade-in mt-8 flex w-full flex-col items-center gap-4 ${mounted ? "is-visible" : ""}`}
        style={{ transitionDelay: "650ms" }}
      >
        <Link href="/browse" className="home-btn home-btn-shine">
          I want rent
        </Link>
        <Link href="/list" className="home-btn home-btn-secondary">
          I want to list rent
        </Link>
      </section>
    </main>
  );
}
