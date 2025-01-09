import { Player } from "./types";
import dynamic from 'next/dynamic';
import 'chart.js/auto';

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
})

export const Last10Chart = (player: Player) => {
    const lastten = [...player.lastten].reverse();
    const dates = [...player.dates].reverse();
    dates.push("Today");
    lastten.push(player.points);

    const colors = lastten.map((pt, index) => {
        return index === lastten.length-1 ? '#0210ad' : '#00d0e3';
    })
    const data = {
        labels: dates,
        datasets: [{
            label: player.objective,
            data: lastten,
            backgroundColor: colors,
            borderWidth: 1,
            hoverBackgroundColor: 'white',
        }]
    }
    return (
        <div style={{width: '100%', height: '100%'}}>
            <Bar data = {data}/>
        </div>
    )
}