import axios from "axios";
import * as cheerio from 'cheerio';

export async function findLink(name: string){
    
    const nameParts = name.split(" ");
    let updatedName;

    updatedName = nameParts[1] + ", " + nameParts[0];

    const axiosResponse = await axios.request({
        method: "GET",
        url: "https://basketball.realgm.com/nba/players",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    });
    const $ = cheerio.load(axiosResponse.data);
    
    const link = $(`td[rel="${updatedName}"]`).find("a").attr("href"); 
    if (link == null || link == undefined){
        return null;
    } 
    return link;
}

export async function findImg(name: string){
    const link = await findLink(name);

    if (link == null){
        return "https://dkn.gs/sports/images/default/players/160.png";
    }

    const axiosResponse = await axios.request({
        method: "GET",
        url: `https://basketball.realgm.com/${link}`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    });
    const $ = cheerio.load(axiosResponse.data);
    return "https://basketball.realgm.com" + $(".half-column-left").find("img").attr("src");
}

export async function lastTen(link: string, obj: string): Promise<[string[], number[], number]>{
    
    const axiosResponse = await axios.request({
        method: "GET", 
        url: `https://basketball.realgm.com${link}`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    });

    const $ = cheerio.load(axiosResponse.data);
    const rows = $(".tablesaw tbody tr").slice(0,10);
    const szn = $("tfoot").find("tr").eq(1);
    
    let values: number[] = [];
    let dates: string[] = [];
    let sznavg;
    let ind = 0;
    if (obj == "Points"){
        ind = 7;
    } else if (obj == "Assists"){
        ind = 20;
    } else if (obj == "Rebounds"){
        ind = 19;
    } else {
        return [["0/0/0"], [0], 0];    
    }
    rows.each((index, row) => {
        const value = parseInt($(row).find("td").eq(ind).text().trim());
        const date = $(row).find("td").eq(0).text().trim();
        values.push(value);
        dates.push(date);
    })
    sznavg = parseFloat($(szn).find("td").eq(ind).text().trim());

    return [dates, values, sznavg];
}

export async function diffPct(team: string, opp: string){
    const axiosResponse = await axios.request({
        method: "GET", 
        url: "https://www.espn.com/nba/stats/rpi",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    });

    const $ = cheerio.load(axiosResponse.data);
    const teamRow = $("tr").filter((_,element)=>{
        return $(element).find("a").text().trim() === team;
    })
    const oppRow = $("tr").filter((_,element)=>{
        return $(element).find("a").text().trim() === opp;
    })
    const teamPct = parseFloat($(teamRow).find("td").eq(5).text().trim());
    const oppPct = parseFloat($(oppRow).find("td").eq(5).text().trim());
    return 1 - Math.abs(oppPct-teamPct);
}

export async function determination(goal: number, last10: number[], sznavg: number, diffpct: number){
    //sznavg and last10 performance will be used to determine likelihood of over/under
    let avgCalc, last10Calc;

    //diff in team percentage will be used as another factor as to how accurate it will be (larger gap in win percentage, lower accuracy)

    //if avgCalc less than 0.5, the confidence rate will be negative (so later a determination can be made as whether or not over or under)
    avgCalc = (((sznavg-goal)/goal)+1)/2;
    if (avgCalc < 0.5){
        avgCalc = (avgCalc-1);
    }

    let ovr = 0, undr = 0;
    for (var i = 0; i<last10.length; i++){
        if (last10[i]>goal){
            ovr++;
        } else {
            undr++;
        }
    }
    //if undr is greater than ovr, the confidence rate will be negative (so later a determination can be made as whether or not over or under)
    if (undr>ovr){
        last10Calc = -(undr/last10.length);
    } else {
        last10Calc = (ovr/last10.length);
    }

    //last10 performance carries more weight than sznavg
    let determination;
    if ((avgCalc+last10Calc*2) < 0){
        determination = "UNDER";
    } else {
        determination = "OVER";
    }

    return [determination, Math.floor(((Math.abs(avgCalc+last10Calc*2) + diffpct)/4)*100)];
}