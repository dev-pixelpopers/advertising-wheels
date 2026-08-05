import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Advertising Wheels',
    description:
        'Founded 2001. One of the first companies to turn truckside into a true advertising medium. Trusted by Fortune 500 brands and their agencies — thousands of trucks activated, GPS-verified, independently measured by StreetMetrics.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
