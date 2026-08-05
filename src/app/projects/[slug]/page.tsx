'use client';

/**
 * Case-study detail — `/projects/[slug]`.
 *
 * Flow: cinematic hero (image scrubs open and drifts as you leave it) → fact
 * strip → sticky-TOC article with clip-revealed gallery plates → pinned results
 * panel whose figures count up → pull quote → related studies → footer.
 *
 * The 404 for an unknown slug is handled by the server layout, so by the time
 * this renders the study is known to exist; the guard below only covers the
 * brief moment before `useParams` resolves.
 */

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { Eyebrow, Dot, ArrowIcon, PrimaryLink, Rings } from '@/components/site/primitives';
import {
    ReadingProgress,
    StickyToc,
    PinnedStats,
    ParallaxMedia,
    ArticleSection,
    BackLink,
    useScrollTriggerRefresh,
} from '@/components/site/detail';
import { getCaseStudy, relatedCaseStudies, type CaseStudy } from '@/data/caseStudies';
import { shotsFor } from '@/data/clientShots';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

/**
 * Entrance runs on mount (not on scroll) because this is the top of the page —
 * a ScrollTrigger at `top 80%` here would already be past its start on load and
 * strand the `from` tweens at opacity 0. The scroll work is the departure: the
 * plate scales down and the copy drifts as the hero leaves.
 */
