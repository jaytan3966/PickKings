import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { createClient } from '@/utils/supabase/server';
import { teamLoc } from '@/app/components/types';

async function findLink(name: string){
    
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

async function findImg(name: string){
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

async function lastTen(link: string, obj: string): Promise<[string[], number[], number]>{
    
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

async function diffPct(team: string, opp: string){
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

async function determination(goal: number, last10: number[], sznavg: number, diffpct: number){
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
export default async function scrape(stat: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://pick6.draftkings.com/?_ga=2.180866211.506658253.1731284801-685764424.1730435514&_gl=1*jwsp7q*_gcl_au*Mjc2ODMzMDY5LjE3MzA0MzU1MTQ.*_ga*Njg1NzY0NDI0LjE3MzA0MzU1MTQ.*_ga_QG8WHJSQMJ*MTczMTI4NDgwMC4yLjAuMTczMTI4NDgwMC42MC4wLjA.&sport=NBA&stat=${stat}`);
    
    await page.waitForSelector('.dkcss-17wjjf8 button');
    const names = await page.$$eval('.dkcss-17wjjf8 button', 
        (buttons) => {
        return buttons.map((button) => {
            const label = button.getAttribute('aria-label');
            const match = label ? label.match(/Open (.*?)'s stat details/) : 'N/A';
            return match ? match[1] : 'N/A'; 
        }).filter((name) => name !== 'N/A' && name !== '/');
    });

    await page.waitForSelector('.dkcss-14iarld');
    const positions = await page.$$eval('.dkcss-14iarld', (labels) => {
        return labels.map((label) => label.textContent ? label.textContent.trim() : 'N/A');
    });

    await page.waitForSelector('.dkcss-16bndj6');
    const pts = await page.$$eval('.dkcss-16bndj6', (labels) => {
        return labels.map((label) => label.textContent ? label.textContent.trim() : 'N/A');
    });

    await page.waitForSelector(`.dkcss-1qi7zms span[aria-label="Player's team"]`);
    const teams = await page.$$eval(`.dkcss-1qi7zms span[aria-label="Player's team"]`, (labels) => {
        return labels.map((label) => label.textContent ? label.textContent.trim() : 'N/A');
    });

    await page.waitForSelector(`.dkcss-1qi7zms span[aria-label="Player's opposing team"]`);
    const opps = await page.$$eval(`.dkcss-1qi7zms span[aria-label="Player's opposing team"]`, (labels) => {
        return labels.map((label) => label.textContent ? label.textContent.trim() : 'N/A').filter((opp) => opp !== 'N/A' && opp !== '@');
    });

    await page.waitForSelector(`.dkcss-1t2yx54`);
    const objs = await page.$$eval(`.dkcss-1t2yx54`, (labels) => {
        return labels.map((label) => label.textContent ? label.textContent.trim() : 'N/A');
    });

    await page.waitForSelector('.dkcss-13cisjn img');
    const logos = await page.$$eval('.dkcss-13cisjn img[src]', (labels) => {
        return labels.map((label) => label ? label.getAttribute('src') : 'https://dkn.gs/sports/images/default/players/160.png');
    });

    const supabase = await createClient();
    
    const playerPromises = names.map(async (name, i) => {
        const { data: existingPlayer, error: fetchError } = await supabase.from("pickdisplay").select("id").eq("name", names[i]).eq("objective", objs[i]).single();
        if (!existingPlayer){
            let img = await findImg(names[i]);
            let link = await findLink(names[i]);
            
            if (link != null){  
                link = link.replace("Summary", "GameLogs");
                let last10 = await lastTen(link, objs[i]);
                let diffpct = await diffPct(teamLoc[teams[i]], teamLoc[opps[i]]);

                let result = await determination(parseFloat(pts[i]), last10[1], last10[2], diffpct);
                if (result != null){
                    const playerInfo = {
                        name: names[i], 
                        position: positions[i],
                        team: teams[i], 
                        opp: opps[i],
                        points: pts[i], 
                        objective: objs[i], 
                        image_url: img,
                        logo: logos[i],
                        player_prof: `https://basketball.realgm.com${link}`,
                        determination: result[0],
                        confidence: result[1],
                        lastten: last10[1],
                        dates: last10[0],
                        sznavg: last10[2],
                        teamdiffpct: (1-diffpct)*100,
                    };
                    const {error: error1} = await supabase.from("pickdisplay").insert(playerInfo);
                    if (error1){
                        console.error(error1);
                    }
                    
                    //for data visualization
                    const pickInfo = {
                        name: names[i],
                        points: pts[i],
                        objective: objs[i],
                        lastten: last10[1],
                        sznavg: last10[2],
                        teamdiffpct: (1-diffpct)*100,
                        determination: result[0],
                        confidence: result[1]
                    }
                    const {error: error2} = await supabase.from("pickstats").insert(pickInfo);
                    
                    if (error2){
                        console.error(error2);
                    }
                }
                
            }
        }
    });

    await Promise.all(playerPromises);

    await browser.close();
}

export async function checkWin(){
    const supabase = await createClient();
    const {data: data, error: error} = await supabase.from("pickdisplay").select();
    
    if (!error){
        
        for (var i = 0; i < data.length; i++){
            const player = data[i];
            const axiosResponse = await axios.request({
                method: "GET", 
                url: `${player.player_prof}`,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            });
        
            const $ = cheerio.load(axiosResponse.data);
            const row = $(".tablesaw tbody").find("tr").eq(0);

            let ind = 0;
            if (player.objective == "Points"){
                ind = 7;
            } else if (player.objective == "Assists"){
                ind = 20;
            } else if (player.objective == "Rebounds"){
                ind = 19;
            } else {
                const {error: error1} = await supabase.from("pickstats").update({success: "MISS"}).eq("name", player.name);
                if (error1){
                    console.error(error1);
                }
            }

            const value = parseInt($(row).find("td").eq(ind).text().trim());
            
            if (player.determination == "OVER" && (value > player.points)){
                const {error: error1} = await supabase.from("pickstats").update({success: "HIT"}).eq("name", player.name).eq("objective", player.objective);
                if (error1){
                    console.error(error1);
                }
            } else if (player.determination == "UNDER" && (value < player.points)){
                const {error: error1} = await supabase.from("pickstats").update({success: "HIT"}).eq("name", player.name).eq("objective", player.objective);
                if (error1){
                    console.error(error1);
                }
            } else {
                const {error: error1} = await supabase.from("pickstats").update({success: "MISS"}).eq("name", player.name).eq("objective", player.objective);
                if (error1){
                    console.error(error1);
                }
            }
        }
    }
}