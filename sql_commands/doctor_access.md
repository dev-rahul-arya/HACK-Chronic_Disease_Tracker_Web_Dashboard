-- Create table for sharing access
create table public.doctor_access (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  access_code text not null unique,
  doctor_name text, -- Optional label like "Dr. Smith"
  created_at timestamptz default now()
);

-- Enable Security
alter table public.doctor_access enable row level security;

-- Policies (Allow users to Manage their own codes)
create policy "Users can manage their own access codes"
on public.doctor_access for all
using (auth.uid() = user_id);