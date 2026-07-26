-- COMPLETE PHASE 2: quests, notebook, profiles, achievements, notifications, statistics
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text not null default '',
  favourite_subject text not null default '',
  weekly_goal_hours numeric(6,2) not null default 10 check (weekly_goal_hours between 0 and 168),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_name text not null,
  subject text,
  duration_seconds integer not null check (duration_seconds >= 0),
  earned_coins integer not null default 0,
  finished_at timestamptz not null default now()
);
create index if not exists study_sessions_user_finished_idx on public.study_sessions(user_id, finished_at desc);

create table if not exists public.daily_quest_definitions (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  event_type text not null check (event_type in ('study_minutes','message','cafe','garden','memory')),
  target integer not null check (target > 0),
  reward integer not null check (reward >= 0),
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.daily_quest_progress (
  quest_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null references public.daily_quest_definitions(id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  reward_claimed boolean not null default false,
  primary key (quest_date,user_id,quest_id)
);

create table if not exists public.daily_quest_bonus (
  quest_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reward integer not null default 100,
  claimed_at timestamptz not null default now(),
  primary key (quest_date,user_id)
);

create table if not exists public.notebook_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '📘',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notebook_notes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.notebook_subjects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  exam_date date,
  exam_importance text check (exam_importance in ('low','medium','high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  reward integer not null default 0,
  metric text not null,
  target integer not null
);
create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key(user_id,achievement_id)
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

insert into public.daily_quest_definitions(id,title,description,icon,event_type,target,reward,sort_order) values
('study-60','Sat produktivnog učenja','Završi ukupno 60 minuta učenja danas.','📚','study_minutes',60,60,1),
('message-1','Javi se grupi','Pošalji makar jednu poruku u grupnom četu.','💬','message',1,15,2),
('cafe-1','Obraduj drugaricu','Pošalji jedan poklon iz kafeterije.','☕','cafe',1,25,3),
('garden-1','Ulepšaj baštu','Kupi jedan predmet za zajedničku baštu.','🌱','garden',1,30,4),
('memory-1','Sačuvaj trenutak','Dodaj jednu novu uspomenu.','📷','memory',1,30,5)
on conflict(id) do update set title=excluded.title,description=excluded.description,icon=excluded.icon,event_type=excluded.event_type,target=excluded.target,reward=excluded.reward,sort_order=excluded.sort_order,active=true;

insert into public.achievements(id,title,description,icon,reward,metric,target) values
('first-session','Prva sesija','Završi prvu sesiju učenja.','🎓',25,'sessions',1),
('study-10h','Deset sati','Sakupi ukupno 10 sati učenja.','⏳',100,'study_minutes',600),
('messages-25','Glas grupe','Pošalji 25 poruka.','💬',50,'messages',25),
('gardener-10','Baštovanka','Dodaj 10 predmeta u baštu.','🌻',75,'garden',10),
('memories-5','Čuvarka uspomena','Dodaj 5 uspomena.','📸',75,'memories',5)
on conflict(id) do nothing;

insert into public.notebook_subjects(name,emoji) values
('Baze podataka','📊'),('Verovatnoća i statistika','🎲'),('Linearna algebra','📐'),('Matematička analiza','📈')
on conflict(name) do nothing;

create or replace function public.today_belgrade() returns date language sql stable as $$ select (now() at time zone 'Europe/Belgrade')::date $$;

create or replace function public.record_quest_event(p_user_id uuid,p_event_type text,p_amount integer default 1)
returns void language plpgsql security definer set search_path=public as $$
declare q record; v_before integer; v_after integer; v_done integer; v_total integer;
begin
  if p_user_id is null or p_amount <= 0 then return; end if;
  for q in select * from daily_quest_definitions where active and event_type=p_event_type loop
    insert into daily_quest_progress(quest_date,user_id,quest_id,progress)
    values(today_belgrade(),p_user_id,q.id,least(p_amount,q.target))
    on conflict(quest_date,user_id,quest_id) do update set progress=least(daily_quest_progress.progress+p_amount,q.target)
    returning progress into v_after;
    update daily_quest_progress set completed_at=coalesce(completed_at,now()),reward_claimed=true
      where quest_date=today_belgrade() and user_id=p_user_id and quest_id=q.id and progress>=q.target and not reward_claimed;
    if found and q.reward>0 then perform add_group_coins(q.reward); end if;
  end loop;
  select count(*) into v_total from daily_quest_definitions where active;
  select count(*) into v_done from daily_quest_progress p join daily_quest_definitions d on d.id=p.quest_id
   where p.quest_date=today_belgrade() and p.user_id=p_user_id and d.active and p.progress>=d.target;
  if v_total>0 and v_done=v_total then
    insert into daily_quest_bonus(quest_date,user_id,reward) values(today_belgrade(),p_user_id,100) on conflict do nothing;
    if found then perform add_group_coins(100); end if;
  end if;
end $$;

create or replace function public.quest_trigger() returns trigger language plpgsql security definer set search_path=public as $$
begin perform record_quest_event(new.user_id,tg_argv[0],1); return new; end $$;

drop trigger if exists quest_chat on public.chat_messages;
create trigger quest_chat after insert on public.chat_messages for each row execute function public.quest_trigger('message');
drop trigger if exists quest_cafe on public.cafe_gifts;
drop trigger if exists quest_garden on public.garden_items;
create or replace function public.memory_quest_trigger() returns trigger language plpgsql security definer set search_path=public as $$ begin perform record_quest_event(new.author_user_id,'memory',1); return new; end $$;
drop trigger if exists quest_memory on public.memories;
create trigger quest_memory after insert on public.memories for each row execute function public.memory_quest_trigger();

create or replace function public.study_session_trigger() returns trigger language plpgsql security definer set search_path=public as $$
begin perform record_quest_event(new.user_id,'study_minutes',floor(new.duration_seconds/60)::integer); return new; end $$;
drop trigger if exists quest_study on public.study_sessions;
create trigger quest_study after insert on public.study_sessions for each row execute function public.study_session_trigger();

alter table public.user_profiles enable row level security; alter table public.study_sessions enable row level security;
alter table public.daily_quest_definitions enable row level security; alter table public.daily_quest_progress enable row level security;
alter table public.daily_quest_bonus enable row level security; alter table public.notebook_subjects enable row level security;
alter table public.notebook_notes enable row level security; alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security; alter table public.notifications enable row level security;

-- APIs use authenticated Supabase client; these policies keep direct browser access safe.
drop policy if exists profiles_read on public.user_profiles; create policy profiles_read on public.user_profiles for select to authenticated using(true);
drop policy if exists profiles_own on public.user_profiles; create policy profiles_own on public.user_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists sessions_read on public.study_sessions; create policy sessions_read on public.study_sessions for select to authenticated using(true);
drop policy if exists sessions_insert on public.study_sessions; create policy sessions_insert on public.study_sessions for insert to authenticated with check(user_id=auth.uid());
drop policy if exists quest_defs_read on public.daily_quest_definitions; create policy quest_defs_read on public.daily_quest_definitions for select to authenticated using(true);
drop policy if exists quest_progress_read on public.daily_quest_progress; create policy quest_progress_read on public.daily_quest_progress for select to authenticated using(user_id=auth.uid());
drop policy if exists quest_bonus_read on public.daily_quest_bonus; create policy quest_bonus_read on public.daily_quest_bonus for select to authenticated using(user_id=auth.uid());
drop policy if exists subjects_read on public.notebook_subjects; create policy subjects_read on public.notebook_subjects for select to authenticated using(true);
drop policy if exists subjects_insert on public.notebook_subjects; create policy subjects_insert on public.notebook_subjects for insert to authenticated with check(created_by=auth.uid());
drop policy if exists notes_read on public.notebook_notes; create policy notes_read on public.notebook_notes for select to authenticated using(true);
drop policy if exists notes_insert on public.notebook_notes; create policy notes_insert on public.notebook_notes for insert to authenticated with check(user_id=auth.uid());
drop policy if exists notes_modify on public.notebook_notes; create policy notes_modify on public.notebook_notes for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists notes_delete on public.notebook_notes; create policy notes_delete on public.notebook_notes for delete to authenticated using(user_id=auth.uid());
drop policy if exists achievements_read on public.achievements; create policy achievements_read on public.achievements for select to authenticated using(true);
drop policy if exists user_achievements_read on public.user_achievements; create policy user_achievements_read on public.user_achievements for select to authenticated using(true);
drop policy if exists notifications_own on public.notifications; create policy notifications_own on public.notifications for select to authenticated using(user_id is null or user_id=auth.uid());
drop policy if exists notifications_update on public.notifications; create policy notifications_update on public.notifications for update to authenticated using(user_id=auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.daily_quest_progress;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notebook_notes; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end $$;
