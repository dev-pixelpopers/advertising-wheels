import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Case Studies & Results | Advertising Wheels',
    description:
        `Truckside campaigns for Fifth Third Bank, Hertz, Nationwide, Wendy's, Saks and more — independently measured results across 50 DMAs.`,
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
