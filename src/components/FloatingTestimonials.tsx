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
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGOS = '/assets/images/clients-logo';

interface Testimonial {
    quote: string;
    name: string;
    /** Role line under the name. Omitted where the source gives no person. */
    role?: string;
    logo: string;
    /** Optional dark-theme variant of the mark. When set, `logo` shows on the
     *  light theme and this swaps in on the dark theme. */
    logoDark?: string;
    /** Accessible name for the logo chip. */
    label: string;
    /** Optional per-logo size override (e.g. a very wide or very small mark that
     *  needs nudging to sit at the same optical weight as the rest). Defaults to
     *  the uniform-height class below. */
    logoClass?: string;
}

/** One shared height for every mark, width auto, centred and contained — so
 *  logos of different aspect ratios all read at the same optical size. */
const LOGO_BASE = 'h-full object-contain';

/** Verbatim from the supplied testimonials sheet. */
const TESTIMONIALS: Testimonial[] = [
    {
        quote: 'Amid a transitional period requiring a shift in brand perception and tighter marketing budgets, Hertz leveraged truck advertising as its primary top-of-funnel tactic for high visibility and cost-effectiveness. The strategy reversed a five-year decline in eCommerce revenue.',
        name: 'Jeff Voorhees',
        role: 'Senior Director, Hertz',
        logo: `${LOGOS}/hertz-logo.webp`,
        label: 'Hertz',
    },
    {
        quote: 'Advertising Wheels exceeded my expectations. I had little time and they really came through for me. The mobile billboards were the highlight of Nationwide’s presence and are still talked about. Thank you Advertising Wheels!',
        name: 'Torri Aprile',
        role: 'Marketing Director, Nationwide Insurance',
        logo: `${LOGOS}/partner-nationwide.webp`,
        label: 'Nationwide Insurance',
    },
    {
        quote: 'Truck advertising has grown into a key portion of our brand marketing budget, yielding record brand awareness and household production growth.',
        name: 'Nick Ferrugia',
        role: 'Director, Brand and Performance Marketing, Fifth Third Bank',
        logo: `${LOGOS}/5th_3rd.webp`,
        label: 'Fifth Third Bank',
    },
    {
        quote: 'Advertising Wheels’ value proposition is delivery of high impact visual messaging that is quick/easy to implement, unusually cost effective, and highly measurable.',
        name: 'Michael Sapienza',
        role: 'Former VP New Product Marketing, Wendy’s International',
        logo: `${LOGOS}/partner-wendys.webp`,
        label: 'Wendy’s International',
    },
    {
        quote: 'The client’s goals and objectives are achieved... as the team implement and execute outstanding results. Recognition is city wide... but memorable.',
        name: 'Jeff Byron',
        role: 'General Manager, Saks Fifth Avenue',
        logo: `${LOGOS}/partner-saks-white.webp`,
        logoDark: `${LOGOS}/partner-saks-dark.webp`,
        label: 'Saks Fifth Avenue',
    },
    {
        quote: 'The staff at Advertising Wheels was courteous, helpful, and always handled themselves with the highest level of professionalism from the design stage to installation.',
        name: 'Athletic Department',
        role: 'The Ohio State University',
        logo: `${LOGOS}/ohio-state-university-logo.webp`,
        label: 'The Ohio State University',
    },
    {
        quote: 'We have won the REGIONAL gold medal for outdoor advertising from the National Council for Marketing and Public Relations... as winner of the regional award, we have been submitted for consideration for the national award from NCMPR. Thank you for helping raise the bar on our marketing!',
        name: 'Greg Krizman',
        role: 'Executive Director of Public Relations, Cuyahoga Community College',
        logo: `${LOGOS}/partner-cuyahoga.webp`,
        label: 'Cuyahoga Community College',
    },
];

/**
 * `embedded` hands control to a parent timeline: the component renders to fill
 * its container and runs no ScrollTrigger of its own (the parent drives the
 * header via [data-tm-head] and the rail via [data-tm-rail]). Used inside
 * SecondSection, where the testimonials play between the marquee and the case
 * studies on a single pinned stage.
 */
