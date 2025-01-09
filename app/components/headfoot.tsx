import Image from "next/image";
import { Logo } from "./types";
import { NavbarProps } from "./types";

const compLogos: Logo[] = [
      {name: "Underdog", img: "/underdog.png", url: "https://underdogfantasy.com/"}, 
      {name: "Sleeper", img: "/sleeper.png", url: "https://sleeper.com/"},
      {name: "Chalkboard", img: "/chalkboard.png", url: "https://chalkboard.io/"},
      {name: "Draftkings", img: "/draftkings.png", url: "https://pick6.draftkings.com/?_ga=2.141137776.371102666.1734665217-685764424.1730435514&_gl=1*owb1a9*_gcl_au*Mjc2ODMzMDY5LjE3MzA0MzU1MTQ.*_ga*Njg1NzY0NDI0LjE3MzA0MzU1MTQ.*_ga_QG8WHJSQMJ*MTczNDY2NTIxNi4yMy4xLjE3MzQ2NjU3OTkuNjAuMC4w&sport=NBA"}];

const handleScrollDown = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current){
        window.scrollTo({
        top: ref.current.offsetTop - 100,
        behavior: "smooth",
        });
    }
}

export const Navbar = ({picksRef, ownRef, aboutRef} : NavbarProps) => {
    return (
        <div className="justify-between flex items-center bg-[#18243c]">
            <h1 className="font-danfo text-3xl md:text-4xl lg:text-6xl text-center p-5 px-10 animate-left">Pick Kings</h1>
            <div className="flex animate-right text-sm md:text-1xl lg:text-2xl font-semibold">
            <button className='px-4 transition ease-in-out delay-150 hover:-translate-y-1 duration-300' onClick={() => handleScrollDown(picksRef)}>Today's Picks</button>
            <button className='px-4 transition ease-in-out delay-150 hover:-translate-y-1 duration-300' onClick={() => handleScrollDown(ownRef)}>Build Your Own</button>
            <button className='px-4 transition ease-in-out delay-150 hover:-translate-y-1 duration-300' onClick={() => handleScrollDown(aboutRef)}>How We Determine Picks</button>
            </div>
        </div>
        
    )
}

export const HomeIntro = () => {
    return (
        <div className="h-[95vh] flex justify-center items-center grid grid-cols-1 sm:grid-cols-2">
            <div className="animate-rise flex flex-col justify-center items-center">
                <h1 className="font-bold text-7xl md:text-8xl lg:text-9xl px-8 text-center">An all in one hub for all your NBA parlays</h1>
            </div>
        
            <div className="flex flex-col justify-center items-center">
                <div className="relative grid grid-cols-1">
                    <a href="https://www.nba.com/" target="_blank" rel="noopener noreferrer" className="transition ease-in-out delay-150 hover:-translate-y-2 hover:scale-110 duration-300 pb-4">
                        <Image src={"/nbalogo.png"} alt="NBA icon" width={325} height={325} className="opacity-0 animate-icons"/>
                    </a>
                    <div className="grid grid-cols-2 sm:grid-cols-4 place-items-center">
                    {compLogos.map((logo, index) => {
                        return (
                        <a href={logo.url} target="_blank" key={logo.name} className="relative aspect-square w-20 h-20 opacity-0 animate-icons" style={{ animationDelay: `${(index+1) * 0.2}s`}}>
                        <Image
                            aria-hidden
                            src={logo.img}
                            alt={logo.name}
                            fill
                            className="px-2 object-contain transition ease-in-out delay-150 hover:-translate-y-2 hover:scale-110 duration-300"/>
                        </a>
                    )
                    })}
                    </div>
                </div>
            </div>
      </div> 
    )
}
export const Footer = () => {
    return (
        <div className="grid row-start-3 flex gap-1 flex-wrap justify-items-center text-white">
        <a className="flex items-center gap-2 hover:underline hover:underline-offset-4 font-semibold text-xl"
            href="https://www.nba.com/" target="_blank" rel="noopener noreferrer" >
            <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16}/>
              NBA Official Website
        </a>
        <p className="text-sm">We do not endorse betting in any shape or form.</p>
        </div>
    )
}

