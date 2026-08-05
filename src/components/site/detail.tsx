'use client';

/**
 * Building blocks shared by the two detail routes — `/projects/[slug]` and
 * `/blog/[slug]`.
 *
 *   ReadingProgress — a scrub-driven bar tied to the article's own height.
 *   StickyToc       — sticky contents list that highlights the section you're in.
 *   PinnedStats     — a pinned panel whose figures count up as you scroll past.
 *   ParallaxMedia   — clip-reveal on entry, then a slow drift against the page.
 *   Prose           — the article body's type scale, in one place.
 *
 * ScrollTrigger notes that matter here:
 *   • Every trigger is created inside `useGSAP` so it's reverted on unmount —
 *     these are route-level components in an SPA, so stale triggers on dead
 *     nodes are a real failure mode, not a theoretical one.
 *   • `scrub` and `toggleActions` are never combined on one trigger.
 *   • ScrollTrigger lives on the TIMELINE, never on a child tween of it.
 *   • Pinning components carry an explicit `refreshPriority` so they refresh in
 *     page order — a pin that refreshes late reports the wrong page height and
 *     drags every trigger below it out of position.
 */

import { ReactNode, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Height of the sticky SiteHeader — anchor scrolling has to clear it. */
const HEADER_OFFSET = 96;

/* ------------------------------------------------------------------ */
/*  ReadingProgress                                                    */
/* ------------------------------------------------------------------ */

/**
 * Fixed bar under the header. Scrubs from 0→1 across the article element, so it
 * reflects progress through the READING, not through the whole document (which
 * would include the hero and the footer and always finish early).
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
    const barRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const target = document.getElementById(targetId);
        if (!target || !barRef.current) return;

        gsap.fromTo(
            barRef.current,
            { scaleX: 0 },
            {
                scaleX: 1,
                ease: 'none',
                transformOrigin: 'left center',
                scrollTrigger: {
                    trigger: target,
                    start: 'top 20%',
                    end: 'bottom bottom',
                    scrub: 0.4,
                    refreshPriority: -1,
                },
            }
        );
    }, [targetId]);

    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
            aria-hidden="true"
        >
            <div ref={barRef} className="h-full w-full origin-left bg-[#C8992B] dark:bg-[#FCD119]" />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  StickyToc                                                          */
/* ------------------------------------------------------------------ */

export interface TocItem {
    id: string;
    nav: string;
}

/**
 * One ScrollTrigger per section reports which one currently owns the reading
 * line (40% down the viewport). `onToggle` rather than `onEnter` so it also
 * resolves correctly when scrolling back up.
 */
export function StickyToc({ items, label = 'Contents' }: { items: TocItem[]; label?: string }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(items[0]?.id ?? '');

    useGSAP(() => {
        items.forEach((item) => {
            const section = document.getElementById(item.id);
            if (!section) return;
            ScrollTrigger.create({
                trigger: section,
                start: `top 40%`,
                end: `bottom 40%`,
                onToggle: (self) => {
                    if (self.isActive) setActive(item.id);
                },
            });
        });
    }, [items]);

    const jump = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
            behavior: 'smooth',
        });
    };

    return (
        <nav ref={rootRef} aria-label={label} className="lg:sticky lg:top-[120px]">
            <p className="font-tommy-regular text-[11px] uppercase tracking-[3px] text-[#8A857C] dark:text-[#9A968E]">
                {label}
            </p>
            <ul className="mt-5 space-y-1 border-l border-black/12 dark:border-white/12">
                {items.map((item, i) => {
                    const on = active === item.id;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => jump(item.id)}
                                aria-current={on ? 'true' : undefined}
                                className={`group relative -ml-px block w-full border-l-2 py-2.5 pl-5 text-left font-tommy-medium text-[14px] transition-colors duration-300 ${on
                                    ? 'border-[#C8992B] text-[#1A1917] dark:border-[#FCD119] dark:text-white'
                                    : 'border-transparent text-[#8A857C] hover:text-[#1A1917] dark:text-[#9A968E] dark:hover:text-white'
                                    }`}
                            >
                                <span className="mr-3 font-tommy-regular text-[11px] tabular-nums opacity-50">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {item.nav}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/* ------------------------------------------------------------------ */
/*  PinnedStats                                                        */
/* ------------------------------------------------------------------ */

export interface PinnedStat {
    value: number;
    prefix?: string;
    suffix?: string;
    comma?: boolean;
    label: string;
}

/**
 * Pinned results panel. The section holds still while each figure slides in and
 * counts up; because the timeline is scrubbed, the counters run backwards on the
 * way up too, which reads as scrubbing a video rather than replaying an intro.
 *
 * Pinning is disabled below `lg` via matchMedia — on a short touch viewport a
 * pin this tall costs more than it earns, so the rows simply reveal in place.
 */
export function PinnedStats({
    stats,
    eyebrow,
    heading,
    note,
}: {
    stats: PinnedStat[];
    eyebrow: string;
    heading: ReactNode;
    note?: string;
}) {
    const rootRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            const rows = q('[data-stat-row]');
            const figures = q('[data-stat-figure]');

            /** Writes the counter's current value into the figure element. */
            const bindCounter = (el: Element, stat: PinnedStat) => {
                const counter = { v: 0 };
                const render = () => {
                    const n = Math.round(counter.v);
                    el.textContent =
                        (stat.prefix ?? '') +
                        (stat.comma ? n.toLocaleString('en-US') : String(n)) +
                        (stat.suffix ?? '');
                };
                render();
                return { counter, render };
            };

            const bound = figures.map((el, i) => bindCounter(el, stats[i]));

            const mm = gsap.matchMedia(rootRef);

            const build = (pin: boolean) => {
                const tl = gsap.timeline({
                    defaults: { ease: 'none' },
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: pin ? 'top top' : 'top 78%',
                        end: pin ? '+=' + window.innerHeight * 1.4 : 'bottom 60%',
                        pin,
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                        refreshPriority: 1,
                    },
                });

                rows.forEach((row, i) => {
                    const { counter, render } = bound[i];
                    tl.fromTo(
                        row,
                        { autoAlpha: 0, y: 44 },
                        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                        i * 0.45
                    ).to(
                        counter,
                        { v: stats[i].value, duration: 0.9, onUpdate: render },
                        i * 0.45
                    );
                });

                return () => tl.scrollTrigger?.kill();
            };

            mm.add('(min-width: 1024px)', () => build(true));
            mm.add('(max-width: 1023px)', () => build(false));
        },
        { scope: rootRef, dependencies: [stats] }
    );

    return (
        <section
            ref={rootRef}
            className="w-full bg-[#E7E0CE] py-20 transition-colors duration-300 md:py-28 dark:bg-[#141414]"
        >
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <p className="font-tommy-regular text-[11px] uppercase tracking-[4px] text-[#8A857C] md:text-[13px] dark:text-[#9A968E]">
                    {eyebrow}
                </p>
                <h2 className="mt-4 max-w-[16ch] font-tommy-bold text-[clamp(30px,4vw,58px)] leading-[1.02] tracking-[-0.025em] text-[#1A1917] dark:text-white">
                    {heading}
                </h2>

                <dl className="mt-14 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            data-stat-row
                            className="grid grid-cols-1 items-baseline gap-2 py-7 sm:grid-cols-[minmax(180px,0.4fr)_1fr] sm:gap-10 md:py-9"
                        >
                            <dt
                                data-stat-figure
                                className="font-tommy-bold text-[clamp(38px,6vw,80px)] leading-none tracking-[-0.03em] tabular-nums text-[#1A1917] dark:text-[#FCD119]"
                            >
                                {s.prefix ?? ''}0{s.suffix ?? ''}
                            </dt>
                            <dd className="font-tommy-regular text-[15px] leading-[1.6] text-[#5A554C] md:text-[18px] dark:text-[#A8A399]">
                                {s.label}
                            </dd>
                        </div>
                    ))}
                </dl>

                {note && (
                    <p className="mt-8 max-w-[62ch] font-tommy-regular text-[13.5px] leading-[1.7] text-[#6F6A60] dark:text-[#9A968E]">
                        {note}
                    </p>
                )}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  ParallaxMedia                                                      */