export default function FloatingTestimonials({ embedded = false }: { embedded?: boolean } = {}) {
    const rootRef = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (embedded) return; // the parent owns all motion
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

            const rail = railRef.current;
            const view = viewportRef.current;
            if (!rail || !view) return;

            // Recomputed on every refresh so a resize or font swap can't leave
            // the rail short of its last card.
            const travel = () => Math.max(0, rail.scrollWidth - view.clientWidth);

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
                .to({}, { duration: 25 }); // the hold

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
                gsap.set(rail, { clearProps: 'x' });
            };
        },
        { scope: rootRef }
    );

    return (
        <section
            ref={rootRef}
            /* Embedded, this panel carries NO background of its own. It slides in
               over the logo field, and an opaque fill would read as a sheet being
               wiped across the screen — the thing the hand-off is trying not to
               be. The marquee clears itself out underneath instead, and the page
               behind supplies the colour. Standalone it still needs its own. */
            className={`relative w-full  pt-[5%] ${embedded ? 'h-full' : 'bg-[#EEE8D9]'}`}
        >
            <div
                ref={frameRef}
                className={`flex w-full items-center md:px-8 lg:px-4 ${embedded ? 'h-full' : 'h-screen h-[100dvh]'}`}
            >
                {/* Plain container — cards sit straight on the section ground.

                    Embedded, this box is also the physics obstacle the logo
                    field has to divide around as the panel slides in: it is the
                    card's actual painted extent, so it leaves a band of clear
                    stage above and below for marks to curve through. Tagging the
                    full-height panel instead would give them nowhere to go. */}
                <div data-tm-obstacle className="mx-auto w-full py-2 sm:py-4 md:py-8 3xl:py-0 lg:py-[7vh]">
                    {/* ---------------- Header (left aligned) ---------------- */}
                    <div
                        data-tm-head
                        className="px-6 md:px-7 mb-[2vh] xl:mb-[3vh] 2xl:mb-[4vh] 3xl:mb-[5vh] lg:px-[4.5%]"
                    >
                        <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#6F6A60] sm:text-[11px] sm:tracking-[4px] md:text-[12px]">
                            Testimonials
                        </p>
                        {/* No max-width: with one, "it." wrapped onto its own line. The
                            explicit <br/> is the only intended break. */}
                        <h2 className="3xl:mt-2 font-tommy-bold text-[22px] leading-[100%] 3xl:leading-[1.15] tracking-tight text-[#1A1917] sm:text-[30px] md:text-[42px] lg:text-[clamp(30px,3.4vw,52px)]">
                            Don’t take our word for it.
                            <br />
                            Hear it from our partners<span className="text-[#FCD119]">.</span>
                        </h2>
                    </div>

                    {/* ---------------- The rail ---------------- */}
                    <div
                        ref={viewportRef}
                        data-tm-viewport
                        className="w-full overflow-hidden pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <div
                            ref={railRef}
                            data-tm-rail
                            className="flex w-max gap-2 lg:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 px-3 sm:px-5  md:px-8 lg:px-[4.5%]"
                        >
                            {TESTIMONIALS.map((t) => (
                                <figure
                                    key={t.label}
                                    /* Embedded, these cross the screen already set —
                                       mark, quote and byline all legible while the
                                       panel slides in, because a blank rounded box
                                       reads as a loading state and the logo field is
                                       supposed to be wrapping around a card. Kept as
                                       a hook for the parent all the same. */
                                    data-tm-card
                                    /* Opaque enough to actually be a card. At
                                       white/20 the logo field showed straight
                                       through the quotes — the marks were behind
                                       these all along, but 20% hides nothing, so
                                       it read as logos sitting on the text. The
                                       panel around them still carries no fill,
                                       so this is not the sheet-wipe the comment
                                       above is guarding against. */
                                    className="flex w-[220px] shrink-0 flex-col rounded-[18px] bg-[#F7F3E8] p-3 md:p-4 lg:p-5 xl:p-6 2xl:p-8 sm:w-[320px]  md:w-[350px] lg:w-[clamp(300px,26vw,368px)] shadow-[0_14px_40px_rgba(0,0,0,0.06)] "
                                >
                                    {/* Client mark on a white chip — the supplied logos are
                                        light-background assets, so the chip keeps them
                                        legible on the dark card too. */}
                                    <span className="mb-2 lg:mb-3 2xl:mb-4 3xl:mb-5 inline-flex w-[100px] md:w-[200px] h-[40px] md:h-[80px] overflow-hidden bg-white/0 sm:mb-7 md:mb-8 ">

                                        <Image
                                            src={t.logo}
                                            alt={t.label}
                                            width={200}
                                            height={80}
                                            loading="lazy"
                                            className={t.logoClass ?? LOGO_BASE}
                                        />
                                    </span>

                                    <blockquote className="font-tommy-regular text-[13px] leading-[1.65] text-[#3A3730] sm:text-[14.5px] sm:leading-[1.72] md:text-[clamp(0.875rem,1.1vw,0.96875rem)]">
                                        “{t.quote}”
                                    </blockquote>

                                    {/* Pushes the attribution to the card's foot so every
                                        byline sits on the same line regardless of quote length. */}
                                    <figcaption className="mt-auto pt-0 3xl:pt-8">
                                        <p className="font-tommy-medium text-[14.5px] text-[#1A1917] sm:text-[16px]">
                                            {t.name}
                                        </p>
                                        {t.role && (
                                            <p className="mt-1 font-tommy-regular text-[11.5px] leading-[1.5] text-[#6F6A60] sm:mt-1.5 sm:text-[12.5px]">
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
