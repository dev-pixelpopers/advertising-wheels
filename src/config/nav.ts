/**
 * Single source of truth for the primary navigation.
 *
 * Both the home-page Hero header and the inner-page SiteHeader read from this
 * list, and the Footer's quick links mirror it — so a route only has to be
 * added in one place.
 */
export interface NavLink {
    label: string;
    href: string;
}

export const NAV_LINKS: NavLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Services', href: '/services' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];
