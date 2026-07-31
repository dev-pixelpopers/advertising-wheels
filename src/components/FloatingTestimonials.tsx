'use client';

/**
 * FloatingTestimonials — a horizontal rail of client quote cards.
 *
 * On desktop the panel pins and the rail tracks sideways as you scroll, so the
 * cards run off the right edge and pull through one by one. Below `lg` the pin
 * is dropped and the rail becomes a native snap-scrolling, swipeable row — page
 * scrolling is never hijacked on touch.
 *
 * Each card is badged with the client's logo rather than a headshot. The marks
 * are supplied for light backgrounds and vary wildly (one is a filled block,
 * another is pure black on transparent), so each sits on its own white chip and
 * reads correctly in either theme without per-asset tweaking.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGOS = '/assets/images/review/logo';

interface Testimonial {
    quote: string;
    name: string;
    /** Role line under the name. Omitted where the source gives no person. */
    role?: string;
    logo: string;
    /** Accessible name for the logo chip. */
    label: string;
}

/** Verbatim from the supplied testimonials sheet. */
const TESTIMONIALS: Testimonial[] = [
    {
        quote: 'Amid a transitional period requiring a shift in brand perception and tighter marketing budgets, Hertz leveraged truck advertising as its primary top-of-funnel tactic for high visibility and cost-effectiveness. The strategy reversed a five-year decline in eCommerce revenue.',
        name: 'Jeff Voorhees',
        role: 'Senior Director, Hertz',
        logo: `${LOGOS}/hertz.png`,
        label: 'Hertz',
    },
    {
        quote: 'Advertising Wheels exceeded my expectations. I had little time and they really came through for me. The mobile billboards were the highlight of Nationwide’s presence and are still talked about. Thank you Advertising Wheels!',
        name: 'Torri Aprile',
        role: 'Marketing Director, Nationwide Insurance',
        logo: `${LOGOS}/nationwide.png`,
        label: 'Nationwide Insurance',
    },
    {
        quote: 'Truck advertising has grown into a key portion of our brand marketing budget, yielding record brand awareness and household production growth.',
        name: 'Nick Ferrugia',
        role: 'Director, Brand and Performance Marketing, Fifth Third Bank',
        logo: `${LOGOS}/third-bank.png`,
        label: 'Fifth Third Bank',
    },
    {
        quote: 'Advertising Wheels’ value proposition is delivery of high impact visual messaging that is quick/easy to implement, unusually cost effective, and highly measurable.',
        name: 'Michael Sapienza',
        role: 'Former VP New Product Marketing, Wendy’s International',
        logo: `${LOGOS}/partner-wendys.png`,
        label: 'Wendy’s International',
    },
    {
        quote: 'The client’s goals and objectives are achieved... as the team implement and execute outstanding results. Recognition is city wide... but memorable.',
        name: 'Jeff Byron',
        role: 'General Manager, Saks Fifth Avenue',
        logo: `${LOGOS}/partner-saks.png`,
        label: 'Saks Fifth Avenue',
    },
    {
        quote: 'The staff at Advertising Wheels was courteous, helpful, and always handled themselves with the highest level of professionalism from the design stage to installation.',
        name: 'Athletic Department',
        role: 'The Ohio State University',
        logo: `${LOGOS}/ohio-state.png`,
        label: 'The Ohio State University',
    },
    {
        quote: 'We have won the REGIONAL gold medal for outdoor advertising from the National Council for Marketing and Public Relations... as winner of the regional award, we have been submitted for consideration for the national award from NCMPR. Thank you for helping raise the bar on our marketing!',
        name: 'Greg Krizman',
        role: 'Executive Director of Public Relations, Cuyahoga Community College',
        logo: `${LOGOS}/partner-cuyahoga.png`,
        label: 'Cuyahoga Community College',
    },
];

