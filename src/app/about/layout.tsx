import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About — Advertising Wheels',
    description:
        'Founded 1999. Owner-operated. Headquartered in Brentwood, Tennessee. The seasoned operator in mobile truckside advertising for Fortune 500 brands and their agencies — 1,000+ premium trucks, GPS-verified and independently measured.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
