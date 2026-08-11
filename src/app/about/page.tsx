'use client';

/**
 * About — the company story (content from the customer brief).
 *
 * Portal banner hero → story (split copy + parallax image + floating badge) →
 * stat band → pinned horizontal timeline (theme-aware) → leadership (flip-in
 * cards) → pull quote (scroll-scrubbed word illumination) → shared CTA + Footer.
 *
 * The portal + timeline are theme-aware so neither goes dark on the light theme.
 * All scroll work is GSAP ScrollTrigger; reveals fire once and are gated on
 * prefers-reduced-motion so the reduced-motion / no-JS render is the finished
 * page.
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import CtaSection from '@/components/CtaSection';
import PortalHero from '@/components/site/PortalHero';
import OrbitDiagram from '@/components/site/OrbitDiagram';
import { useTheme } from '@/context/ThemeContext';
import { Reveal, CountUp, Eyebrow, Dot } from '@/components/site/primitives';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const STORY_IMG = '/assets/images/clients/hertz/hero-04.webp';

/* ------------------------------------------------------------------ */
/*  Data — from the customer's about.html                              */
/* ------------------------------------------------------------------ */

const MILESTONES = [
    { year: '2001', title: 'Founded', body: `Our founders saw what the industry hadn't: thousands of trucks already crisscrossing America's busiest streets every day — unused ad space in motion. Advertising Wheels became an early pioneer of truckside advertising to turn truckside into a true advertising medium, giving brands street-level visibility static OOH couldn't deliver.` },
    { year: '2008', title: 'National operational footprint', body: 'Expanded from regional to 50-DMA national coverage — building the fleet-sourcing, production, and management process that lets one accountable team run campaigns in every major metro.' },
    { year: '2014', title: 'GPS-verified delivery', body: 'Every truck in the network upgraded to continuous GPS reporting. Verified-mile reporting becomes the default, not the upgrade.' },
    { year: '2019', title: 'WRMSDC-certified MBE', body: 'Certified as a Minority Business Enterprise by the Western Regional Minority Supplier Development Council (Certificate WR05284) — opening supplier-diversity partnerships with enterprise and public-sector advertisers.' },
    { year: '2020', title: 'Inc. 5000 debut', body: 'Named to the Inc. 5000 list of America\'s fastest-growing private companies — the first of five consecutive appearances (2020–2024), marking truckside\'s arrival as a growth medium, not a novelty.' },
    { year: '2026', title: 'StreetMetrics partnership', body: `Partnered with StreetMetrics for independent, third-party measurement — every campaign now ships with verified impressions, reach, and frequency, reported the way a digital buy is reported.` },
];
/* The three functions that report into the owner — they become the orbit. */
const LEADERSHIP = [
    {
        title: 'National Operations', role: 'Fleets · Markets · Activation', mono: '01', icon: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', body: 'Thousands of trucks activated. Concurrent campaigns across DMAs coast to coast. One team running national scale as a single, coordinated operation.'
    },
    { title: 'Third-Party Verified', role: 'StreetMetrics · Independent Verification', mono: '02', icon: 'M3 3v18h18M7 15l4-5 3 3 5-7', body: `GPS data from every truck flows to our measurement partner StreetMetrics, where impressions, reach, and frequency are independently modeled and verified — not self-reported.` },
    { title: 'Creative & Production', role: 'Wraps · Print · Install · Maintain', mono: '03', icon: 'M15 5l4 4M3 21l1.2-4.4a2 2 0 01.5-.9l9.4-9.4a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8l-9.4 9.4a2 2 0 01-.9.5L3 21z', body: 'Over 1 million square feet of premium cast vinyl installed — and counting. Precision printing, expert installation, and regular inspections keep every wrap campaign-sharp from first mile to last.' },
];

/* ================================================================== */
/*  Story — split copy + parallax image + floating badge               */
/* ================================================================== */

