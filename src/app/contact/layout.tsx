import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact — Advertising Wheels',
    description:
        'Book a route, wrap a fleet or partner your trucks. Talk to the Advertising Wheels team — artwork to first highway mile in days.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
