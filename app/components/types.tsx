export interface Player {
    id: string,
    name: string;
    position: string;
    team: string;
    opp: string;
    points: number;
    objective: string;
    image_url: string;
    logo: string;
    player_prof: string;
    determination: string;
    confidence: number;
    lastten: number[];
    sznavg: number;
    teamdiffpct: number;
    dates: string[];
    handlePlayer: (player: Player) => void;
};
  
export interface Logo {
    name: string,
    img: string,
    url: string
}

export interface PlayerModalProps extends Player{
    isVisible: boolean;
    onClose: () => void;
}

export interface PickGridProps{
    picks: Player[];
}

export const teamLoc: Record<string, string> = {
    OKC: "Oklahoma City",
    CLE: "Cleveland",
    BOS: "Boston",
    HOU: "Houston",
    DAL: "Dallas",
    ORL: "Orlando",
    MIL: "Milwaukee",
    LAC: "LA",
    GSW: "Golden State",
    MEM: "Memphis",
    DEN: "Denver",
    NYK: "New York",
    CHI: "Chicago",
    LAL: "LA Lakers",
    PHX: "Phoenix",
    ATL: "Atlanta",
    MIA: "Miami",
    MIN: "Minnesota",
    SAS: "San Antonio",
    BKN: "Brooklyn",
    DET: "Detroit",
    PHI: "Philadelphia",
    IND: "Indiana",
    SAC: "Sacramento",
    WAS: "Washington",
    POR: "Portland",
    UTA: "Utah",
    TOR: "Toronto",
    CHA: "Charlotte",
    NOP: "New Orleans"
}

export const teamNames: Record<string, string> = {
    OKC: "Thunder",
    CLE: "Cavaliers",
    BOS: "Celtics",
    HOU: "Rockets",
    DAL: "Mavs",
    ORL: "Magic",
    MIL: "Bucks",
    LAC: "Clippers",
    GSW: "Warriors",
    MEM: "Grizzlies",
    DEN: "Nuggets",
    NYK: "Knicks",
    CHI: "Bulls",
    LAL: "Lakers",
    PHX: "Suns",
    ATL: "Hawks",
    MIA: "Heat",
    MIN: "Timberwolves",
    SAS: "Spurs",
    BKN: "Nets",
    DET: "Pistons",
    PHI: "Sixers",
    IND: "Pacers",
    SAC: "Kings",
    WAS: "Wizards",
    POR: "Blazers",
    UTA: "Jazz",
    TOR: "Raptors",
    CHA: "Hornets",
    NOP: "Pelicans"
}

export interface NavbarProps {
    picksRef: React.RefObject<HTMLDivElement | null>;
    ownRef: React.RefObject<HTMLDivElement | null>;
    aboutRef: React.RefObject<HTMLDivElement | null>;
  }