'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
    const textContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    // We use a ref to track active index inside the GSAP loop without triggering constant re-renders
    const activeIndexRef = useRef(-1);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.1, // Slight smoothing
                    invalidateOnRefresh: true,
                },
            });

            // Set initial states
            gsap.set('.wcu-heading', { autoAlpha: 0, y: 30 });
            gsap.set('.wcu-video-block', { y: '80vh', autoAlpha: 0 });
            gsap.set('.wcu-body-text', { autoAlpha: 0, yPercent: 100 });

            // 1. Heading appears
            tl.to('.wcu-heading', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });

            // 2. Video block scrolls up from bottom
            tl.to('.wcu-video-block', { y: 0, autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, '+=0.2');

            // 3. Tab animations (takes up the rest of the scroll)
            // We animate a dummy object from -0.1 to CHAPTERS.length - 0.01
            const progressObj = { value: -0.1 };

            tl.to(progressObj, {
                value: CHAPTERS.length - 0.01,
                duration: CHAPTERS.length, // Scales this phase to be the longest
                ease: 'none',
                onUpdate: () => {
                    if (progressObj.value < 0) return; // Wait until it crosses 0

                    const newIndex = Math.floor(progressObj.value);
                    if (newIndex !== activeIndexRef.current) {
                        const oldIndex = activeIndexRef.current;
                        activeIndexRef.current = newIndex;
                        setActiveIndex(newIndex);

                        if (oldIndex >= 0) {
                            // Animate old text down (out) and fade
                            gsap.to(`.wcu-body-text-${oldIndex}`, {
                                yPercent: 100,
                                autoAlpha: 0,
                                duration: 0.3,
                                ease: 'power2.inOut'
                            });
                        }

                        // Animate new text up (in) from bottom
                        gsap.fromTo(`.wcu-body-text-${newIndex}`,
                            { yPercent: 100, autoAlpha: 0 },
                            { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 }
                        );
                    }
                }
            });

            // Set initial state for text boxes
            gsap.set('.wcu-body-text', { autoAlpha: 0, yPercent: 100 });
            gsap.set(`.wcu-body-text-0`, { autoAlpha: 1, yPercent: 0 });

        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="relative h-[400vh] w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] pb-[100px]">
            <div className="sticky top-0 flex h-screen w-full flex-col px-4 md:px-8 lg:px-12 pt-20 pb-3">

                {/* Heading and Intro Text */}
                <div className="wcu-heading mb-[10px] text-center shrink-0">
                    <h2 className="font-tommy-bold text-[32px] uppercase leading-[1.05] tracking-tight md:text-[clamp(1.75rem,3vw,2.875rem)] text-[#1A1917] dark:text-white">
                        Why Choose Us<span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                    </h2>
                    <p className="mt-1 md:mt-2 max-w-[430px] mx-auto font-tommy-regular text-[14px] leading-[1.6] md:text-[15px] text-[#6F6A60] dark:text-[#9A968E]">
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
                            <video src="/assets/videos/why-choose-video.mp4" className="absolute inset-0 w-full h-full object-cover" loop autoPlay muted>
                            </video>
                        </div>

                        {/* Dark text overlay boxes */}
                        <div className="absolute inset-0 w-full flex flex-row gap-2 md:gap-4 px-2 md:px-6 lg:px-8 pointer-events-none">
                            {CHAPTERS.map((ch, i) => (
                                <div key={i} className="flex-1 relative h-full">
                                    <div style={{
                                        background: "linear-gradient(0deg, rgba(255, 255, 255, 0.3) 0%, rgba(23, 23, 23, 0.3) 100%)"
                                    }}
                                        className={`wcu-body-text wcu-body-text-${i} absolute bottom-0 w-full h-auto bg-black/70 backdrop-blur-lg px-4 pt-4 pb-8 rounded-t-[12px] md:rounded-t-[6px] pointer-events-auto z-[9999999]`}
                                    >
                                        <p className="font-tommy-medium text-[11px] md:text-[14px] lg:text-[16px] leading-[1.6] text-white/90">
                                            {ch.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Bottom Navigation Bar */}
                    <div className="flex flex-row w-full overflow-hidden shrink-0 z-10 px-2 md:px-6 lg:px-8 gap-2 md:gap-4">
                        {CHAPTERS.map((ch, i) => {
                            const isActive = activeIndex === i;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-b-[6px] bg-white flex flex-col justify-center px-3 py-3 md:px-5 md:py-4 lg:py-5 transition-colors duration-500 ${isActive
                                        ? 'bg-[#F5F2EA] dark:bg-[#1A1A1A] shadow-inner border border-black/5 dark:border-white/5'
                                        : 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer border border-transparent'
                                        }`}
                                >
                                    <p className={`font-tommy-medium text-[8px] md:text-[11px] lg:text-[20px] tracking-[1px] md:tracking-[2px] transition-colors duration-500 ${isActive ? 'text-[#C8992B] dark:text-[#FCD119]' : 'text-[#8A857C] dark:text-[#6F6A60]'}`}>
                                        {ch.tag}
                                    </p>
                                    <h4 className={`font-tommy-bold text-[12px] md:text-[16px] lg:text-[30px] leading-[1.1] transition-colors duration-500 ${isActive ? 'text-[#1A1917] dark:text-white' : 'text-[#1A1917]/50 dark:text-white/50'}`}>
                                        {ch.title}
                                    </h4>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
