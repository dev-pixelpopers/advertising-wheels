'use client';

/**
 * Projects — the work.
 *
 * Flow: hero → a featured case study with counting stats → a pinned horizontal
 * gallery that scrubs sideways through client campaigns (signature) → an
 * industries grid → the shared closer + footer.
 */

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import CtaSection from '@/components/CtaSection';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, CountUp, Eyebrow, Dot, ArrowIcon } from '@/components/site/primitives';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGOS = '/assets/images/review/logo';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Project {
    brand: string;
    industry: string;
    result: string;
    metric: string;
    metricLabel: string;
    logo: string;
    /**
     * Slug of the full write-up in `src/data/caseStudies.ts`, when one exists.
     * Cards without a slug stay as plain articles rather than linking nowhere —
     * a dead "Read the story" affordance is worse than none at all.
     */
    slug?: string;
}

const PROJECTS: Project[] = [
    { brand: 'Hertz', industry: 'Travel & Mobility', result: 'Truck advertising ran as the primary top-of-funnel tactic and reversed a five-year decline in eCommerce revenue.', metric: '5yr', metricLabel: 'Decline reversed', logo: `${LOGOS}/partner-hertz.png`, slug: 'hertz' },
    { brand: 'Nationwide', industry: 'Insurance', result: 'Mobile billboards became the highlight of Nationwide’s market presence — and are still talked about today.', metric: 'City', metricLabel: 'Wide recall', logo: `${LOGOS}/partner-nationwide.png`, slug: 'nationwide' },
    { brand: 'Wendy’s', industry: 'Quick-Service Food', result: 'High-impact visual messaging, quick to implement, unusually cost-effective and highly measurable.', metric: 'Days', metricLabel: 'To launch', logo: `${LOGOS}/partner-wendys.png` },
    { brand: 'Saks Fifth Avenue', industry: 'Luxury Retail', result: 'The team executed outstanding results — recognition was city-wide, and memorable.', metric: '#1', metricLabel: 'In-market buzz', logo: `${LOGOS}/partner-saks-white.png` },
    { brand: 'Volkswagen', industry: 'Automotive', result: 'Synchronized routes blanketed launch corridors, turning highway miles into launch-week presence.', metric: '50', metricLabel: 'Markets ready', logo: `${LOGOS}/partner-vw.png` },
    { brand: 'Cuyahoga CC', industry: 'Education', result: 'Campaign earned a regional gold medal for outdoor advertising from the NCMPR — and a national nomination.', metric: 'Gold', metricLabel: 'NCMPR award', logo: `${LOGOS}/partner-cuyahoga.png`, slug: 'cuyahoga-community-college' },
    { brand: 'FanDuel', industry: 'Sports & Gaming', result: 'Game-day fleets surged around venues and sports districts, hitting crowds exactly when intent peaked.', metric: 'Peak', metricLabel: 'Daypart reach', logo: `${LOGOS}/partner-fanduel.png` },
    { brand: 'Xfinity', industry: 'Telecom', result: 'Neighbourhood-level routing carried the offer straight into target ZIPs across multiple metros.', metric: 'ZIP', metricLabel: 'Level targeting', logo: `${LOGOS}/partner-xfinity.png` },
    { brand: 'Dollar', industry: 'Car Rental', result: 'An OOH-vs-control study lifted Dollar.com peak-week visits +32% YoY in target markets, outperforming control in every flight.', metric: '+32%', metricLabel: 'YoY site visits', logo: `${LOGOS}/dollar-car-rental-logo.png`, slug: 'dollar' },
    { brand: 'AAA', industry: 'Travel & Mobility', result: 'A membership and roadside-assistance awareness plan built for commuter routes and travel hubs.', metric: 'Routes', metricLabel: 'Commuter reach', logo: `${LOGOS}/aaa-vector-logo.png`, slug: 'aaa' },
    { brand: 'Burger King', industry: 'Quick-Service Food', result: 'A foot-traffic and limited-time-offer push near restaurant clusters, timed to peak meal times.', metric: 'Peak', metricLabel: 'Meal-time reach', logo: `${LOGOS}/burger-king-logo.png`, slug: 'burger-king' },
];

