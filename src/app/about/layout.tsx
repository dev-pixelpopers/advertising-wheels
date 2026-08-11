import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'About | Advertising Wheels',
    description:
        'Founded 2001. One of the first companies to turn truckside into a true advertising medium. Trusted by Fortune 500 brands and their agencies — thousands of trucks activated, GPS-verified, independently measured by StreetMetrics.',
    path: '/about',
    image: '/assets/images/clients/banner image/About-main.webp',
    imageAlt: 'An Advertising Wheels truckside campaign on the street',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
