import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
    title: 'Case Studies & Results | Advertising Wheels',
    description: `Truckside campaigns for Fifth Third Bank, Hertz, Nationwide, Wendy's, Saks and more — independently measured results across 50 DMAs.`,
    path: '/projects',
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