/* ------------------------------------------------------------------ */

/**
 * Two separate triggers on purpose: one non-scrubbed clip-reveal for the
 * entrance (`once`), and one scrubbed parallax for the drift. Combining them
 * would force a single behaviour on both, and `scrub` always wins.
 */
export function ParallaxMedia({
    src,
    alt = '',
    className = '',
    height = 'h-[300px] md:h-[520px]',
    caption,
}: {
    src: string;
    alt?: string;
    className?: string;
    height?: string;
    caption?: string;
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from(rootRef.current, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1.05,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 84%', once: true },
            });

            gsap.fromTo(
                imgRef.current,
                { yPercent: -8 },
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            );
        },
        { scope: rootRef }
    );

    return (
        <figure className={className}>
            <div
                ref={rootRef}
                className={`overflow-hidden rounded-[20px] border border-black/10 dark:border-white/10 ${height}`}
            >
                {/* Oversized so the parallax drift never exposes an edge.
                    The drift moves this WRAPPER rather than the image itself —
                    next/image with `fill` owns the element's own transform box,
                    so animating the <img> directly fights it. */}
                <div ref={imgRef} className="relative h-[118%] w-full">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 1100px"
                        className="object-cover"
                    />
                </div>
            </div>
            {caption && (
                <figcaption className="mt-3 font-tommy-regular text-[12.5px] text-[#6F6A60] dark:text-[#9A968E]">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

/* ------------------------------------------------------------------ */
/*  Prose                                                              */
/* ------------------------------------------------------------------ */

/** One anchored article section — the id doubles as the TOC target. */
export function ArticleSection({
    id,
    heading,
    body,
    callout,
}: {
    id: string;
    heading: string;
    body: string[];
    callout?: string;
}) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            gsap.from(ref.current?.children ?? [], {
                y: 30,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
            });
        },
        { scope: ref }
    );

    return (
        <section ref={ref} id={id} className="scroll-mt-[120px] pt-14 first:pt-0 md:pt-20">
            <h2 className="font-tommy-bold text-[clamp(24px,2.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                {heading}
            </h2>
            {body.map((p) => (
                <p
                    key={p.slice(0, 40)}
                    className="mt-5 font-tommy-regular text-[16px] leading-[1.78] text-[#4F4A42] md:text-[17.5px] dark:text-[#B7B2A8]"
                >
                    {p}
                </p>
            ))}
            {callout && (
                <p className="mt-8 border-l-2 border-[#C8992B] py-1 pl-6 font-tommy-medium text-[17px] leading-[1.6] text-[#1A1917] md:text-[19px] dark:border-[#FCD119] dark:text-white">
                    {callout}
                </p>
            )}
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Back link                                                          */
/* ------------------------------------------------------------------ */

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <a
            href={href}
            className="group inline-flex items-center gap-2 font-tommy-medium text-[13px] uppercase tracking-[2px] text-[#6F6A60] transition-colors duration-300 hover:text-[#1A1917] dark:text-[#9A968E] dark:hover:text-white"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:-translate-x-1">
                <path d="M15 8 H2 M7 3 L2 8 L7 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {children}
        </a>
    );
}

/* ------------------------------------------------------------------ */
/*  Refresh-on-mount                                                   */
/* ------------------------------------------------------------------ */

/**
 * Images on these pages are unsized, so the document height grows as they
 * decode — after every trigger has already measured. Refresh once the window's
 * load event fires so pins and end positions settle against the final layout.
 */
export function useScrollTriggerRefresh() {
    useEffect(() => {
        const refresh = () => ScrollTrigger.refresh();
        if (document.readyState === 'complete') {
            const t = window.setTimeout(refresh, 120);
            return () => window.clearTimeout(t);
        }
        window.addEventListener('load', refresh);
        return () => window.removeEventListener('load', refresh);
    }, []);
}
