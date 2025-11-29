-- Function to get detailed medication logs for the last 30 days via access code
create or replace function get_med_history_by_code(lookup_code text)
returns table (
  med_name text,
  taken_at timestamptz,
  status text
)
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  -- 1. Find the user associated with the code
  select user_id into target_user_id
  from public.doctor_access
  where access_code = lookup_code;

  -- 2. If valid, return logs joined with med names
  if target_user_id is not null then
    return query
    select m.name as med_name, ml.taken_at, ml.status
    from public.medication_logs ml
    join public.medications m on ml.medication_id = m.id
    where ml.user_id = target_user_id
    and ml.taken_at > (now() - interval '30 days') -- Only last 30 days
    order by ml.taken_at asc;
  end if;
end;
$$;