function Story() {
    const rootRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from('[data-story-copy] > *', {
                y: 42, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });
            // Accent rule draws down the left of the copy.
            gsap.from(lineRef.current, {
                scaleY: 0, transformOrigin: 'top center', ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top 78%', end: 'center 55%', scrub: 1 },
            });
            // Image wipes up, then holds a slow parallax.
            gsap.from('[data-story-media]', {
                clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 70%', once: true },
            });
            gsap.to(imgRef.current, {
                yPercent: -12, ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
            });
            gsap.from('[data-story-badge]', {
                scale: 0.8, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.8)',
                scrollTrigger: { trigger: rootRef.current, start: 'top 58%', once: true },
            });
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <style>{`
                .story-outline { -webkit-text-stroke: 1.5px rgba(26,25,23,.10); color: transparent; }
                .dark .story-outline { -webkit-text-stroke: 1.5px rgba(255,255,255,.08); }
            `}</style>

            {/* Oversized outlined founding year behind the grid */}
            <span aria-hidden="true" className="story-outline pointer-events-none absolute -top-8 right-[3%] select-none font-tommy-bold leading-none tracking-tight" style={{ fontSize: 'clamp(140px,20vw,300px)' }}>
                2001
            </span>

            <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-3 md:px-6 lg:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
                {/* Copy with a drawing accent rule */}
                <div className="relative pl-5 md:pl-7 lg:pl-10">
                    <div ref={lineRef} className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#C8992B] dark:bg-[#FCD119]" />
                    <div data-story-copy>
                        <Eyebrow>Our story</Eyebrow>
                        <h2 className="mt-4 font-tommy-bold text-[clamp(28px,3.6vw,50px)] leading-[1.06] tracking-tight text-[#1A1917] dark:text-white">
                            Twenty-five years of doing one thing — for the brands that can’t afford to gamble<Dot />
                        </h2>
                        <p className="mt-3 md:mt-4 lg:mt-5 font-tommy-medium text-[17px] leading-[1.6] text-[#2C2C2B] md:text-[19px] dark:text-[#EAEAEA]">
                            We started Advertising Wheels in 2001 with a simple thesis: out-of-home was the only major
                            media channel without real measurement, targeting or accountability — and brands deserved better.
                        </p>
                        <p className="mt-3 md:mt-4 lg:mt-5 font-tommy-regular text-[15.5px] leading-[1.75] text-[#5A554C] dark:text-[#A8A399]">
                            Twenty-five years later the channel has caught up to where we always thought it should be.
                            GPS-verified delivery. Modeled impressions. Brand-lift studies. Geofenced retargeting. Most
                            competitors got into this business in the last three to five years, when measurement made it
                            credible. We’ve been here the whole time.
                        </p>
                        <p className="mt-5 font-tommy-regular text-[15.5px] leading-[1.75] text-[#5A554C] dark:text-[#A8A399]">
                            We are independently owned, running national campaigns for the largest brands in CPG, telecom, automotive,
                            retail and financial services — and the holding-company agencies that buy on their behalf.
                        </p>
                    </div>
                </div>

                {/* Image with parallax + floating badge */}
                <div className="relative">
                    <div data-story-media className="overflow-hidden rounded-[26px] border border-black/10 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.35)] dark:border-white/10" style={{ aspectRatio: '4 / 5' }}>
                        <img ref={imgRef} src={STORY_IMG} alt="Advertising Wheels operations" className="h-[118%] w-full object-cover" />
                    </div>
                    <div data-story-badge className="absolute -bottom-6 left-2 md:-left-6 rounded-2xl bg-[#1A1917] px-6 py-5 shadow-xl dark:bg-[#FCD119]">
                        <p className="font-tommy-bold text-[34px] leading-none text-[#FCD119] dark:text-black">25+</p>
                        <p className="mt-1.5 font-tommy-regular text-[11px] uppercase tracking-[2px] text-white/60 dark:text-black/60">Years · Owner-operated</p>
                    </div>
                    <div data-story-badge className="absolute -right-4 -top-4 rounded-full border border-black/10 bg-white/80 px-5 py-2.5 font-tommy-medium text-[12px] uppercase tracking-[2px] text-[#1A1917] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#141414]/80 dark:text-white">
                        San Francisco, CA
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ================================================================== */
/*  Stat band                                                          */
/* ================================================================== */

