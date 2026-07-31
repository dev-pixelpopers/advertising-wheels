'use client';

/**
 * Vendors — the fleet-partner pitch (for truck / trailer owners who want to
 * earn from the miles they already drive).
 *
 * Flow: hero → benefits grid → a vertical timeline whose line draws in on
 * scroll (signature) → requirements checklist → animated network stats → a
 * vendor-specific closer + footer.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, CountUp, Eyebrow, Dot, ArrowIcon } from '@/components/site/primitives';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const BENEFITS = [
    { k: 'Earn from miles you already drive', d: 'Your trucks are on the road regardless. A wrap turns those routine miles into a second, passive revenue stream — no new stops, no detours.', icon: 'M3 13l2-7h11l3 4h2v5h-2M5 13H3v3h2m0-3a2 2 0 104 0m10 0a2 2 0 10-4 0' },
    { k: 'We bring the campaigns', d: 'Our sales team lands the national and local advertisers. You never have to chase a brand or negotiate a rate — the bookings come to you.', icon: 'M3 3v18h18M7 15l4-5 3 3 5-7' },
    { k: 'Creative, print & install on us', d: 'Design, premium cast vinyl and professional installation are all handled in-house. Your truck comes back wrapped, inspected and ready to earn.', icon: 'M15 5l4 4M3 21l1.2-4.4a2 2 0 01.5-.9l9.4-9.4a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8l-9.4 9.4a2 2 0 01-.9.5L3 21z' },
    { k: 'Keep control of your fleet', d: 'You keep driving your routes, your schedule and your business. We just add advertising revenue on top of the operation you already run.', icon: 'M12 21s-7-6.3-7-11a7 7 0 1114 0c0 4.7-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
];

const STEPS = [
    { step: 'Apply', body: 'Tell us about your vehicles, the markets you cover and the routes you run. It takes a few minutes and there’s no commitment.' },
    { step: 'Qualify', body: 'We confirm your trucks, coverage and insurance, then match you to campaigns that fit your footprint and mileage.' },
    { step: 'Wrap & roll', body: 'Bring your truck in — our studio wraps and inspects it, and you’re back on your normal routes, now earning.' },
    { step: 'Get paid', body: 'You’re paid on a clear, recurring schedule for as long as the campaign flies, with GPS mileage backing every invoice.' },
];

const REQUIREMENTS = [
    'Box trucks, straight trucks or dry-van trailers',
    'Clean, undamaged panels suitable for wrapping',
    'Active commercial auto insurance',
    'Regular routes in one or more of our 50 markets',
    'Consistent weekly mileage and road time',
    'Willingness to keep the wrap on for the flight',
];

const NETWORK_STATS = [
    { el: <CountUp value={300} suffix="+" />, label: 'Trucks in the network' },
    { el: <CountUp value={50} />, label: 'Markets covered' },
    { el: <CountUp value={24} suffix="/7" />, label: 'Routing & support' },
    { el: <CountUp value={7} />, label: 'Days to first wrap' },
];

/* ------------------------------------------------------------------ */
/*  Benefits                                                           */
/* ------------------------------------------------------------------ */

