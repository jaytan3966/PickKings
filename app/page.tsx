"use client";

import { useState, useEffect, useRef } from "react";
import { Player } from "./components/types";
import PlayerModal from "./components/playerModal";
import PickGrid from "./components/pickGrid";
import { Navbar, Footer, HomeIntro } from "./components/headfoot";
import { About } from "./components/aboutus";

export default function picks() {

    const [players, setPlayers] = useState<Player[]>([]);
    const [title, setTitle] = useState("No NBA picks today. Check back again tomorrow!");
    const [showModal, setModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    
    const handlePlayer = (player: Player) => {
      setSelectedPlayer(player);
      setModal(true);
    }
    const handleCloseModal = () => {
      setModal(false);
    };

    const picksRef = useRef<HTMLDivElement | null>(null);
    const ownRef = useRef<HTMLDivElement | null>(null);
    const aboutRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      async function getPicks(){
        let response = await fetch("/api/routing");
        if (response.ok){
          try{
            let playas = await response.json();
            if (Object.keys(playas[0]).length === 0){
              setTitle("No NBA picks today. Check back again tomorrow!");
            } else {
              //sort players from highest to lowest confidence
              playas.sort((i: Player, j: Player) => j.confidence - i.confidence);
              const playersWithHandle = playas.map((player: Player) => ({
                ...player,
                handlePlayer,
              }));
              setPlayers(playersWithHandle);
              setTitle("Today's Top Picks");
            }
          } catch {
            setTitle("Error loading picks, try again later.")
          }
        } else {
          setTitle("Error loading picks, try again later.")
        }
      }
      getPicks();
    }, []);

    return (
    
    <>   
      <header className="sticky top-0 z-10">
        <Navbar picksRef={picksRef} ownRef={ownRef} aboutRef={aboutRef} />
      </header>

      <HomeIntro/>

      <main className="grid gap-8 justify-items-center">    
        <hr className="w-[90vw]"/>
        <h1 ref={picksRef} className="font-bold text-4xl text-white">{title}</h1>
        <PickGrid picks={players}/>

        <hr className="w-[90vw]"/>
        <h1 ref={ownRef} className="font-bold text-4xl text-white">Build Your Own</h1>
        

        <hr className="w-[90vw]"/>
        <h1 ref={aboutRef} className="font-bold text-4xl text-white">How we Determine Picks</h1>
        <About />
        <hr className="w-[30vw]"/>
      </main>
      
      <footer className="grid row-start-3 flex gap-1 flex-wrap justify-items-center text-white p-4">
        <Footer/>
      </footer>
      {selectedPlayer?.id && <PlayerModal isVisible={showModal} onClose={handleCloseModal} {...selectedPlayer}/>}
    </>
  );
}
