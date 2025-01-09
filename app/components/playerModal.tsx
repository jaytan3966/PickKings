import Image from "next/image";
import { PlayerModalProps } from "./types";
import { teamNames } from "./types";
import { Last10Chart } from "./last10Chart";

const PlayerModal = ({ isVisible, onClose, ...props }: PlayerModalProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
      <div className="relative box bg-[#18243c] rounded-lg shadow-lg border border-[#2C3E50] outline outline-double outline-[#3B4C5C] w-[40vw] justify-center items-center text-center rounded-md">
        
        <button
          onClick={onClose}
          className="absolute text-white font-bold text-xl top-1 right-4"
          aria-label="Close">x</button>

        <div className="grid grid-cols-1 lg:grid-cols-2 justify-center items-center p-1">
          <a href={props.player_prof} target="_blank" title={`See ${props.name}'s stats`} className="text-xl font-bold flex justify-center items-center flex-col p-2"> 
            <Image className="rounded-full" src={props.image_url} alt={props.name} width={130} height={130}/>
            {props.name} 
            <p className="font-normal text-md">{props.position}</p>
          </a>
          
          <div className="flex flex-col justify-center items-center mt-4">
            <a href={`https://www.nba.com/${teamNames[props.team]}/`} target="_blank" title={`Visit the ${teamNames[props.team]}'s page`}>
              <Image src={props.logo} alt={props.name} width={130} height={130}/></a>
            <p className="font-semibold pt-2">{props.team} vs. {props.opp}</p>
            <p className="font-semibold">{props.determination} {props.points} {props.objective}</p>
            <p className="p-1">{props.confidence}% Confidence</p>
          </div>

          <div>
            <p className="font-semibold">{props.objective} Average this Season</p>
            <p>{props.sznavg}</p>
          </div>

          <div>
            <p className="font-semibold">Team Differential</p>
            <p>{props.teamdiffpct}%</p>
          </div>
          
        </div>
        <div className="p-2 flex flex-col">
          <p className="font-semibold">{props.objective} in the Last Ten Games</p>
          <Last10Chart {...props}/>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
