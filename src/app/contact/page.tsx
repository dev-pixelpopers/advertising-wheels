'use client';

/**
 * Contact — the conversion surface.
 *
 * Flow: a split hero (copy + working-feeling form with a success state) →
 * contact-detail cards → an animated FAQ accordion → footer. The form is
 * presentation-only (no endpoint wired), so submit just shows the thank-you.
 */

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import PortalHero from '@/components/site/PortalHero';
import { Reveal, Eyebrow, Dot, ArrowIcon, Rings } from '@/components/site/primitives';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DETAILS = [
    {
        label: 'Call us',
        value: '1-877-4-ADWHEELS (1-877-423-9433)',
        sub: 'Mon–Fri, 8am–6pm ET',
        icon: 'M5.2 2.5 6.6 5.3 5.3 6.6a8.4 8.4 0 0 0 4.1 4.1l1.3-1.3 2.8 1.4v2.4c0 .6-.5 1-1.1.9A11.6 11.6 0 0 1 2.1 3.6c0-.6.4-1.1 1-1.1h2.1Z',
    },
    {
        label: 'Email us',
        value: 'BrandGrowth@advertisingwheels.com',
        sub: 'We reply within one business day',
        icon: 'M1.8 3.4h12.4v9.2H1.8zM2.4 4.6l5.6 4 5.6-4',
    },
    {
        label: 'Headquarters',
        value: 'Nashville, Tennessee',
        sub: '50 metro markets, coast to coast',
        icon: 'M8 14s5-4.5 5-8A5 5 0 0 0 3 6c0 3.5 5 8 5 8Zm0-6.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
    },
];

const INTERESTS = ['Start a campaign', 'Become a fleet partner', 'Press / media', 'Something else'];

const FAQS = [
    { q: 'How fast can a campaign go live?', a: 'For most markets we go from approved artwork to the first highway mile in about five business days — design, print, install and routing included.' },
    { q: 'Which markets do you cover?', a: 'We run 50 metro markets from coast to coast. You can start with a single route in one city or scale to a synchronized fleet across multiple corridors.' },
    { q: 'How are impressions measured?', a: 'Reach and frequency are modelled by an independent, audited third party and reported alongside 24/7 GPS route data — the same rigour you’d expect from a digital buy.' },
    { q: 'Do you handle the creative?', a: 'Yes. Our in-house studio designs wraps engineered for distance and motion, then prints and installs them on premium cast vinyl. Bring finished art or start from a brief.' },
    { q: 'I own trucks — how do I partner?', a: 'Head to the Vendors page and apply. If your vehicles and routes fit, we match you to campaigns and handle the wrap, install and reporting.' },
];

/* ------------------------------------------------------------------ */
/*  Hero + form                                                        */
/* ------------------------------------------------------------------ */