export default function FloatingTestimonials() {
    const rootRef = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);

            /* Header reveal */
            gsap.from(q('[data-tm-head] > *'), {
                y: 26,
                autoAlpha: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });

            const mm = gsap.matchMedia();

            /* ---- Desktop: pin the panel, drive the rail sideways ---- */
            mm.add('(min-width: 1024px)', () => {
                const rail = railRef.current;
                const view = viewportRef.current;
                if (!rail || !view) return;

                // Recomputed on every refresh so a resize or font swap can't leave
                // the rail short of its last card.
                const travel = () => Math.max(0, rail.scrollWidth - view.clientWidth);

                // The section stays pinned past the end of the rail: the cards
                // finish at 100/130 of the pin, then the completed rail HOLDS for
                // the last 30 units before releasing into WhyChooseUs — without
                // this, the pin lets go the instant the last card arrives. The
                // extra pin distance matches (travel * 1.3), so the rail portion
                // still scrubs 1:1 with the scroll.
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: 'top top',
                        end: () => '+=' + Math.round(Math.max(travel() * 1.3, window.innerHeight)),
                        pin: frameRef.current,
                        anticipatePin: 1,
                        scrub: 0.8,
                        invalidateOnRefresh: true,
                    },
                });
                tl.to(rail, { x: () => -travel(), ease: 'none', duration: 100 })
                    .to({}, { duration: 30 }); // the hold

                return () => {
                    tl.scrollTrigger?.kill();
                    tl.kill();
                    gsap.set(rail, { clearProps: 'x' });
                };
            });

            return () => mm.revert();
        },
        { scope: rootRef }
    );

    return (
        <section
            ref={rootRef}
            className="relative w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
        >
            <div ref={frameRef} className="w-full px-2 md:px-3 lg:px-4 md:px-8 lg:flex lg:h-screen lg:items-center lg:py-0">
                {/* Plain container — cards sit straight on the section ground. */}
                <div className="mx-auto w-full lg:max-w-[1440px] py-4 md:py-8 lg:py-[7vh]">
                    {/* ---------------- Header (left aligned) ---------------- */}
                    <div
                        data-tm-head
                        className="mb-6 px-3 md:px-5 lg:px-7 md:mb-12 md:px-14 lg:mb-[5vh] lg:px-[4.5%]"
                    >
                        <p className="font-tommy-regular text-[11px] uppercase tracking-[4px] text-[#6F6A60] md:text-[12px] dark:text-[#9A968E]">
                            Testimonials
                        </p>
                        {/* No max-width: with one, "it." wrapped onto its own line. The
                            explicit <br/> is the only intended break. */}
                        <h2 className="mt-4 font-tommy-bold text-[30px] leading-[1.15] tracking-tight text-[#1A1917] md:text-[46px] lg:text-[clamp(30px,3.4vw,52px)] dark:text-white">
                            Don’t take our word for it.
                            <br />
                            Hear it from our partners<span className="text-[#FCD119]">.</span>
                        </h2>
                    </div>

                    {/* ---------------- The rail ---------------- */}
                    {/* Below lg this is the scroller itself (snap + swipe). At lg the
                        overflow is hidden and GSAP translates the inner track instead. */}
                    <div
                        ref={viewportRef}
                        className="overflow-x-auto pb-2 [scrollbar-width:none] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
                    >
                        <div
                            ref={railRef}
                            className="flex w-max snap-x snap-mandatory gap-5 px-3 md:px-5 lg:px-7 md:gap-6 md:px-14 lg:snap-none lg:px-[4.5%]"
                        >
                            {TESTIMONIALS.map((t) => (
                                <figure
                                    key={t.label}
                                    className="flex w-[290px] shrink-0 snap-start flex-col rounded-[18px] bg-white/20 p-7 shadow-[0_14px_40px_rgba(0,0,0,0.06)] transition-colors duration-300 md:w-[340px] md:p-8 lg:w-[clamp(300px,23vw,368px)] dark:bg-[#1C1C1C] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
                                >
                                    {/* Client mark on a white chip — the supplied logos are
                                        light-background assets, so the chip keeps them
                                        legible on the dark card too. */}
                                    <span className="mb-7 inline-flex h-[72px] w-[136px] shrink-0 items-center justify-center rounded-[14px] bg-white/0 ring-1 ring-black/[0.08] md:mb-8 dark:ring-white/10">
                                        <img
                                            src={t.logo}
                                            alt={t.label}
                                            loading="lazy"
                                            className="max-h-[52px] max-w-[110px] object-contain"
                                        />
                                    </span>

                                    <blockquote className="font-tommy-regular text-[14.5px] leading-[1.72] text-[#3A3730] md:text-[15.5px] dark:text-[#CFCABF]">
                                        “{t.quote}”
                                    </blockquote>

                                    {/* Pushes the attribution to the card's foot so every
                                        byline sits on the same line regardless of quote length. */}
                                    <figcaption className="mt-auto pt-8">
                                        <p className="font-tommy-medium text-[16px] text-[#1A1917] dark:text-white">
                                            {t.name}
                                        </p>
                                        {t.role && (
                                            <p className="mt-1.5 font-tommy-regular text-[12.5px] leading-[1.5] text-[#6F6A60] dark:text-[#9A968E]">
                                                {t.role}
                                            </p>
                                        )}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
