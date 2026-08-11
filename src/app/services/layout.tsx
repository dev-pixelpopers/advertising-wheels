import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Services | Advertising Wheels',
    description:
        'Truckside mobile billboards, premium fleet wraps, ZIP-level targeting and retargeting, impressions verified by StreetMetrics, creative studio and full campaign management.',
    path: '/services',
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
