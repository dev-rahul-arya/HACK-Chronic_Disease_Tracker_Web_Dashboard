-- Create table for medication logs (history)
create table public.medication_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  medication_id uuid references public.medications not null,
  taken_at timestamptz default now(),
  status text default 'taken' -- 'taken' or 'skipped'
);

-- Enable Security
alter table public.medication_logs enable row level security;

-- Policies
create policy "Users can view their own med logs"
on public.medication_logs for select
using (auth.uid() = user_id);

create policy "Users can insert their own med logs"
on public.medication_logs for insert
with check (auth.uid() = user_id);