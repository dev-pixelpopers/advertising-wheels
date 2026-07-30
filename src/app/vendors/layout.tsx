import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vendors — Advertising Wheels',
    description:
        'Own a box truck, trailer or fleet? Partner with Advertising Wheels to turn the miles you already drive into steady advertising revenue — we bring the campaigns, creative and installs.',
};

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