function Stats() {
    /* `wordy` marks the two entries that are a PHRASE rather than a figure.
       They cannot carry the figure's display size: a column here is about 216px
       at 1440 and "IMPRESSIONS" alone is ~340px at 50px, which is what pushed it
       across its neighbour. */
    const items: { el: React.ReactNode; label: string; wordy?: boolean }[] = [
        { el: <CountUp value={25} suffix="+" />, label: 'Years in truckside advertising' },
        { el: <CountUp value={50} suffix="+" />, label: 'DMAs covered through one accountable partner' },
        /* The newlines are load-bearing — see `white-space: pre-line` below. Left
           to wrap on their own the two phrases disagree: "BILLIONS OF
           IMPRESSIONS" is long enough to take two lines at every width, while
           "360 Degree Service" fits on one from about 1600 up, so the pair fell
           out of step on wide screens. Breaking both explicitly keeps them the
           same height on every screen instead of only on the narrow ones. */
        { el: <CountUp value={"BILLIONS OF\nIMPRESSIONS"} />, label: 'Ready for retargeting', wordy: true },
        { el: <CountUp value={"360 Degree\nService"} />, label: 'From start to finish, we handle everything.', wordy: true },
    ];
    return (
        <section className="w-full border-y border-black/10 bg-[#EEE8D9] transition-colors duration-300 py-12 md:py-16 lg:py-24 dark:border-white/10 dark:bg-[#0A0A0A]">
            <style>{`
                /* Sized against the COLUMN, not the viewport.

                   A column is (80% of the viewport, less the padding and gaps)
                   divided four ways: about 0.2vw − 72px of usable width, which at
                   1024 is only ~133px. A plain vw size ignores that fixed −72px
                   and overshoots hardest exactly where the column is tightest,
                   so the phrase sizes carry the subtraction too. */
                .about-stat { font-size: clamp(30px, 4.5vw, 50px); line-height: 1; }
                /* pre-line keeps the authored newline but still lets the text
                   wrap further if a column is too narrow for a line — so the
                   break is a floor on the line count, never a ceiling, and it
                   cannot reintroduce an overflow at small widths. */
                /* Two columns of 80% of a 320px phone is a 99px column, and the
                   floor has to let the longest word fit INSIDE that — at 16px
                   "IMPRESSIONS" measures 105px, so it broke mid-word and took the
                   phrase to three lines while its neighbour stayed at two. The
                   subtraction is here for the same reason as the desktop rule. */
                .about-stat--wordy { font-size: clamp(14px, calc(5.6vw - 4px), 28px); line-height: 1.08; white-space: pre-line; }
                @media (min-width: 1024px) {
                    /* The coefficient is set so the longest word ("IMPRESSIONS")
                       keeps real headroom in its column rather than just clearing
                       it — measured at 1440 it lands ~195px inside 215px. Sized to
                       fit exactly, a font fallback or a hinting difference would
                       be enough to push it over and force a mid-word break. */
                    .about-stat--wordy { font-size: clamp(17px, calc(2.75vw - 10px), 34px); }
                }
            `}</style>
            <Reveal className="mx-auto grid max-w-[80%] grid-cols-2 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-12 px-3 md:px-6 lg:px-12 lg:grid-cols-4" y={30} stagger={0.14}>
                {items.map((s, i) => (
                    /* `min-w-0` is the actual fix for the collision, not the type
                       size. A grid item's min-width defaults to `auto`, which means
                       its longest unbreakable word sets a floor the `1fr` track is
                       not allowed to go below — so "IMPRESSIONS" widened its own
                       column and shoved the next one along. With the floor removed
                       the track holds its quarter and the text wraps inside it. */
                    <div key={i} className="min-w-0 border-l border-black/10 pl-2 md:pl-4 lg:pl-6 dark:border-white/10">
                        {/* `break-words` is the belt-and-braces guarantee: whatever
                            the viewport, a word with nowhere to go breaks rather
                            than spilling into the neighbouring stat. */}
                        <p className={`about-stat${s.wordy ? ' about-stat--wordy' : ''} font-tommy-bold tracking-tight text-[#1A1917] break-words hyphens-auto dark:text-white`}>{s.el}</p>
                        <p className="mt-3 max-w-[200px] font-tommy-regular text-[12.5px] leading-[1.4] text-[#6F6A60] dark:text-[#9A968E]">{s.label}</p>
                    </div>
                ))}
            </Reveal>
        </section>
    );
}

