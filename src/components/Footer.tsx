'use client';

/**
 * Footer — the page's closing surface.
 *
 * It shares the CtaSection's ground deliberately, so the yellow closer reads as
 * a card resting on the footer rather than a block stacked above it. The handoff
 * is reinforced on scroll: the footer parallaxes up from under the CTA, then the
 * columns, rules and bottom bar resolve in sequence.
 *
 * TRIGGER NOTE: this is the last element on the page, so its top can never rise
 * above `viewportH - footerH` (~62% on a 1080px screen). Any ScrollTrigger start
 * above that line simply never fires and its `from` tween strands the element at
 * opacity 0. Everything below therefore hangs off ONE trigger at `top 85%` —
 * comfortably reachable — and sequences the beats inside the timeline instead.
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Logo from './Logo';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Row-major order, so the two-column grid reads About/Vendors, Projects/Blog,
   Services/Contact — matching the header's nav. */
const QUICK_LINKS = [
    { label: 'About', href: '/about' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
];

const SOCIALS = [
    {
        label: 'LinkedIn',
        href: '	https://www.linkedin.com/company/advertisingwheels',
        path: 'M4.98 3.5A1.75 1.75 0 1 1 3.23 5.25 1.75 1.75 0 0 1 4.98 3.5ZM3.5 8.25h2.96V19H3.5V8.25Zm5.19 0h2.84v1.47h.04a3.11 3.11 0 0 1 2.8-1.54c3 0 3.55 1.97 3.55 4.54V19h-2.96v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V19H8.69V8.25Z',
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/advertisingwheels/',
        path: 'M11.5 2h1c2.2 0 2.6.01 3.5.05a4.3 4.3 0 0 1 1.44.28 2.9 2.9 0 0 1 1.05.68 2.9 2.9 0 0 1 .68 1.05 4.3 4.3 0 0 1 .28 1.44c.04.9.05 1.3.05 3.5v1c0 2.2-.01 2.6-.05 3.5a4.3 4.3 0 0 1-.28 1.44 3.1 3.1 0 0 1-1.73 1.73 4.3 4.3 0 0 1-1.44.28c-.9.04-1.3.05-3.5.05h-1c-2.2 0-2.6-.01-3.5-.05a4.3 4.3 0 0 1-1.44-.28 3.1 3.1 0 0 1-1.73-1.73 4.3 4.3 0 0 1-.28-1.44C2.01 14.6 2 14.2 2 12v-1c0-2.2.01-2.6.05-3.5a4.3 4.3 0 0 1 .28-1.44 3.1 3.1 0 0 1 1.73-1.73 4.3 4.3 0 0 1 1.44-.28C6.4 4.01 6.8 4 9 4Zm.5 4.25a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm0 1.75a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3.6-2.6a.78.78 0 1 0 0 1.55.78.78 0 0 0 0-1.55Z',
    },
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/AdvertisingWheels/',
        path: 'M13.5 12.5h2.1l.4-2.75h-2.5V8.1c0-.8.28-1.35 1.42-1.35h1.2V4.3a17 17 0 0 0-1.85-.1c-1.9 0-3.27 1.16-3.27 3.3v1.84H8.5v2.76h2.5V19h2.5v-6.5Z',
    },
    {
        label: 'Tiktok',
        href: 'https://www.tiktok.com/@advertisingwheels',
        path: 'M14 2c.26 1.9 1.42 3.32 3.3 3.5v2.4c-1.12.05-2.2-.3-3.3-1v5.8c0 3.5-2.6 5.55-5.4 5.55-2.65 0-4.85-1.9-4.85-4.8 0-2.95 2.35-4.9 5.25-4.7v2.55c-.4-.1-.85-.13-1.28-.06-1.15.2-1.9 1.02-1.8 2.2.1 1.15.98 1.9 2.05 1.85 1.28-.06 2.05-1 2.05-2.35V2H14Z',
    },
];

interface CredentialLogo {
    src: string;
    alt: string;
    size: string;
    className?: string;
}

const DARKEN = 'brightness-0 dark:brightness-100';

