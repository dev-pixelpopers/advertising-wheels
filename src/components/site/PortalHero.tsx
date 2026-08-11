'use client';

/**
 * PortalHero — the shared "portal" banner used at the top of every inner page.
 *
 * Two doors start closed in the middle and part outward on scroll to uncover a
 * full-bleed image. The badge + title sit in front as a persistent title card
 * (visible whether the portal is open or shut); the lead copy and buttons only
 * reveal once the image is uncovered.
 *
 * Theme-aware: cream doors + ink type on the light theme, near-black doors +
 * cream type on dark, so the banner never fights the page it opens onto.
 *
 * Motion is bound to scroll POSITION (scrub) so it reverses on the way back up,
 * and is skipped entirely under prefers-reduced-motion — where the doors are
 * simply hidden and everything is shown, i.e. the finished page.
 */

import { ReactNode, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useTheme } from '@/context/ThemeContext';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface PortalHeroProps {
    /** Small pill above the title, e.g. "About". */
    badge: string;
    /** Big title. Plain string keeps the wordmark styling consistent. */
    title: ReactNode;
    /** Supporting line, revealed once the portal opens. */
    lead?: ReactNode;
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string };
    /** Full-bleed image uncovered by the doors. */
    image: string;
    /** Alt text for that image. */
    imageAlt?: string;
    /** Scroll depth of the portal. Default '200vh'. */
    height?: string;
    /** Title size. Defaults to the big wordmark scale. */
    titleSize?: string;
}

export default function PortalHero({
    badge,
    title,
    lead,
    primary,
    secondary,
    image,
    imageAlt = '',
    height = '200vh',
    titleSize = 'clamp(44px,7vw,150px)',
}: PortalHeroProps) {
    const heroRef = useRef<HTMLElement>(null);
    const imgRef = useRef<HTMLDivElement>(null);
    const titleWrapRef = useRef<HTMLDivElement>(null);
    const panelLRef = useRef<HTMLDivElement>(null);
    const panelRRef = useRef<HTMLDivElement>(null);

    const { theme } = useTheme();
    const isLight = theme === 'light';
    const ground = isLight ? '#EEE8D9' : '#0A0A0A';
    const ink = isLight ? '#1A1917' : '#EEE8D9';
    const inkDim = isLight ? 'rgba(26,25,23,.72)' : 'rgba(238,232,217,.8)';
    const accent = isLight ? '#FCD119' : '#FCD119';
    const scrim = '#5d59599e';
    const wordShadow = isLight ? '0 2px 26px rgba(238,232,217,.7)' : '0 2px 30px rgba(0,0,0,.55)';

    useGSAP(
        () => {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduced) {
                gsap.set([panelLRef.current, panelRRef.current], { autoAlpha: 0 });
                gsap.set('[data-banner-in]', { autoAlpha: 1, y: 0 });
                return;
            }

            // Hidden up front — set here rather than via a .from() at a later
            // timeline position, which would paint them visible before it runs.
            gsap.set('[data-banner-in]', { autoAlpha: 0, y: 24 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                },
            });

            tl.fromTo(panelLRef.current, { xPercent: 0 }, { xPercent: -106, duration: 0.62 }, 0)
                .fromTo(panelRRef.current, { xPercent: 0 }, { xPercent: 106, duration: 0.62 }, 0)
                .fromTo(imgRef.current, { scale: 1.14 }, { scale: 1, duration: 0.85 }, 0)
                // Title lifts as the doors part, then settles back to centre.
                .to(titleWrapRef.current, { y: -38, duration: 0.34, ease: 'power1.out' }, 0)
                .to(titleWrapRef.current, { y: 0, duration: 0.4, ease: 'power2.inOut' }, 0.34)
                .to('[data-banner-in]', { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, ease: 'power3.out' }, 0.5)
                .to({}, { duration: 0.2 });
        },
        { scope: heroRef }
    );

    return (
        <section ref={heroRef} className="relative" style={{ height, backgroundColor: ground }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ isolation: 'isolate' }}>
                {/* Full-bleed image.
                    next/image, not <img> — these heroes are client shoot
                    originals (the About one is a 24MB frame straight off the
                    camera), so the raw file must never reach the browser. The
                    scale tween drives this WRAPPER, because `fill` makes
                    next/image own the <img>'s own transform box. */}
                <div ref={imgRef} className="absolute inset-0 z-0 will-change-transform">
                    <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>

                {/* Theme-aware readability scrim */}
                <div className="absolute inset-0 z-10" style={{ background: scrim }} />

                {/* Doors — begin CLOSED (meeting in the middle). No inline transform,
                    so GSAP owns xPercent cleanly and the closed state takes hold. */}
                <div ref={panelLRef} className="absolute left-0 top-0 z-20 h-full w-[52%]" style={{ backgroundColor: ground }} />
                <div ref={panelRRef} className="absolute right-0 top-0 z-20 h-full w-[52%]" style={{ backgroundColor: ground }} />

                {/* Title card — centred. Lead + buttons are positioned absolutely
                    below centre so revealing them never shifts the title. */}
                <div className="relative inset-0 z-30 flex flex-col items-center justify-center px-3 md:px-5 lg:px-6 text-center h-full gap-3 md:gap-5 lg:gap-7.5">
                    <div ref={titleWrapRef} className="flex flex-col items-center will-change-transform">
                        <span
                            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-tommy-regular text-[11px] uppercase tracking-[0.3em] md:text-[12.5px]"
                            style={{ border: `1px solid ${isLight ? 'rgba(26,25,23,.2)' : 'rgba(238,232,217,.25)'}`, color: inkDim }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                            {badge}
                        </span>
                        <h1
                            className="mt-5 font-tommy-bold leading-[0.9] tracking-tight md:mt-6"
                            style={{ fontSize: titleSize, color: ink, textShadow: wordShadow }}
                        >
                            {title}
                            <span style={{ color: accent }}>.</span>
                        </h1>
                    </div>

                    <div className="relative inset-x-0 flex flex-col items-center lg:px-6">
                        {lead && (
                            <p
                                data-banner-in
                                style={{ opacity: 0, color: 'white' }}
                                className="max-w-[640px] font-tommy-regular text-[clamp(15px,1.8vw,20px)] leading-[1.6]"
                            >
                                {lead}
                            </p>
                        )}

                        {(primary || secondary) && (
                            <div data-banner-in style={{ opacity: 0 }} className="mt-4 md:mt-6 lg:mt-8 flex flex-wrap items-center justify-center gap-4">
                                {primary && (
                                    <a
                                        href={primary.href}
                                        className="group inline-flex items-center gap-3 rounded-full bg-[#FCD119] px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 font-tommy-medium text-[15px] text-[#1A1917] transition-transform duration-300 hover:scale-[1.04]"
                                    >
                                        {primary.label}
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                                            <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                )}
                                {secondary && (
                                    <a
                                        href={secondary.href}
                                        className="inline-flex items-center gap-3 rounded-full border-2 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 font-tommy-medium text-[15px] transition-colors duration-300"
                                        style={{ borderColor: isLight ? 'rgba(238,232,217,.45)' : 'rgba(238,232,217,.45)', color: '#fff' }}
                                    >
                                        {secondary.label}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
