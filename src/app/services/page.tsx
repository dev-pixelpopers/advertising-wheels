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
import CtaSection from '@/components/CtaSection';
import HorizontalStatement from '@/components/site/HorizontalStatement';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, Eyebrow, Dot } from '@/components/site/primitives';

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
        body: '600 square feet of uninterrupted brand canvas moving through daily life — commuter streets, retail corridors, event crowds, and the exact ZIP codes you want to own. Too big to miss, too close to skip, and seen again tomorrow.',
        features: ['Full-truck & trailer formats', 'Event & venue presence', 'ZIP-level market coverage', 'Repeated daily exposure'],
        icon: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    },
    {
        tag: 'Production',
        title: 'Fleet Wraps & Print',
        body: `Over 1 million square feet of premium cast vinyl installed. Precision printing, color-matched to your brand, expertly installed and QA'd — then inspected and maintained for the life of the campaign, so week eight looks like day one.`,
        features: ['Premium HD cast vinyl, 1M+ sq ft installed', 'Expert installation & panel QA', 'Color-matched to brand standards', 'Ongoing inspection & maintenance'],
        icon: 'M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6L7.9 14 2 9.4h7.6z',
    },
    {
        tag: 'Targeting',
        title: 'From Street to Screen',
        body: 'Campaigns are targeted at the ZIP level — matched to fleets delivering through those exact neighborhoods every day. GPS verifies where your brand traveled, and exposed devices carry your message onto their phones and feeds.',
        features: ['ZIP-level geographic targeting', 'Real delivery routes, real frequency', 'Live GPS verification', 'Geofenced retargeting layer'],
        icon: 'M12 21s-7-6.3-7-11a7 7 0 1114 0c0 4.7-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    },
    {
        tag: 'Measurement',
        title: 'Verified by StreetMetrics',
        body: 'Every campaign is independently measured by StreetMetrics — impressions, reach, and frequency verified by a third party and reported the way digital is. Numbers your CMO can defend in the boardroom, not our own marketing claims.',
        features: ['StreetMetrics third-party verification', 'Reach & frequency reporting', 'Impressions-per-flight readouts', 'Post-campaign analysis & lift measurement'],
        icon: 'M3 3v18h18M7 15l4-5 3 3 5-7',
    },
    {
        tag: 'Creative',
        title: 'Creative Studio',
        body: 'A moving canvas needs creative built for it. Our studio designs wraps for the way people actually see them — up close, in motion, at street level — bold enough to turn heads in traffic and become the post people share.',
        features: ['Street-level art direction', 'Concept to production art', 'A/B creative by market or fleet', 'Social-ready wrap reveals'],
        icon: 'M15 5l4 4M3 21l1.2-4.4a2 2 0 01.5-.9l9.4-9.4a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8l-9.4 9.4a2 2 0 01-.9.5L3 21z',
    },
    {
        tag: 'Management',
        title: 'Campaign Management',
        body: 'One team from artwork to on the road — fleet sourcing, production, launch, reporting, and renewals, with a single point of contact throughout. Issues get caught and fixed before you ever hear about them.',
        features: ['Single point of contact', 'Artwork to on-road in days', 'Proactive issue resolution', 'Flight, renewal & consolidated reporting'],
        icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    },
];

