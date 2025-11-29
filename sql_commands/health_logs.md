-- 1. Create the health_logs table
create table public.health_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  systolic_bp int,
  diastolic_bp int,
  heart_rate int,
  glucose int,
  weight numeric,
  glucose_context text,
  notes text,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
-- This is crucial so users can't see each other's data
alter table public.health_logs enable row level security;

-- 3. Create Policy: Allow users to insert their own data
create policy "Users can insert their own logs"
on public.health_logs for insert
with check (auth.uid() = user_id);

-- 4. Create Policy: Allow users to view their own data
create policy "Users can view their own logs"
on public.health_logs for select
using (auth.uid() = user_id);