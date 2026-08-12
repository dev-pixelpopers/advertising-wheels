import AdvertisingLeader from '@/components/AdvertisingLeader';
import SecondSection from '@/components/SecondSection';
import TruckExperience from '@/components/TruckExperience';
import MarketsCoverageV2 from '@/components/MarketsCoverageV2';
import WhyChooseUs from '@/components/WhyChooseUs';
import CtaSection from '@/components/CtaSection';
import HeroWrapper from '@/components/HeroWrapper';

export default function Home() {
  return (
    <>
      <HeroWrapper />
      <div className='relative z-[80] w-full bg-[#EEE8D9]  pt-[100px] second-home-section -mt-[100vh]'>
        <div className='max-w-none w-full mx-auto'>
          <SecondSection />
        </div>
        <AdvertisingLeader />
        <TruckExperience />
        <MarketsCoverageV2 />
        <WhyChooseUs />
        <CtaSection />
      </div>
    </>
  );
}