const PROCESS = [
    { step: 'Plan', body: 'We map your audience to DMAs and ZIP codes, then match fleets whose daily delivery routes cover them — and scope the flight that hits your goals.' },
    { step: 'Create', body: 'Our studio designs a wrap built for the highway, then we print and install it in-house with color-matched QA.' },
    { step: 'Roll', body: 'Wrapped trucks work their daily delivery routes through your target ZIPs, tracked live by GPS so every mile is verified, not estimated.' },
    { step: 'StreetMetrics', body: 'Impressions, reach and frequency, independently verified by StreetMetrics, land in a readout you can take straight to the board.' },
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
        <section ref={rootRef} className="w-full bg-[#EEE8D9]  transition-colors duration-300 py-10 md:py-16 lg:py-28">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-y-4 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-x-20">
                {/* Sticky index — desktop only */}
                <div className="hidden lg:block">
                    <div className="sticky top-[18vh]">
                        <Eyebrow>Capabilities</Eyebrow>
                        <h2 className="mt-4 font-tommy-bold text-[clamp(34px,3vw,52px)] leading-[1.02] tracking-tight text-[#1A1917]">
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
                                            className={`font-tommy-medium text-[13px] tabular-nums transition-colors duration-300 ${active === i ? 'text-[#C8992B]' : 'text-black/30'}`}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span
                                            className={`font-tommy-medium text-[19px] transition-colors duration-300 ${active === i ? 'text-[#1A1917]' : 'text-black/35'}`}
                                        >
                                            {s.title}
                                        </span>
                                        <span
                                            className={`ml-auto h-px transition-all duration-300 ${active === i ? 'w-10 bg-[#C8992B]' : 'w-0 bg-transparent'}`}
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
                    <h2 className="mt-3 font-tommy-bold text-[34px] leading-[1.04] tracking-tight text-[#1A1917]">
                        Everything but the still image<Dot />
                    </h2>
                </div>

                {/* Scrolling panels */}
                <div className="flex flex-col">
                    {SERVICES.map((s, i) => (
                        <article
                            key={s.title}
                            id={`svc-${i}`}
                            className="svc-panel flex min-h-auto lg:min-h-[62vh] flex-col justify-center border-t border-black/10 py-10 first:border-t-0 lg:min-h-[78vh]"
                        >
                            <span data-svc-in className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCD119] text-black">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                    <path d={s.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <p data-svc-in className="mt-7 font-tommy-regular text-[12px] uppercase tracking-[4px] text-[#C8992B]">
                                {String(i + 1).padStart(2, '0')} — {s.tag}
                            </p>
                            <h3 data-svc-in className="mt-3 font-tommy-bold text-[34px] leading-[1.02] tracking-tight text-[#1A1917] md:text-[52px]">
                                {s.title}
                            </h3>
                            <p data-svc-in className="mt-5 max-w-[560px] font-tommy-regular text-[16px] leading-[1.75] text-[#5A554C] md:text-[18px]">
                                {s.body}
                            </p>
                            <ul data-svc-in className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                {s.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3 font-tommy-regular text-[15px] text-[#3A3730]">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCD119]/20 text-[#C8992B]">
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
        <section ref={rootRef} className="w-full border-y border-black/10 bg-[#E7E0CE]  text-[#1A1917] transition-colors duration-300 py-10 md:py-16 lg:py-32">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <Reveal className="max-w-[720px]" y={30}>
                    <Eyebrow>How it works</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight">
                        Artwork to first mile, in days<Dot />
                    </h2>
                </Reveal>

                <div className="relative mt-16">
                    {/* Connecting line that draws with scroll (desktop) */}
                    <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-black/10 lg:block">
                        <div ref={lineRef} className="h-full w-full origin-left bg-[#C8992B]" />
                    </div>

                    <Reveal className="grid grid-cols-1 gap-y-4 md:gap-y-8 lg:gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10" y={40} stagger={0.14}>
                        {PROCESS.map((p, i) => (
                            <div key={p.step} className="relative">
                                <span className="relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#FCD119] font-tommy-bold text-[20px] text-black">
                                    {i + 1}
                                </span>
                                <h3 className="mt-6 font-tommy-bold text-[24px] tracking-tight">{p.step}</h3>
                                <p className="mt-3 max-w-[260px] font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C]">
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
    { k: 'Modeled impressions', d: 'Reach and frequency modeled by StreetMetrics from actual GPS movement data — real miles, real times, real locations — and reported the way a digital buy is reported.' },
    { k: 'Brand-lift studies', d: 'Exposed-vs-control studies through independent measurement partners, attached to every major campaign.' },
    { k: 'Geofenced retargeting', d: 'Devices that came within impression range of our trucks become a targetable retargeting audience the following day.' },
];

function MeasurementStack() {
    return (
        <section className="w-full bg-[#EEE8D9]  transition-colors duration-300 py-10 md:py-16 lg:py-32">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <Reveal className="max-w-[760px]" y={30}>
                    <Eyebrow>Measurement stack</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(32px,4.4vw,60px)] leading-[1.02] tracking-tight text-[#1A1917]">
                        Numbers your CMO can defend<Dot />
                    </h2>
                    <p className="mt-5 font-tommy-regular text-[16px] leading-[1.7] text-[#5A554C]">
                        Out-of-home was the last major channel without real accountability. We closed that gap —
                        four layers of independent measurement on every flight.
                    </p>
                </Reveal>

                <Reveal className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-black/10 bg-black/10 md:grid-cols-2" y={40} stagger={0.12}>
                    {STACK.map((s, i) => (
                        <div key={s.k} className="bg-[#EEE8D9] p-4 md:p-6 lg:p-8 transition-colors duration-300 md:p-10">
                            <span className="font-tommy-regular text-[11px] uppercase tracking-[3px] text-[#C8992B]">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-4 font-tommy-bold text-[22px] leading-tight tracking-tight text-[#1A1917] md:text-[26px]">
                                {s.k}
                            </h3>
                            <p className="mt-3 font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C]">{s.d}</p>
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
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300">
            <PortalHero
                badge="Solutions"
                title="WHAT WE DO"
                lead="From the wrap on the truck to the readout on your desk — placement, production, targeting, measurement, creative and campaign management, handled end to end by one accountable team."
                primary={{ label: 'Book a Campaign', href: '/contact#form' }}
                secondary={{ label: 'See the results', href: '/projects' }}
                image="/assets/images/clients/floor-and-decor/hero-05.webp"
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
