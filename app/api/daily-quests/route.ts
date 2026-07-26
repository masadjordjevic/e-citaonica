import { createClient } from "@/lib/supabase/server"
export async function GET(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user) return Response.json({error:"Nisi prijavljena."},{status:401});
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Belgrade"}).format(new Date());
 const [{data:defs,error:e1},{data:progress,error:e2},{data:bonus}]=await Promise.all([
  supabase.from("daily_quest_definitions").select("id,title,description,icon,event_type,target,reward,sort_order").eq("active",true).order("sort_order"),
  supabase.from("daily_quest_progress").select("quest_id,progress,completed_at,reward_claimed").eq("quest_date",today).eq("user_id",user.id),
  supabase.from("daily_quest_bonus").select("reward,claimed_at").eq("quest_date",today).eq("user_id",user.id).maybeSingle(),
 ]);
 if(e1||e2) return Response.json({error:"Dnevni zadaci nisu dostupni."},{status:500});
 const map=new Map((progress??[]).map(x=>[x.quest_id,x]));
 return Response.json({quests:(defs??[]).map(d=>{const p=map.get(d.id);return {id:d.id,title:d.title,description:d.description,icon:d.icon,checkType:d.event_type,checkTarget:d.target,coinReward:d.reward,progress:p?.progress??0,completed:Boolean(p?.completed_at),completedAt:p?.completed_at??undefined}}),bonus:bonus??null});
}