function Hero({ study }: { study: CaseStudy }) {
    const rootRef = useRef<HTMLElement>(null);
    const plateRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);

            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from(q('[data-h-eyebrow]'), { y: 18, autoAlpha: 0, duration: 0.6 })
                .from(q('[data-h-title]'), { yPercent: 110, duration: 1, ease: 'power4.out' }, '<0.05')
                .from(q('[data-h-lead]'), { y: 24, autoAlpha: 0, duration: 0.7 }, '<0.35')
                .from(q('[data-h-tag]'), { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, '<0.15')
                .from(
                    plateRef.current,
                    { clipPath: 'inset(12% 8% 12% 8% round 20px)', autoAlpha: 0, duration: 1.15, ease: 'power3.out' },
                    0.25
                );

            // Departure — scrubbed, so it reverses cleanly on the way back up.
            gsap.to(plateRef.current, {
                scale: 0.94,
                yPercent: -4,
                ease: 'none',
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'bottom 90%',
                    end: 'bottom 30%',
                    scrub: 0.5,
                    refreshPriority: -1,
                },
            });
        },
        { scope: rootRef }
    );

    return (
        <section
            ref={rootRef}
            className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
        >
            <div className="pointer-events-none absolute -right-[18%] -top-[40%] opacity-80" aria-hidden="true">
                <Rings />
            </div>

            <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-14 pt-[124px] md:px-12 md:pb-20 md:pt-[172px]">
                <div data-h-eyebrow className="mb-8">
                    <BackLink href="/projects">All projects</BackLink>
                </div>

                <Eyebrow>{study.industry}</Eyebrow>

                <h1 className="mt-5 font-tommy-bold text-[clamp(40px,6.6vw,96px)] leading-[0.95] tracking-[-0.03em] text-[#1A1917] dark:text-white">
                    <span className="block overflow-hidden pb-[0.08em]">
                        <span data-h-title className="block">
                            {study.brand}
                            <Dot />
                        </span>
                    </span>
                </h1>

                <p
                    data-h-lead
                    className="mt-7 max-w-[640px] font-tommy-regular text-[17px] leading-[1.72] text-[#4F4A42] md:text-[20px] dark:text-[#B7B2A8]"
                >
                    {study.lead}
                </p>

                <div className="mt-9 flex flex-wrap gap-2.5">
                    {study.services.map((s) => (
                        <span
                            key={s}
                            data-h-tag
                            className="rounded-full border border-black/12 px-4 py-2 font-tommy-regular text-[12px] uppercase tracking-[1.5px] text-[#6F6A60] dark:border-white/12 dark:text-[#A8A399]"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12">
                <div
                    ref={plateRef}
                    className="relative h-[300px] overflow-hidden rounded-[24px] border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.16)] md:h-[560px] dark:border-white/10"
                >
                    {/* `priority` — this is the LCP element on the route. */}
                    <Image
                        src={study.hero}
                        alt={`${study.brand} truckside campaign`}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 1440px"
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Fact strip                                                         */
/* ------------------------------------------------------------------ */

function Facts({ study }: { study: CaseStudy }) {
    const ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from(ref.current?.children ?? [], {
                y: 26,
                autoAlpha: 0,
                duration: 0.7,
                stagger: 0.09,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
            });
        },
        { scope: ref }
    );

    const facts = [
        { k: 'Client', v: study.brand },
        { k: 'Sector', v: study.industry },
        { k: 'Markets', v: study.markets },
        { k: 'Duration', v: study.duration },
        { k: 'Year', v: study.year },
    ];

    return (
        <section className="w-full bg-[#EEE8D9] pt-16 transition-colors duration-300 md:pt-24 dark:bg-[#0A0A0A]">
            <div
                ref={ref}
                className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-9 border-y border-black/10 px-6 py-10 md:grid-cols-5 md:px-12 dark:border-white/10"
            >
                {facts.map((f) => (
                    <div key={f.k}>
                        <p className="font-tommy-regular text-[10.5px] uppercase tracking-[2.5px] text-[#8A857C] dark:text-[#9A968E]">
                            {f.k}
                        </p>
                        <p className="mt-2.5 font-tommy-medium text-[16px] leading-[1.3] text-[#1A1917] md:text-[18px] dark:text-white">
                            {f.v}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Article                                                            */
/* ------------------------------------------------------------------ */

function Article({ study }: { study: CaseStudy }) {
    const toc = study.sections.map((s) => ({ id: s.id, nav: s.nav }));

    return (
        <section className="w-full bg-[#EEE8D9] py-16 transition-colors duration-300 md:py-24 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
                <aside className="order-2 lg:order-1">
                    <StickyToc items={toc} />
                </aside>

                <div id="cs-article" className="order-1 min-w-0 lg:order-2">
                    {study.sections.map((s, i) => (
                        <div key={s.id}>
                            <ArticleSection id={s.id} heading={s.heading} body={s.body} />
                            {/* Gallery plates break up the read at section boundaries. */}
                            {study.gallery[i] && i < study.sections.length - 1 && (
                                <ParallaxMedia
                                    src={study.gallery[i]}
                                    alt={`${study.brand} campaign`}
                                    className="mt-12 md:mt-16"
                                    height="h-[240px] md:h-[420px]"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Fleet gallery                                                      */
/* ------------------------------------------------------------------ */

/**
 * The on-route documentation — `FleetShots` from the client's shoot folder.
 *
 * Deliberately a different register from the article's `ParallaxMedia`
 * plates: those are single art-directed images that punctuate the read, this
 * is the contact sheet — the same wrap photographed across a run, which is
 * the actual evidence that the campaign was on the road.
 *
 * Every tile is `next/image` with a real `sizes`, because the sources are
 * 2-6MB camera originals; a plain <img> here would ship ~40MB of photography
 * for one section.
 */
function FleetGallery({ study, shots }: { study: CaseStudy; shots: string[] }) {
    const ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from(ref.current?.children ?? [], {
                y: 46,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.07,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
            });
        },
        { scope: ref }
    );

    if (!shots.length) return null;

    return (
        <section className="w-full bg-[#EEE8D9] py-16 transition-colors duration-300 md:py-24 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12">
                <div className="flex flex-wrap items-end justify-between gap-6 border-t border-black/10 pt-12 dark:border-white/10">
                    <div>
                        <Eyebrow>On the road</Eyebrow>
                        <h2 className="mt-4 font-tommy-bold text-[clamp(26px,3vw,42px)] leading-[1.05] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                            The fleet in service<Dot />
                        </h2>
                    </div>
                    <p className="max-w-[380px] font-tommy-regular text-[14.5px] leading-[1.62] text-[#5A554C] dark:text-[#A8A399]">
                        {study.brand} wraps photographed across live routes — the same
                        vehicles our GPS logs were counting.
                    </p>
                </div>

                {/* First tile runs full width on desktop: the run needs one
                    establishing frame before it becomes a grid. */}
                <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {shots.map((src, i) => (
                        <div
                            key={src}
                            className={`group relative overflow-hidden rounded-[16px] border border-black/10 dark:border-white/10 ${i === 0 ? 'col-span-2 h-[240px] md:h-[420px]' : 'h-[150px] md:h-[240px]'
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`${study.brand} fleet on route`}
                                fill
                                loading="lazy"
                                sizes={i === 0 ? '(max-width: 768px) 100vw, 900px' : '(max-width: 768px) 50vw, 440px'}
                                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Quote                                                              */
/* ------------------------------------------------------------------ */

function Quote({ study }: { study: CaseStudy }) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            gsap.from(ref.current?.querySelectorAll('[data-q]') ?? [], {
                y: 34,
                autoAlpha: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
            });
        },
        { scope: ref }
    );

    return (
        <section
            ref={ref}
            className="w-full bg-[#EEE8D9] py-20 transition-colors duration-300 md:py-28 dark:bg-[#0A0A0A]"
        >
            <div className="mx-auto max-w-[980px] px-6 text-center md:px-12">
                <span data-q className="block font-tommy-bold text-[54px] leading-none text-[#C8992B] dark:text-[#FCD119]">
                    &ldquo;
                </span>
                <blockquote
                    data-q
                    className="mt-4 font-tommy-medium text-[clamp(22px,3vw,40px)] leading-[1.3] tracking-[-0.02em] text-[#1A1917] dark:text-white"
                >
                    {study.quote.text}
                </blockquote>
                <p data-q className="mt-8 font-tommy-regular text-[13px] uppercase tracking-[2.5px] text-[#6F6A60] dark:text-[#9A968E]">
                    {study.quote.author} — {study.quote.role}
                </p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Related                                                            */
/* ------------------------------------------------------------------ */

function Related({ slug }: { slug: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const items = relatedCaseStudies(slug);

    useGSAP(
        () => {
            gsap.from(ref.current?.children ?? [], {
                y: 44,
                autoAlpha: 0,
                duration: 0.85,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
            });
        },
        { scope: ref }
    );

    if (!items.length) return null;

    return (
        <section className="w-full bg-[#EEE8D9] pb-24 transition-colors duration-300 md:pb-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <div className="flex flex-wrap items-end justify-between gap-6 border-t border-black/10 pt-12 dark:border-white/10">
                    <h2 className="font-tommy-bold text-[clamp(26px,3vw,42px)] leading-[1.05] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                        More work<Dot />
                    </h2>
                    <PrimaryLink href="/projects">All projects</PrimaryLink>
                </div>

                <div ref={ref} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {items.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/projects/${c.slug}`}
                            className="group flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/40 transition-colors duration-300 hover:border-[#C8992B]/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#FCD119]/30"
                        >
                            <div className="relative h-[180px] overflow-hidden">
                                <Image
                                    src={c.hero}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <span className="font-tommy-regular text-[11px] uppercase tracking-[2px] text-[#C8992B] dark:text-[#FCD119]">
                                    {c.industry}
                                </span>
                                <h3 className="mt-3 font-tommy-bold text-[21px] leading-[1.15] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                                    {c.brand}
                                </h3>
                                <p className="mt-3 font-tommy-regular text-[14.5px] leading-[1.62] text-[#5A554C] dark:text-[#A8A399]">
                                    {c.summary}
                                </p>
                                <span className="mt-6 inline-flex items-center gap-2 font-tommy-medium text-[12.5px] uppercase tracking-[2px] text-[#1A1917] transition-colors duration-300 group-hover:text-[#C8992B] dark:text-white dark:group-hover:text-[#FCD119]">
                                    Read case study <ArrowIcon />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CaseStudyDetailPage() {
    const params = useParams<{ slug: string }>();
    const study = getCaseStudy(params?.slug ?? '');

    // Images decode after the triggers measure — settle positions once loaded.
    useScrollTriggerRefresh();

    if (!study) return null;

    /* Only the clients with a shoot folder get the gallery — the rest of the
       studies fall through to the section being omitted entirely rather than
       padded out with stock. Capped at 7: past that the contact sheet stops
       reading as evidence and starts reading as an archive dump. */
    const fleet = shotsFor(study.slug)?.fleet.slice(0, 7) ?? [];

    return (
        // No header/footer here — the root layout renders both for every route.
        <>
            <ReadingProgress targetId="cs-article" />

            <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
                <Hero study={study} />
                <Facts study={study} />
                <Article study={study} />

                <PinnedStats
                    eyebrow="The numbers"
                    heading={<>What it moved<Dot /></>}
                    stats={study.stats}
                    note="Impressions are GPS-logged at fifteen-second intervals and third-party audited. Lift figures are measured against demographically matched control markets with no fleet presence."
                />

                <FleetGallery study={study} shots={fleet} />
                <Quote study={study} />
                <Related slug={study.slug} />
            </main>
        </>
    );
}
