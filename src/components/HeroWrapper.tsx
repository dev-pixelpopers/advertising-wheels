
"use client";

import { useState, useEffect } from 'react';
import { hasSeenPreloader, markPreloaderSeen } from '@/lib/preloaderSeen';
import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';

export default function HeroWrapper() {
    const [isPreloaderDone, setIsPreloaderDone] = useState(false);

    useEffect(() => {
        if (hasSeenPreloader()) setIsPreloaderDone(true);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <>
            {!isPreloaderDone && (
                <Preloader
                    onComplete={() => {
                        markPreloaderSeen();
                        setIsPreloaderDone(true);
                    }} />
            )}
            <Hero isReady={isPreloaderDone} />
        </>
    );
}


