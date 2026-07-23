'use client';

export default function HomeMarquee() {
    const logos: string[] = [
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
    ];

    // Two copies so the track can loop seamlessly (translateX -50% lands on a boundary).
    const track = [...logos, ...logos];

    const renderTile = (logo: string, index: number) => (
        <div key={index} className="mr-2 shrink-0">
            <img
                className="w-[100px] h-[100px] object-contain opacity-[0.8] transition-all"
                src={`/assets/images/${logo}`}
                alt=""
            />
        </div>
    );

    // Animations are orchestrated by the parent SecondSection via the class hooks below.
    return (
        <div className="home-marquee flex flex-col items-center overflow-hidden">
            <style>{`
                @keyframes marquee-right {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
                @keyframes marquee-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>

            <div className="overflow-hidden py-[60px]">
                <p className="hm-heading text-black dark:text-white text-center font-tommy-regular leading-[40px] text-[30px] capitalize transition-colors duration-300">trusted by Fortune 500 brands across financial services</p>
            </div>

            <div className='mt-[30px] pb-[60px]'>
                <div className="hm-row1 w-full overflow-hidden">
                    <div
                        className="flex flex-row gap-[150px]"
                        style={{ animation: 'marquee-right 40s linear infinite' }}
                    >
                        {track.map(renderTile)}
                    </div>
                </div>

                <div className="hm-row2 w-full overflow-hidden mt-[50px]">
                    <div
                        className="flex flex-row gap-[150px]"
                        style={{ animation: 'marquee-left 40s linear infinite' }}
                    >
                        {track.map(renderTile)}
                    </div>
                </div>
            </div>
        </div>
    );
}
