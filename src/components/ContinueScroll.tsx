"use client";

import { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ContinueScroll() {

    const [showContinueIcon, setShowContinueIcon] = useState<boolean>(true);
    const scrollArrowRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        let showTimeout: ReturnType<typeof setTimeout>;

        const isFooterVisible = () => {
            const footer = document.querySelector("footer");

            if (!footer) return false;

            const rect = footer.getBoundingClientRect();

            return rect.top < window.innerHeight && rect.bottom > 0;
        };

        const handleScrollStart = () => {
            clearTimeout(showTimeout);
            setShowContinueIcon(false);
        };

        const handleScrollEnd = () => {
            clearTimeout(showTimeout);

            showTimeout = setTimeout(() => {
                if (!isFooterVisible()) {
                    setShowContinueIcon(true);
                } else {
                    setShowContinueIcon(false);
                }
            }, 500);
        };

        ScrollTrigger.addEventListener("scrollStart", handleScrollStart);
        ScrollTrigger.addEventListener("scrollEnd", handleScrollEnd);

        return () => {
            clearTimeout(showTimeout);

            ScrollTrigger.removeEventListener("scrollStart", handleScrollStart);
            ScrollTrigger.removeEventListener("scrollEnd", handleScrollEnd);
        };
    }, []);

    return (
        <>
            {showContinueIcon && (<div ref={scrollArrowRef} className="fixed bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 md:gap-3 opacity-90">

                <span
                    aria-hidden="true"
                    className="hero-swipe-hand md:hidden block h-[48px] w-[48px] bg-current text-[#1A1917]"
                    style={{
                        WebkitMaskImage: 'url(/assets/images/swipe-hand.png)',
                        maskImage: 'url(/assets/images/swipe-hand.png)',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                    }}
                />

                {/* Tablet and up — the original label + travelling arrow. */}
                <span className="hidden md:block text-[#1A1917] font-tommy-medium text-[11px] md:text-[14px] uppercase tracking-[3px]">Scroll</span>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="hero-scroll-arrow hidden md:block text-[#1A1917] md:w-[44px] md:h-[44px]">
                    <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            )}
        </>
    )
}