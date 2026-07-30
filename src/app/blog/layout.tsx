import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog — Advertising Wheels',
    description:
        'Insights from the road — out-of-home strategy, truckside measurement, GPS routing, wrap creative and the earned-media flywheel, from the Advertising Wheels team.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
