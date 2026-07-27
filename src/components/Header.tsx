"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ scrolledHero }: { scrolledHero: Boolean }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="w-full header flex flex-row justify-between items-center px-0 py-0 z-10 px-[60px]">
            <div className="w-full">
                <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-auto">
                    <path
                        d="M67.498 26.678L71.4258 14.8084L76.2476 0.843518H82.378C87.8215 0.843518 88.5705 0.898221 89.0615 1.33233C89.5585 1.77197 90.4347 4.0414 91.299 7.12787C91.4709 7.74216 91.9982 9.56443 92.4709 11.1774C93.3794 14.2794 93.4047 14.3698 94.4832 18.2994C95.9444 23.6222 96.8961 26.9852 97.1322 27.6557C97.2668 28.0396 97.5988 29.1397 97.8692 30.0997C98.3249 31.7193 98.9546 32.3802 99.2001 31.4959C99.6146 30.0049 99.9869 28.4722 100.609 25.7009C101.005 23.9343 101.503 21.7346 101.716 20.8132C101.929 19.8913 102.362 18.0063 102.679 16.6237C102.996 15.241 103.367 13.6702 103.505 13.1327C103.765 12.1179 104.023 11.0043 104.769 7.68644C105.011 6.61095 105.475 4.62959 105.799 3.28258L106.39 0.833984L113.04 0.908763L119.69 0.983535L119.959 1.75792C120.204 2.46153 119.225 6.98484 117.347 13.8308C116.887 15.511 115.506 21.0205 114.863 23.7456C114.736 24.2831 114.321 25.9172 113.942 27.3766C113.029 30.8826 111.685 36.221 110.671 40.3634C109.283 46.0365 107.404 48.8725 104.516 49.6519C103.743 49.8602 101.454 49.9992 98.7871 49.9992C94.926 49.9992 94.1736 49.9244 93.0295 49.4281C91.7144 48.8569 91.714 48.8554 90.718 46.0068C90.1703 44.439 89.2618 41.7114 88.6997 39.9448C88.1371 38.1782 87.5725 36.4814 87.4443 36.1743C87.3171 35.8672 86.3226 32.9137 85.2357 29.6109C83.3705 23.9428 82.9073 22.9251 82.4197 23.4174C82.1275 23.712 80.9879 27.0574 80.1186 30.1695L75.3132 46.7968L71.6892 37.2915C70.9183 35.2945 70.1788 33.409 70.0456 33.1019C69.9129 32.7948 69.2852 31.2239 68.6511 29.6109L67.498 26.678Z"
                        className="fill-[#1A1917] dark:fill-white transition-colors duration-300"
                    />
                    <path
                        d="M31.2373 49.5345C31.2373 49.5345 36.7921 48.2277 39.0105 47.2385L40.459 46.5918L39.0791 43.7789C38.3201 42.2322 37.6993 40.8342 37.6993 40.6726C37.6993 40.5111 37.5843 40.1637 37.444 39.9001C37.3033 39.6369 36.9635 38.8321 36.6879 38.1125C36.1333 36.6625 35.9101 36.5832 34.0656 37.1863C31.5494 38.0084 29.814 38.4708 27.4342 38.456C23.3476 38.4312 20.7035 37.1789 18.2318 34.4666C14.6543 30.5402 13.8479 24.8109 16.1576 19.7258C18.6268 14.2918 22.8512 11.4264 28.4875 11.3635C34.1787 11.2995 37.9413 14.0143 39.8555 19.5642C40.2664 20.7551 40.6886 25.4843 40.8476 30.6789C40.9237 33.1518 41.1029 35.6337 41.2467 36.1947C41.3904 36.7561 41.6516 37.7735 41.8269 38.456C42.8097 42.2808 45.599 45.9327 48.8974 47.7123C50.7617 48.7183 54.5174 49.7634 56.2681 49.7634C57.3175 49.7634 57.4983 49.6817 57.4983 49.2079C57.4983 48.9026 57.3822 48.4373 57.2405 48.1736C57.0983 47.9105 56.6553 46.7642 56.2557 45.6264C55.8562 44.4891 55.4251 43.3101 55.2982 43.0068C55.1708 42.703 54.4843 40.9036 53.7727 39.0075C53.0605 37.1115 52.2956 35.1257 52.0728 34.595C51.8496 34.0642 51.5731 33.3813 51.4575 33.078C51.3419 32.7747 51.1217 32.2162 50.9686 31.8371C50.25 30.0614 45.0118 16.2766 44.4177 14.6001C44.149 13.8418 43.8438 13.097 43.7396 12.9453C43.6354 12.7937 43.0887 11.4284 42.5252 9.91145C41.9613 8.395 41.3978 6.90531 41.2723 6.60202C41.1464 6.29873 40.7074 5.15742 40.2965 4.06518L39.5483 2.07992L39.4668 1.85245C38.8727 1.7013 38.248 1.54271 37.5927 1.3762C10.989 -5.38044 0.299571 14.4222 0.0220271 24.3232C-0.256011 34.2248 1.66655 53.2022 31.2373 49.5345Z"
                        className="fill-[#1A1917] dark:fill-white transition-colors duration-300"
                    />
                    <path d="M54.5603 0.833984H43.332L62.5026 49.9992H73.0572C73.2497 49.9992 73.3819 49.8041 73.3123 49.6234L54.5603 0.833984Z" fill="#F6D54D" />
                </svg>
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                <div className={`flex font-tommy-regular flex-row w-full justify-end items-center gap-8 text-white ${!scrolledHero ? "text-white dark:text-white" : "!text-[#44517b] dark:!text-[#A3B8EE]"}`}>
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