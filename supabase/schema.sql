create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_key text unique not null,
  name text not null,
  email text unique not null,
  avatar_url text,
  status text not null default 'Idle' check (status in ('Idle', 'Studying', 'On Break')),
  current_subject text,
  hours_this_week numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, member_key, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'member_key', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
