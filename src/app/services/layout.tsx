import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Services | Advertising Wheels',
    description:
        'Truckside mobile billboards, premium fleet wraps, ZIP-level targeting and retargeting, impressions verified by StreetMetrics, creative studio and full campaign management.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
