-- Create an extension for generating unique slugs
create extension if not exists "unaccent";

-- Add profile details columns to users table
alter table public.usuarios add column if not exists cover_image text;
alter table public.usuarios add column if not exists bio text;
alter table public.usuarios add column if not exists website text;
alter table public.usuarios add column if not exists disciplines text[] default '{}';
alter table public.usuarios add column if not exists social_links jsonb default '[]';

-- Create portfolio table
create table public.portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.usuarios(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create gallery table
create table public.gallery (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.usuarios(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  location text,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create followers table
create table public.followers (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.usuarios(id) on delete cascade,
  following_id uuid references public.usuarios(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  constraint unique_follower unique (follower_id, following_id)
);

-- Enable RLS
alter table public.portfolio enable row level security;
alter table public.gallery enable row level security;
alter table public.followers enable row level security;

-- Create policies
create policy "Users can view all portfolio items"
  on public.portfolio for select
  using (true);

create policy "Users can manage their own portfolio items"
  on public.portfolio for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view all gallery items"
  on public.gallery for select
  using (true);

create policy "Users can manage their own gallery items"
  on public.gallery for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view all followers"
  on public.followers for select
  using (true);

create policy "Users can manage their own follow relationships"
  on public.followers for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- Create functions
create or replace function public.get_user_followers(user_id uuid)
returns setof public.usuarios as $$
  select u.*
  from public.usuarios u
  inner join public.followers f on f.follower_id = u.id
  where f.following_id = user_id;
$$ language sql security definer;

create or replace function public.get_user_following(user_id uuid)
returns setof public.usuarios as $$
  select u.*
  from public.usuarios u
  inner join public.followers f on f.following_id = u.id
  where f.follower_id = user_id;
$$ language sql security definer;

create or replace function public.follow_user(target_user_id uuid)
returns void as $$
begin
  insert into public.followers (follower_id, following_id)
  values (auth.uid(), target_user_id)
  on conflict do nothing;
end;
$$ language plpgsql security definer;

create or replace function public.unfollow_user(target_user_id uuid)
returns void as $$
begin
  delete from public.followers
  where follower_id = auth.uid()
  and following_id = target_user_id;
end;
$$ language plpgsql security definer;
