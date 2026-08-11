import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Fleet Partners | Advertising Wheels',
    description:
        'Own a box truck, trailer or fleet? Partner with Advertising Wheels to turn the miles you already drive into steady advertising revenue — we bring the campaigns, creative and installs.',
    path: '/vendors',
});

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
