import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Contact | Advertising Wheels',
    description:
        'Book a route, wrap a fleet or partner your trucks. Talk to the Advertising Wheels team — artwork to on the road in days.',
    path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
