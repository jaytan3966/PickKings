import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { createClient } from '@/utils/supabase/server';
import { teamLoc } from '@/app/components/types';
import { findLink, findImg,lastTen, diffPct, determination } from '../playerScraper/helperFncts';

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

    await page.waitForSelector('.dkcss-smbwj3');
    const pts = await page.$$eval('.dkcss-smbwj3', (labels) => {
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
                    if (names[i] && pts[i] && objs[i]){
                        const {error: error2} = await supabase.from("pickstats").insert(pickInfo);
                    
                        if (error2){
                            console.error(error2);
                        }
                    }
                }
            }
        }
    });

    await Promise.all(playerPromises);
    
    await browser.close();
}

type TeamInfo = {
    [team: string]: {
        team: string;
        players: string[];
    };
};

export async function getAllTeams(){
    const supabase = await createClient();
    const {data: allteams, error: fetchError } = await supabase.from("pickdisplay").select();
    let teamsInfo: TeamInfo = {};
    let existingPlayer: string[];
    if (allteams){
       
        for (var i = 0; i<allteams.length; i++){
            const { data: existingTeam, error: fetchError } = await supabase.from("todaysteams").select("id").eq("team", allteams[i].team).single();
            
            if (!existingTeam){
                teamsInfo[allteams[i].team] = {
                    team: allteams[i].team,
                    players: [allteams[i].name],
                }
                const {error: error2} = await supabase.from("todaysteams").insert(teamsInfo[allteams[i].team]);
            } else {
                let existingPlayer: string[] = teamsInfo[allteams[i].team].players || [];
                if (!existingPlayer.includes(allteams[i].name)){
                    teamsInfo[allteams[i].team].players.push(allteams[i].name);
                }
            }
            const { error: updateError } = await supabase.from("todaysteams")
                .update({ players: teamsInfo[allteams[i].team].players }).eq("team", allteams[i].team);
        }
    }   
}
export async function checkWin(){
    const supabase = await createClient();
    const {data: data, error: error} = await supabase.from("pickdisplay").select();
    let misses = 0, hits = 0;
    
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
                hits++;
                if (error1){
                    console.error(error1);
                }
            } else if (player.determination == "UNDER" && (value < player.points)){
                const {error: error1} = await supabase.from("pickstats").update({success: "HIT"}).eq("name", player.name).eq("objective", player.objective);
                hits++;
                if (error1){
                    console.error(error1);
                }
            } else {
                const {error: error1} = await supabase.from("pickstats").update({success: "MISS"}).eq("name", player.name).eq("objective", player.objective);
                misses++;
                if (error1){
                    console.error(error1);
                }
            }
        }
        const {error: error1} = await supabase.from("pastPredicts").insert({
            hitPct: (hits/(hits+misses)*100)});
        if (error1){
            console.error(error1);
        }
    }
}