/* ================================================================== */
/*  Pinned horizontal timeline (theme-aware — light on light theme)    */
/* ================================================================== */

function Timeline() {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);



    useGSAP(
        () => {

            const track = trackRef.current;
            if (!track) return;
            const mm = gsap.matchMedia();

            mm.add('(min-width: 1024px)', () => {
                const amount = () => Math.max(0, track.scrollWidth - window.innerWidth);
                const tween = gsap.to(track, {
                    x: () => -amount(), ease: 'none',
                    scrollTrigger: {
                        trigger: rootRef.current, start: 'top top', end: () => '+=' + amount(),
                        pin: true, scrub: 1, invalidateOnRefresh: true,
                        /* This page has TWO pins — this one and the orbit below it
                           — and they have to refresh in page order. Higher goes
                           first, and this is the upper of the two.

                           Without it the orbit could refresh first and measure a
                           page that did not yet include this pin's ~4,600px of
                           scroll distance, so its own start landed thousands of
                           pixels early: it pinned and drew its cards on top of
                           this section while this one was still pinned.

                           The ordering is genuinely at risk here rather than
                           merely unspecified. The orbit's pin is built on a SECOND
                           pass — `stacked` starts true and pins nothing, then
                           flips — so it is created after this one and can refresh
                           ahead of it. Same convention as `site/detail.tsx`. */
                        refreshPriority: 1,
                        onUpdate: (self) => { if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress }); },
                    },
                });
                gsap.utils.toArray<HTMLElement>('.tl-panel').forEach((panel) => {
                    gsap.from(panel.querySelectorAll('[data-tl-in]'), {
                        y: 40, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
                        scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 78%', toggleActions: 'play none none reverse' },
                    });
                });
                return () => { gsap.set(track, { clearProps: 'x' }); };
            });

            mm.add('(max-width: 1023px)', () => {
                gsap.utils.toArray<HTMLElement>('.tl-panel').forEach((panel) => {
                    gsap.from(panel.querySelectorAll('[data-tl-in]'), {
                        y: 34, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
                        scrollTrigger: { trigger: panel, start: 'top 82%', once: true },
                    });
                });
            });

            return () => mm.revert();
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden border-y border-black/10 bg-[#E7E0CE] text-[#1A1917] transition-colors duration-300 lg:h-screen dark:border-white/10 dark:bg-[#141414] dark:text-white">
            <div className="pointer-events-none relative inset-x-0 top-0 z-20 pt-[92px] px-3 md:px-8 lg:px-12 lg:pt-[13vh]">
                <Eyebrow>Twenty-five years on the road</Eyebrow>
                <h2 className="mt-3 font-tommy-bold text-[34px] uppercase leading-none tracking-tight md:text-[54px]">
                    A short company history<Dot />
                </h2>
            </div>

            <div ref={trackRef} className="flex flex-col gap-6 px-3 md:px-4 lg:px-6 pb-10 md:pb-12 lg:pb-16 pt-10 md:px-12 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:px-0 lg:pb-0 lg:pt-0">
                {MILESTONES.map((m, i) => (
                    <article key={m.year} className="tl-panel relative flex shrink-0 flex-col justify-start 2xl:justify-center pt-[20px] 2xl:pt-0 border-black/10 lg:h-full lg:w-[62vw] lg:border-l lg:px-[6vw] 2xl:w-[48vw] dark:border-white/10">
                        <span data-tl-in className="block font-tommy-bold text-[26px] tracking-[3px] text-[#C8992B] dark:text-[#FCD119]">{m.year}</span>
                        <span data-tl-in className="mt-1 font-tommy-regular text-[12px] uppercase tracking-[4px] text-black/40 dark:text-white/40">
                            {String(i + 1).padStart(2, '0')} / {String(MILESTONES.length).padStart(2, '0')}
                        </span>
                        <h3 data-tl-in className="mt-6 font-tommy-bold text-[32px] leading-[1.04] tracking-tight md:text-[clamp(2rem,3.5vw,3.375rem)]">{m.title}</h3>
                        <p data-tl-in className="mt-6 max-w-[540px] font-tommy-regular text-[15.5px] leading-[1.7] text-[#5A554C] md:text-[17px] dark:text-white/60">{m.body}</p>
                    </article>
                ))}
            </div>

            <div className="absolute inset-x-12 bottom-[8vh] z-20 hidden h-px bg-black/15 lg:block dark:bg-white/15">
                <div ref={progressRef} className="h-full origin-left bg-[#C8992B] dark:bg-[#FCD119]" style={{ transform: 'scaleX(0)' }} />
            </div>
        </section>
    );
}

