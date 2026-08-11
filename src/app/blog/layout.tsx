import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Blog — Advertising Wheels',
    description:
        'Insights from the road — out-of-home strategy, truckside measurement, GPS routing, wrap creative and the earned-media flywheel, from the Advertising Wheels team.',
    path: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
