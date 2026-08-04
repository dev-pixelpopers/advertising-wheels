'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function AdvertisingLeader() {
    const rootRef = useRef<HTMLDivElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    const btnRef = useRef<HTMLAnchorElement>(null);
    const svgRef = useRef(null);
    const textSceneRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Split the paragraph into lines (keeps the coloured highlight spans intact).
            const split = new SplitText(paraRef.current, {
                type: 'lines',
                linesClass: 'leader-line',
            });

            // Two concentric rings — set each to its own circumference, fully hidden,
            // so they draw on (to full) with the scroll.
            const q = gsap.utils.selector(rootRef);
            const ring1 = (q('.layer-1')[0] as unknown as SVGCircleElement) || null;
            const ring2 = (q('.layer-2')[0] as unknown as SVGCircleElement) || null;
            const len1 = ring1 ? ring1.getTotalLength() : 0;
            const len2 = ring2 ? ring2.getTotalLength() : 0;
            if (ring1) gsap.set(ring1, { strokeDasharray: len1, strokeDashoffset: len1 });
            if (ring2) gsap.set(ring2, { strokeDasharray: len2, strokeDashoffset: len2 });

            // One pinned stage, one scene. Positions are absolute (not '+=') so each
            // beat's share of the pin stays predictable at ~580px per timeline unit.
            //
            // The pin was 3800px when a second scene of proof cards followed the
            // statement. That scene is gone, so the pin is scaled back to match the
            // 4.5 units this timeline actually uses — leaving it at 3800 would have
            // meant roughly 1200px of scrolling against a finished, static stage.
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.2,
                },
            });

            // ── THE STATEMENT ──
            // Text reveals line by line, blur → readable, while the rings draw on behind it.
            tl.fromTo(
                split.lines,
                { filter: 'blur(12px)', autoAlpha: 0.15, yPercent: 20 },
                { filter: 'blur(0px)', autoAlpha: 1, yPercent: 0, stagger: 0.25, duration: 1.2 },
                0
            )
                // One full turn across the section — duration tracks the timeline length.
                .to(svgRef.current, { rotation: 360, transformOrigin: '50% 50%', duration: 4.5 }, 0);

            if (ring1) tl.to(ring1, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0.2);
            if (ring2) tl.to(ring2, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, 0.2);

            // Button fades up once the sentence has landed.
            tl.from(btnRef.current, { y: 24, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 2.4);

            // ── OUT — rings erase and the statement lifts away, handing off to the
            // truck section. Both land on 4.5, exactly where the pin releases, so the
            // stage is never left empty and never cut off mid-exit.
            if (ring1) tl.to(ring1, { strokeDashoffset: len1, duration: 1, ease: 'power2.inOut' }, 3.5);
            if (ring2) tl.to(ring2, { strokeDashoffset: len2, duration: 0.9, ease: 'power2.inOut' }, 3.6);
            tl.to(textSceneRef.current, { yPercent: -55, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 3.6);

            // Restore the original paragraph markup on cleanup/HMR.
            return () => {
                split.revert();
            };
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className='relative h-[250vh] w-full'>
            <div className='sticky top-0 z-10 w-full h-dvh overflow-hidden rounded-[20px] bg-white dark:bg-[#141414] mx-auto mt-[20px] transition-colors duration-300 shadow-sm dark:shadow-black/50  max-w-[95%]'>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <svg
                        ref={svgRef}
                        width="800"
                        height="800"
                        viewBox="0 0 895 895"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ overflow: 'visible' }}
                    >
                        <circle className="layer-1" opacity="0.28" cx="447.5" cy="447.5" r="442.5" stroke="#EEE8D9" strokeWidth="10" />
                        <circle className="layer-2" opacity="0.22" cx="448" cy="448" r="360" stroke="#EEE8D9" strokeWidth="10" />
                    </svg>
                </div>
                {/* THE STATEMENT — own layer, centred on the stage. */}
                <div ref={textSceneRef} className="relative w-full h-full inset-0 z-10 flex flex-col items-center justify-center px-[3%] lg:px-[2%] xl:px-[5%] 2xl:px-[10%]">
                    <p ref={paraRef} className="text-[#2C2C2B] dark:text-[#EAEAEA] transition-colors duration-300 text-[20px] md:text-[25px] lg:text-[clamp(1.1rem,2.2vw,2.25rem)] leading-[183%] font-tommy-medium text-center capitalize w-full">
                        Advertising Wheels is the leader in truckside billboard advertising. For 25+ years
                        <span className="text-[#D5CCB4] dark:text-[#8C8472]"> we’ve helped national and local brands own the street with one of the largest truckside fleets in the country —</span> pairing bold, high-impact creative with GPS-tracked routing and independently verified impressions
                        <span className="text-[#D5CCB4] dark:text-[#8C8472]"> so every campaign is planned, targeted, and measurable.</span>
                    </p>
                    <a ref={btnRef} className="rounded-[6px] bg-[#282828] dark:bg-[#FCD119] py-[6px] md:py-[10px] lg:py-[12px] px-[20px] md:px-[35px] lg:px-[50px] text-[16px] md:text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[208%] text-[#FCD119] dark:text-black font-tommy-regular w-max mt-[50px] transition-colors duration-300 cursor-pointer">More about us</a>
                </div>
            </div>

        </div>
    )
}
