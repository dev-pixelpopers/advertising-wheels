'use client';

/**
 * Contact — the conversion surface.
 *
 * Flow: a split hero (copy + working-feeling form with a success state) →
 * contact-detail cards → an animated FAQ accordion → footer. The form is
 * presentation-only (no endpoint wired), so submit just shows the thank-you.
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
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
        sub: 'Mon–Fri, 8am–6pm CT',
        icon: 'M5.2 2.5 6.6 5.3 5.3 6.6a8.4 8.4 0 0 0 4.1 4.1l1.3-1.3 2.8 1.4v2.4c0 .6-.5 1-1.1.9A11.6 11.6 0 0 1 2.1 3.6c0-.6.4-1.1 1-1.1h2.1Z',
        href: "tel:+18774239433"
    },
    {
        label: 'Email us',
        value: 'BrandGrowth@AdvertisingWheels.com',
        sub: 'We reply within one business day',
        icon: 'M1.8 3.4h12.4v9.2H1.8zM2.4 4.6l5.6 4 5.6-4',
        href: "mailto:BrandGrowth@AdvertisingWheels.com"
    },
    {
        label: 'Headquarters',
        value: 'Nashville, Tennessee',
        sub: '50 DMAs, coast to coast',
        icon: 'M8 14s5-4.5 5-8A5 5 0 0 0 3 6c0 3.5 5 8 5 8Zm0-6.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
        href: "",
    },
];

const INTERESTS = ['Start a campaign', 'Become a fleet partner', 'Press / media', 'Something else'];

const FAQS = [
    { q: 'How fast can a campaign go live?', a: 'For most markets we go from approved artwork to trucks on the road in about five business days — design, print, and installation included. Larger multi-market activations are scheduled to launch in sync.' },
    { q: 'Which markets do you cover?', a: 'We cover 50 DMAs coast to coast. Start with a handful of trucks in one market or scale to concurrent fleets across as many DMAs as your campaign needs.' },
    { q: 'How are impressions measured?', a: `Impressions, reach, and frequency are independently measured by StreetMetrics from actual GPS movement data — the same rigor you'd expect from a digital buy.` },
    { q: 'Do you handle the creative?', a: 'Yes. Our in-house studio designs wraps designed for how people see them — up close, in motion, at street level, then prints and installs them on premium cast vinyl. Bring finished art or start from a brief.' },
    { q: 'I own trucks — how do I partner?', a: 'Head to the Vendors page and apply. If your vehicles and routes fit, we match you to campaigns and handle the wrap, install and reporting.' },
];

/* ------------------------------------------------------------------ */
/*  Hero + form                                                        */
/* ------------------------------------------------------------------ */