/* ================================================================== */
/*  Leadership — cards morph into a hub-and-spoke orbit on scroll      */
/* ================================================================== */

function Leadership({ stacked }: { stacked: boolean }) {
    return (
        <OrbitDiagram stacked={stacked}
            eyebrow={<Eyebrow>Leadership</Eyebrow>}
            heading={
                <h2 className="mt-4 font-tommy-bold text-[clamp(28px,2.8vw,46px)] leading-[1.06] tracking-tight text-[#1A1917] dark:text-white">
                    Decades of truckside expertise. Trusted by the world's biggest brands<Dot />
                </h2>
            }
            intro={
                <p className="mt-5 font-tommy-regular text-[10px]  md:text-[clamp(0.875rem,1vw,0.96875rem)] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">
                    Our team has planned, produced, and measured campaigns for Fortune 500 advertisers and their agencies for over two decades —
                    bringing category-deep experience to every fleet, every market, and every readout.

                </p>
            }
            hub={{
                title: 'Roopanjan Dey',
                role: '',
                mono: '',
                body: 'Two and a half decades in truckside, still personally involved in every major client relationship.',
            }}
            nodes={LEADERSHIP}
        />
    );
}


/* ================================================================== */
/*  Pull quote — scroll-scrubbed word illumination                     */
/* ================================================================== */