function Benefits() {
    return (
        <section className="w-full bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1200px] px-6 md:px-12">
                <Reveal className="max-w-[760px]" y={30}>
                    <Eyebrow>Why partner</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                        Your fleet, a second income<Dot />
                    </h2>
                </Reveal>
                <Reveal className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2" y={48} stagger={0.14}>
                    {BENEFITS.map((b) => (
                        <div
                            key={b.k}
                            className="rounded-[20px] border border-black/10 bg-white/40 p-8 transition-colors duration-300 hover:border-[#C8992B]/40 md:p-10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#FCD119]/30"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d={b.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <h3 className="mt-7 font-tommy-bold text-[23px] leading-tight tracking-tight text-[#1A1917] md:text-[27px] dark:text-white">
                                {b.k}
                            </h3>
                            <p className="mt-4 font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] md:text-[16px] dark:text-[#A8A399]">
                                {b.d}
                            </p>
                        </div>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Vertical drawing-line timeline                                     */
/* ------------------------------------------------------------------ */

function Steps() {
    const rootRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from(lineRef.current, {
                scaleY: 0,
                transformOrigin: 'top center',
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top 60%', end: 'bottom 75%', scrub: 1 },
            });
            gsap.utils.toArray<HTMLElement>('.vstep').forEach((el) => {
                gsap.from(el, {
                    x: -30,
                    autoAlpha: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
                });
            });
        },
        { scope: rootRef }
    );

    return (
        <section className="w-full border-y border-black/10 bg-[#E7E0CE] py-24 text-[#1A1917] transition-colors duration-300 md:py-32 dark:border-white/10 dark:bg-[#141414] dark:text-white">
            <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                <Reveal className="max-w-[720px]" y={30}>
                    <Eyebrow>How partnering works</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight">
                        Four steps to earning<Dot />
                    </h2>
                </Reveal>

                <div ref={rootRef} className="relative mt-16 pl-[70px]">
                    {/* The rail + the line that draws with scroll */}
                    <div className="absolute left-[26px] top-2 bottom-2 w-px bg-black/12 dark:bg-white/12">
                        <div ref={lineRef} className="h-full w-full origin-top bg-[#C8992B] dark:bg-[#FCD119]" />
                    </div>

                    <div className="flex flex-col gap-14">
                        {STEPS.map((s, i) => (
                            <div key={s.step} className="vstep relative">
                                <span className="absolute left-[-70px] flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-[#C8992B] bg-[#E7E0CE] font-tommy-bold text-[20px] text-[#C8992B] dark:border-[#FCD119] dark:bg-[#141414] dark:text-[#FCD119]">
                                    {i + 1}
                                </span>
                                <h3 className="font-tommy-bold text-[26px] tracking-tight md:text-[30px]">{s.step}</h3>
                                <p className="mt-3 max-w-[560px] font-tommy-regular text-[16px] leading-[1.72] text-[#5A554C] dark:text-white/60">
                                    {s.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Requirements                                                       */
/* ------------------------------------------------------------------ */

function Requirements() {
    return (
        <section className="w-full bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <Reveal className="self-start" y={30}>
                    <Eyebrow>What you’ll need</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(30px,3.6vw,52px)] leading-[1.04] tracking-tight text-[#1A1917] dark:text-white">
                        A simple bar to clear<Dot />
                    </h2>
                    <p className="mt-5 max-w-[420px] font-tommy-regular text-[16px] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">
                        If you run road-worthy trucks on regular routes in our markets, you likely already
                        qualify. Here’s the checklist.
                    </p>
                </Reveal>

                <Reveal className="grid grid-cols-1 gap-3 sm:grid-cols-2" y={30} stagger={0.09}>
                    {REQUIREMENTS.map((r) => (
                        <div
                            key={r}
                            className="flex items-start gap-3.5 rounded-2xl border border-black/10 bg-white/40 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]"
                        >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6.5L4.6 9 10 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <p className="font-tommy-regular text-[15px] leading-[1.5] text-[#3A3730] dark:text-[#CFCABF]">{r}</p>
                        </div>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Network stats                                                      */
/* ------------------------------------------------------------------ */

function NetworkStats() {
    return (
        <section className="w-full bg-[#EEE8D9] pb-8 transition-colors duration-300 dark:bg-[#0A0A0A]">
            <Reveal className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-12 px-6 md:px-12 lg:grid-cols-4" y={30} stagger={0.14}>
                {NETWORK_STATS.map((s, i) => (
                    <div key={i} className="border-l border-black/10 pl-6 dark:border-white/10">
                        <p className="font-tommy-bold text-[clamp(40px,5.5vw,72px)] leading-none tracking-tight text-[#1A1917] dark:text-white">
                            {s.el}
                        </p>
                        <p className="mt-3 font-tommy-regular text-[13px] uppercase tracking-[2px] text-[#6F6A60] dark:text-[#9A968E]">
                            {s.label}
                        </p>
                    </div>
                ))}
            </Reveal>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Vendor closer (bespoke — audience is operators, not advertisers)   */
/* ------------------------------------------------------------------ */

function VendorCta() {
    return (
        <section className="w-full bg-[#EEE8D9] py-20 transition-colors duration-300 md:py-28 dark:bg-[#0A0A0A]">
            <Reveal className="mx-auto max-w-[1200px] px-6 md:px-12" self y={40}>
                <div className="relative overflow-hidden rounded-[32px] bg-[#FCD119] px-8 py-16 text-center md:px-14 md:py-24">
                    <div className="pointer-events-none absolute -bottom-[45%] left-1/2 -translate-x-1/2" aria-hidden="true">
                        <svg width="820" height="820" viewBox="0 0 895 895" fill="none">
                            <circle cx="447.5" cy="447.5" r="442.5" stroke="#000" strokeOpacity="0.07" strokeWidth="10" />
                            <circle cx="448" cy="448" r="360" stroke="#000" strokeOpacity="0.05" strokeWidth="10" />
                        </svg>
                    </div>
                    <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center">
                        <p className="font-tommy-regular text-[13px] uppercase tracking-[4px] text-black/60">Become a partner</p>
                        <h2 className="mt-4 font-tommy-bold text-[40px] leading-[0.98] tracking-[-2px] text-black md:text-[76px] md:tracking-[-3px]">
                            Put your fleet to work.
                        </h2>
                        <p className="mt-6 max-w-[520px] font-tommy-regular text-[15px] leading-[1.65] text-black/65 md:text-[17px]">
                            Apply in minutes. If your trucks fit, we’ll match you to campaigns and have you wrapped and
                            earning within a week.
                        </p>
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                            <a href="/contact" className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04]">
                                Apply to partner
                                <ArrowIcon />
                            </a>
                            <a href="/contact" className="rounded-full border-2 border-black px-8 py-4 font-tommy-medium text-[15px] text-black transition-colors duration-300 hover:bg-black hover:text-[#FCD119]">
                                Talk to our team
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VendorsPage() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Fleet Partners"
                title="DRIVE. EARN"
                lead="Own box trucks, trailers or a full fleet? Turn the routes you already run into recurring advertising revenue — we handle the brands, the creative and the install."
                primary={{ label: 'Apply to partner', href: '/contact' }}
                secondary={{ label: 'How it works', href: '#how' }}
                image="/assets/images/process/truck.png"
                imageAlt="An Advertising Wheels partner truck"
            />

            <Benefits />
            <div id="how">
                <Steps />
            </div>
            <Requirements />
            <NetworkStats />
            <VendorCta />
        </main>
    );
}
