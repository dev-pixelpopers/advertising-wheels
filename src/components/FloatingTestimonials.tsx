'use client';

/**
 * FloatingTestimonials — cinematic "Floating Scatter Testimonial Matrix".
 *
 * A pinned, scroll-scrubbed section (300vh of scroll depth) where nine
 * glassmorphic testimonial cards drift upward through the viewport in
 * three staggered waves, floating under and over a static glass title
 * locked to the centre of the screen.
 *
 * Performance notes:
 *   - All movement uses GSAP `y` / `rotation` transforms (GPU-composited)
 *     — never `top`, so the scroll scrub stays at a locked 60fps.
 *   - `will-change: transform` + force3D promote each card to its own layer.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Mock testimonial data                                              */
/* ------------------------------------------------------------------ */

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    /** Accent used for the logo block + name highlight. */
    accent: string;
    /** Scatter-map position (viewport %) — lanes chosen to never overlap
     *  within the same wave. */
    left: string;
    top: string;
    /** Static tilt + drift direction for organic motion. */
    rotate: number;
    /** z-10 drifts under the pinned title, z-30 drifts over it. */
    z: 'z-10' | 'z-30';
}

const TESTIMONIALS: Testimonial[] = [
    /* ---- Wave 1 -------------------------------------------------- */
    {
        name: 'Marcus Chen',
        role: 'CMO',
        company: 'Vertex Retail',
        quote: 'Our brand rolled through five states in a week. Foot traffic in new markets jumped 34% — nothing else in our media mix comes close.',
        accent: '#FCD119',
        left: '4%',
        top: '8%',
        rotate: -5,
        z: 'z-10',
    },
    {
        name: 'Alicia Romero',
        role: 'Brand Director',
        company: 'Halo Beverages',
        quote: 'The trucks became the campaign. People were posting them on socials before our launch ads even went live.',
        accent: '#7dd3fc',
        left: '38%',
        top: '52%',
        rotate: 3,
        z: 'z-30',
    },
    {
        name: 'David Okafor',
        role: 'Founder',
        company: 'Northbound Coffee',
        quote: 'A single wrapped fleet outperformed our entire paid-social budget on cost per impression. We re-signed for a full year.',
        accent: '#f9a8d4',
        left: '70%',
        top: '16%',
        rotate: 6,
        z: 'z-10',
    },
    /* ---- Wave 2 -------------------------------------------------- */
    {
        name: 'Priya Natarajan',
        role: 'VP of Growth',
        company: 'Loop Fitness',
        quote: 'We tracked a 4.1x lift in branded search in every corridor the fleet covered. The reporting made the board meeting easy.',
        accent: '#86efac',
        left: '6%',
        top: '46%',
        rotate: 4,
        z: 'z-30',
    },
    {
        name: 'Tom Whitfield',
        role: 'Marketing Lead',
        company: 'Summit Outdoors',
        quote: 'Highway miles turned into brand miles. Our dealers started calling to ask which agency did the wraps.',
        accent: '#FCD119',
        left: '40%',
        top: '6%',
        rotate: -3,
        z: 'z-10',
    },
    {
        name: 'Sofia Marino',
        role: 'Head of Comms',
        company: 'Brightline Bank',
        quote: 'Premium creative, spotless execution, zero downtime. It felt less like buying media and more like adding a moving flagship store.',
        accent: '#c4b5fd',
        left: '72%',
        top: '55%',
        rotate: -6,
        z: 'z-30',
    },
    /* ---- Wave 3 -------------------------------------------------- */
    {
        name: 'James Park',
        role: 'CEO',
        company: 'Atlas Logistics',
        quote: 'We wrapped twelve trailers with them. Recruitment applications doubled — drivers wanted to be seen in those trucks.',
        accent: '#fda4af',
        left: '5%',
        top: '14%',
        rotate: 5,
        z: 'z-30',
    },
    {
        name: 'Emma Lindqvist',
        role: 'Creative Director',
        company: 'Studio Nord',
        quote: 'The only OOH partner that treated our artwork like art. Colour-matched to the millimetre, even on curved panels.',
        accent: '#FCD119',
        left: '39%',
        top: '58%',
        rotate: -4,
        z: 'z-10',
    },
    {
        name: 'Rashid Al-Amin',
        role: 'Performance Manager',
        company: 'Nova Energy',
        quote: 'From contract to first mile in nine days. Coverage dashboards updated daily. This is how outdoor should work.',
        accent: '#7dd3fc',
        left: '71%',
        top: '10%',
        rotate: 3,
        z: 'z-30',
    },
];

