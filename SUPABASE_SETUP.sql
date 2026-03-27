-- ================================================================
-- NSICerts.org — Supabase Database Setup
-- Run this entire script in Supabase > SQL Editor > New Query
-- ================================================================

-- 1. COURSE PROGRESS TABLE
-- Tracks which chapters a user has completed and quiz results
create table if not exists course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  completed_chapters integer[] default '{}',
  quiz_results jsonb default '{}',
  passed_final boolean default false,
  cert_number text,
  cert_issued_at timestamptz,
  exam_score integer,
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 2. CERTIFICATIONS TABLE
-- Stores issued certificates for verification
create table if not exists certifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  cert_number text unique not null,
  issued_at timestamptz default now(),
  expires_at timestamptz,
  score integer,
  unique(user_id, course_id)
);

-- 3. ROW LEVEL SECURITY (RLS)
-- Users can only see and edit their own data

alter table course_progress enable row level security;
alter table certifications enable row level security;

-- Course progress policies
create policy "Users can view own progress"
  on course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on course_progress for update
  using (auth.uid() = user_id);

-- Certifications policies
create policy "Users can view own certifications"
  on certifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own certifications"
  on certifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own certifications"
  on certifications for update
  using (auth.uid() = user_id);

-- 4. PUBLIC CERT VERIFICATION
-- Anyone can look up a cert number to verify it (no login needed)
create policy "Public can verify certifications by cert number"
  on certifications for select
  using (true);

-- 5. PROFILES TABLE (stores full name for certificates)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- Automatically creates a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- DONE! Your database is ready.
-- Tables created: course_progress, certifications, profiles
-- ================================================================
