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
        <div
            key={index}
            className="mr-2 shrink-0 rounded-[2px] border border-[#E3E3E3] bg-white py-[24px] px-[84px]"
        >
            <img
                className="w-[72px] h-[76px] object-cover opacity-[0.3]"
                src={`/assets/images/${logo}`}
                alt=""
            />
        </div>
    );

    return (
        <div className="flex flex-col items-center overflow-hidden">
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

            <p className="text-black text-center font-tommy-regular leading-[40px] text-[30px] capitalize">trusted by Fortune 500 brands across financial services</p>

            {/* Row 1 — moves right */}
            <div className="w-full overflow-hidden mt-[100px]">
                <div
                    className="flex flex-row w-max"
                    style={{ animation: 'marquee-right 40s linear infinite' }}
                >
                    {track.map(renderTile)}
                </div>
            </div>

            {/* Row 2 — moves left */}
            <div className="w-full overflow-hidden mt-[10px]">
                <div
                    className="flex flex-row w-max"
                    style={{ animation: 'marquee-left 40s linear infinite' }}
                >
                    {track.map(renderTile)}
                </div>
            </div>
        </div>
    );
}