/* Timeline windows for the three waves (fractions of the scrub). */
const WAVES: { start: number; duration: number }[] = [
    { start: 0.0, duration: 0.35 },
    { start: 0.33, duration: 0.35 },
    { start: 0.66, duration: 0.34 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FloatingTestimonials() {
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const cards = gsap.utils.toArray<HTMLElement>('[data-scatter-card]');

            // Park every card below the fold before the pin engages.
            gsap.set(cards, { y: '110vh', force3D: true });

            // One master timeline scrubbed across the full 300vh of scroll.
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: stageRef.current,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            // Three waves of three cards, each sweeping bottom → top through
            // its own slice of the timeline. A tiny intra-wave stagger keeps
            // cards from moving in visual lock-step.
            WAVES.forEach((wave, w) => {
                const waveCards = cards.slice(w * 3, w * 3 + 3);
                waveCards.forEach((card, i) => {
                    tl.fromTo(
                        card,
                        { y: '110vh', rotation: Number(card.dataset.rotate) },
                        {
                            y: '-110vh',
                            // Drift the tilt the opposite way mid-flight.
                            rotation: -Number(card.dataset.rotate),
                            duration: wave.duration - i * 0.02,
                            force3D: true,
                        },
                        wave.start + i * 0.02
                    );
                });
            });

            // Title: settle in as the first wave rises, sit for the ride.
            tl.from(
                '[data-scatter-title]',
                { scale: 0.9, autoAlpha: 0, duration: 0.08, ease: 'power2.out' },
                0
            );
        },
        { scope: rootRef }
    );

    return (
        /* Outer wrapper: 300vh of scroll depth for the scrub. */
        <div ref={rootRef} className="relative h-[300vh] w-full bg-[#0A0A0A]">
            {/* Pinned full-screen stage */}
            <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
                {/* Soft ambient glow so the glass cards have something to blur */}
                <div className="pointer-events-none absolute left-[15%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-[#FCD119]/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[15%] right-[10%] h-[45vh] w-[45vh] rounded-full bg-[#7dd3fc]/10 blur-[130px]" />

                {/* ------------------------------------------------ */}
                {/* Static centre title (cards drift under AND over)  */}
                {/* ------------------------------------------------ */}
                <div
                    data-scatter-title
                    className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-black/40 px-8 py-4 backdrop-blur-md"
                >
                    <h2 className="whitespace-nowrap text-center font-tommy-bold text-2xl font-black text-white md:text-5xl">
                        What Our Customers
                        <br className="md:hidden" /> Are Saying
                        <span className="text-[#FCD119]">.</span>
                    </h2>
                </div>

                {/* ------------------------------------------------ */}
                {/* The scatter matrix — 9 drifting glass cards       */}
                {/* ------------------------------------------------ */}
                {TESTIMONIALS.map((t, i) => (
                    <article
                        key={i}
                        data-scatter-card
                        data-rotate={t.rotate}
                        style={{ left: t.left, top: t.top }}
                        className={`absolute ${t.z} w-[78vw] max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg will-change-transform md:w-auto`}
                    >
                        {/* Header row: logo placeholder + identity */}
                        <div className="mb-4 flex items-center gap-3">
                            {/* Company logo placeholder — initials block */}
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-tommy-bold text-sm text-black"
                                style={{ backgroundColor: t.accent }}
                                aria-hidden="true"
                            >
                                {t.company
                                    .split(' ')
                                    .map((w) => w[0])
                                    .join('')
                                    .slice(0, 2)}
                            </div>
                            <div>
                                <p className="font-tommy-medium text-[15px] leading-tight" style={{ color: t.accent }}>
                                    {t.name}
                                </p>
                                <p className="font-tommy-regular text-[12px] text-gray-400">
                                    {t.role} · {t.company}
                                </p>
                            </div>
                        </div>
                        {/* Quote */}
                        <blockquote className="font-tommy-regular text-[14px] leading-[1.65] text-white/85">
                            &ldquo;{t.quote}&rdquo;
                        </blockquote>
                    </article>
                ))}

                {/* Edge fades so cards materialise softly instead of popping */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            </div>
        </div>
    );
}