function ContactHero() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Posts the form and only shows the thank-you once the server confirms.
     *
     * The form is NOT reset on failure and never unmounts mid-flight, so a
     * network blip or a rejected field leaves everything the person typed
     * exactly where it was — losing a long message to a failed request is the
     * one outcome that guarantees they don't try again.
     */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (sending) return;

        const form = e.currentTarget;
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());

        setSending(true);
        setError(null);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(json.error ?? 'Something went wrong. Please try again.');
                return;
            }
            form.reset();
            setSent(true);
        } catch {
            setError('Could not reach the server. Please check your connection and try again.');
        } finally {
            setSending(false);
        }
    }

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from(q('[data-ch-copy] > *'), { y: 28, autoAlpha: 0, duration: 0.7, stagger: 0.1 })
                .from(q('[data-ch-form]'), { y: 40, autoAlpha: 0, scale: 0.98, duration: 0.9 }, '<0.15');
        },
        { scope: rootRef }
    );

    /* The native #form jump is not enough on its own here.
       The browser performs it as soon as the element exists, but the PortalHero
       above this section carries a large photograph with no reserved height —
       when it decodes, everything below shifts down and the jump you already
       made is now pointing at the wrong place, leaving the form half off-screen.
       So the position is re-taken after layout settles and again on window load.
       Bailing on any user scroll keeps this from fighting someone who has
       already started moving the page themselves. */
    useEffect(() => {
        if (window.location.hash !== '#form') return;

        let cancelled = false;
        const stop = () => { cancelled = true; };
        const seat = () => {
            if (cancelled) return;
            document.getElementById('form')?.scrollIntoView({ block: 'start' });
        };

        seat();
        const t = window.setTimeout(seat, 300);
        window.addEventListener('load', seat);
        window.addEventListener('wheel', stop, { passive: true, once: true });
        window.addEventListener('touchstart', stop, { passive: true, once: true });

        return () => {
            window.clearTimeout(t);
            window.removeEventListener('load', seat);
            window.removeEventListener('wheel', stop);
            window.removeEventListener('touchstart', stop);
        };
    }, []);

    const inputClass =
        'w-full rounded-xl border border-black/12 bg-white/50 px-2 lg:px-3 2xl:px-4 py-1.5 lg:py-2.5 2xl:py-3.5 font-tommy-regular text-[clamp(0.75rem,0.8vw,0.9375rem)] text-[#1A1917] placeholder:text-black/35 transition-colors duration-200 focus:border-[#C8992B] focus:outline-none';
    const labelClass = 'mb-1 2xl:mb-2 block font-tommy-medium text-[12.5px] uppercase tracking-[1.5px] text-[#6F6A60]';

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300">
            <div className="pointer-events-none absolute -left-[14%] -top-[36%] opacity-90 md:-left-[6%]" aria-hidden="true">
                <Rings />
            </div>

            <div className="relative z-10 mx-auto grid w-full lg:max-w-[1320px] grid-cols-1 gap-4 md:gap-6 lg:gap-10 pb-10 pt-[80px] px-3 md:px-6 lg:px-12 md:pb-28 xl:pt-[90px] 3xl:pt-[190px] lg:grid-cols-[0.95fr_1.05fr] 2xl:gap-20">
                {/* Copy */}
                <div data-ch-copy className="lg:pt-6">
                    <Eyebrow>Get in touch</Eyebrow>
                    <h1 className="mt-5 font-tommy-bold text-[clamp(46px,6.5vw,92px)] leading-[0.95] tracking-[-2px] text-[#1A1917]">
                        Let’s talk<Dot />
                    </h1>
                    <p className="mt-6 max-w-[460px] font-tommy-regular text-[16px] leading-[1.7] text-[#4F4A42] md:text-[19px]">
                        Tell us what you want to move — a product, a perception, a whole market. We’ll come back
                        with routes, formats and a plan you can measure.
                    </p>

                    <ul className="mt-10 flex flex-col gap-2 lg:gap-3 3xl:gap-5">
                        {DETAILS.map((d) => (
                            <li key={d.label}>
                                <a href={d.href} className='flex items-center gap-2 md:gap-3 lg:gap-4'>
                                    <span className="flex h-6 md:h-8 lg:h-11 w-6 md:w-8 lg:w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#C8992B]">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-[8px] md:w-[12px] lg:w-[16px] h-[8px] md:h-[12px] lg:h-[16px]">
                                            <path d={d.icon} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span>
                                        <span className="block font-tommy-medium text-[16px] text-[#1A1917]">{d.value}</span>
                                        <span className="block font-tommy-regular text-[13px] text-[#6F6A60]">{d.sub}</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Form card.
                    `id="form"` is the landing target for every CTA on the site.
                    The page opens with a full PortalHero above this grid, so a bare
                    /contact link drops you on "LET'S TALK" with the form roughly two
                    viewports further down — the anchor skips that. The hero's own
                    "Book a Strategy Call" button was already pointing at #form; until
                    now there was nothing here with that id for it to reach.

                    scroll-mt clears the 73px fixed header, plus a little air so the
                    card doesn't sit flush under it. */}
                <div id="form" data-ch-form className="relative scroll-mt-[96px] md:scroll-mt-[110px]">
                    <div className="rounded-[16px] md:rounded-[20px] lg:rounded-[26px] border border-black/10 bg-white/60 p-2 md:p-5 xl:p-7 3xl:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                        {sent ? (
                            <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h2 className="mt-6 font-tommy-bold text-[30px] tracking-tight text-[#1A1917]">Message on its way<Dot /></h2>
                                <p className="mt-3 max-w-[360px] font-tommy-regular text-[15px] leading-[1.7] text-[#5A554C]">
                                    Thanks — we’ll be in touch within one business day. In the meantime, feel free to call
                                    us at 1-877-4-ADWHEELS (1-877-423-9433).
                                </p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="mt-8 font-tommy-medium text-[14px] uppercase tracking-[2px] text-[#C8992B]"
                                >
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2 lg:gap-3 3xl:gap-5">
                                {/* Honeypot. Hidden from people and from screen readers; bots
                                    fill it in and the server silently discards the submission. */}
                                {/* NOT named "website" — that is a real browser autofill
                                    category, so Chrome and password managers happily filled
                                    it even off-screen. A filled honeypot makes the server
                                    discard the submission and answer 200, so a genuine
                                    inquiry vanished with the visitor seeing a thank-you.
                                    The opaque name has nothing for autofill to match on,
                                    and the vendor opt-outs cover the managers that guess. */}
                                <input
                                    type="text"
                                    name="aw_contact_ref"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    data-lpignore="true"
                                    data-1p-ignore=""
                                    data-form-type="other"
                                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                                />
                                <div className="grid grid-cols-1 gap-2 lg:gap-3 3xl:gap-5 sm:grid-cols-2">
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
                                                {/* `value` was missing, so every submission reported
                                                    the interest as "on" regardless of the choice. */}
                                                <input type="radio" name="interest" value={int} defaultChecked={i === 0} className="peer sr-only" />
                                                <span className="inline-block rounded-full border border-black/12 px-2 lg:px-3 2xl:px-4 py-1 lg:py-1.5 2xl:py-2.5 font-tommy-regular text-[13.5px] text-[#5A554C] transition-colors duration-200 peer-checked:border-transparent peer-checked:bg-[#1A1917] peer-checked:text-[#FCD119]">
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

                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-xl border border-[#B4342A]/25 bg-[#B4342A]/[0.06] px-4 py-3 font-tommy-regular text-[13.5px] leading-[1.5] text-[#8E2A22]"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#1A1917] px-4 md:px-6 xl:px-8 py-2 md:py-3 xl:py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                                >
                                    {sending ? 'Sending…' : <>Send message <ArrowIcon /></>}
                                </button>
                                <p className="font-tommy-regular text-[11.5px] leading-[1.6] text-[#6F6A60]/85">
                                    By submitting you agree to our{' '}
                                    <a href="/privacy" className="underline underline-offset-2 hover:text-[#1A1917]">
                                        Privacy Policy
                                    </a>
                                    . We’ll only use your details to respond to this enquiry.
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
        <section className="w-full bg-[#EEE8D9]  transition-colors duration-300 pt-14 md:pt-20 lg:pt-32">
            <div className="mx-auto grid lg:max-w-[1200px] grid-cols-1 gap-6 md:gap-12 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <Reveal className="self-start" y={30}>
                    <Eyebrow>Good to know</Eyebrow>
                    <h2 className="mt-4 font-tommy-bold text-[clamp(30px,3.6vw,52px)] leading-[1.04] tracking-tight text-[#1A1917]">
                        Questions, answered<Dot />
                    </h2>
                    <p className="mt-5 max-w-[360px] font-tommy-regular text-[16px] leading-[1.7] text-[#5A554C]">
                        Still curious about something? Call or email and a real person will walk you through it.
                    </p>
                </Reveal>

                <Reveal className="flex flex-col" y={26} stagger={0.08}>
                    {FAQS.map((f, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={f.q} className="border-b border-black/10">
                                <button
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex w-full items-center justify-between gap-6 py-3 md:py-4 lg:py-6 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="font-tommy-medium text-[19px] text-[#1A1917] md:text-[22px]">{f.q}</span>
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 transition-all duration-300 ${isOpen ? 'rotate-45 bg-[#FCD119] text-black' : 'text-[#1A1917]'}`}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                                {/* grid-rows trick animates height without measuring. */}
                                <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <p className="max-w-[560px] pb-6 font-tommy-regular text-[15.5px] leading-[1.75] text-[#5A554C]">
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
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300">
            <PortalHero
                badge="Contact"
                title="LET'S TALK"
                lead="Tell us what you want to move — a product, a perception, a whole market. We'll come back with routes, formats and a plan you can measure."
                primary={{ label: 'Book a Strategy Call', href: '#form' }}
                secondary={{ label: 'See our work', href: '/projects' }}
                image="/assets/images/clients/banner image/CL9A0259 1.png"
                imageAlt="Advertising Wheels fleet for reliable heating & air campaign"
            />
            <ContactHero />
            <Faq />
        </main>
    );
}
