'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A single, continuously-visible truck whose ENVIRONMENT morphs around it on scroll.
 *  Step 1 — light-grey studio: wrap panels snap onto the truck, a "verified" badge pulses.
 *  Step 2 — dusk urban corridor: a glowing blue route line unfolds ahead.
 *  Step 3 — same street: a projected analytics interface with live counters + heatmap.
 *
 * Layout: a tall parent + a sticky child (NO gsap pin). ScrollTrigger only scrubs the
 * timeline that crossfades the environments and animates the overlays.
 */

/* ------------------------------------------------------------------ */
/*  Subtitle type ramp                                                 */
/*                                                                     */
/*  Mirrors the Hero's tier system rather than inventing a second one:  */
/*  a small tracked index label, a cream statement a step down from the */
/*  section heading, the payoff word in the accent, and a caret to      */
/*  close it. Shared constants so all three steps stay identical and    */
/*  nothing shifts as they cross-fade.                                  */
/* ------------------------------------------------------------------ */

const SUB_LABEL =
    'font-tommy-regular text-[10px] md:text-[12px] uppercase tracking-[0.34em] text-[#FCD119]';

const SUB_TYPE =
    'mt-3 md:mt-4 font-tommy-bold capitalize leading-[1.06] tracking-[-0.01em] text-[#EEE8D9] text-[clamp(1.3rem,3.4vw,3.1rem)]';

const SUB_ACCENT = 'italic text-[#FCD119]';

const SUB_CARET =
    'aw-caret ml-[0.12em] inline-block h-[0.78em] w-[0.05em] translate-y-[0.06em] bg-[#FCD119] align-middle';

const pinPositions = [
    {
        className: "left-[8%] top-[10%] lg:top-[44%] ",
    },
    {
        className: "top-[20%] lg:top-[30%] right-[15%] 2xl:right-[23%] 3xl:right-[28%] ",
    },
    {
        className: "right-[10%] lg:right-[16%] top-[30%] lg:top-[44%] ",
    },
    {
        className: "right-[50%] lg:right-[4%] top-[20%] lg:top-[44%] ",
    },
];

