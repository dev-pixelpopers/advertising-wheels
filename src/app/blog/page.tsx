'use client';

/**
 * Blog — insights from the road.
 *
 * Flow: hero → a featured post that clip-reveals with a parallax image →
 * category chips → an article grid with staggered reveals → a newsletter band →
 * footer.
 */

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, Eyebrow, Dot, ArrowIcon, Rings } from '@/components/site/primitives';
import { POSTS } from '@/data/posts';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

/**
 * Posts now come from `src/data/posts.ts` so this index and the `/blog/[slug]`
 * article route can never disagree about what exists. The newest post leads as
 * the feature; the rest fill the grid.
 *
 * Categories are derived from the data rather than hand-listed — a hard-coded
 * chip for a category no one has written yet just filters to an empty grid.
 */
const FEATURED = POSTS[0];
const REST = POSTS.slice(1);
const CATEGORIES = ['All', ...Array.from(new Set(REST.map((p) => p.category)))];

/* ------------------------------------------------------------------ */
/*  Featured                                                           */
/* ------------------------------------------------------------------ */

function Featured() {
    const rootRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from('[data-bf-media]', {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 78%', once: true },
            });
            gsap.from('[data-bf-copy] > *', {
                y: 32,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });
            // Gentle parallax on the image.
            gsap.to(imgRef.current, {
                yPercent: -12,
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
            });
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="w-full bg-[#EEE8D9] py-10 md:py-16 transition-colors duration-300 lg:py-24 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <Link href={`/blog/${FEATURED.slug}`} className="group grid grid-cols-1 items-center gap-4 md:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                    <div data-bf-media className="order-2 overflow-hidden rounded-[24px] border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.14)] lg:order-1 dark:border-white/10">
                        <div className="relative h-[280px] overflow-hidden md:h-[440px]">
                            {/* Oversized + parallaxed, so the drift moves this
                                wrapper — `fill` gives next/image the <img>'s
                                own transform box. */}
                            <div ref={imgRef} className="absolute inset-0 h-[124%] w-full">
                                <Image
                                    src={FEATURED.image}
                                    alt=""
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 700px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                            </div>
                        </div>
                    </div>
                    <div data-bf-copy className="order-1 lg:order-2">
                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#FCD119] px-3.5 py-1.5 font-tommy-medium text-[11px] uppercase tracking-[1.5px] text-black">Featured</span>
                            <span className="font-tommy-regular text-[12px] uppercase tracking-[2px] text-[#8A857C] dark:text-[#9A968E]">{FEATURED.category}</span>
                        </div>
                        <h2 className="mt-3 md:mt-5 lg:mt-6 font-tommy-bold text-[26px] md:text-[clamp(30px,3.6vw,52px)] leading-[1.04] tracking-tight text-[#1A1917] dark:text-white">
                            {FEATURED.title}
                        </h2>
                        <p className="mt-2 md:mt-4 lg:mt-5 lg:max-w-[520px] font-tommy-regular text-[14px] md:text-[16px] leading-[1.75] text-[#5A554C] lg:text-[18px] dark:text-[#A8A399]">
                            {FEATURED.excerpt}
                        </p>
                        <div className="mt-3 md:mt-5 lg:mt-7 flex items-center gap-4 font-tommy-regular text-[11px] md:text-[13px] text-[#6F6A60] dark:text-[#9A968E]">
                            <span>{FEATURED.date}</span>
                            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                            <span>{FEATURED.read}</span>
                        </div>
                        <span className="mt-4 md:mt-6 lg:mt-8 inline-flex items-center gap-2 font-tommy-medium text-[12px] md:text-[14px] uppercase tracking-[2px] text-[#1A1917] transition-colors duration-300 group-hover:text-[#C8992B] dark:text-white dark:group-hover:text-[#FCD119]">
                            Read article <ArrowIcon />
                        </span>
                    </div>
                </Link>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Grid                                                               */
/* ------------------------------------------------------------------ */

function Grid() {
    const [active, setActive] = useState('All');
    const visible = active === 'All' ? REST : REST.filter((p) => p.category === active);

    return (
        <section className="w-full bg-[#EEE8D9] pb-14 md:pb-20 transition-colors duration-300 lg:pb-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1280px] px-3 md:px-6 lg:px-12">
                {/* Category chips */}
                <Reveal className="flex flex-wrap items-center gap-1.5 md:gap-2.5 border-t border-black/10 pt-6 md:pt-10 lg:pt-12 dark:border-white/10" y={20} stagger={0.05}>
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setActive(c)}
                            className={`rounded-full border px-3 md:px-5 py-1.5 md:py-2.5 font-tommy-medium text-[11px] md:text-[13.5px] transition-colors duration-300 ${active === c
                                ? 'border-transparent bg-[#1A1917] text-[#FCD119] dark:bg-[#FCD119] dark:text-black'
                                : 'border-black/12 text-[#5A554C] hover:border-[#C8992B]/40 hover:text-[#1A1917] dark:border-white/12 dark:text-[#A8A399] dark:hover:text-white'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </Reveal>

                {/* Cards — keyed on active so the reveal replays on filter change. */}
                <Reveal key={active} className="mt-5 md:mt-8 lg:mt-10 grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-3" y={44} stagger={0.1}>
                    {visible.map((p) => (
                        <Link
                            key={p.slug}
                            href={`/blog/${p.slug}`}
                            className="group flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/40 transition-colors duration-300 hover:border-[#C8992B]/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#FCD119]/30"
                        >
                            <div className="relative h-[190px] overflow-hidden">
                                <Image
                                    src={p.image}
                                    alt=""
                                    fill
                                    loading="lazy"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-3 md:p-5 lg:p-6">
                                <div className="flex items-center gap-3 font-tommy-regular text-[11.5px] uppercase tracking-[1.5px] text-[#8A857C] dark:text-[#9A968E]">
                                    <span className="text-[#C8992B] dark:text-[#FCD119]">{p.category}</span>
                                    <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                                    <span>{p.read}</span>
                                </div>
                                <h3 className="mt-2 md:mt-3 font-tommy-bold text-[16px] md:text-[21px] leading-[1.15] tracking-tight text-[#1A1917] dark:text-white">
                                    {p.title}
                                </h3>
                                <p className="mt-2 md:mt-3 font-tommy-regular text-[12px] md:text-[14.5px] leading-[1.65] text-[#5A554C] dark:text-[#A8A399]">
                                    {p.excerpt}
                                </p>
                                <div className="mt-4 md:mt-6 flex items-center justify-between md:pt-4">
                                    <span className="font-tommy-regular text-[12.5px] text-[#6F6A60] dark:text-[#9A968E]">{p.date}</span>
                                    <span className="text-[#1A1917] opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:text-white">
                                        <ArrowIcon />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Newsletter                                                         */
/* ------------------------------------------------------------------ */

function Newsletter() {
    return (
        <section className="w-full bg-[#EEE8D9] md:pb-20 transition-colors duration-300 lg:pb-32 dark:bg-[#0A0A0A]">
            <Reveal className="mx-auto max-w-[1280px] px-3 md:px-6 lg:px-12" self y={40}>
                <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-[#E7E0CE] px-5 md:px-8 py-8 md:py-12 transition-colors duration-300 lg:px-16 lg:py-20 dark:border-white/10 dark:bg-[#141414]">
                    <div className="pointer-events-none absolute -right-[10%] -top-[60%] opacity-60" aria-hidden="true">
                        <Rings />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 items-center gap-5 md:gap-8 lg:gap-10 lg:grid-cols-[1fr_1fr]">
                        <div>
                            <Eyebrow>The dispatch</Eyebrow>
                            <h2 className="mt-2 md:mt-4 font-tommy-bold text-[24px] md:text-[clamp(28px,3.4vw,46px)] leading-[1.05] tracking-tight text-[#1A1917] dark:text-white">
                                Route news and results, once a month<Dot />
                            </h2>
                            <p className="mt-2 md:mt-4 max-w-[440px] font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-white/55">
                                Market openings, campaign readouts and the occasional strong opinion about out-of-home.
                                No spam, ever.
                            </p>
                        </div>
                        <form className="flex flex-col gap-2 md:gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="blog-email" className="sr-only">Your email address</label>
                            <input
                                id="blog-email"
                                type="email"
                                required
                                placeholder="you@company.com"
                                className="w-full min-w-0 flex-1 rounded-full border border-black/15 bg-white/70 px-3 md:px-6 py-2 md:py-4 font-tommy-regular text-[12px] md:text-[15px] text-[#1A1917] placeholder:text-black/35 focus:border-[#C8992B] focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#FCD119]"
                            />
                            <button
                                type="submit"
                                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#FCD119] px-5 md:px-8 py-2 md:py-4 font-tommy-medium text-[12px] md:text-[15px] text-black transition-transform duration-300 hover:scale-[1.04]"
                            >
                                Subscribe <ArrowIcon />
                            </button>
                        </form>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Blog"
                title="FROM THE ROAD"
                lead="Strategy, measurement and craft from the team that turned box trucks into the most accountable billboards in the country."
                primary={{ label: 'Read the latest', href: '#latest' }}
                image="/assets/images/process/city.png"
                imageAlt="An Advertising Wheels truck on a city corridor"
            />

            <div id="latest">
                <Featured />
            </div>
            <Grid />
            <Newsletter />
        </main>
    );
}