function ContactHero() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [sent, setSent] = useState(false);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from(q('[data-ch-copy] > *'), { y: 28, autoAlpha: 0, duration: 0.7, stagger: 0.1 })
                .from(q('[data-ch-form]'), { y: 40, autoAlpha: 0, scale: 0.98, duration: 0.9 }, '<0.15');
        },
        { scope: rootRef }
    );

    const inputClass =
        'w-full rounded-xl border border-black/12 bg-white/50 px-4 py-3.5 font-tommy-regular text-[15px] text-[#1A1917] placeholder:text-black/35 transition-colors duration-200 focus:border-[#C8992B] focus:outline-none dark:border-white/12 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#FCD119]';
    const labelClass = 'mb-2 block font-tommy-medium text-[12.5px] uppercase tracking-[1.5px] text-[#6F6A60] dark:text-[#9A968E]';

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <div className="pointer-events-none absolute -left-[14%] -top-[36%] opacity-90 md:-left-[6%]" aria-hidden="true">
                <Rings />
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-14 px-6 pb-24 pt-[132px] md:px-12 md:pb-28 md:pt-[190px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
                {/* Copy */}
                <div data-ch-copy className="lg:pt-6">
                    <Eyebrow>Get in touch</Eyebrow>
                    <h1 className="mt-5 font-tommy-bold text-[clamp(46px,6.5vw,92px)] leading-[0.95] tracking-[-2px] text-[#1A1917] dark:text-white">
                        Let’s talk<Dot />
                    </h1>
                    <p className="mt-6 max-w-[460px] font-tommy-regular text-[16px] leading-[1.7] text-[#4F4A42] md:text-[19px] dark:text-[#B7B2A8]">
                        Tell us what you want to move — a product, a perception, a whole market. We’ll come back
                        with routes, formats and a plan you can measure.
                    </p>

                    <ul className="mt-10 flex flex-col gap-5">
                        {DETAILS.map((d) => (
                            <li key={d.label} className="flex items-center gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#C8992B] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#FCD119]">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d={d.icon} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span>
                                    <span className="block font-tommy-medium text-[16px] text-[#1A1917] dark:text-white">{d.value}</span>
                                    <span className="block font-tommy-regular text-[13px] text-[#6F6A60] dark:text-[#9A968E]">{d.sub}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Form card */}
                <div data-ch-form className="relative">
                    <div className="rounded-[26px] border border-black/10 bg-white/60 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm md:p-10 dark:border-white/10 dark:bg-white/[0.04]">
                        {sent ? (
                            <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h2 className="mt-6 font-tommy-bold text-[30px] tracking-tight text-[#1A1917] dark:text-white">Message on its way<Dot /></h2>
                                <p className="mt-3 max-w-[360px] font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">
                                    Thanks — we’ll be in touch within one business day. In the meantime, feel free to call
                                    us at 1-877-4-ADWHEELS (1-877-423-9433).
                                </p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="mt-8 font-tommy-medium text-[14px] uppercase tracking-[2px] text-[#C8992B] dark:text-[#FCD119]"
                                >
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="c-name" className={labelClass}>Full name</label>
                                        <input id="c-name" name="name" required placeholder="Jane Doe" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-company" className={labelClass}>Company</label>
                                        <input id="c-company" name="company" placeholder="Acme Inc." className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-email" className={labelClass}>Email</label>
                                        <input id="c-email" name="email" type="email" required placeholder="jane@acme.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-phone" className={labelClass}>Phone</label>
                                        <input id="c-phone" name="phone" type="tel" placeholder="(555) 012-3456" className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>I’m interested in</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {INTERESTS.map((int, i) => (
                                            <label key={int} className="cursor-pointer">
                                                <input type="radio" name="interest" defaultChecked={i === 0} className="peer sr-only" />
                                                <span className="inline-block rounded-full border border-black/12 px-4 py-2.5 font-tommy-regular text-[13.5px] text-[#5A554C] transition-colors duration-200 peer-checked:border-transparent peer-checked:bg-[#1A1917] peer-checked:text-[#FCD119] dark:border-white/12 dark:text-[#A8A399] dark:peer-checked:bg-[#FCD119] dark:peer-checked:text-black">
                                                    {int}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="c-msg" className={labelClass}>Tell us about it</label>
                                    <textarea id="c-msg" name="message" rows={4} required placeholder="Markets, timing, goals — as much or as little as you like." className={`${inputClass} resize-none`} />
                                </div>

                                <button
                                    type="submit"
                                    className="group mt-1 inline-flex items-center justify-center gap-3 rounded-full bg-[#1A1917] px-8 py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.02] dark:bg-[#FCD119] dark:text-black"
                                >
                                    Send message <ArrowIcon />
                                </button>
                                <p className="font-tommy-regular text-[11.5px] leading-[1.6] text-[#6F6A60]/85 dark:text-[#9A968E]/80">
                                    By submitting you agree to our Privacy Policy. We’ll only use your details to respond
                                    to this enquiry.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  FAQ accordion                                                      */
/* ------------------------------------------------------------------ */

function Faq() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section className="w-full bg-[#EEE8D9] py-24 transition-colors duration-300 md:py-32 dark:bg-[#0A0A0A]">
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <Reveal className="self-start" y={30}>
                    <Eyebrow>Good to know</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(30px,3.6vw,52px)] leading-[1.04] tracking-tight text-[#1A1917] dark:text-white">
                        Questions, answered<Dot />
                    </h2>
                    <p className="mt-5 max-w-[360px] font-tommy-regular text-[16px] leading-[1.7] text-[#5A554C] dark:text-[#A8A399]">
                        Still curious about something? Call or email and a real person will walk you through it.
                    </p>
                </Reveal>

                <Reveal className="flex flex-col" y={26} stagger={0.08}>
                    {FAQS.map((f, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={f.q} className="border-b border-black/10 dark:border-white/10">
                                <button
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="font-tommy-medium text-[19px] text-[#1A1917] md:text-[22px] dark:text-white">{f.q}</span>
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 transition-all duration-300 dark:border-white/15 ${isOpen ? 'rotate-45 bg-[#FCD119] text-black' : 'text-[#1A1917] dark:text-white'}`}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                                {/* grid-rows trick animates height without measuring. */}
                                <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <p className="max-w-[560px] pb-6 font-tommy-regular text-[15.5px] leading-[1.75] text-[#5A554C] dark:text-[#A8A399]">
                                            {f.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <PortalHero
                badge="Contact"
                title="LET'S TALK"
                lead="Tell us what you want to move — a product, a perception, a whole market. We'll come back with routes, formats and a plan you can measure."
                primary={{ label: 'Book a Strategy Call', href: '#form' }}
                secondary={{ label: 'See our work', href: '/projects' }}
                image="/assets/images/costco-img.webp"
                imageAlt="Advertising Wheels production studio"
            />
            <ContactHero />
            <Faq />
            <Footer />
        </main>
    );
}
