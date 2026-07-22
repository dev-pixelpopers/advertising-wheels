export default function Campaigns() {
    return (
        <div className="flex flex-row">
            <div>
                <img className='w-[881px] h-[823px] object-cover' src="/assets/images/campaings-img.png" alt="" />
            </div>
            <div className="py-10 max-w-[53%]">
                <h2 className="text-[230px] leading-[226px] text-white font-tommy-bold tracking-[-11px] -ml-[35%]">Campaigns<span className="text-[#FCD119]">.</span></h2>
                <div className="mt-[200px] flex flex-col gap-y-10 pl-[300px]">
                    <p className="font-tommy-regular text-[21px] text-black leading-[30px] capitalize">From local activations to nationwide rollouts, we’ve helped brands create campaigns that stand out on the streets. Every campaign is customized to meet your goals and deliver real visibility.</p>
                    <a className="rounded-[6px] bg-[#282828] py-[12px] px-[50px] text-[24px] leading-[50px] text-[#FCD119] font-tommy-regular w-max">Plan a campaign</a>
                </div>
            </div>
        </div>
    )
}