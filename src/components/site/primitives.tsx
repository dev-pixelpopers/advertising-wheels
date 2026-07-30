'use client';

/**
 * Shared building blocks for the inner pages.
 *
 * These keep the six routes visually consistent with the home page — same
 * cream/dark grounds, MADE TOMMY type, yellow "." accents and GSAP-driven
 * reveals — without every page re-implementing the same motion.
 *
 *   PageHero  — the standard inner-page opener (mask-reveal title, rings motif,
 *               header-clearing offset, on-mount entrance).
 *   Reveal    — scroll-triggered stagger for a group of children.
 *   CountUp   — a number that counts up when it scrolls into view.
 *   Eyebrow / Dot — tiny typographic helpers.
 */

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Typographic helpers                                                */
/* ------------------------------------------------------------------ */

/** The brand's yellow full-stop — text-safe amber on cream, bright on dark. */
export function Dot() {
    return <span className="text-[#C8992B] dark:text-[#FCD119]">.</span>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <p className={`font-tommy-regular text-[11px] uppercase tracking-[4px] text-[#8A857C] md:text-[13px] dark:text-[#9A968E] ${className}`}>
            {children}
        </p>
    );
}

/** Right-pointing arrow that nudges on hover (parent needs the `group` class). */
export function ArrowIcon({ className = '' }: { className?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-300 group-hover:translate-x-1 ${className}`}>
            <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Solid dark→yellow pill (primary call to action). */
export function PrimaryLink({ href = '#', children, className = '' }: { href?: string; children: ReactNode; className?: string }) {
    return (
        <a
            href={href}
            className={`group inline-flex items-center gap-3 rounded-full bg-[#1A1917] px-8 py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04] dark:bg-[#FCD119] dark:text-black ${className}`}
        >
            {children}
            <ArrowIcon />
        </a>
    );
}

/** Outlined pill (secondary action). */
export function GhostLink({ href = '#', children, className = '' }: { href?: string; children: ReactNode; className?: string }) {
    return (
        <a
            href={href}
            className={`inline-flex items-center gap-3 rounded-full border-2 border-[#1A1917] px-8 py-4 font-tommy-medium text-[15px] text-[#1A1917] transition-colors duration-300 hover:bg-[#1A1917] hover:text-[#FCD119] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black ${className}`}
        >
            {children}
        </a>
    );
}

/* ------------------------------------------------------------------ */
/*  Concentric rings backdrop                                          */
/* ------------------------------------------------------------------ */

/** The concentric-ring motif used behind AdvertisingLeader / the yellow CTA. */
export function Rings({ className = '', spin = true }: { className?: string; spin?: boolean }) {
    return (
        <svg
            className={`${className} ${spin ? 'aw-spin' : ''}`}
            width="900"
            height="900"
            viewBox="0 0 895 895"
            fill="none"
            aria-hidden="true"
        >
            <circle cx="447.5" cy="447.5" r="442.5" className="stroke-black/[0.06] dark:stroke-white/[0.06]" strokeWidth="10" />
            <circle cx="448" cy="448" r="360" className="stroke-black/[0.05] dark:stroke-white/[0.05]" strokeWidth="10" />
            <circle cx="448" cy="448" r="270" className="stroke-black/[0.04] dark:stroke-white/[0.04]" strokeWidth="10" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  PageHero                                                           */
/* ------------------------------------------------------------------ */

interface PageHeroProps {
    eyebrow: string;
    /** Title content — inject <Dot/> where the yellow stop should land. */
    title: ReactNode;
    lead?: ReactNode;
    actions?: ReactNode;
    /** Optional visual to the right of the copy (spans ~45% on desktop). */
    aside?: ReactNode;
    /** Extra tags/stats row under the actions. */
    footerSlot?: ReactNode;
}

export function PageHero({ eyebrow, title, lead, actions, aside, footerSlot }: PageHeroProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from(q('[data-hero-eyebrow]'), { y: 20, autoAlpha: 0, duration: 0.6 })
                .from(
                    q('[data-hero-title]'),
                    { yPercent: 108, duration: 1, ease: 'power4.out' },
                    '<0.05'
                )
                .from(q('[data-hero-lead]'), { y: 26, autoAlpha: 0, duration: 0.7 }, '<0.35')
                .from(q('[data-hero-actions] > *'), { y: 22, autoAlpha: 0, duration: 0.6, stagger: 0.12 }, '<0.1')
                .from(q('[data-hero-foot] > *'), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, '<0.05');

            if (aside) {
                tl.from(q('[data-hero-aside]'), { autoAlpha: 0, y: 40, scale: 0.96, duration: 0.9, ease: 'power3.out' }, 0.35);
            }
        },
        { scope: rootRef }
    );

    return (
        <section
            ref={rootRef}
            className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
        >
            <style>{`
                @keyframes aw-spin { to { transform: rotate(360deg); } }
                .aw-spin { animation: aw-spin 60s linear infinite; transform-origin: 50% 50%; }
                @media (prefers-reduced-motion: reduce) { .aw-spin { animation: none; } }
            `}</style>

            {/* Rings drift behind the copy, echoing the home page's motif. */}
            <div className="pointer-events-none absolute -right-[16%] -top-[36%] opacity-90 md:-right-[6%] md:-top-[46%]" aria-hidden="true">
                <Rings />
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 pb-20 pt-[132px] md:gap-16 md:px-12 md:pb-28 md:pt-[190px] lg:grid-cols-[1.15fr_0.85fr]">
                {/* Copy column */}
                <div>
                    <div data-hero-eyebrow>
                        <Eyebrow>{eyebrow}</Eyebrow>
                    </div>

                    <h1 className="mt-5 font-tommy-bold text-[clamp(46px,7vw,104px)] leading-[0.94] tracking-[-2px] text-[#1A1917] dark:text-white">
                        {/* The mask wrapper the entrance rides up out of. */}
                        <span className="block overflow-hidden pb-[0.08em]">
                            <span data-hero-title className="block">
                                {title}
                            </span>
                        </span>
                    </h1>

                    {lead && (
                        <p data-hero-lead className="mt-7 max-w-[560px] font-tommy-regular text-[16px] leading-[1.7] text-[#4F4A42] md:text-[19px] dark:text-[#B7B2A8]">
                            {lead}
                        </p>
                    )}

                    {actions && (
                        <div data-hero-actions className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                            {actions}
                        </div>
                    )}

                    {footerSlot && (
                        <div data-hero-foot className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6 border-t border-black/10 pt-8 dark:border-white/10">
                            {footerSlot}
                        </div>
                    )}
                </div>

                {/* Optional aside visual */}
                {aside && (
                    <div data-hero-aside className="relative">
                        {aside}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Reveal — scroll-triggered stagger for a group                      */
/* ------------------------------------------------------------------ */

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Distance travelled on entrance. */
    y?: number;
    stagger?: number;
    start?: string;
    /** Animate the wrapper's direct children (default) or the wrapper itself. */
    self?: boolean;
}

export function Reveal({ children, className = '', y = 44, stagger = 0.12, start = 'top 82%', self = false }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const targets = self ? ref.current : (ref.current?.children as unknown as Element[]);
            if (!targets) return;
            gsap.from(targets, {
                y,
                autoAlpha: 0,
                duration: 0.85,
                ease: 'power3.out',
                stagger,
                scrollTrigger: { trigger: ref.current, start, once: true },
            });
        },
        { scope: ref }
    );

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  CountUp — animated number on scroll                                */
/* ------------------------------------------------------------------ */

interface CountUpProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    /** Thousands separator. */
    comma?: boolean;
    className?: string;
    duration?: number;
}

export function CountUp({ value, prefix = '', suffix = '', decimals = 0, comma = false, className = '', duration = 1.6 }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useGSAP(
        () => {
            const el = ref.current;
            if (!el) return;
            const counter = { v: 0 };
            const render = () => {
                const n = counter.v;
                const body = comma
                    ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
                    : n.toFixed(decimals);
                el.textContent = prefix + body + suffix;
            };
            render();
            gsap.to(counter, {
                v: value,
                duration,
                ease: 'power2.out',
                onUpdate: render,
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            });
        },
        { scope: ref }
    );

    return <span ref={ref} className={className}>{prefix}{(0).toFixed(decimals)}{suffix}</span>;
}
