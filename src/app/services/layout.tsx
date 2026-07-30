import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Services — Advertising Wheels',
    description:
        'Truckside mobile billboards, in-house fleet wraps, GPS routing and targeting, independently verified impressions, creative studio and full campaign management.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