const FEATURED_STATS = [
    { el: <CountUp value={96} prefix="+" suffix="%" />, label: 'Branded checking search clicks' },
    { el: <CountUp value={8} suffix="%" />, label: 'Lift in household production' },
    { el: <CountUp value={6802} comma />, label: 'Incremental checking households' },
    { el: <><span className="align-top text-[0.5em]">&lt;</span><CountUp value={12} /></>, label: 'Month better-than-break-even ROMI' },
];

const INDUSTRIES = [
    'Financial Services', 'Automotive', 'Quick-Service Food', 'Luxury Retail',
    'Insurance', 'Sports & Gaming', 'Telecom', 'Education', 'Healthcare', 'Travel & Mobility', 'Entertainment', 'Public Sector',
];

/* ------------------------------------------------------------------ */
/*  Featured                                                           */
/* ------------------------------------------------------------------ */

function Featured() {
    const rootRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from('[data-feat-media]', {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });
            gsap.from('[data-feat-copy] > *', {
                y: 34,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 68%', once: true },
            });
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="w-full bg-[#EEE8D9] py-20 transition-colors duration-300 md:py-28 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-16">
                {/* Media */}
                <div data-feat-media className="overflow-hidden rounded-[24px] border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.14)] dark:border-white/10">
                    <img src="/assets/images/case-study-img.jpg" alt="Fifth Third Bank truckside campaign" className="h-[300px] w-full object-cover md:h-[460px]" />
                </div>

                {/* Copy */}
                <div data-feat-copy>
                    <Eyebrow>Featured case study</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(30px,3.6vw,52px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                        Fifth Third Bank<Dot />
                    </h2>
                    <p className="mt-5 max-w-[520px] font-tommy-regular text-[16px] leading-[1.75] text-[#5A554C] md:text-[18px] dark:text-[#A8A399]">
                        Truck advertising grew into a key portion of the brand marketing budget, yielding record
                        brand awareness and household-production growth — all independently measured.
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8">
                        {FEATURED_STATS.map((s, i) => (
                            <div key={i} className="border-l border-black/10 pl-5 dark:border-white/10">
                                <p className="font-tommy-bold text-[clamp(30px,3.4vw,44px)] leading-none text-[#1A1917] dark:text-white">
                                    {s.el}
                                </p>
                                <p className="mt-2.5 font-tommy-regular text-[12.5px] leading-[1.4] text-[#6F6A60] dark:text-[#9A968E]">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/projects/fifth-third-bank"
                        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#1A1917] px-8 py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04] dark:bg-[#FCD119] dark:text-black"
                    >
                        Read the full case study <ArrowIcon />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Pinned horizontal gallery                                          */
/* ------------------------------------------------------------------ */

function Gallery() {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const track = trackRef.current;
            if (!track) return;
            const mm = gsap.matchMedia();

            mm.add('(min-width: 1024px)', () => {
                const amount = () => Math.max(0, track.scrollWidth - window.innerWidth);
                gsap.to(track, {
                    x: () => -amount(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: 'top top',
                        end: () => '+=' + amount(),
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    },
                });
                return () => gsap.set(track, { clearProps: 'x' });
            });

            mm.add('(max-width: 1023px)', () => {
                gsap.from('.pj-card', {
                    y: 40,
                    autoAlpha: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: track, start: 'top 82%', once: true },
                });
            });

            return () => mm.revert();
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden border-y border-black/10 bg-[#E7E0CE] text-[#1A1917] transition-colors duration-300 lg:h-screen dark:border-white/10 dark:bg-[#141414] dark:text-white">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-end justify-between px-6 pt-[92px] md:px-12 lg:pt-[13vh]">
                <div>
                    <Eyebrow>Selected work</Eyebrow>
                    <h2 className="mt-3 font-tommy-bold text-[34px] uppercase leading-none tracking-tight md:text-[54px]">
                        Brands that own the street<Dot />
                    </h2>
                </div>
                <p className="hidden font-tommy-regular text-[11px] uppercase tracking-[3px] text-black/35 lg:block dark:text-white/35">
                    Scroll →
                </p>
            </div>

            <div
                ref={trackRef}
                className="flex flex-col gap-6 px-6 pb-16 pt-[210px] md:px-12 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:px-[6vw] lg:pb-0 lg:pt-[24vh]"
            >
                {PROJECTS.map((p) => {
                    // `.pj-card` is the horizontal track's animation hook, so it has to
                    // land on the outermost node either way — hence the shared class
                    // string and the two explicit branches below (a polymorphic
                    // `Link | 'article'` component can't be typed cleanly against
                    // Link's required `href`).
                    const cardClass =
                        'pj-card group flex shrink-0 flex-col rounded-[22px] border border-black/10 bg-white/60 p-8 transition-colors duration-300 hover:border-[#C8992B]/40 md:p-9 lg:w-[clamp(340px,30vw,420px)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#FCD119]/40';

                    const inner = (
                        <>
                            <div className="flex items-start justify-between">
                                <span className="inline-flex h-[64px] w-[132px] items-center justify-start">
                                    <img src={p.logo} alt={p.brand} className="max-h-[46px] max-w-[120px] object-contain" loading="lazy" />
                                </span>
                                <span className="rounded-full border border-black/15 px-3 py-1 font-tommy-regular text-[10.5px] uppercase tracking-[1.5px] text-[#6F6A60] dark:border-white/15 dark:text-white/50">
                                    {p.industry}
                                </span>
                            </div>

                            <div className="mt-8 flex items-end gap-3">
                                <span className="font-tommy-bold text-[56px] leading-[0.9] text-[#C8992B] md:text-[68px] dark:text-[#FCD119]">{p.metric}</span>
                                <span className="mb-2 font-tommy-regular text-[13px] uppercase leading-[1.3] tracking-[1.5px] text-[#6F6A60] dark:text-white/45">{p.metricLabel}</span>
                            </div>

                            <h3 className="mt-6 font-tommy-bold text-[26px] tracking-tight">{p.brand}</h3>
                            <p className="mt-3 font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-white/60">{p.result}</p>

                            {p.slug && (
                                <span className="mt-8 inline-flex items-center gap-2 font-tommy-medium text-[13px] uppercase tracking-[2px] text-[#6F6A60] transition-colors duration-300 group-hover:text-[#C8992B] dark:text-white/50 dark:group-hover:text-[#FCD119]">
                                    Read the story <ArrowIcon />
                                </span>
                            )}
                        </>
                    );

                    // Cards without a written study stay as plain articles rather than
                    // linking nowhere.
                    return p.slug ? (
                        <Link key={p.brand} href={`/projects/${p.slug}`} className={cardClass}>
                            {inner}
                        </Link>
                    ) : (
                        <article key={p.brand} className={cardClass}>
                            {inner}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Industries                                                         */
/* ------------------------------------------------------------------ */

function Industries() {
    return (
        <section className="w-full bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1200px] px-6 md:px-12">
                <Reveal className="max-w-[720px]" y={30}>
                    <Eyebrow>Who we roll for</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                        Trusted across every category<Dot />
                    </h2>
                </Reveal>
                <Reveal className="mt-12 flex flex-wrap gap-3" y={24} stagger={0.05}>
                    {INDUSTRIES.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-black/12 bg-white/40 px-6 py-3 font-tommy-medium text-[15px] text-[#3A3730] transition-colors duration-300 hover:border-[#C8992B]/40 hover:text-[#1A1917] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#CFCABF] dark:hover:text-white"
                        >
                            {tag}
                        </span>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProjectsPage() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Work"
                title="THE RESULTS"
                lead="National and local brands put their name on our fleet — then watched the search clicks, household growth and city-wide recall follow. Every campaign measured the same way."
                primary={{ label: 'Start your campaign', href: '/contact' }}
                secondary={{ label: 'How we do it', href: '/services' }}
                image="/assets/images/case-study-img.jpg"
                imageAlt="A wrapped Advertising Wheels truck on a city street"
            />

            <Featured />
            <Gallery />
            <Industries />

            <CtaSection />
        </main>
    );
}
