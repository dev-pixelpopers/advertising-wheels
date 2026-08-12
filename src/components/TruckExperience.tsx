'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

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

const SUB_ACCENT = 'text-[#FCD119]';

const SUB_CARET =
    'aw-caret ml-[0.12em] inline-block h-[0.78em] w-[0.05em] translate-y-[0.06em] bg-[#FCD119] align-middle';

/**
 * Map markers scattered over the city plate.
 *
 * Deliberately off-grid: three of the original four used to share `top-[44%]`,
 * which lined them up on one horizontal rule and read as a UI row rather than
 * points on a map. No two share a `top` at any breakpoint, and the sizes step
 * up and down so they sit at different apparent depths — the low ones are the
 * largest and read as nearest the camera.
 *
 * They also stay out of the middle band, where the truck sits: the centre of
 * the plate from roughly 20%–80% across and 30%–70% down belongs to the
 * vehicle, so markers hug the edges or clear the roof.
 *
 * Each entry keeps to ONE horizontal anchor across breakpoints (all `left-*`
 * or all `right-*`). Mixing them leaves the mobile side still applying at `lg`,
 * where with a fixed width the `left` silently wins.
 */
const pinPositions = [
    {
        // Near-left, low — largest, so it reads closest to camera
        className: 'left-[17%] top-[10%] lg:left-[6%] lg:top-[34%]',
        size: 'w-[64px] h-[64px] lg:w-[82px] lg:h-[82px]',
    },
    {
        // Upper-left, clearing the trailer roof
        className: 'left-[36%] top-[22%] lg:left-[19%] lg:top-[18%]',
        size: 'w-[52px] h-[52px] lg:w-[64px] lg:h-[64px]',
    },
    {
        // Right, mid-height — smallest of the right pair, sits furthest back
        className: 'right-[8%] top-[30%] lg:right-[14%] 2xl:right-[20%] 3xl:right-[25%] lg:top-[33%]',
        size: 'w-[56px] h-[56px] lg:w-[70px] lg:h-[70px]',
    },
    {
        // Far-right, low
        className: 'right-[32%] top-[30%] lg:right-[5%] 2xl:right-[7%] 3xl:right-[10%] lg:top-[44%]',
        size: 'w-[60px] h-[60px] lg:w-[76px] lg:h-[76px]',
    },
    {
        // Left flank, below the cab line
        className: 'left-[23%] top-[29%] lg:left-[15%] lg:top-[42%]',
        size: 'w-[58px] h-[58px] lg:w-[74px] lg:h-[74px]',
    },
    {
        // High and inboard — well above the trailer roof, so it can sit over
        // the centre without landing on the vehicle
        className: 'left-[62%] top-[24%] lg:left-[30%] lg:top-[8%]',
        size: 'w-[46px] h-[46px] lg:w-[56px] lg:h-[56px]',
    },
    {
        // High right, mirroring the one above — smallest pair, furthest back
        className: 'right-[10%] top-[17%] lg:right-[26%] 2xl:right-[30%] 3xl:right-[44%] lg:top-[20%]',
        size: 'w-[50px] h-[50px] lg:w-[60px] lg:h-[60px]',
    },
    {
        // High right, mirroring the one above — smallest pair, furthest back
        className: 'right-[14%] top-[40%] lg:right-[26%] 2xl:right-[30%] 3xl:right-[24%] lg:top-[20%]',
        size: 'w-[50px] h-[50px] lg:w-[60px] lg:h-[60px]',
    },
    {
        // Right flank, low
        className: 'right-[80%] top-[30%] lg:right-[9%] 2xl:right-[12%] 3xl:right-[10%] lg:top-[20%]',
        size: 'w-[62px] h-[62px] lg:w-[78px] lg:h-[78px]',
    },
    {
        // Far-left, upper — tucked into the corner
        className: 'left-[4%] top-[14%] lg:left-[3%] lg:top-[21%]',
        size: 'w-[48px] h-[48px] lg:w-[58px] lg:h-[58px]',
    }

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
    const signalRef = useRef<HTMLDivElement>(null);
    const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
    const statsBarRef = useRef<HTMLDivElement>(null);
    /* The stats panel is two screens wide on mobile (4 cards × 50vw) but only
       ~98vw is visible, and `globals.css` hides every scrollbar in the app — so
       without these there is no signal at all that the row moves. `railRef` is
       the element that actually scrolls; the cues live OUTSIDE it, on the panel,
       or they would slide away with the cards they are advertising. */
    const railRef = useRef<HTMLDivElement>(null);
    const fadeLeftRef = useRef<HTMLDivElement>(null);
    const fadeRightRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLSpanElement>(null);
    const nudgedRef = useRef(false);
    const sub1Ref = useRef<HTMLDivElement>(null);
    const sub2Ref = useRef<HTMLDivElement>(null);
    const sub3Ref = useRef<HTMLDivElement>(null);

    // Illustrative dashboard figures — static, not live fleet data.
    const [impressionsCount] = useState(3.45);
    const [mileageCount] = useState(12563);
    const [trucksCount] = useState(48);
    const [campaignsCount] = useState(7);


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
            // Broadcast origin is the GPS puck (bottom-left of the arc svg), so
            // the deploy scale grows out of the roof rather than from mid-air.
            gsap.set(signalRef.current, { autoAlpha: 0, scale: 0.4, transformOrigin: '25% 81%' });
            gsap.set(pinRefs.current.filter(Boolean), { autoAlpha: 0, scale: 0.3, y: 20 });
            gsap.set(statsBarRef.current, { autoAlpha: 0, y: 40 });
            gsap.set([sub2Ref.current, sub3Ref.current], { autoAlpha: 0 });
            gsap.set(sub1Ref.current, { autoAlpha: 1 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    /* Starts the instant the section's top touches the viewport
                       BOTTOM, not when it reaches the top. The previous section
                       is a 250vh parent around a 100vh sticky child, so its last
                       100vh is that panel scrolling out — and this section is
                       sliding up underneath it for that whole stretch. Waiting
                       for 'top top' meant the timeline sat at progress 0 through
                       all of it: an empty cream panel filling the screen with
                       nothing but the step-01 subtitle riding along at its foot.
                       Beginning on entry means the wrap step is already playing
                       as the previous panel leaves, and the two moves read as
                       one continuous hand-off. */
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: 1,
                    // NO pin — the sticky child holds the visual in place.
                },
            });

            // ── STEP 1 SEQUENCE ──
            // 1. Truck moves from left to right into center position AND studio background wipes up from bottom
            tl.to(truckWrapRef.current, { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
                .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, "<")
                .to(studioRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, "<");

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

            // ── STEP 2 — signal + the pins reveal together on scroll ────────
            // The GPS unit deploys at the same beat as the first pin, so the
            // broadcast and the map answers read as one event.
            tl.to(signalRef.current, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.8)' }, 1.85);

            /* The step is derived from the pin COUNT rather than being a fixed
               0.2 per pin: the whole set has to be up before the exit beat at
               2.65, and a fixed step meant adding markers silently pushed the
               last ones past it — they would have popped in already fading. */
            const livePins = pinRefs.current.filter(Boolean) as HTMLDivElement[];
            const PIN_IN_START = 1.85;
            const PIN_IN_DURATION = 0.3;
            const PIN_ALL_IN_BY = 2.55;
            const lastStart = PIN_ALL_IN_BY - PIN_IN_DURATION;
            const step = livePins.length > 1 ? (lastStart - PIN_IN_START) / (livePins.length - 1) : 0;

            livePins.forEach((pin, index) => {
                tl.to(pin, {
                    autoAlpha: 1,
                    scale: 1,
                    y: 0,
                    duration: PIN_IN_DURATION,
                    ease: 'back.out(1.8)',
                }, PIN_IN_START + index * step);
            });

            // ── TRANSITION 2 → 3 ──
            // 1. Pins fade out and truck WITH banner moves right out of screen
            pinRefs.current.forEach((pin) => {
                if (pin) {
                    tl.to(pin, { autoAlpha: 0, scale: 0.5, duration: 0.3 }, 2.65);
                }
            });
            // Signal leaves on the pins' beat. The truck wrapper fades a moment
            // later anyway, but tying it to the pins keeps the pair in lockstep
            // if either exit is ever retimed.
            tl.to(signalRef.current, { autoAlpha: 0, scale: 0.5, duration: 0.3 }, 2.65);
            tl.to(truckWrapRef.current, { xPercent: 160, autoAlpha: 0, duration: 0.75, ease: 'power2.in' }, 2.65);

            // 2. THEN: Background changes from city.png to stats.png, stats bar reveals & subtitle updates
            tl.to(urbanRef.current, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut' }, 3.3)
                .to(statsRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power1.inOut' }, 3.3)
                .to(statsBarRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 3.4)
                .to(sub2Ref.current, { autoAlpha: 0, duration: 0.3 }, 3.3)
                .to(sub3Ref.current, { autoAlpha: 1, duration: 0.5 }, 3.5);

            /* 3. A single nudge once the panel has settled — the cheapest way to
                  show a rail moves is to move it. Fires from the timeline so it
                  cannot happen while the panel is still invisible, and guards on
                  a ref because a scrubbed `.call()` runs again every time the
                  playhead crosses it, in either direction. */
            tl.call(
                () => {
                    const rail = railRef.current;
                    if (nudgedRef.current || !rail) return;
                    if (rail.scrollWidth - rail.clientWidth < 8) return;
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    nudgedRef.current = true;
                    /* `scrollLeft` is a plain settable number on the element, so
                       this needs no ScrollToPlugin. */
                    gsap.to(rail, {
                        scrollLeft: 30,
                        duration: 0.4,
                        ease: 'power2.inOut',
                        yoyo: true,
                        repeat: 1,
                    });
                },
                undefined,
                3.9,
            );
        },
        { scope: rootRef }
    );

    /**
     * Keeps the swipe cues honest about where the rail actually is.
     *
     * Written straight to the DOM rather than held in state: this runs on every
     * scroll event of a touch drag, and re-rendering a section that is already
     * driving a scrubbed GSAP timeline on the same frames is how a smooth swipe
     * turns into a stuttering one. Nothing here needs to participate in React's
     * render at all.
     *
     * The measurement lives in a ResizeObserver rather than a direct call so the
     * first sync arrives in the observer's own callback — that keeps the initial
     * paint correct without a setState (or a layout read) in the effect body,
     * and it re-measures for free when the breakpoint or the panel width moves.
     */
    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;

        const sync = () => {
            const max = rail.scrollWidth - rail.clientWidth;
            /* A couple of px of slack: sub-pixel layout rounding leaves a
               non-zero `max` on desktop, where nothing actually scrolls. */
            const scrollable = max > 4;
            const p = scrollable ? rail.scrollLeft / max : 0;

            /* Both edges ramp over the first/last ~17% of travel, so the cue
               reads as "there is more that way" rather than blinking off the
               moment the rail leaves its rest position. */
            if (fadeLeftRef.current) {
                fadeLeftRef.current.style.opacity = scrollable ? String(Math.min(p * 6, 1)) : '0';
            }
            if (fadeRightRef.current) {
                fadeRightRef.current.style.opacity = scrollable ? String(Math.min((1 - p) * 6, 1)) : '0';
            }
            if (trackRef.current) {
                trackRef.current.style.opacity = scrollable ? '1' : '0';
            }

            if (thumbRef.current && scrollable) {
                /* The thumb is sized to the visible share of the rail, so it
                   doubles as a "how much is there" indicator — with a floor so
                   it never shrinks into an invisible sliver. */
                const w = Math.max(rail.clientWidth / rail.scrollWidth, 0.18);
                thumbRef.current.style.width = `${w * 100}%`;
                /* translateX percentages resolve against the THUMB's own width,
                   not the track's — hence the ratio rather than a bare `p`. */
                thumbRef.current.style.transform = `translateX(${(p * (1 - w) / w) * 100}%)`;
            }
        };

        /* The written hint has done its job the moment a finger lands, so it
           retires on first touch rather than on first scroll — that way the
           nudge below cannot dismiss its own prompt. */
        const retireHint = () => {
            if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.25 });
            rail.removeEventListener('pointerdown', retireHint);
        };

        rail.addEventListener('scroll', sync, { passive: true });
        rail.addEventListener('pointerdown', retireHint, { passive: true });
        const ro = new ResizeObserver(sync);
        ro.observe(rail);

        return () => {
            rail.removeEventListener('scroll', sync);
            rail.removeEventListener('pointerdown', retireHint);
            ro.disconnect();
        };
    }, []);

    return (
        /* 400vh, down from 500vh. The trigger now spans 'top bottom' → 'bottom
           bottom', which is the section's full height — where it used to span
           'top top' → 'bottom bottom', i.e. height minus one viewport. Keeping
           500vh would have stretched the same 4-unit timeline over 500vh of
           scroll and made every step 25% slower; 400vh reclaims the dead
           viewport instead, so the choreography keeps exactly the pace it had. */
        <section ref={rootRef} className="relative h-[400vh] w-full bg-[#EEE8D9]">
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
                /* GPS broadcast arcs — pulse outward in sequence, like a live ping. */
                @keyframes aw-sig {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                .aw-sig { animation: aw-sig 1.6s ease-in-out infinite; }
                .aw-sig-2 { animation-delay: 0.25s; }
                .aw-sig-3 { animation-delay: 0.5s; }
                @media (prefers-reduced-motion: reduce) { .aw-sig { animation: none; opacity: 1; } }
                /* Terminal caret, same device the Hero closes its headline with. */
                @keyframes aw-caret { 0%,45% { opacity: 1; } 55%,100% { opacity: 0; } }
                .aw-caret { animation: aw-caret 1.05s steps(1) infinite; }
                @media (prefers-reduced-motion: reduce) { .aw-caret { animation: none; } }
            `}</style>

            {/* Sticky visual stage (no gsap pin) */}
            <div className="sticky top-[7%] lg:top-[8%] h-screen w-full overflow-hidden">

                {/* HEADING — built on the Hero's tier system: a small tracked label
                    over an oversized uppercase line, cream on a darkened plate, with
                    the accent carried by the full stop. No theme colours here — this
                    sits on photography, not on the page ground. */}
                <div className="relative z-30 flex w-full flex-col items-center justify-center px-6 pointer-events-none mt-[30px] 2xl:mt-[10px]">
                    <div ref={headingRef} className="flex flex-col items-center">
                        <span className="font-tommy-regular text-[10px] uppercase tracking-[0.34em] text-[#FCD119] md:text-[12px]">
                            The Process
                        </span>
                        <h2 className="mt-2 2xl:mt-3 text-center font-tommy-bold uppercase leading-[0.98] tracking-[-0.015em] text-[#EEE8D9] text-[clamp(2rem,5.4vw,4.25rem)] md:mt-4">
                            How It Works<span className="text-[#FCD119]">.</span>
                        </h2>
                    </div>
                </div>

                {/* ENVIRONMENT — 1st slide: studio background (clips from bottom to top on entrance) */}
                <div ref={studioRef} className="absolute inset-0 z-0">
                    <Image
                        src="/assets/images/process/studio.png"
                        alt="Studio background"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        loading="lazy"
                    />
                </div>

                {/* ENVIRONMENT — 2nd slide: city background (dissolves in as 1st background dissolves out) */}
                <div ref={urbanRef} className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="/assets/images/process/city.png"
                        alt="City background"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        loading="lazy"
                    />
                </div>

                {/* ENVIRONMENT — 3rd slide: stats background (dissolves in after truck moves out right) */}
                <div ref={statsRef} className="absolute inset-0 z-0 top-[17%] lg:top-0">
                    <Image
                        src="/assets/images/process/stats.png"
                        alt="Stats background"
                        fill
                        sizes="100vw"
                        className="object-contain lg:object-cover object-top"
                        loading="lazy"
                    />
                </div>


                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[30%]"
                    style={{ background: 'linear-gradient(0deg, rgba(8,8,10,0.62) 0%, rgba(8,8,10,0.34) 42%, rgba(8,8,10,0) 100%)' }}
                />

                {/* Map markers — see `pinPositions` for the placement rules */}
                {pinPositions.map((pin, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            pinRefs.current[index] = el;
                        }}
                        className={`absolute z-20 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${pin.size} ${pin.className}`}
                    >
                        <Image
                            src="/assets/images/process/circle.png"
                            alt="Circle background"
                            width={82}
                            height={82}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            loading="lazy"
                        />

                        <Image
                            src="/assets/images/process/pin.gif"
                            alt="Pin animation"
                            width={40}
                            height={40}
                            /* Half the container rather than a fixed pixel size, so the
                               icon keeps its proportion as the marker sizes vary. */
                            className="w-1/2 h-1/2 object-contain relative z-10 pointer-events-none"
                            loading="lazy"
                        />
                    </div>
                ))}

                {/* TRUCK — enters from left, centre stage */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div ref={truckWrapRef} className="relative w-full md:w-[70vw] lg:w-[40vw] 2xl:w-[40vw] lg:max-w-[1120px] top-[5%] md:top-[12%] lg:top-[3%] xl:top-0">
                        <Image
                            src="/assets/images/process/truck.png"
                            alt="Advertising Wheels truck"
                            width={1120}
                            height={800}
                            className="w-full h-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.35)]"
                            loading="lazy"
                        />

                        {/* Banner image (the brand creative) that aligns and snaps onto the truck body */}
                        <div
                            ref={bannerRef}
                            className="absolute left-[5.4%] top-[11%] w-[62.9%] h-[58%] rounded-[4px] overflow-hidden shadow-2xl pointer-events-none"
                        >
                            <Image
                                src="/assets/images/process/banner.jpg"
                                alt="Brand creative banner"
                                fill
                                sizes="(max-width: 768px) 85vw, 600px"
                                className="object-cover"
                                loading="lazy"
                            />
                        </div>

                        {/* GPS signal — a puck on the box's front-top corner (~69% across,
                            ~9% down truck.png) broadcasting arcs into the sky. Lives inside
                            the truck wrapper so it rides in, holds and exits with the
                            vehicle; the timeline reveals it as the route step begins. */}
                        <div ref={signalRef} className="pointer-events-none absolute left-[65%] top-[-22%] z-20 w-[16%]">
                            <svg viewBox="0 0 64 64" className="h-auto w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]" aria-hidden="true">
                                {/* Broadcast arcs — up-right quadrant, pulsing outward */}
                                <g fill="none" stroke="#FCD119" strokeWidth="3.5" strokeLinecap="round">
                                    <path className="aw-sig" d="M 16 39 A 13 13 0 0 1 29 52" />
                                    <path className="aw-sig aw-sig-2" d="M 16 29 A 23 23 0 0 1 39 52" />
                                    <path className="aw-sig aw-sig-3" d="M 16 19 A 33 33 0 0 1 49 52" />
                                </g>
                                {/* The GPS puck itself */}
                                <circle cx="16" cy="52" r="5" fill="#FCD119" stroke="#1A1917" strokeWidth="1.5" />
                                <circle cx="16" cy="52" r="1.8" fill="#1A1917" />
                            </svg>
                        </div>

                        {/* Quality-verified badge on the body */}
                        <div ref={badgeRef} className="aw-badge absolute right-0 md:right-[11%] lg:right-[-9%] xl:right-[2%] 2xl:right-[16%] top-[18%] md:top-[20%] lg:top-[14%] xl:top-[24%] 2xl:top-[30%] flex items-center gap-1 md:gap-2 rounded-full bg-[#1A1917]/90 backdrop-blur px-3 lg:px-4 py-1 md:py-2 border border-[#FCD119]/40 z-20">
                            <span className="flex items-center justify-center w-3 md:w-4 lg:w-5 h-3 md:h-4 lg:h-5 rounded-full bg-[#FCD119] text-[#1A1917] text-[10px] md:text-[12px] font-bold">✓</span>
                            <span className="text-[#FCD119] text-[10px] md:text-[13px] font-tommy-medium whitespace-nowrap">Quality Verified</span>
                        </div>
                    </div>
                </div>

                {/* STATS BAR — appears with stats.png, positioned bottom of screen above subtitle text */}
                <div
                    ref={statsBarRef}
                    /* `overflow-hidden`, not `overflow-scroll`: the scrolling has
                       moved to the rail below so this shell can hold the swipe
                       cues still while the cards slide underneath them. */
                    className="absolute top-[44%] lg:top-0 lg:bottom-[20%] left-1/2 -translate-x-1/2 w-[98%] lg:w-[92%] lg:max-w-[1240px] z-30 bg-white/95 backdrop-blur-md rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100 px-2 py-4 lg:p-4  pointer-events-auto overflow-hidden"
                >
                    {/* These figures are illustrative, not live fleet data — the
                        counters below drift on a timer. Labelling the panel keeps
                        its campaign-scale truck count from reading as a claim
                        about the size of the fleet. */}
                    <p className="mb-3 px-2 md:px-5 text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 uppercase text-center lg:text-left text-center">
                        Sample campaign dashboard
                    </p>

                    <div className="relative">
                        <div
                            ref={railRef}
                            role="region"
                            aria-label="Sample campaign metrics"
                            tabIndex={0}
                            className="overflow-x-auto overflow-y-hidden lg:overflow-visible outline-none"
                        >
                            <div className="grid grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 gap-y-2 md:gap-y-4 lg:gap-y-0 w-max lg:w-auto">
                                {/* Item 1: TOTAL IMPRESSIONS */}
                                <div className="flex flex-col justify-between lg:pr-3 md:px-5 first:pl-0 w-[50vw] lg:w-auto">
                                    <div className="flex flex-col lg:flex-row items-center gap-2 md:gap-3">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 uppercase text-center lg:text-left">TOTAL IMPRESSIONS</span>
                                            <div className="flex items-center lg:items-baseline gap-1.5 md:gap-2 justify-center lg:justify-left">
                                                <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black">
                                                    {impressionsCount.toFixed(2)}M
                                                </span>
                                                <span className="text-[11px] md:text-[12px] font-tommy-medium text-black whitespace-nowrap">
                                                    ↑ 12.5%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Sparkline Graph */}
                                    <svg className="w-full h-5 lg:mt-2" viewBox="0 0 100 25" fill="none">
                                        <path d="M0 20 Q 20 18, 35 10 T 70 16 T 100 4" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>

                                {/* Item 2: TOTAL MILEAGE */}
                                <div className="flex flex-col justify-between xl:pr-3 px-3 md:px-2 xl:px-5 pt-0 w-[50vw] lg:w-auto">
                                    <div className="flex flex-col lg:flex-row items-center gap-3">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 uppercase text-center lg:text-left">TOTAL MILEAGE</span>
                                            <div className="flex items-center lg:items-baseline gap-1.5 md:gap-2 justify-center lg:justify-left">
                                                <span className="text-[16px] text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black">
                                                    {mileageCount.toLocaleString()} <span className="text-[15px] md:text-[18px] font-tommy-medium">miles</span>
                                                </span>
                                                <span className="text-[11px] md:text-[12px] font-tommy-medium text-black whitespace-nowrap">
                                                    ↑ 8.3%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Sparkline Graph */}
                                    <svg className="w-full h-5 lg:mt-2" viewBox="0 0 100 25" fill="none">
                                        <path d="M0 18 Q 25 22, 45 12 T 75 14 T 100 6" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>

                                {/* Item 3: ACTIVE TRUCKS */}
                                <div className="flex flex-col justify-between xl:pr-3 lg:px-3 xl:px-5 pt-0 w-[50vw] lg:w-auto">
                                    <div className="flex flex-col lg:flex-row items-center gap-3">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 uppercase text-center lg:text-left">ACTIVE TRUCKS</span>
                                            <div className="flex items-center lg:items-baseline gap-1.5 md:gap-2 justify-center lg:justify-left">
                                                <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black">
                                                    {trucksCount}
                                                </span>
                                                <span className="text-[11px] md:text-[12px] font-tommy-medium text-black whitespace-nowrap">
                                                    ↑ 5.2%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Sparkline Graph */}
                                    <svg className="w-full h-5 lg:mt-2" viewBox="0 0 100 25" fill="none">
                                        <path d="M0 22 Q 30 14, 50 16 T 80 8 T 100 5" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>

                                {/* Item 4: ACTIVE CAMPAIGNS */}
                                <div className="flex flex-col justify-between md:pl-5">
                                    <div className="flex flex-col lg:flex-row items-center gap-2 md:gap-3 w-[50vw] lg:w-auto">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FCD119] flex items-center justify-center shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 11c0-1.33-.52-2.54-1.37-3.45L19 5l-1.5-1.5-2.52 2.52C13.97 5.37 12.54 5 11 5c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.54 0 2.97-.37 4-1.02L17.52 20.5 19 19l-2.37-2.55C17.48 13.54 18 12.33 18 11zm-7 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-[11px] font-tommy-bold tracking-wider text-gray-500 uppercase text-center lg:text-left">ACTIVE CAMPAIGNS</span>
                                            <div className="flex items-center lg:items-baseline gap-1.5 md:gap-2 justify-center lg:justify-left">
                                                <span className="text-[16px] md:text-[clamp(1.125rem,1.8vw,1.625rem)] font-tommy-bold leading-tight text-black">
                                                    {campaignsCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Sparkline Graph */}
                                    <svg className="w-full h-5 lg:mt-2" viewBox="0 0 100 25" fill="none">
                                        <path d="M0 20 Q 20 22, 40 14 T 70 8 T 100 4" stroke="#FCD119" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Edge fades — the primary "there is more this way" cue, and
                        the only one that survives being glanced at. They sit on
                        the shell, over the rail, so they hold their edge while
                        the cards move. Opacity is written by the scroll handler;
                        the inline value is just the at-rest starting point. */}
                        <div
                            ref={fadeLeftRef}
                            aria-hidden="true"
                            style={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/95 to-white/0 lg:hidden"
                        />
                        <div
                            ref={fadeRightRef}
                            aria-hidden="true"
                            style={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/95 to-white/0 lg:hidden"
                        />
                    </div>

                    {/* Position + written prompt. The track stands in for the
                        scrollbar this app hides globally (see `globals.css`), and
                        the thumb's WIDTH reports how much of the rail is on screen
                        — so it answers "how much more" as well as "where". */}
                    <div aria-hidden="true" className="mt-2.5 flex items-center justify-center gap-2.5 lg:hidden">
                        <div
                            ref={trackRef}
                            style={{ opacity: 0 }}
                            className="h-[3px] w-14 rounded-full bg-gray-200 overflow-hidden transition-opacity duration-200"
                        >
                            <div ref={thumbRef} className="h-full w-1/2 rounded-full bg-[#FCD119]" />
                        </div>
                        <span
                            ref={hintRef}
                            className="font-tommy-regular text-[9px] uppercase tracking-[0.22em] text-gray-400"
                        >
                            Swipe →
                        </span>
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
                            <span className={SUB_LABEL}>02 — Match</span>
                            <p className={SUB_TYPE}>
                                Matched to fleets covering your <span className={SUB_ACCENT}>target ZIPs.</span>
                                <span aria-hidden="true" className={SUB_CARET} />
                            </p>
                        </div>
                        <div ref={sub3Ref} className="flex flex-col items-center pt-5 justify-center">
                            <span className={SUB_LABEL}>03 — Measure</span>
                            <p className={SUB_TYPE}>
                                Measured by <span className={SUB_ACCENT}>StreetMetrics.</span>
                                <span aria-hidden="true" className={SUB_CARET} />
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