export default function TruckExperience() {
    const rootRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const studioRef = useRef<HTMLDivElement>(null);
    const urbanRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const truckWrapRef = useRef<HTMLDivElement>(null);
    const bannerRef = useRef<HTMLDivElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
    const statsBarRef = useRef<HTMLDivElement>(null);
    const sub1Ref = useRef<HTMLDivElement>(null);
    const sub2Ref = useRef<HTMLDivElement>(null);
    const sub3Ref = useRef<HTMLDivElement>(null);

    // Continuous live counters (running continuously, independent of scroll)
    const [impressionsCount, setImpressionsCount] = useState(3.45);
    const [mileageCount, setMileageCount] = useState(12563);
    const [trucksCount, setTrucksCount] = useState(48);
    const [campaignsCount] = useState(7);

    useEffect(() => {
        const timer = setInterval(() => {
            setImpressionsCount((prev) => parseFloat((prev + 0.003).toFixed(3)));
            setMileageCount((prev) => prev + Math.floor(Math.random() * 4 + 2));
            if (Math.random() > 0.8) {
                setTrucksCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
            }
        }, 350);
        return () => clearInterval(timer);
    }, []);

    useGSAP(
        () => {
            // Initial states.
            gsap.set(studioRef.current, { clipPath: 'inset(100% 0% 0% 0%)' });
            gsap.set(headingRef.current, { autoAlpha: 0, y: -40 });
            gsap.set(truckWrapRef.current, { xPercent: -140, autoAlpha: 0 });
            gsap.set(bannerRef.current, { yPercent: -140, xPercent: -10, rotate: -12, scale: 1.2, autoAlpha: 0 });
            gsap.set(urbanRef.current, { autoAlpha: 0 });
            gsap.set(statsRef.current, { autoAlpha: 0 });
            gsap.set(badgeRef.current, { autoAlpha: 0, scale: 0.6 });
            gsap.set(pinRefs.current.filter(Boolean), { autoAlpha: 0, scale: 0.3, y: 20 });
            gsap.set(statsBarRef.current, { autoAlpha: 0, y: 40 });
            gsap.set([sub2Ref.current, sub3Ref.current], { autoAlpha: 0 });
            gsap.set(sub1Ref.current, { autoAlpha: 1 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                    // NO pin — the sticky child holds the visual in place.
                },
            });

            // ── STEP 1 SEQUENCE ──
            // 1. Truck moves from left to right into center position AND studio background wipes up from bottom
            tl.to(truckWrapRef.current, { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
                .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.05)
                .to(studioRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, 0);

            // 2. NOW banner appears in mid-air and snaps onto the centered truck
            tl.to(
                bannerRef.current,
                { yPercent: 0, xPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: 'power2.out' },
                0.55
            )
                // Quality-verified badge pops in as wrap settles onto the body
                .to(badgeRef.current, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.85);

            // ── TRANSITION 1 → 2 — studio background dissolves into city background & heading recedes ──
            tl.to(headingRef.current, { autoAlpha: 0, y: -20, duration: 0.3 }, 1.3)
                .to(studioRef.current, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut' }, 1.45)
                .to(urbanRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut' }, 1.45)
                .to(badgeRef.current, { autoAlpha: 0, duration: 0.3 }, 1.45)
                .to(sub1Ref.current, { autoAlpha: 0, duration: 0.3 }, 1.45)
                .to(sub2Ref.current, { autoAlpha: 1, duration: 0.4 }, 1.75);

            // ── STEP 2 — 4 pins reveal one by one on scroll ─────────────────
            pinRefs.current.forEach((pin, index) => {
                if (pin) {
                    tl.to(pin, {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'back.out(1.8)',
                    }, 1.85 + index * 0.2);
                }
            });

            // ── TRANSITION 2 → 3 ──
            // 1. Pins fade out and truck WITH banner moves right out of screen
            pinRefs.current.forEach((pin) => {
                if (pin) {
                    tl.to(pin, { autoAlpha: 0, scale: 0.5, duration: 0.3 }, 2.65);
                }
            });
            tl.to(truckWrapRef.current, { xPercent: 160, autoAlpha: 0, duration: 0.75, ease: 'power2.in' }, 2.65);

            // 2. THEN: Background changes from city.png to stats.png, stats bar reveals & subtitle updates
            tl.to(urbanRef.current, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut' }, 3.3)
                .to(statsRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut' }, 3.3)
                .to(statsBarRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 3.4)
                .to(sub2Ref.current, { autoAlpha: 0, duration: 0.3 }, 3.3)
                .to(sub3Ref.current, { autoAlpha: 1, duration: 0.5 }, 3.5);
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="relative h-[400vh] w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A] -mt-[100vh]">
            <style>{`
                @keyframes aw-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(252,209,25,0.55); }
                    70% { box-shadow: 0 0 0 22px rgba(252,209,25,0); }
                    100% { box-shadow: 0 0 0 0 rgba(252,209,25,0); }
                }
                .aw-badge { animation: aw-pulse 2s ease-out infinite; }
                @keyframes aw-heat {
                    0%,100% { opacity: 0.35; }
                    50% { opacity: 0.9; }
                }
                /* Terminal caret, same device the Hero closes its headline with. */
                @keyframes aw-caret { 0%,45% { opacity: 1; } 55%,100% { opacity: 0; } }
                .aw-caret { animation: aw-caret 1.05s steps(1) infinite; }
                @media (prefers-reduced-motion: reduce) { .aw-caret { animation: none; } }
            `}</style>

            {/* Sticky visual stage (no gsap pin) */}
            <div className="sticky top-[8%] h-screen w-full overflow-hidden">

                {/* HEADING — built on the Hero's tier system: a small tracked label
                    over an oversized uppercase line, cream on a darkened plate, with
                    the accent carried by the full stop. No theme colours here — this
                    sits on photography, not on the page ground. */}
                <div className="absolute top-[9%] left-0 z-30 flex w-full flex-col items-center justify-center px-6 pointer-events-none md:top-[11%]">
                    <div ref={headingRef} className="flex flex-col items-center">
                        <span className="font-tommy-regular text-[10px] uppercase tracking-[0.34em] text-[#FCD119] md:text-[12px]">
                            The Process
                        </span>
                        <h2 className="mt-3 text-center font-tommy-bold uppercase leading-[0.98] tracking-[-0.015em] text-[#EEE8D9] text-[clamp(2rem,5.4vw,4.25rem)] md:mt-4">
                            How It Works<span className="text-[#FCD119]">.</span>
                        </h2>
                    </div>
                </div>

                {/* ENVIRONMENT — 1st slide: studio background (clips from bottom to top on entrance) */}
                <div ref={studioRef} className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/process/studio.png"
                        alt="Studio background"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* ENVIRONMENT — 2nd slide: city background (dissolves in as 1st background dissolves out) */}
                <div ref={urbanRef} className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src="/assets/images/process/city.png"
                        alt="City background"
                        className="w-full h-[112%] object-cover"
                    />
                </div>

                {/* ENVIRONMENT — 3rd slide: stats background (dissolves in after truck moves out right) */}
                <div ref={statsRef} className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/process/stats.png"
                        alt="Stats background"
                        className="w-full h-full object-cover"
                    />
                </div>


                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[30%]"
                    style={{ background: 'linear-gradient(0deg, rgba(8,8,10,0.62) 0%, rgba(8,8,10,0.34) 42%, rgba(8,8,10,0) 100%)' }}
                />

                {/* 4 PINS — 1 on left side of truck, 3 on right side of truck aligned on the same horizontal line */}
                {pinPositions.map((pin, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            pinRefs.current[index] = el;
                        }}
                        className={`absolute z-20 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] w-[60px] lg:w-[75px] h-[60px] lg:h-[75px] ${pin.className}`}
                    >
                        <img
                            src="/assets/images/process/circle.png"
                            alt="Circle background"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />

                        <img
                            src="/assets/images/process/pin.gif"
                            alt="Pin animation"
                            className={`w-[30px] lg:w-[40px] h-[30px] lg:h-[40px] object-contain relative z-10 pointer-events-none`}
                        />
                    </div>
                ))}

                {/* TRUCK — enters from left, centre stage */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div ref={truckWrapRef} className="relative w-full lg:w-[60vw] 3xl:w-[74vw] lg:max-w-[1120px] top-[10%] 2xl:top-0">
                        <img
                            src="/assets/images/process/truck.png"
                            alt="Advertising Wheels truck"
                            className="w-full h-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.35)]"
                        />

                        {/* Banner image (the brand creative) that aligns and snaps onto the truck body */}
                        <div
                            ref={bannerRef}
                            className="absolute left-[5.4%] top-[11%] w-[62.9%] h-[58%] rounded-[4px] overflow-hidden shadow-2xl pointer-events-none"
                        >
                            <img
                                src="/assets/images/process/banner.jpg"
                                alt="Brand creative banner"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Quality-verified badge on the body */}
                        <div ref={badgeRef} className="aw-badge absolute right-0 md:right-[11%] lg:right-[13%] 2xl:right-[16%] top-[18%] md:top-[20%] lg:top-[24%] 2xl:top-[30%] flex items-center gap-1 md:gap-2 rounded-full bg-[#1A1917]/90 backdrop-blur px-3 lg:px-4 py-1 md:py-2 border border-[#FCD119]/40 z-20">
                            <span className="flex items-center justify-center w-3 md:w-4 lg:w-5 h-3 md:h-4 lg:h-5 rounded-full bg-[#FCD119] text-[#1A1917] text-[10px] md:text-[12px] font-bold">✓</span>
                            <span className="text-[#FCD119] text-[10px] md:text-[13px] font-tommy-medium whitespace-nowrap">Quality Verified</span>
                        </div>
                    </div>
                </div>

                {/* STATS BAR — appears with stats.png, positioned bottom of screen above subtitle text */}
                <div
                    ref={statsBarRef}
                    className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[98%] lg:w-[92%] lg:max-w-[1240px] z-30 bg-white/95 dark:bg-[#141414]/90 backdrop-blur-md rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100 dark:border-white/10 px-2 py-4 lg:p-4 transition-colors duration-300 pointer-events-auto"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800/80 gap-y-4 md:gap-y-0">
                        {/* Item 1: TOTAL IMPRESSIONS */}
                        <div className="flex flex-col justify-between pr-3 md:px-5 first:pl-0">
                            <div className="flex flex-col lg:flex-row items-center gap-3">
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">TOTAL IMPRESSIONS</span>
                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                        <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black dark:text-white">
                                            {impressionsCount.toFixed(2)}M
                                        </span>
                                        <span className="text-[11px] md:text-[12px] font-tommy-medium text-black dark:text-gray-300 whitespace-nowrap">
                                            ↑ 12.5%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Sparkline Graph */}
                            <svg className="w-full h-5 mt-2" viewBox="0 0 100 25" fill="none">
                                <path d="M0 20 Q 20 18, 35 10 T 70 16 T 100 4" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        {/* Item 2: TOTAL MILEAGE */}
                        <div className="flex flex-col justify-between xl:pr-3 px-3 xl:px-5 pt-3 md:pt-0">
                            <div className="flex flex-col lg:flex-row items-center gap-3">
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">TOTAL MILEAGE</span>
                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                        <span className="text-[16px] text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black dark:text-white">
                                            {mileageCount.toLocaleString()} <span className="text-[15px] md:text-[18px] font-tommy-medium">km</span>
                                        </span>
                                        <span className="text-[11px] md:text-[12px] font-tommy-medium text-black dark:text-gray-300 whitespace-nowrap">
                                            ↑ 8.3%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Sparkline Graph */}
                            <svg className="w-full h-5 mt-2" viewBox="0 0 100 25" fill="none">
                                <path d="M0 18 Q 25 22, 45 12 T 75 14 T 100 6" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        {/* Item 3: ACTIVE TRUCKS */}
                        <div className="flex flex-col justify-between xl:pr-3 lg:px-3 xl:px-5 pt-3 md:pt-0">
                            <div className="flex flex-col lg:flex-row items-center gap-3">
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">ACTIVE TRUCKS</span>
                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                        <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black dark:text-white">
                                            {trucksCount}
                                        </span>
                                        <span className="text-[11px] md:text-[12px] font-tommy-medium text-black dark:text-gray-300 whitespace-nowrap">
                                            ↑ 5.2%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Sparkline Graph */}
                            <svg className="w-full h-5 mt-2" viewBox="0 0 100 25" fill="none">
                                <path d="M0 22 Q 30 14, 50 16 T 80 8 T 100 5" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        {/* Item 4: ACTIVE CAMPAIGNS */}
                        <div className="flex flex-col justify-between md:pl-5 pt-3 md:pt-0">
                            <div className="flex flex-col lg:flex-row items-center gap-3">
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 11c0-1.33-.52-2.54-1.37-3.45L19 5l-1.5-1.5-2.52 2.52C13.97 5.37 12.54 5 11 5c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.54 0 2.97-.37 4-1.02L17.52 20.5 19 19l-2.37-2.55C17.48 13.54 18 12.33 18 11zm-7 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">ACTIVE CAMPAIGNS</span>
                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                        <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black dark:text-white">
                                            {campaignsCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Sparkline Graph */}
                            <svg className="w-full h-5 mt-2" viewBox="0 0 100 25" fill="none">
                                <path d="M0 20 Q 20 22, 40 14 T 70 8 T 100 4" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* SUBTITLES — the Hero's stack, one step down.
                    Each step is an indexed label above a single cream line whose
                    payoff word carries the accent in italic, closed by a blinking
                    caret. All three share one ramp so nothing resizes as they swap,
                    and all three are the same colour because the veil above has
                    already made the plate behind them consistent. */}
                <div className="absolute bottom-[9%] top-[78%] left-0 z-30 w-full flex justify-center px-6 pointer-events-none">
                    <div className="relative text-center w-full">
                        <div ref={sub1Ref} className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={SUB_LABEL}>01 — Wrap</span>
                            <p className={SUB_TYPE}>
                                Wrapped, inspected, <span className={SUB_ACCENT}>verified.</span>
                                <span aria-hidden="true" className={SUB_CARET} />
                            </p>
                        </div>
                        <div ref={sub2Ref} className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={SUB_LABEL}>02 — Route</span>
                            <p className={SUB_TYPE}>
                                Routed for <span className={SUB_ACCENT}>maximum reach.</span>
                                <span aria-hidden="true" className={SUB_CARET} />
                            </p>
                        </div>
                        <div ref={sub3Ref} className="flex flex-col items-center pt-5 justify-center">
                            <span className={SUB_LABEL}>03 — Measure</span>
                            <p className={SUB_TYPE}>
                                Measured in <span className={SUB_ACCENT}>real time.</span>
                                <span aria-hidden="true" className={SUB_CARET} />
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
