import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import scrape from '../webscraper/functions';
import { checkWin, getAllTeams } from '../webscraper/functions';

export async function POST(req: NextRequest){

    const supabase = await createClient();
    const {data: clear1, error: error1} = await supabase.from("pickdisplay").delete().neq("points", 0);
    const {data: clear2, error: error2} = await supabase.from("pickstats").delete().neq("points", 0);
    const {data: clear3, error: error3} = await supabase.from("todaysteams").delete().neq("team", "hello");

    try{
        await scrape("PTS");
        await scrape("REB");
        await scrape("AST");
        await getAllTeams();
        return NextResponse.json({message: 'Scraped successfully!'});
    } catch (error){
        console.error(error);
        return NextResponse.json({error: 'Failed to scrape.', details: error});
    }
    
}

export async function GET(req: NextRequest){
    const supabase = await createClient();
    const {data: picks} = await supabase.from("pickdisplay").select();

    return NextResponse.json(picks);
}

export async function PUT(req: NextRequest){
    try{
        await checkWin();
        return NextResponse.json({message: 'Results updated!'});
    } catch (error){
        console.error(error);
        return NextResponse.json({error: 'Failed to find results.', details: error});
    }
}