function PullQuote() {
    const rootRef = useRef<HTMLElement>(null);
    const quoteRef = useRef<HTMLQuoteElement>(null);
    const { theme } = useTheme();

    useGSAP(
        () => {
            const dim = theme === 'light' ? '#CDC6B4' : '#4C4842';
            const ink = theme === 'light' ? '#1A1917' : '#FFFFFF';

            const split = new SplitText(quoteRef.current, { type: 'words', wordsClass: 'pq-word' });
            gsap.set(split.words, { color: dim });

            // Words illuminate left-to-right, tied 1:1 to scroll (a "reading" scrub).
            gsap.to(split.words, {
                color: ink, ease: 'none', stagger: 0.4,
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', end: 'bottom 62%', scrub: 0.5 },
            });

            gsap.from('[data-pq-mark]', {
                autoAlpha: 0, y: 24, scale: 0.8, duration: 0.7, ease: 'back.out(1.6)',
                scrollTrigger: { trigger: rootRef.current, start: 'top 76%', once: true },
            });
            gsap.from('[data-pq-cite]', {
                autoAlpha: 0, y: 18, duration: 0.7, ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 55%', once: true },
            });

            return () => split.revert();
        },
        { scope: rootRef, dependencies: [theme] }
    );

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden border-t border-black/10 bg-[#EEE8D9]  transition-colors duration-300 py-18 md:py-28 lg:py-40">
            <div className="mx-auto max-w-[960px] px-6 text-center md:px-12">
                <span data-pq-mark className="inline-block font-tommy-bold text-[90px] leading-[0.6] text-[#C8992B] dark:text-[#FCD119]">“</span>
                <blockquote ref={quoteRef} className="mt-4 font-tommy-medium text-[clamp(23px,3.1vw,40px)] leading-[1.34] tracking-[-0.01em]">
                    Hundreds of trucks across multiple markets, and our brand shows up perfectly on every one. Advertising Wheels' install standards and inspection process work at a scale most vendors can't touch. They treat our logo the way we do.
                </blockquote>
                <cite data-pq-cite className="mt-9 block font-tommy-regular text-[13px] uppercase not-italic tracking-[3px] text-[#6F6A60] dark:text-[#9A968E]">
                    Nick Ferrugia - Director, Brand and Performance Marketing, Fifth Third Bank
                </cite>
            </div>
        </section>
    );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function AboutPage() {
    /**
     * The orbit runs wherever the two-column row exists — from `lg` (1024px) up.
     * It used to demand 1280px, because the diagram was laid out at one fixed
     * card size and simply had to be given enough room; it now scales itself to
     * whatever stage it gets (see `fit()` in OrbitDiagram), so the threshold is
     * only about the COLUMN, not the size.
     *
     * 1024px is the real floor, not a cautious one. Below `lg` the grid collapses
     * to a single column, which puts the copy above the stage inside a pinned
     * h-screen — there is no longer a viewport tall enough to hold both, and the
     * cards would scale past the point of being readable. Phones get the stacked
     * list, and should.
     *
     * Watched (not read once) so a resize or an orientation change re-picks
     * the layout rather than leaving the wrong one mounted.
     *
     * Starts `true` on purpose. The orbit branch pins on mount, and a child's
     * layout effect runs before this one — so defaulting to the orbit meant
     * every narrow-screen load built a pin, then swapped the branch out from
     * under it and left the pin-spacer behind, overflowing the section. The
     * stacked branch pins nothing, so leading with it is always safe.
     */
    const [stacked, setStacked] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');
        const sync = () => setStacked(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    /**
     * Re-measure once the branch above has actually settled.
     *
     * `refreshPriority` fixes the ORDER pins refresh in; it cannot help if a pin
     * did not exist yet when the page was last measured. Flipping `stacked`
     * mounts or unmounts the orbit's pin, which changes the height of everything
     * below it — and the child's layout effect that builds that pin runs before
     * this one, so by here the new branch is mounted and ready to be measured.
     */
    useEffect(() => {
        ScrollTrigger.refresh();
    }, [stacked]);

    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="About"
                title="ADVERTISING WHEELS"
                lead="The seasoned operator in mobile truckside advertising — trusted by Fortune 500 brands and their agencies since 2001."
                primary={{ label: 'Start a Campaign', href: '/contact#form' }}
                secondary={{ label: 'See our work', href: '/projects' }}
                image="/assets/images/clients/banner image/About-main.webp"
                imageAlt="An Advertising Wheels truckside campaign on the street"
            />
            <Story />
            <Stats />
            <Timeline />
            <Leadership stacked={stacked} />
            <PullQuote />
            <CtaSection />
        </main>
    );
}
