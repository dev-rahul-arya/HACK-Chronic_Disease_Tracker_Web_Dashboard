-- Create the medications table
create table public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  dosage text,
  frequency text,
  created_at timestamptz default now()
);

-- Enable Security
alter table public.medications enable row level security;

-- Policies
create policy "Users can view their own medications"
on public.medications for select
using (auth.uid() = user_id);

create policy "Users can insert their own medications"
on public.medications for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own medications"
on public.medications for delete
using (auth.uid() = user_id);