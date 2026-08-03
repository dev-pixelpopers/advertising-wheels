'use client';

/**
 * Services — the capability set.
 *
 * Flow: hero → a sticky index that tracks a scrolling stack of capability
 * panels (the signature beat) → a numbered process with a line that draws in →
 * a formats strip → the shared closer + footer.
 */

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import CtaSection from '@/components/CtaSection';
import HorizontalStatement from '@/components/site/HorizontalStatement';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, Eyebrow, Dot, PrimaryLink, GhostLink } from '@/components/site/primitives';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Service {
    tag: string;
    title: string;
    body: string;
    features: string[];
    icon: string;
}

const SERVICES: Service[] = [
    {
        tag: 'Placement',
        title: 'Mobile Billboards',
        body: '600 square feet of uninterrupted brand canvas rolling through rush hour, event crowds and the exact neighbourhoods you want to own. Ten times the efficiency of a static board, at a fraction of the cost.',
        features: ['Full-truck & trailer formats', 'Event & venue domination', 'Neighbourhood-level targeting', 'Day-part scheduling'],
        icon: 'M3 13l2-7h11l3 4h2v5h-2M5 13H3v3h2m0-3a2 2 0 104 0m10 0a2 2 0 10-4 0',
    },
    {
        tag: 'Production',
        title: 'Fleet Wraps & Print',
        body: 'Design, print and installation handled entirely in-house on premium cast vinyl — engineered to read at highway speed and hold colour for the life of the campaign, not just the launch photo.',
        features: ['Cast-vinyl, highway-grade', 'In-house install & QA', 'Colour-matched to brand', 'Wrap longevity reporting'],
        icon: 'M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6L7.9 14 2 9.4h7.6z',
    },
    {
        tag: 'Targeting',
        title: 'GPS Routing & Targeting',
        body: 'Routes are planned around your audience — corridors, dayparts and dwell zones — then tracked live, 24/7. You always know where your spend is, down to the mile.',
        features: ['Audience-led route planning', 'Live 24/7 GPS telemetry', 'Geo-fenced dwell zones', 'Real-time route dashboard'],
        icon: 'M12 21s-7-6.3-7-11a7 7 0 1114 0c0 4.7-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    },
    {
        tag: 'Measurement',
        title: 'Verified Impressions',
        body: 'Reach and frequency are modelled by an independent, audited third party and reported the way digital is — numbers your CMO can defend in the boardroom, not our own marketing claims.',
        features: ['Third-party audited data', 'Reach & frequency modelling', 'Impression-per-flight reporting', 'Post-campaign readouts'],
        icon: 'M3 3v18h18M7 15l4-5 3 3 5-7',
    },
    {
        tag: 'Creative',
        title: 'Creative Studio',
        body: 'A moving canvas needs creative built for it. Our studio designs wraps engineered for distance, motion and glance-value — bold enough to stop traffic and become the post people share.',
        features: ['Highway-first art direction', 'Concept to production art', 'A/B creative for routes', 'Social-ready wrap reveals'],
        icon: 'M15 5l4 4M3 21l1.2-4.4a2 2 0 01.5-.9l9.4-9.4a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8l-9.4 9.4a2 2 0 01-.9.5L3 21z',
    },
    {
        tag: 'Management',
        title: 'Campaign Management',
        body: 'One team from artwork to first highway mile — booking, production, routing, reporting and renewals. You get a single point of contact and a campaign that runs itself.',
        features: ['Single point of contact', 'Artwork-to-road in days', 'Flight & renewal handling', 'Consolidated reporting'],
        icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    },
];

const PROCESS = [
    { step: 'Plan', body: 'We map your audience to real corridors, markets and dayparts, and scope the fleet and flight that hits them.' },
    { step: 'Create', body: 'Our studio designs a wrap built for the highway, then we print and install it in-house with colour-matched QA.' },
    { step: 'Roll', body: 'Trucks hit their routes on schedule, tracked live by GPS so every planned mile is a mile actually driven.' },
    { step: 'Report', body: 'Independently verified impressions, reach and frequency land in a readout you can take straight to the board.' },
];

/* ------------------------------------------------------------------ */
/*  Sticky capability index                                            */
/* ------------------------------------------------------------------ */

function Capabilities() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    useGSAP(
        () => {
            const panels = gsap.utils.toArray<HTMLElement>('.svc-panel');
            panels.forEach((panel, i) => {
                ScrollTrigger.create({
                    trigger: panel,
                    start: 'top 55%',
                    end: 'bottom 55%',
                    onToggle: (self) => self.isActive && setActive(i),
                });
                gsap.from(panel.querySelectorAll('[data-svc-in]'), {
                    y: 40,
                    autoAlpha: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: panel, start: 'top 78%', once: true },
                });
            });
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="w-full bg-[#EEE8D9] py-20 transition-colors duration-300 md:py-28 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-y-4 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-x-20">
                {/* Sticky index — desktop only */}
                <div className="hidden lg:block">
                    <div className="sticky top-[18vh]">
                        <Eyebrow>Capabilities</Eyebrow>
                        <h2 className="mt-4 font-tommy-bold text-[clamp(34px,3vw,52px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                            Everything but the
                            <br />
                            still image<Dot />
                        </h2>
                        <ol className="mt-10 flex flex-col gap-1">
                            {SERVICES.map((s, i) => (
                                <li key={s.title}>
                                    <button
                                        onClick={() =>
                                            document.getElementById(`svc-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                        }
                                        className="group flex w-full items-center gap-4 py-2.5 text-left"
                                    >
                                        <span
                                            className={`font-tommy-medium text-[13px] tabular-nums transition-colors duration-300 ${active === i ? 'text-[#C8992B] dark:text-[#FCD119]' : 'text-black/30 dark:text-white/30'}`}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span
                                            className={`font-tommy-medium text-[19px] transition-colors duration-300 ${active === i ? 'text-[#1A1917] dark:text-white' : 'text-black/35 dark:text-white/35'}`}
                                        >
                                            {s.title}
                                        </span>
                                        <span
                                            className={`ml-auto h-px transition-all duration-300 ${active === i ? 'w-10 bg-[#C8992B] dark:bg-[#FCD119]' : 'w-0 bg-transparent'}`}
                                        />
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Mobile heading */}
                <div className="mb-6 lg:hidden">
                    <Eyebrow>Capabilities</Eyebrow>
                    <h2 className="mt-3 font-tommy-bold text-[34px] leading-[1.04] tracking-tight text-[#1A1917] dark:text-white">
                        Everything but the still image<Dot />
                    </h2>
                </div>

                {/* Scrolling panels */}
                <div className="flex flex-col">
                    {SERVICES.map((s, i) => (
                        <article
                            key={s.title}
                            id={`svc-${i}`}
                            className="svc-panel flex min-h-[62vh] flex-col justify-center border-t border-black/10 py-10 first:border-t-0 lg:min-h-[78vh] dark:border-white/10"
                        >
                            <span data-svc-in className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCD119] text-black">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                    <path d={s.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <p data-svc-in className="mt-7 font-tommy-regular text-[12px] uppercase tracking-[4px] text-[#C8992B] dark:text-[#FCD119]">
                                {String(i + 1).padStart(2, '0')} — {s.tag}
                            </p>
                            <h3 data-svc-in className="mt-3 font-tommy-bold text-[34px] leading-[1.02] tracking-tight text-[#1A1917] md:text-[52px] dark:text-white">
                                {s.title}
                            </h3>
                            <p data-svc-in className="mt-5 max-w-[560px] font-tommy-regular text-[16px] leading-[1.75] text-[#5A554C] md:text-[18px] dark:text-[#A8A399]">
                                {s.body}
                            </p>
                            <ul data-svc-in className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                {s.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3 font-tommy-regular text-[15px] text-[#3A3730] dark:text-[#CFCABF]">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCD119]/20 text-[#C8992B] dark:text-[#FCD119]">
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6.5L4.6 9 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Process                                                            */
/* ------------------------------------------------------------------ */

function Process() {
    const rootRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from(lineRef.current, {
                scaleX: 0,
                transformOrigin: 'left center',
                ease: 'none',
                scrollTrigger: { trigger: rootRef.current, start: 'top 70%', end: 'bottom 70%', scrub: 1 },
            });
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="w-full border-y border-black/10 bg-[#E7E0CE] py-24 text-[#1A1917] transition-colors duration-300 md:py-32 dark:border-white/10 dark:bg-[#141414] dark:text-white">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <Reveal className="max-w-[720px]" y={30}>
                    <Eyebrow>How it works</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight">
                        Artwork to first mile, in days<Dot />
                    </h2>
                </Reveal>

                <div className="relative mt-16">
                    {/* Connecting line that draws with scroll (desktop) */}
                    <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-black/10 lg:block dark:bg-white/10">
                        <div ref={lineRef} className="h-full w-full origin-left bg-[#C8992B] dark:bg-[#FCD119]" />
                    </div>

                    <Reveal className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10" y={40} stagger={0.14}>
                        {PROCESS.map((p, i) => (
                            <div key={p.step} className="relative">
                                <span className="relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#FCD119] font-tommy-bold text-[20px] text-black">
                                    {i + 1}
                                </span>
                                <h3 className="mt-6 font-tommy-bold text-[24px] tracking-tight">{p.step}</h3>
                                <p className="mt-3 max-w-[260px] font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-white/55">
                                    {p.body}
                                </p>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Measurement stack                                                  */
/* ------------------------------------------------------------------ */

const STACK = [
    { k: 'GPS-verified delivery', d: 'Continuous GPS on every truck in the national fleet. Verified-impression reporting is the default, not an upgrade.' },
    { k: 'Modeled impressions', d: 'Reach and frequency modelled against route, daypart and market — reported the way a digital buy is reported.' },
    { k: 'Brand-lift studies', d: 'Exposed-vs-control studies through independent measurement partners, attached to every major campaign.' },
    { k: 'Geofenced retargeting', d: 'Devices that came within impression range of our trucks become a targetable retargeting audience the following day.' },
];

function MeasurementStack() {
    return (
        <section className="w-full bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <Reveal className="max-w-[760px]" y={30}>
                    <Eyebrow>Measurement stack</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight text-[#1A1917] dark:text-white">
                        Numbers your CMO can defend<Dot />
                    </h2>
                    <p className="mt-5 font-tommy-regular text-[16px] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">
                        Out-of-home was the last major channel without real accountability. We closed that gap —
                        four layers of independent measurement on every flight.
                    </p>
                </Reveal>

                <Reveal className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-black/10 bg-black/10 md:grid-cols-2 dark:border-white/10 dark:bg-white/10" y={40} stagger={0.12}>
                    {STACK.map((s, i) => (
                        <div key={s.k} className="bg-[#EEE8D9] p-8 transition-colors duration-300 md:p-10 dark:bg-[#0A0A0A]">
                            <span className="font-tommy-regular text-[11px] uppercase tracking-[3px] text-[#C8992B] dark:text-[#FCD119]">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-4 font-tommy-bold text-[22px] leading-tight tracking-tight text-[#1A1917] md:text-[26px] dark:text-white">
                                {s.k}
                            </h3>
                            <p className="mt-3 font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">{s.d}</p>
                        </div>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ServicesPage() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Solutions"
                title="WHAT WE DO"
                lead="From the wrap on the truck to the readout on your desk — placement, production, routing, measurement, creative and campaign management, handled end to end by one accountable team."
                primary={{ label: 'Book a Strategy Call', href: '/contact' }}
                secondary={{ label: 'See the results', href: '/projects' }}
                image="/assets/images/kroger-img.webp"
                imageAlt="An Advertising Wheels truck on a city corridor at dusk"
            />

            <HorizontalStatement />
            <Capabilities />
            <MeasurementStack />
            <Process />

            <CtaSection />
        </main>
    );
}
