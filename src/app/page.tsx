import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <div className='w-full'>
      <Preloader />
      <Hero />
    </div>
  );
}
