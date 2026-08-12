'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ── Chapter pacing, in scrub units ──────────────────────────────────────────
   One SEG is one chapter: its handover plus the rest that follows. Everything
   below is expressed in these units and converted to scroll distance by the
   trigger, so changing the section's height re-paces the whole thing rather
   than desyncing the snap points from the tweens. */
const OUT_DUR = 0.3;
const IN_DUR = 0.4;
const SEG = 1;
/** How far into a segment the incoming panel starts, i.e. the handover point.
    The outgoing panel is already on its way down by then. */
const HANDOVER = OUT_DUR * 0.6;
/** Where inside a segment the chapter is settled — what the scroll snaps to. */
const REST_AT = 0.75;

/** Attached on approach, never in the markup — see the effect that uses it. */
const VIDEO_SRC = '/assets/videos/why-choose-video.mp4';

const CHAPTERS = [
    {
        tag: '01 Efficiency',
        title: 'The Smart Play',
        body: `One truck. 600 square feet of uninterrupted brand canvas moving through daily life — seen up close, in motion, and again tomorrow. Presence a static board can't match, at a fraction of the cost.`,
    },
    {
        tag: '02 Reach',
        title: 'The Everywhere Illusion',
        body: 'The same truck seen on five streets feels like fifty. Sightings become photos, photos become posts — the earned-media flywheel starts spinning on its own.',
    },
    {
        tag: '03 Scale',
        title: 'Real Trucks. Real Routes.',
        body: 'Your brand rides working delivery fleets — moving through the neighborhoods, retail corridors, and commercial zones of your DMA all day, every day. Start with a handful of trucks in one market. Scale to fleets across 50 DMAs.',
    },
    {
        tag: '04 Proof',
        title: 'Proof in the Pavement',
        body: 'Every mile is measured. 24/7 GPS telemetry, impressions independently verified by StreetMetrics, and wrap condition reporting — analytics that outlive any campaign flight.',
    },
];

