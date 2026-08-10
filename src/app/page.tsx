"use client";
import { useState, useEffect } from 'react';
import { hasSeenPreloader, markPreloaderSeen } from '@/lib/preloaderSeen';
import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';
import AdvertisingLeader from '@/components/AdvertisingLeader';
import SecondSection from '@/components/SecondSection';
import TruckExperience from '@/components/TruckExperience';
import MarketsCoverageV2 from '@/components/MarketsCoverageV2';
import WhyChooseUs from '@/components/WhyChooseUs';
import CtaSection from '@/components/CtaSection';

export default function Home() {
  /* Starts false on BOTH server and client so hydration matches, then the
     effect below skips the intro on the same tick if it has already played.
     Reading storage in the initialiser instead would render different markup
     on the two sides and desync hydration. The visual side of the skip is not
     left to this effect — the head script has already hidden the intro before
     the first paint, so there is nothing to flash. */
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);

  useEffect(() => {
    if (hasSeenPreloader()) setIsPreloaderDone(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 relative'>
      {!isPreloaderDone && (
        <Preloader
          onComplete={() => {
            markPreloaderSeen();
            setIsPreloaderDone(true);
          }}
        />
      )}

      <Hero isReady={isPreloaderDone} />

      {/* Rides up over the Hero's final 100vh — the negative margin is what
          lets the Hero hold its finished frame while this section arrives. */}
      <div className='relative z-[80] w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 pt-[100px] second-home-section -mt-[100vh]'>
        <div className='max-w-none w-full mx-auto'>
          <SecondSection />
        </div>
        <AdvertisingLeader />
        <TruckExperience />
        <MarketsCoverageV2 />
        <WhyChooseUs />
        <CtaSection />
      </div>
    </div>
  );
}
