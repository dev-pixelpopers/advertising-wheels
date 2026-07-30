import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Projects — Advertising Wheels',
    description:
        'Truckside campaigns for Fifth Third Bank, Hertz, Nationwide, Wendy’s, Saks Fifth Avenue and more — routes, impressions and the results they moved.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
