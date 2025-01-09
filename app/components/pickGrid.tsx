import Image from "next/image";
import {PickGridProps} from "./types";

const PickGrid = ({picks}: PickGridProps) => {

    return(
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {picks.map((player, index) => {   
            return (  
                <div key={player.id} onClick={() => 
                player.handlePlayer(player)} className="box bg-black flex hover:scale-110 delay-150 duration-300 rounded-lg shadow-lg items-center justify-center border border-[#2C3E50] outline outline-double outline-[#3B4C5C] sm:w-[60vw] md:w-[34vw] lg:w-[25vw] xl:w-[20vw] 2xl:w-[17vw] cursor-pointer"
                style={{ animationDelay: `${index * 0.2}s`}}>
                    <Image className="rounded-full" src={player.image_url} alt={player.name} width={130} height={130}/>
    
                    <div className="flex flex-col text-white text-center justify-items-center w-1/3" 
                    style={{backgroundImage: `url("${player.logo}")`, backgroundSize:'contain', backgroundColor: 'rgba(0, 0, 0, 0.8)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundBlendMode: 'overlay', flexGrow: 1 }}>
                        <p className="font-bold" >{player.name}</p>
                        <p>{player.position}</p>
                        <p className="p-1">{player.team} vs. {player.opp}</p>
                        <p className="pt-1 sm:text-xs md:text-sm">{player.points} {player.objective}</p>
                        <p className="font-bold">{player.determination}</p>
                    </div>
                </div>
            )
        })}
    </div>
    )
}

export default PickGrid;