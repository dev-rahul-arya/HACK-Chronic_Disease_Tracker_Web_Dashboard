-- 1. Function to get Vital Logs via Access Code
create or replace function get_vitals_by_code(lookup_code text)
returns setof health_logs
language plpgsql
security definer -- This runs with admin privileges to bypass RLS safely
as $$
declare
  target_user_id uuid;
begin
  -- Find the user_id associated with this code
  select user_id into target_user_id
  from public.doctor_access
  where access_code = lookup_code;

  -- If code is valid, return that user's logs
  if target_user_id is not null then
    return query select * from public.health_logs 
    where user_id = target_user_id 
    order by logged_at desc;
  end if;
end;
$$;

-- 2. Function to get Medications via Access Code
create or replace function get_meds_by_code(lookup_code text)
returns table (
  name text,
  dosage text,
  frequency text,
  last_taken timestamptz
)
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  select user_id into target_user_id
  from public.doctor_access
  where access_code = lookup_code;

  if target_user_id is not null then
    return query 
    select m.name, m.dosage, m.frequency, 
           (select max(taken_at) from public.medication_logs ml where ml.medication_id = m.id) as last_taken
    from public.medications m
    where m.user_id = target_user_id;
  end if;
end;
$$;