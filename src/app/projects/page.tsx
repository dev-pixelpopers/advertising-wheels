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
import CtaSection from '@/components/CtaSection';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, CountUp, Eyebrow, Dot, ArrowIcon } from '@/components/site/primitives';
import { useScrollTriggerRefresh } from '@/components/site/detail';
import { HOUSE_SHOTS } from '@/data/clientShots';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGOS = '/assets/images/clients-logo';

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
    /** Optional dark-theme variant of the mark. When set, `logo` shows on the
     *  light theme and this swaps in on the dark theme. */
    logoDark?: string;
    /**
     * Slug of the full write-up in `src/data/caseStudies.ts`, when one exists.
     * Cards without a slug stay as plain articles rather than linking nowhere —
     * a dead "Read the story" affordance is worse than none at all.
     */
    slug?: string;
    url: string;
}

const PROJECTS: Project[] = [
    { brand: 'Hertz', industry: 'Travel & Mobility', result: 'Truck advertising ran as the primary top-of-funnel tactic and reversed a five-year decline in eCommerce revenue.', metric: '5yr', metricLabel: 'Decline reversed', logo: `${LOGOS}/hertz-logo.png`, slug: 'hertz', url: 'https://www.hertz.com' },
    { brand: 'Fifth Third Bank', industry: 'Financial Services', result: 'Synchronized routes blanketed launch corridors, turning highway miles into launch-week presence.', metric: '50', metricLabel: 'Markets ready', logo: `${LOGOS}/5th_3rd.png`, url: 'https://www.53.com' },
    { brand: 'AB InBev', industry: 'Beverage', result: 'Fleets covering stadium districts and sports-bar corridors carried the brand through game-day crowds, right where intent peaks.', metric: 'Peak', metricLabel: 'Daypart reach', logo: `${LOGOS}/ab-inbev.png`, url: 'https://www.ab-inbev.com' },
    { brand: 'Xfinity', industry: 'Telecom', result: 'ZIP-targeted fleet coverage carried the offer into target neighborhoods across multiple metros.', metric: 'ZIP', metricLabel: 'Level targeting', logo: `${LOGOS}/partner-xfinity.png`, slug: 'xfinity', url: 'https://www.xfinity.com' },
    { brand: 'Wendy’s', industry: 'Quick-Service Food', result: 'High-impact visual messaging, quick to implement, unusually cost-effective and highly measurable.', metric: 'Days', metricLabel: 'To launch', logo: `${LOGOS}/partner-wendys.png`, slug: 'wendys', url: 'https://www.wendys.com' },
    { brand: 'Nationwide', industry: 'Insurance', result: 'Mobile billboards became the highlight of Nationwide’s market presence — and are still talked about today.', metric: 'City', metricLabel: 'Wide recall', logo: `${LOGOS}/partner-nationwide.png`, slug: 'nationwide', url: 'https://www.nationwide.com' },
    { brand: 'Raising Cane’s', industry: 'Quick-Service Food', result: 'Pre-opening trade-area flights introduced the brand weeks before each new restaurant opened its lane.', metric: '3wk', metricLabel: 'Pre-opening presence', logo: `${LOGOS}/canes.png`, slug: 'raising-canes', url: 'https://www.raisingcanes.com' },
    { brand: 'Dollar', industry: 'Car Rental', result: 'An OOH-vs-control study lifted Dollar.com peak-week visits +32% YoY in target markets, outperforming control in every flight.', metric: '+32%', metricLabel: 'YoY site visits', logo: `${LOGOS}/dollar-car-rental-logo.png`, slug: 'dollar', url: 'https://www.dollar.com' },
    { brand: 'Floor & Decor', industry: 'Specialty Retail', result: `A six-truck Boston fleet carried two simultaneous store openings through the metro's homeowner neighborhoods and retail corridors.`, metric: '2', metricLabel: 'Stores launched', logo: `${LOGOS}/partner-floor-decor.png`, slug: 'floor-and-decor', url: 'https://www.flooranddecor.com' },
    { brand: 'Outer', industry: 'DTC Home & Outdoor', result: 'A digitally-native furniture brand gained a seven-day physical presence on LA’s Westside design streets.', metric: '7d', metricLabel: 'Weekly presence', logo: `${LOGOS}/outer.png`, slug: 'outer', url: 'https://liveouter.com' },
    { brand: 'Reliable Heating & Air', industry: 'Home Services', result: 'Offer-led wraps kept a hard system price on residential streets across the Atlanta service area, season after season.', metric: '100%', metricLabel: 'In-footprint miles', logo: `${LOGOS}/partner-reliable.png`, slug: 'reliable-heating-cooling', url: 'https://reliable.com' },
    { brand: 'Burger King', industry: 'Quick-Service Food', result: 'A foot-traffic and limited-time-offer push carried through restaurant trade areas all day — including every breakfast, lunch, and dinner rush.', metric: 'Peak', metricLabel: 'Meal-time reach', logo: `${LOGOS}/burger-king-logo.png`, slug: 'burger-king', url: 'https://www.bk.com' },
    { brand: 'AAA', industry: 'Travel & Mobility', result: 'A membership and roadside-assistance awareness plan carried through commuter corridors and travel hubs.', metric: 'Routes', metricLabel: 'Commuter reach', logo: `${LOGOS}/aaa-vector-logo.png`, slug: 'aaa', url: 'https://www.aaa.com' },
    { brand: 'Saks Fifth Avenue', industry: 'Luxury Retail', result: 'The team executed outstanding results — recognition was city-wide, and memorable.', metric: '#1', metricLabel: 'In-market buzz', logo: `${LOGOS}/partner-saks-white.png`, url: 'https://www.saksfifthavenue.com' },
    { brand: 'Cuyahoga CC', industry: 'Education', result: 'Campaign earned a regional gold medal for outdoor advertising from the NCMPR — and a national nomination.', metric: 'Gold', metricLabel: 'NCMPR award', logo: `${LOGOS}/partner-cuyahoga.png`, slug: 'cuyahoga-community-college', url: 'https://www.tri-c.edu' },
];