const CREDENTIALS: { logos: CredentialLogo[] }[] = [

    { logos: [{ src: '/assets/images/cta/national-minority.webp', alt: 'National Minority Supplier Development Council', size: 'h-[20px] md:h-[100px]' }] },
    {
        logos: [
            { src: '/assets/images/cta/6x.png', alt: 'Five-time Inc. 5000 honoree', size: 'h-[20px] md:h-[30px]', className: DARKEN },
            { src: '/assets/images/cta/inc-5000-seal.webp', alt: '', size: 'h-[30px] md:h-[80px]' },

        ],
    },
    { logos: [{ src: '/assets/images/cta/mbe-certified.webp', alt: 'Minority Business Enterprise certified', size: 'h-[20px] md:h-[80px]' }] },
    { logos: [{ src: '/assets/images/cta/geopath.webp', alt: 'GeoPath accredited', size: 'h-[20px] md:h-[45px]', className: 'dark:invert' }] },
    { logos: [{ src: '/assets/images/cta/o-aaa.webp', alt: 'OAAA member', size: 'h-[20px] md:h-[30px]', className: 'dark:invert' }] },
];

export default function Footer() {
    const rootRef = useRef<HTMLElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const year = new Date().getFullYear();
    const [isMobile, setIsMobile] = useState<Boolean>(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 1024);
    }, []);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);

            // ── CTA → footer handoff ──
            // The footer rides up out from under the closer. `bottom bottom` is
            // the one end point guaranteed reachable: it IS the page's last
            // scroll position, so the parallax always resolves fully to 0.
            gsap.fromTo(
                innerRef.current,
                { yPercent: isMobile ? 4 : 12 },
                {
                    yPercent: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: 'top bottom',
                        end: 'bottom bottom',
                        scrub: 0.6,
                    },
                }
            );

            // ── Entrance — one reachable trigger, beats sequenced internally ──
            const tl = gsap.timeline({
                scrollTrigger: { trigger: rootRef.current, start: 'top 85%', once: true },
            });

            tl.from(q('[data-foot-rule]'), {
                scaleY: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power2.out',
                transformOrigin: 'top center',
            }, 0)
                .from(q('[data-foot-col]'), {
                    y: 40,
                    autoAlpha: 0,
                    duration: 0.75,
                    stagger: 0.12,
                    ease: 'power3.out',
                }, 0.05)
                .from(q('[data-foot-hr]'), {
                    scaleX: 0,
                    duration: 0.8,
                    ease: 'power2.inOut',
                    transformOrigin: 'left center',
                }, 0.5)
                .from(q('[data-foot-logos] > div'), {
                    y: 16,
                    autoAlpha: 0,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: 'power3.out',
                }, 0.6)
                .from(q('[data-foot-bottom] > *'), {
                    y: 16,
                    autoAlpha: 0,
                    duration: 0.55,
                    stagger: 0.1,
                    ease: 'power3.out',
                }, 0.65)
                .from(q('[data-foot-mark]'), {
                    yPercent: 40,
                    autoAlpha: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                }, 0.7);
        },
        { scope: rootRef }
    );

    return (
        <footer
            ref={rootRef}
            className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
            aria-labelledby="footer-heading"
        >
            <style>{`
                /* Underline sweeps out from the left on hover, retracts to the right. */
                .ft-link { position: relative; }
                .ft-link::after {
                    content: ''; position: absolute; left: 0; bottom: -3px;
                    height: 1px; width: 100%; background: currentColor;
                    transform: scaleX(0); transform-origin: right center;
                    transition: transform .34s cubic-bezier(.2,.8,.2,1);
                }
                .ft-link:hover::after { transform: scaleX(1); transform-origin: left center; }
                @media (prefers-reduced-motion: reduce) {
                    .ft-link::after { transition: none; }
                }
            `}</style>

            <h2 id="footer-heading" className="sr-only">
                Advertising Wheels — site footer
            </h2>

            <div ref={innerRef} className="relative mx-auto w-full px-4 sm:px-6 lg:max-w-[1240px] lg:px-12">
                {/* ================= Top: three columns on desktop, stacked on mobile/tablet ================= */}
                <div className="grid grid-cols-1 gap-10 py-8 sm:py-12 lg:grid-cols-[1.1fr_0.9fr_1.2fr] lg:gap-12 lg:py-16 xl:py-24">
                    {/* ---- Identity + direct contact ---- */}
                    <div data-foot-col className="flex flex-col gap-4 md:gap-6 lg:gap-8 lg:pr-12">
                        <Logo width={132} height={55} />

                        <p className="max-w-[280px] font-tommy-regular text-[13.5px] leading-[1.7] text-[#6F6A60] dark:text-[#9A968E]">
                            Truckside billboard advertising with GPS-verified coverage and
                            impressions independently measured by StreetMetrics.
                        </p>

                        <ul className="flex flex-col gap-2 md:gap-3 lg:gap-4">
                            <li className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#C8992B] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#FCD119]">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path
                                            d="M5.2 2.5 6.6 5.3 5.3 6.6a8.4 8.4 0 0 0 4.1 4.1l1.3-1.3 2.8 1.4v2.4c0 .6-.5 1-1.1.9A11.6 11.6 0 0 1 2.1 3.6c0-.6.4-1.1 1-1.1h2.1Z"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <a href="tel:+18774239433" className="font-tommy-medium text-[14px] text-[#1A1917] dark:text-white">
                                    1-877-4-ADWHEELS (1-877-423-9433)
                                </a>
                            </li>
                            <li>
                                <a href="mailto:BrandGrowth@AdvertisingWheels.com" className="group flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#C8992B] transition-colors duration-300 group-hover:border-[#C8992B]/40 group-hover:bg-[#FCD119]/20 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#FCD119] dark:group-hover:bg-[#FCD119]/10">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                            <rect x="1.8" y="3.4" width="12.4" height="9.2" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
                                            <path d="m2.4 4.6 5.6 4 5.6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span className="ft-link font-tommy-medium text-[14px] text-[#1A1917] dark:text-white">
                                        BrandGrowth@AdvertisingWheels.com
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* ---- Quick links ---- */}
                    <div data-foot-col className="relative lg:px-8 xl:px-12">
                        <span
                            data-foot-rule
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 hidden w-px bg-black/10 lg:block dark:bg-white/10"
                        />
                        <h3 className="font-tommy-bold text-[19px] uppercase tracking-tight text-[#1A1917] dark:text-white">
                            Quick Links<span className="text-[#FCD119]">.</span>
                        </h3>
                        <ul className="mt-3 md:mt-5 lg:mt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 md:gap-y-3 lg:gap-y-4">
                            {QUICK_LINKS.map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        className="ft-link inline-block font-tommy-regular text-[14px] text-[#6F6A60] transition-colors duration-300 hover:text-[#1A1917] dark:text-[#9A968E] dark:hover:text-white"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ---- Newsletter ---- */}
                    <div data-foot-col className="relative lg:pl-8 xl:pl-12">
                        <span
                            data-foot-rule
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 hidden w-px bg-black/10 lg:block dark:bg-white/10"
                        />
                        <h3 className="font-tommy-bold text-[19px] uppercase tracking-tight text-[#1A1917] dark:text-white">
                            Newsletter<span className="text-[#FCD119]">.</span>
                        </h3>
                        <p className="mt-3 font-tommy-regular text-[13px] leading-[1.6] text-[#6F6A60] dark:text-[#9A968E]">
                            Route news, market openings and campaign results — once a month.
                        </p>

                        <form
                            className="mt-6 flex items-center gap-3 border-b border-black/15 pb-2.5 transition-colors duration-300 focus-within:border-[#C8992B] dark:border-white/15 dark:focus-within:border-[#FCD119]"
                            /* Presentation only — no endpoint is wired up yet. */
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <label htmlFor="footer-email" className="sr-only">
                                Your email address
                            </label>
                            <input
                                id="footer-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                className="w-full min-w-0 bg-transparent font-tommy-regular text-[14px] text-[#1A1917] placeholder:text-black/35 focus:outline-none dark:text-white dark:placeholder:text-white/35"
                            />
                            <button
                                type="submit"
                                className="group flex shrink-0 items-center gap-2 rounded-full bg-[#1A1917] px-5 py-2.5 font-tommy-medium text-[13px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04] dark:bg-[#FCD119] dark:text-black"
                            >
                                Subscribe
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                >
                                    <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </form>

                        <p className="mt-4 font-tommy-regular text-[11.5px] leading-[1.7] text-[#6F6A60]/85 dark:text-[#9A968E]/80">
                            I have read the{' '}
                            <a href="/privacy" className="ft-link text-[#1A1917] dark:text-white">
                                Privacy Policy
                            </a>{' '}
                            provided by Advertising Wheels.
                        </p>
                    </div>
                </div>

                {/* ================= Industry Associations & Credentials ================= */}
                <div data-foot-logos className="flex flex-wrap items-center justify-start gap-6 md:justify-between pb-[10px] md:pb-[16px] lg:pb-[20px] px-2 md:px-3 lg:px-4">
                    {CREDENTIALS.map((card, idx) => (
                        <div key={idx} className="flex items-center gap-3 md:gap-4">
                            {card.logos.map((c) => (
                                <img
                                    key={c.src}
                                    src={c.src}
                                    alt={c.alt}
                                    loading="lazy"
                                    className={`${c.size} ${c.className ?? ''} w-auto max-w-full object-contain`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* ================= Bottom bar ================= */}
                <div
                    data-foot-hr
                    aria-hidden="true"
                    className="h-px w-full bg-black/10 dark:bg-white/10"
                />

                <div
                    data-foot-bottom
                    className="flex flex-col items-center gap-6 py-8 text-center lg:flex-row lg:justify-between lg:gap-4 lg:text-left"
                >
                    <p className="font-tommy-regular text-[12px] text-[#6F6A60] dark:text-[#9A968E]">
                        © {year} Advertising Wheels. All Rights Reserved.
                    </p>

                    <div className="flex items-center gap-3">
                        <span className="font-tommy-regular text-[11px] uppercase tracking-[2px] text-[#6F6A60]/75 dark:text-[#9A968E]/70">
                            We Are Social
                        </span>
                        <ul className="flex items-center gap-2">
                            {SOCIALS.map((s) => (
                                <li key={s.label}>
                                    <a
                                        href={s.href}
                                        target='_blank'
                                        aria-label={s.label}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#6F6A60] transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-[#FCD119] hover:text-black dark:border-white/10 dark:bg-white/[0.06] dark:text-[#9A968E]"
                                    >
                                        <svg width="15" height="15" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
                                            <path d={s.path} />
                                        </svg>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center gap-3 font-tommy-regular text-[12px]">
                        <a href="/privacy" className="ft-link text-[#6F6A60] transition-colors duration-300 hover:text-[#1A1917] dark:text-[#9A968E] dark:hover:text-white">
                            Privacy Policy
                        </a>
                        <span className="text-black/15 dark:text-white/15">|</span>
                        <a href="/terms" className="ft-link text-[#6F6A60] transition-colors duration-300 hover:text-[#1A1917] dark:text-[#9A968E] dark:hover:text-white">
                            Terms &amp; Conditions
                        </a>
                    </div>
                </div>
            </div>

            {/* Oversized wordmark closing the page out. Sized to ~95% of the viewport
                at any width so the whole name reads: larger and it clips at BOTH ends,
                which looks like a broken string rather than a deliberate mark. It sits
                flush on the bottom edge — `leading-[0.8]` crops the line box tight to
                the caps, so flush reads as intentional without cutting any letterform. */}
            <div
                data-foot-mark
                aria-hidden="true"
                /* `leading-[0.8]` makes the line box shorter than the font's content
                   box, so the glyph box overhangs the footer by ~0.3em. The padding is
                   in vw to match the vw-based font size and cancel that at any width. */
                className="pointer-events-none relative flex w-full select-none justify-center -mb-[2%]"
            >
                <span className="whitespace-nowrap font-tommy-bold text-[9.4vw] leading-[0.8] tracking-[-0.03em] text-black/[0.06] dark:text-white/[0.055]">
                    ADVERTISING WHEELS
                </span>
            </div>
        </footer>
    );
}
