-- ─── Text Aura: usage metering schema ───────────────────────────────────────
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- It creates the anonymous free-tier usage counter + two atomic RPCs the
-- serverless functions call. No auth required for the free tier.

create table if not exists usage_counters (
  device_id  text primary key,
  day        date        not null default (now() at time zone 'utc')::date,
  count      int         not null default 0,
  ad_bonus   int         not null default 0,
  last_ip    text,
  updated_at timestamptz not null default now()
);

-- Atomically consume one generation. Resets the counter on a new UTC day.
-- Returns whether it was allowed plus the post-state.
-- (Table columns are alias-qualified (uc.) so they never collide with the
--  same-named OUT parameters, e.g. ad_bonus.)
create or replace function consume_generation(
  p_device text, p_ip text, p_base int, p_cap int
) returns table(allowed boolean, used int, ad_bonus int, allowance int)
language plpgsql as $$
declare
  v_day   date := (now() at time zone 'utc')::date;
  v_count int;
  v_bonus int;
  v_allow int;
begin
  insert into usage_counters(device_id, day, count, ad_bonus, last_ip)
    values (p_device, v_day, 0, 0, p_ip)
    on conflict (device_id) do nothing;

  -- Lock the row, then reset if the day rolled over.
  perform 1 from usage_counters uc where uc.device_id = p_device for update;
  update usage_counters uc
    set day = v_day, count = 0, ad_bonus = 0
    where uc.device_id = p_device and uc.day <> v_day;

  select uc.count, uc.ad_bonus into v_count, v_bonus
    from usage_counters uc where uc.device_id = p_device;

  v_allow := least(p_base + v_bonus, p_cap);

  if v_count >= v_allow then
    update usage_counters uc set last_ip = p_ip, updated_at = now()
      where uc.device_id = p_device;
    allowed := false; used := v_count; ad_bonus := v_bonus; allowance := v_allow;
  else
    update usage_counters uc set count = uc.count + 1, last_ip = p_ip, updated_at = now()
      where uc.device_id = p_device;
    allowed := true; used := v_count + 1; ad_bonus := v_bonus; allowance := v_allow;
  end if;
  return next;
end;
$$;

-- Grant ad-reward bonus shifts (capped so base + bonus never exceeds p_cap).
create or replace function grant_ad_bonus(
  p_device text, p_inc int, p_base int, p_cap int
) returns table(used int, ad_bonus int, allowance int)
language plpgsql as $$
declare
  v_day      date := (now() at time zone 'utc')::date;
  v_count    int;
  v_bonus    int;
  v_allow    int;
  v_maxbonus int := greatest(p_cap - p_base, 0);
begin
  insert into usage_counters(device_id, day) values (p_device, v_day)
    on conflict (device_id) do nothing;

  perform 1 from usage_counters uc where uc.device_id = p_device for update;
  update usage_counters uc
    set day = v_day, count = 0, ad_bonus = 0
    where uc.device_id = p_device and uc.day <> v_day;

  update usage_counters uc
    set ad_bonus = least(uc.ad_bonus + p_inc, v_maxbonus), updated_at = now()
    where uc.device_id = p_device;

  select uc.count, uc.ad_bonus into v_count, v_bonus
    from usage_counters uc where uc.device_id = p_device;
  v_allow := least(p_base + v_bonus, p_cap);

  used := v_count; ad_bonus := v_bonus; allowance := v_allow;
  return next;
end;
$$;
