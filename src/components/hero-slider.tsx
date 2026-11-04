"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";

const AUTOPLAY_DELAY = 7000;

type Slide = {
  eyebrow: string;
  title: [string, string, string];
  description: string;
  note: string;
  quote: string;
  image: string;
  imageAlt: string;
  accent: string;
  glow: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Your neighborhood library",
    title: ["Discover", "The Best Books", "Of All Day"],
    description:
      "BookNook gathers the books your community loves in one cozy place. Browse handpicked titles, borrow with a tap, and keep every story you discover close at hand.",
    note: "Free to browse — no account needed",
    quote: "“Some books leave us free and some books make us free.”",
    image: "/images/Book1-Cover-Mockup-.png",
    imageAlt: "A stack of design, money and colour books",
    accent: "from-[#8a6ee8] via-[#9d8cf2] to-[#6f8ff0]",
    glow: "rgba(138, 110, 232, 0.16)",
  },
  {
    eyebrow: "Borrow, read, return",
    title: ["Borrow", "Stories Worth", "Passing On"],
    description:
      "Find a book on a neighbor’s shelf, borrow it for as long as you need, and return it when you are done. No fees, no fuss — just stories finding their next reader.",
    note: "Keep track of every due date in My Borrows",
    quote: "“A room without books is like a body without a soul.”",
    image: "/images/Book2-Cover-Mockup-.png",
    imageAlt: "A stack of ecological economics and design books",
    accent: "from-[#5f9e87] via-[#7cab9d] to-[#8a6ee8]",
    glow: "rgba(95, 158, 135, 0.16)",
  },
  {
    eyebrow: "Share your shelf",
    title: ["Share", "The Books", "You Love Most"],
    description:
      "Turn the books you have already read into someone else’s next favorite. Add them to your shelf, lend them out, and build a little library together with the people around you.",
    note: "List a book in under a minute",
    quote: "“There is no friend as loyal as a book.”",
    image: "/images/Book3-Cover-Mockup-.png",
    imageAlt: "A stack of natural philosophy and astrophysics books",
    accent: "from-[#b08a5e] via-[#c49e72] to-[#8a6ee8]",
    glow: "rgba(176, 138, 94, 0.16)",
  },
];

export function HeroSlider() {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Swiper's own Autoplay module reads the clock while initializing, which
  // Next 16 flags during prerender. Driving it here also lets us pause on
  // hover/focus and respect reduced-motion preferences.
  useEffect(() => {
    if (!swiper || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      swiper.slideNext();
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [swiper, paused, active]);

  return (
    <section
      aria-label="Featured books"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden bg-[#f5f4f1]"
    >
      <p className="sr-only" aria-live="polite">
        Slide {active + 1} of {SLIDES.length}: {SLIDES[active].title.join(" ")}
      </p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,#ffffff_0%,rgba(255,255,255,0.55)_34%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 size-[26rem] rounded-full bg-brand/10 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(125deg,rgba(255,255,255,0.55)_0%,transparent_38%,rgba(47,44,61,0.025)_100%)]"
      />

      <Swiper
        modules={[Keyboard]}
        slidesPerView={1}
        loop
        speed={850}
        keyboard={{ enabled: true }}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActive(instance.realIndex)}
        className="relative z-10"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.image}>
            <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pt-12 pb-28 sm:px-8 lg:min-h-[620px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-4 lg:px-10 lg:pt-16 lg:pb-24">
              <div className="relative z-10 max-w-[540px]">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-ink-muted uppercase backdrop-blur">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                  {slide.eyebrow}
                </p>

                <h1 className="text-[40px] leading-[1.14] font-semibold tracking-[-0.045em] text-ink sm:text-[52px] lg:text-[62px] xl:text-[68px]">
                  <span className="block">{slide.title[0]}</span>
                  <span
                    className={`block bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}
                  >
                    {slide.title[1]}
                  </span>
                  <span className="block">{slide.title[2]}</span>
                </h1>

                <p className="mt-6 max-w-[440px] text-[15px] leading-7 text-ink-muted lg:text-base lg:leading-8">
                  {slide.description}
                </p>

                <Link
                  href="/books"
                  className="group mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-ink pr-5 pl-7 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(47,44,61,0.7)] transition-colors hover:bg-brand focus-visible:ring-4 focus-visible:ring-brand/25 focus-visible:outline-none"
                >
                  Browse Books
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </Link>

                <p className="mt-4 flex items-center gap-2 text-[13px] font-medium text-ink-muted">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-brand/70" />
                  {slide.note}
                </p>
              </div>

              <div className="relative flex items-center justify-center lg:justify-end">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-1/2 aspect-square -translate-y-1/2 rounded-full blur-3xl lg:inset-x-0"
                  style={{ background: slide.glow }}
                />

                <div className="relative w-full max-w-[560px] lg:max-w-[620px]">
                  <p className="mx-auto mb-7 max-w-[330px] text-center text-[17px] leading-8 font-medium text-ink-muted italic lg:mb-4">
                    {slide.quote}
                  </p>

                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    width={1297}
                    height={816}
                    priority={index === 0}
                    sizes="(min-width: 1024px) 46vw, 90vw"
                    className="h-auto w-full drop-shadow-[0_35px_45px_rgba(47,44,61,0.12)]"
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 lg:bottom-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="pointer-events-auto flex items-center gap-4">
            <div className="flex items-center gap-2" role="group" aria-label="Slide pagination">
              {SLIDES.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                  onClick={() => swiper?.slideToLoop(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus-visible:ring-4 focus-visible:ring-brand/25 focus-visible:outline-none ${
                    active === index
                      ? "w-8 bg-brand"
                      : "w-2.5 bg-ink/20 hover:bg-ink/40"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold tracking-[0.12em] text-ink-muted tabular-nums">
              {String(active + 1).padStart(2, "0")}
              <span className="text-ink/30"> / {String(SLIDES.length).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => swiper?.slidePrev()}
              className="flex size-11 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink shadow-sm backdrop-blur transition hover:border-brand/30 hover:text-brand focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => swiper?.slideNext()}
              className="flex size-11 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink shadow-sm backdrop-blur transition hover:border-brand/30 hover:text-brand focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
