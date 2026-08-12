"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { NAV_LINKS } from "@/config/nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHomeHeader, setShowHomeHeader] = useState(false);

    const isHomePage = pathname === '/';

    // On home page only: listen for hero canvas animation completion
    useEffect(() => {
        if (!isHomePage) return;

        setShowHomeHeader(false);

        const handleHeaderShow = (e: Event) => {
            const customEvent = e as CustomEvent<boolean>;
            setShowHomeHeader(!!customEvent.detail);
        };

        window.addEventListener('heroHeaderShow', handleHeaderShow);
        return () => window.removeEventListener('heroHeaderShow', handleHeaderShow);
    }, [isHomePage]);

    // Frost the bar once the page leaves the very top.
    useEffect(() => {
        const onScroll = () => setScrolled(typeof window !== 'undefined' ? window.scrollY > 12 : false);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close the mobile panel whenever the route changes.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    const isVisible = !isHomePage || showHomeHeader;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-[100] w-full transition-all duration-500 ease-out ${isVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-full pointer-events-none'
                }`}
        >
            <div
                className={`w-full transition-all duration-300 ${scrolled || menuOpen
                    ? 'border-b border-black/10 bg-[#EEE8D9]/85 backdrop-blur-xl'
                    : 'border-b border-transparent bg-transparent'
                    }`}
            >
                <div className="flex w-full items-center justify-between py-1 md:py-2 xl:py-3 2xl:py-4 px-3 md:px-6 lg:px-[60px] ">
                    {/* Wordmark → home */}
                    <Link href="/" aria-label="Advertising Wheels — home" className="shrink-0">
                        <Logo width={80} height={40} className="w-[60px] md:w-[80px] lg:w-[80px] h-[20px] md:[h-40px] lg:h-[40px]" />
                    </Link>

                    {/* Nav + controls grouped to the right, matching the home header */}
                    <div className="flex items-center gap-8">
                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-8 lg:flex">
                            {NAV_LINKS.map((l) => {
                                const active = isActive(l.href);
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className={`sh-link font-tommy-regular text-[15px] transition-colors duration-300 ${active
                                            ? 'text-[#C8992B]'
                                            : 'text-[#6F6A60] hover:text-[#1A1917]'
                                            }`}
                                        aria-current={active ? 'page' : undefined}
                                        data-active={active ? 'true' : undefined}
                                    >
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-3">
                            {/* Theme toggle */}
                            {/* <button
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                                className="relative flex h-8 w-16 items-center justify-between rounded-full border border-black/15 bg-black/[0.06] px-1 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FCD119]"
                            >
                                <svg
                                    className={`h-5 w-5 transition-opacity duration-300 ${theme === 'light' ? 'text-[#C8992B] opacity-100' : 'text-gray-400 opacity-40'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                                </svg>
                                <svg
                                    className={`h-5 w-5 transition-opacity duration-300 ${theme === 'dark' ? 'text-[#FCD119] opacity-100' : 'text-gray-400 opacity-40'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                                <span
                                    className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`}
                                />
                            </button> */}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={menuOpen}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#1A1917] lg:hidden"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    {menuOpen ? (
                                        <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    ) : (
                                        <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile slide-down panel */}
                <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-400 lg:hidden ${menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <nav className="flex flex-col gap-1 px-6 pb-6 pt-2">
                        {NAV_LINKS.map((l) => {
                            const active = isActive(l.href);
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-tommy-medium text-[17px] transition-colors duration-200 ${active
                                        ? 'bg-[#FCD119]/15 text-[#C8992B]'
                                        : 'text-[#3A3730] hover:bg-black/[0.04]'
                                        }`}
                                >
                                    {l.label}
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="opacity-40">
                                        <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Animated underline for the active/hovered desktop link */}
            <style>{`
                .sh-link { position: relative; }
                .sh-link::after {
                    content: ''; position: absolute; left: 0; bottom: -6px;
                    height: 2px; width: 100%; border-radius: 2px;
                    background: currentColor;
                    transform: scaleX(0); transform-origin: right center;
                    transition: transform .34s cubic-bezier(.2,.8,.2,1);
                }
                .sh-link:hover::after,
                .sh-link[data-active='true']::after { transform: scaleX(1); transform-origin: left center; }
                @media (prefers-reduced-motion: reduce) {
                    .sh-link::after { transition: none; }
                }
            `}</style>
        </header>
    );
}