export default function WhyChooseUs() {
    const rootRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    // We use a ref to track active index inside the GSAP loop without triggering constant re-renders
    const activeIndexRef = useRef(-1);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add({
                isMobile: "(max-width: 1279px)",
                isDesktop: "(min-width: 1280px)"
            }, (context) => {
                const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean };

                // Set initial states
                gsap.set('.wcu-heading', { autoAlpha: 0, y: 30 });
                gsap.set('.wcu-video-block', { y: '80vh', autoAlpha: 0 });
                gsap.set('.wcu-body-text', { autoAlpha: 0, yPercent: 100 });

                if (isMobile) {
                    CHAPTERS.forEach((_, i) => {
                        if (i > 0) gsap.set(`.wcu-tab-mobile-${i}`, { autoAlpha: 0, yPercent: 100 });
                    });
                }

                /* Built first, WITHOUT its trigger, because the snap points are
                   positions on this timeline and cannot be computed until it has a
                   duration. The trigger is attached at the bottom. */
                const tl = gsap.timeline();

                // 1. Heading appears
                tl.to('.wcu-heading', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' });

                /* 2. Video block scrolls up from bottom — the section "sticks first":
                   this whole entrance happens before chapter 1 is on deck. Kept short
                   relative to the four chapters on purpose. It is scroll the reader
                   spends watching one thing arrive, and at the original 1.9 units it
                   was a third of the section's travel before the content even began. */
                tl.to('.wcu-video-block', { y: 0, autoAlpha: 1, duration: 0.95, ease: 'power2.out' }, '+=0.15');
                tl.addLabel('chapters', '+=0.1');

                /* 3. The chapters.

                   These are ON the scrubbed timeline, not fired as side effects from
                   an onUpdate. That distinction is the whole fix for the section
                   opening two panels at once: an onUpdate that hides `oldIndex` and
                   shows `newIndex` only ever accounts for TWO panels, so a fast
                   scroll that carries the playhead from chapter 0 to chapter 2 in one
                   frame leaves chapter 1 shown and never told to leave. Those tweens
                   also ran in real time, against a scrub that was still easing the
                   playhead, so two of them could be mid-flight in opposite
                   directions and whichever finished last won.

                   On the timeline there is no index to skip and no race. Every
                   panel's state is a pure function of the playhead: scrub anywhere,
                   at any speed, in either direction, and GSAP renders exactly the
                   one arrangement that position describes. */
                CHAPTERS.forEach((_, i) => {
                    const at = `chapters+=${i * SEG}`;

                    if (i > 0) {
                        tl.to(`.wcu-body-text-${i - 1}`,
                            { yPercent: 100, autoAlpha: 0, duration: OUT_DUR, ease: 'power2.in' },
                            at);

                        if (isMobile) {
                            tl.to(`.wcu-tab-mobile-${i - 1}`,
                                { yPercent: -100, autoAlpha: 0, duration: OUT_DUR, ease: 'power2.in' },
                                at);
                        }
                    }

                    // Overlapped slightly, so the outgoing panel is already clearing
                    // as the next one rises rather than the two cross-fading in place.
                    tl.fromTo(`.wcu-body-text-${i}`,
                        { yPercent: 100, autoAlpha: 0 },
                        { yPercent: 0, autoAlpha: 1, duration: IN_DUR, ease: 'power2.out' },
                        i > 0 ? `${at}+=${HANDOVER}` : at);

                    if (isMobile && i > 0) {
                        tl.fromTo(`.wcu-tab-mobile-${i}`,
                            { yPercent: 100, autoAlpha: 0 },
                            { yPercent: 0, autoAlpha: 1, duration: IN_DUR, ease: 'power2.out' },
                            `${at}+=${HANDOVER}`);
                    }
                });

                /* The last chapter needs the same rest as the others, and there is no
                   following handover to provide it — without this the timeline ends
                   the instant panel 4 lands and its snap point sits past the end. */
                tl.to({}, { duration: SEG - IN_DUR }, `chapters+=${(CHAPTERS.length - 1) * SEG + IN_DUR}`);

                const chaptersAt = tl.labels.chapters;
                const total = tl.duration();

                /* One resting place per chapter, plus the top of the section so the
                   entrance has somewhere to settle instead of being yanked straight
                   into chapter 1. This is what makes one scroll open one panel. */
                const snapPoints = [
                    0,
                    ...CHAPTERS.map((_, i) => (chaptersAt + i * SEG + REST_AT) / total),
                ];

                /* The tab highlight, derived from the playhead rather than tracked
                   alongside it — same reason as the panels. Reading `tl.time()` means
                   the label can never disagree with the panel that is showing.

                   It flips at the HANDOVER, not at the segment boundary: the outgoing
                   panel is eased out with `power2.in`, whose first moments barely
                   move, so a boundary flip lit the next tab while the previous
                   paragraph was still sitting there at full opacity. */
                const indexAt = (t: number) => {
                    if (t < chaptersAt) return -1;
                    const rel = t - chaptersAt;
                    const i = Math.min(CHAPTERS.length - 1, Math.floor(rel / SEG));
                    return i > 0 && rel - i * SEG < HANDOVER ? i - 1 : i;
                };

                tl.eventCallback('onUpdate', () => {
                    const i = indexAt(tl.time());
                    if (i !== activeIndexRef.current) {
                        activeIndexRef.current = i;
                        setActiveIndex(i);
                    }
                });

                ScrollTrigger.create({
                    animation: tl,
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                    snap: {
                        snapTo: snapPoints,
                        duration: { min: 0.2, max: 0.5 },
                        delay: 0.06,
                        ease: 'power2.inOut',
                    },
                });
            });
        },
        { scope: rootRef }
    );

    /* iOS will not autoplay unless the video is BOTH inline and muted at the
       moment play is attempted, and it judges that from the DOM rather than from
       React's props: `muted` is a property, not an attribute, so a server-rendered
       <video muted> can reach Safari without it and the play promise is rejected
       before hydration ever sets it. Setting it on the element and then asking
       again is what actually starts it.
       The retries cover the two states where iOS refuses a first attempt outright
       — Low Power Mode, and a tab that was never foregrounded — neither of which
       reports as an error worth surfacing. */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;

        const play = () => { void v.play().catch(() => { }); };

        /* The src is attached here rather than in the markup, once the section
           is within a screen of the viewport, so a 64 MB download never overlaps
           the initial page load. `play()` only starts once there is something
           to play.

           Deliberately a scroll listener and not an IntersectionObserver. Both
           express the intent, but they fail in opposite directions: if an
           observer never delivers a callback the src is never set and the
           section is a black rectangle for good, whereas this recomputes from
           the element's own geometry every time and cannot get stuck. The check
           is a `getBoundingClientRect` on one element behind a passive listener,
           and it unsubscribes the moment it fires. */
        const attach = () => {
            if (v.getAttribute('src')) return true;
            v.setAttribute('src', VIDEO_SRC);
            v.load();
            play();
            return true;
        };

        const maybeAttach = () => {
            const el = rootRef.current;
            if (!el) return;
            // One viewport of warning, so it is buffered by the time it shows.
            if (el.getBoundingClientRect().top > window.innerHeight * 2) return;
            attach();
            window.removeEventListener('scroll', maybeAttach);
            window.removeEventListener('resize', maybeAttach);
        };

        maybeAttach(); // in case it is already in range on load (short pages, deep links)
        window.addEventListener('scroll', maybeAttach, { passive: true });
        window.addEventListener('resize', maybeAttach, { passive: true });

        const onVisible = () => { if (!document.hidden) play(); };
        document.addEventListener('visibilitychange', onVisible);
        // Low Power Mode holds out until the user touches the page at least once.
        window.addEventListener('touchstart', play, { once: true, passive: true });

        return () => {
            window.removeEventListener('scroll', maybeAttach);
            window.removeEventListener('resize', maybeAttach);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('touchstart', play);
        };
    }, []);

    return (
        <div ref={rootRef} className="relative h-[400vh] w-full bg-[#EEE8D9] pb-[100px]">
            <div className="sticky top-0 flex h-screen w-full flex-col px-4 md:px-8 lg:px-12 pt-20 pb-3">

                {/* Heading and Intro Text */}
                <div className="wcu-heading mb-[10px] text-center shrink-0">
                    <h2 className="font-tommy-bold text-[32px] uppercase leading-[1.05] tracking-tight md:text-[clamp(1.75rem,3vw,2.875rem)] text-[#1A1917]">
                        Why Choose Us<span className="text-[#C8992B]">.</span>
                    </h2>
                    <p className="mt-1 md:mt-2 max-w-[430px] mx-auto font-tommy-regular text-[14px] leading-[1.6] md:text-[15px] text-[#6F6A60]">
                        Four reasons brands move budget onto the road — efficiency, reach,
                        scale, and proof you can audit.
                    </p>
                </div>

                {/* Video and Tabs Wrapper */}
                <div className="wcu-video-block flex-1 w-full flex flex-col">
                    {/* 1. Large Rounded Video Container */}
                    <div className="relative flex-1 w-full rounded-[16px] md:rounded-[32px] overflow-hidden bg-black shadow-2xl">
                        {/* VIDEO PLACEHOLDER */}
                        <div className="relative inset-0 w-full h-full">
                            <div className='absolute top-0 left-0 w-full h-full z-100' style={{
                                background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 65.21%, rgba(0, 0, 0, 0.46) 84.67%)"
                            }}>

                            </div>
                            {/* `playsInline` is not optional on iOS: without it
                                Safari takes the video fullscreen on play, which
                                counts as a user-initiated presentation and is
                                refused outright when autoplay asks for it. */}
                            {/* No `src` here — see the effect. The file is 64 MB
                                and this section is several screens down, so
                                naming it in the markup starts that download
                                during the initial page load, competing with the
                                hero for the whole connection. `preload="none"`
                                is not enough on its own: it is a hint browsers
                                are free to ignore, and Chrome routinely does for
                                an autoplaying element. Withholding the src is
                                the only instruction that always holds. */}
                            <video
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                loop
                                autoPlay
                                muted
                                playsInline
                                preload="none"
                                disablePictureInPicture
                                aria-hidden="true"
                            />
                        </div>

                        {/* Dark text overlay boxes */}
                        <div className="absolute inset-0 w-full flex flex-row gap-0 xl:gap-4 px-0 xl:px-8 pointer-events-none">
                            {CHAPTERS.map((ch, i) => (
                                /* Below `lg` the four columns OVERLAP instead of sitting side
                                   by side. A quarter of a phone screen is about 90px, which
                                   shreds a paragraph into a ladder of two-word lines; even a
                                   768px tablet only buys 152px, a 380px-tall ribbon of text.
                                   The split needs roughly 260px a column to read, so it waits
                                   for `lg`. Only one panel is ever visible at a time, so
                                   stacking them costs nothing and hands the active one the
                                   full width. */
                                <div
                                    key={i}
                                    className="absolute inset-x-2 top-0 bottom-0 h-full xl:relative xl:inset-auto xl:flex-1"
                                >
                                    <div style={{
                                        background: "linear-gradient(0deg, rgba(255, 255, 255, 0.3) 0%, rgba(23, 23, 23, 0.3) 100%)"
                                    }}
                                        className={`wcu-body-text wcu-body-text-${i} absolute bottom-0 w-full h-auto bg-black/70 backdrop-blur-lg px-2 md:px-4 pt-2 md:pt-4 pb-3 md:pb-6 lg:pb-8 rounded-t-[12px] md:rounded-t-[6px] pointer-events-auto z-[9999999]`}
                                    >
                                        <p className="font-tommy-medium text-[12px] md:text-[14px] 2xl:text-[16px] leading-[1.55] md:leading-[1.6] text-white/90">
                                            {ch.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Bottom Navigation Bar — rolls as a single box until `xl`, one strip above it.
                           Four across at phone width was wrapping titles too much. Now they roll 
                           in a single shared container. Switches with the panels above. */}
                    <div className="relative h-[85px] md:h-[105px] overflow-hidden w-full shrink-0 z-10 px-2 mt-2 xl:overflow-visible xl:h-auto xl:mt-0 xl:px-8">
                        <div className="relative w-full h-full xl:flex xl:flex-row xl:gap-4">
                            {CHAPTERS.map((ch, i) => {
                                const isActive = activeIndex === i;
                                return (
                                    <div
                                        key={i}
                                        /* On mobile, this is always styled active since it's the only one shown,
                                           while on desktop it transitions colors. */
                                        className={`wcu-tab-mobile-${i} absolute inset-0 xl:relative xl:inset-auto flex flex-col justify-center rounded-[10px] border px-3 py-2.5 transition-colors duration-500 md:px-5 md:py-4 xl:flex-1 xl:rounded-[0px] xl:rounded-b-[6px] xl:py-5 cursor-pointer bg-[#F5F2EA] shadow-inner border-black/5 xl:shadow-none xl:border-transparent xl:bg-white xl:hover:bg-black/[0.02] ${isActive ? 'xl:!bg-[#F5F2EA] xl:!shadow-inner xl:!border-black/5' : ''}`}
                                    >
                                        <p className={`font-tommy-medium text-[10px] md:text-[11px] xl:text-[13px] 2xl:text-[16px] tracking-[1px] md:tracking-[2px] transition-colors duration-500 text-[#C8992B] xl:text-[#8A857C] ${isActive ? 'xl:!text-[#C8992B]' : ''}`}>
                                            {ch.tag}
                                        </p>
                                        <h4 className={`font-tommy-bold text-[14px] md:text-[16px] xl:text-[22px] 2xl:text-[28px] leading-[1.15] md:leading-[1.1] transition-colors duration-500 text-[#1A1917] xl:text-[#1A1917]/50 ${isActive ? 'xl:!text-[#1A1917]' : ''}`}>
                                            {ch.title}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