const FEATURED_STATS = [
    { el: <CountUp value={96} prefix="+" suffix="%" />, label: 'Branded checking search clicks' },
    { el: <CountUp value={8} suffix="%" />, label: 'Lift in household production' },
    { el: <CountUp value={6802} comma />, label: 'Incremental checking households' },
    { el: <CountUp prefix="<" suffix=" months" value={12} />, label: 'Broke even in under 12 months' },
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
        <section ref={rootRef} className="w-full bg-[#EEE8D9] py-14 md:py-20 transition-colors duration-300 lg:py-28 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-3 md:px-8 lg:px-12 lg:grid-cols-2 lg:gap-16">
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

                    <div className="mt-6 md:mt-8 lg:mt-10 grid md:grid-cols-2 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-4 md:gap-y-6 lg:gap-y-8">
                        {FEATURED_STATS.map((s, i) => (
                            <div key={i} className={`border-b md:border-l border-black/10 pb-3 md:pb-0 md:pl-4 lg:pl-5 dark:border-white/10 text-center md:text-left`}>
                                <p className="font-tommy-bold text-[25px] md:text-[clamp(30px,3.4vw,44px)] leading-none text-[#1A1917] dark:text-white">
                                    {s.el}
                                </p>
                                <p className="mt-2.5 font-tommy-regular text-[12.5px] leading-[1.4] text-[#6F6A60] dark:text-[#9A968E]">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/contact#form"
                        className="group md:mt-8 lg:mt-10 inline-flex items-center gap-3 rounded-full bg-[#1A1917] px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 font-tommy-medium text-[12px] md:text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04] dark:bg-[#FCD119] dark:text-black mx-auto lg:mx-0 flex w-max"
                    >
                        Start your Campaign <ArrowIcon />
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

            // mm.add('(min-width: 1024px)', () => {
            // Measured against the section's own inner width, not
            // `window.innerWidth` — the latter includes the vertical
            // scrollbar, which would leave the final card short of the
            // right edge by the scrollbar's width on every desktop that
            // renders one.
            const amount = () =>
                Math.max(0, track.scrollWidth - (rootRef.current?.clientWidth ?? 0));

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

            // The travel distance and the pin's end are both derived from
            // the track's width, but they are only evaluated at refresh.
            // If the track resizes afterwards — a card added, a font
            // swapping in, the window resizing — the two can disagree and
            // the run stops before the last cards while the pin keeps
            // holding. Re-measure whenever the track's width actually
            // changes so they stay in step.
            let last = track.scrollWidth;
            const ro = new ResizeObserver(() => {
                if (track.scrollWidth === last) return;
                last = track.scrollWidth;
                ScrollTrigger.refresh();
            });
            ro.observe(track);

            // return () => {
            //     ro.disconnect();
            //     gsap.set(track, { clearProps: 'x' });
            // };
            // });

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
            <div className="pointer-events-none relative inset-x-0 top-0 z-20 flex items-end justify-between px-6 pt-[92px] md:px-12 lg:pt-[13vh]">
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
                className="flex gap-4 md:gap-6 px-3 pb-10 md:pb-16 md:px-6 lg:h-full lg:w-max items-start lg:gap-8 lg:px-[6vw] lg:pb-0 pt-[20px] md:pt-[70px] lg:pt-[150px]"
            >
                {PROJECTS.map((p) => {
                    // `.pj-card` is the horizontal track's animation hook, so it has to
                    // land on the outermost node either way — hence the shared class
                    // string and the two explicit branches below (a polymorphic
                    // `Link | 'article'` component can't be typed cleanly against
                    // Link's required `href`).
                    const cardClass =
                        'pj-card group flex shrink-0 flex-col justify-between h-full lg:h-[500px] rounded-[16px] md:rounded-[20px] lg:rounded-[22px] border border-black/10 bg-white/60 p-5 md:p-7 transition-colors duration-300 hover:border-[#C8992B]/40 lg:p-9 w-[clamp(340px,30vw,420px)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#FCD119]/40';

                    const inner = (
                        <>
                            <div className="flex flex-col-reverse md:flex-row gap-y-2 items-start justify-between">
                                <span
                                    className="mb-2 lg:mb-3 2xl:mb-4 3xl:mb-5 inline-flex w-[180px] h-[80px] bg-white/0 sm:mb-7 md:mb-8 dark:ring-white/10 "
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(p.url, '_blank');
                                    }}
                                >
                                    <img src={p.logo} alt={p.brand} className="h-full object-contain" loading="lazy" />

                                </span>
                                <span className="rounded-full border border-black/15 px-3 py-1 font-tommy-regular text-[10.5px] uppercase tracking-[1.5px] text-[#6F6A60] dark:border-white/15 dark:text-white/50">
                                    {p.industry}
                                </span>
                            </div>

                            <div className="mt-4 md:mt-6 lg:mt-8 flex items-end gap-2 md:gap-3">
                                <span className="font-tommy-bold text-[35px] leading-[0.9] text-[#C8992B] md:text-[clamp(2.5rem,4.7vw,4.25rem)] dark:text-[#FCD119]">{p.metric}</span>
                                <span className="mb-2 font-tommy-regular text-[10px] md:text-[13px] uppercase leading-[1.3] tracking-[1.5px] text-[#6F6A60] dark:text-white/45">{p.metricLabel}</span>
                            </div>

                            <h3 className="mt-3 md:mt-5 lg:mt-6 font-tommy-bold text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] tracking-tight">{p.brand}</h3>
                            <p className="mt-3 font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-white/60">{p.result}</p>


                            <span className="mt-4 md:mt-6 lg:mt-8 inline-flex items-center gap-2 font-tommy-medium text-[13px] uppercase tracking-[2px] text-[#6F6A60] transition-colors duration-300 group-hover:text-[#C8992B] dark:text-white/50 dark:group-hover:text-[#FCD119]">
                                Read the story <ArrowIcon />
                            </span>

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
        <section className="w-full bg-[#EEE8D9] py-14 md:py-24 transition-colors duration-300 lg:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto lg:max-w-[1200px] px-3 md:px-6 lg:px-12">
                <Reveal className="max-w-[720px]" y={30}>
                    <Eyebrow>Who we roll for</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                        Trusted across every category<Dot />
                    </h2>
                </Reveal>
                <Reveal className="mt-6 md:mt-10 lg:mt-12 flex flex-wrap gap-2 md:gap-3" y={24} stagger={0.05}>
                    {INDUSTRIES.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-black/12 bg-white/40 px-4 md:px-6 py-2 md:py-3 font-tommy-medium text-[12px] md:text-[15px] text-[#3A3730] transition-colors duration-300 hover:border-[#C8992B]/40 hover:text-[#1A1917] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#CFCABF] dark:hover:text-white"
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
    // The hero and featured plates decode after the triggers measure, so the
    // pinned gallery's start/end are set against a document that is still
    // growing — leaving the pin misaligned and the track short of the last
    // cards. Refresh once the page has settled.
    useScrollTriggerRefresh();

    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Work"
                title="THE RESULTS"
                lead="National and local brands put their name on our fleet — then watched the search clicks, household growth and city-wide recall follow. Every campaign measured the same way."
                primary={{ label: 'Start a Campaign', href: '/contact#form' }}
                secondary={{ label: 'How we do it', href: '/services' }}
                image={HOUSE_SHOTS.projectsHero}
                imageAlt="A wrapped Advertising Wheels truck for Nationwide on the road"
            />

            <Featured />
            <Gallery />
            <Industries />

            <CtaSection />
        </main>
    );
}
