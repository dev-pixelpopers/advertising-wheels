"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/Logo";

export default function Header({ scrolledHero }: { scrolledHero: Boolean }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="w-full header flex flex-row justify-between items-center px-0 py-0 z-10 px-[60px]">
            <div className="w-full">
                <Logo className="pointer-events-auto" />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                <div className={`flex font-tommy-regular flex-row w-full justify-end items-center gap-8 text-white ${!scrolledHero ? "text-white dark:text-white" : "!text-[#909ABA] dark:!text-[#A3B8EE]"}`}>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">About</Link>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">Projects</Link>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">Services</Link>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">Vendors</Link>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">Blog</Link>
                    <Link href={"#"} className="pointer-events-auto hover:opacity-80 transition-opacity">Contact</Link>

                    {/* Theme Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="pointer-events-auto relative flex items-center justify-between w-16 h-8 px-1 rounded-full cursor-pointer bg-[#282828] dark:bg-white/20 border border-white/20 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FCD119]"
                    >
                        {/* Sun Icon */}
                        <svg
                            className={`w-5 h-5 transition-opacity duration-300 ${theme === 'light' ? 'text-[#FCD119] opacity-100' : 'text-gray-400 opacity-40'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                        </svg>

                        {/* Moon Icon */}
                        <svg
                            className={`w-5 h-5 transition-opacity duration-300 ${theme === 'dark' ? 'text-[#FCD119] opacity-100' : 'text-gray-400 opacity-40'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>

                        {/* Sliding Thumb */}
                        <span
                            className={`absolute left-1 w-6 h-6 rounded-full bg-white dark:bg-[#FCD119] shadow-md transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}