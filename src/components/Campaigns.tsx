'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Campaigns() {
    const rootRef = useRef<HTMLDivElement>(null);
    const imgWrapRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    const btnRef = useRef<HTMLAnchorElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse',
                },
            });

            tl
                // Image reveals with a clip curtain while it settles from a slight zoom.
                .from(imgWrapRef.current, {
                    clipPath: 'inset(100% 0% 0% 0%)',
                    duration: 1,
                    ease: 'power4.out',
                })
                .from(imgRef.current, {
                    scale: 1.15,
                    duration: 1.2,
                    ease: 'power3.out',
                }, 0)
                // Wordmark rises and fades in (no mask, so it can overflow above the card).
                .from(headingRef.current, {
                    y: 48,
                    autoAlpha: 0,
                    duration: 0.9,
                }, 0.25)
                // Copy and button rise in.
                .from(paraRef.current, {
                    y: 28,
                    autoAlpha: 0,
                    duration: 0.7,
                }, '-=0.45')
                .from(btnRef.current, {
                    y: 20,
                    autoAlpha: 0,
                    duration: 0.6,
                }, '-=0.4');
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="flex flex-row">
            <div ref={imgWrapRef} className="relative z-0 overflow-hidden">
                <img ref={imgRef} className='w-[881px] h-[823px] object-cover' src="/assets/images/campaings-img.png" alt="" />
            </div>
            <div className="relative z-20 py-10 max-w-[53%]">
                <h2 ref={headingRef} className="text-[230px] leading-[226px] text-white font-tommy-bold tracking-[-11px] -ml-[35%]">Campaigns<span className="text-[#FCD119]">.</span></h2>
                <div className="mt-[200px] flex flex-col gap-y-10 pl-[300px]">
                    <p ref={paraRef} className="font-tommy-regular text-[21px] text-black leading-[30px] capitalize">From local activations to nationwide rollouts, we’ve helped brands create campaigns that stand out on the streets. Every campaign is customized to meet your goals and deliver real visibility.</p>
                    <a ref={btnRef} className="rounded-[6px] bg-[#282828] py-[12px] px-[50px] text-[24px] leading-[50px] text-[#FCD119] font-tommy-regular w-max">Plan a campaign</a>
                </div>
            </div>
        </div>
    )
}
