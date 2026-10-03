-- ============================================================================
-- CHALO - SUPABASE DATABASE SCHEMA, RLS, FUNCTIONS & SEED
-- Architecture reference: ARCHITECTURE.md (Sections 3 & 4)
-- Run this script in the Supabase SQL Editor
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TABLES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'citizen' check (role in ('citizen','student')),
  institution text,
  bound_device_id text,
  student_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_pkr integer not null default 0 check (balance_pkr >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('topup','fare')),
  amount_pkr integer not null,
  method text,
  route_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.stops (
  id text primary key,
  name text not null,
  network text not null check (network in ('metrobus','orange','speedo')),
  lat double precision not null,
  lng double precision not null
);

create table if not exists public.routes (
  id text primary key,
  name text not null,
  network text not null check (network in ('metrobus','orange','speedo')),
  fare_pkr integer not null
);

create table if not exists public.route_stops (
  route_id text not null references public.routes(id) on delete cascade,
  seq integer not null,
  stop_id text not null references public.stops(id),
  minutes_from_prev integer not null default 0,
  primary key (route_id, seq)
);

create table if not exists public.transfers (
  from_stop_id text not null references public.stops(id),
  to_stop_id text not null references public.stops(id),
  walk_minutes integer not null default 3,
  primary key (from_stop_id, to_stop_id)
);

create table if not exists public.vehicles (
  id text primary key,
  route_id text not null references public.routes(id) on delete cascade,
  dir smallint not null default 1 check (dir in (1,-1)),
  seq integer not null default 1,
  progress real not null default 0,
  lat double precision not null,
  lng double precision not null,
  heading real not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id text not null,
  kind text not null check (kind in ('paygo','student')),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  extracted_name text,
  institution text,
  liveness_passed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. AUTH TRIGGER (New user -> profile + wallet)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.wallets(user_id, balance_pkr)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.student_verifications enable row level security;
alter table public.qr_tokens enable row level security;
alter table public.stops enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.transfers enable row level security;
alter table public.vehicles enable row level security;

-- Drop existing policies if re-running
drop policy if exists own_profile on public.profiles;
drop policy if exists own_wallet on public.wallets;
drop policy if exists own_tx on public.transactions;
drop policy if exists own_verif on public.student_verifications;
drop policy if exists read_stops on public.stops;
drop policy if exists read_routes on public.routes;
drop policy if exists read_route_stops on public.route_stops;
drop policy if exists read_transfers on public.transfers;
drop policy if exists read_vehicles on public.vehicles;

-- Create policies
create policy own_profile on public.profiles for select using (auth.uid() = id);
create policy own_wallet on public.wallets for select using (auth.uid() = user_id);
create policy own_tx on public.transactions for select using (auth.uid() = user_id);
create policy own_verif on public.student_verifications for select using (auth.uid() = user_id);
create policy read_stops on public.stops for select to authenticated using (true);
create policy read_routes on public.routes for select to authenticated using (true);
create policy read_route_stops on public.route_stops for select to authenticated using (true);
create policy read_transfers on public.transfers for select to authenticated using (true);
create policy read_vehicles on public.vehicles for select to authenticated using (true);

-- Enable Realtime publication for vehicles table
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vehicles'
  ) then
    alter publication supabase_realtime add table public.vehicles;
  end if;
end $$;

-- 5. RPC FUNCTIONS

-- Top-up function (Mock payment method: JazzCash or RAAST)
create or replace function public.top_up(p_amount integer, p_method text)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  new_bal integer;
begin
  if p_amount <= 0 or p_amount > 10000 then
    raise exception 'invalid amount';
  end if;
  if p_method not in ('jazzcash','raast') then
    raise exception 'invalid method';
  end if;

  update public.wallets
  set balance_pkr = balance_pkr + p_amount, updated_at = now()
  where user_id = auth.uid()
  returning balance_pkr into new_bal;

  if new_bal is null then
    raise exception 'wallet not found';
  end if;

  insert into public.transactions(user_id, type, amount_pkr, method)
  values (auth.uid(), 'topup', p_amount, p_method);

  return new_bal;
end $$;

-- QR Token issuance (30 seconds TTL, device-bound for students)
create or replace function public.issue_qr_token(p_device_id text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  t public.qr_tokens;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then
    raise exception 'profile not found';
  end if;

  if p.role = 'student' and p.bound_device_id is distinct from p_device_id then
    raise exception 'device not bound';
  end if;

  insert into public.qr_tokens(user_id, device_id, kind, expires_at)
  values (
    auth.uid(),
    p_device_id,
    case when p.role = 'student' then 'student' else 'paygo' end,
    now() + interval '30 seconds'
  )
  returning * into t;

  return jsonb_build_object(
    'token_id', t.id,
    'kind', t.kind,
    'expires_at', t.expires_at
  );
end $$;

-- QR Validation (Conductor mode: single-use, expiry check, fare deduction)
create or replace function public.validate_qr(p_token uuid, p_route_id text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t public.qr_tokens;
  v_fare integer;
  bal integer;
begin
  select * into t from public.qr_tokens where id = p_token for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  if t.used_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'already_used');
  end if;

  if t.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  select fare_pkr into v_fare from public.routes where id = p_route_id;
  if v_fare is null then
    return jsonb_build_object('ok', false, 'reason', 'unknown_route');
  end if;

  if t.kind = 'student' then
    v_fare := 0;
  end if;

  if v_fare > 0 then
    update public.wallets
    set balance_pkr = balance_pkr - v_fare, updated_at = now()
    where user_id = t.user_id and balance_pkr >= v_fare
    returning balance_pkr into bal;

    if bal is null then
      return jsonb_build_object('ok', false, 'reason', 'insufficient_balance');
    end if;
  else
    select balance_pkr into bal from public.wallets where user_id = t.user_id;
  end if;

  update public.qr_tokens set used_at = now() where id = t.id;

  insert into public.transactions(user_id, type, amount_pkr, route_id)
  values (t.user_id, 'fare', v_fare, p_route_id);

  return jsonb_build_object('ok', true, 'fare', v_fare, 'balance', bal);
end $$;

-- Student Upgrade
create or replace function public.upgrade_to_student(
  p_name text,
  p_institution text,
  p_device_id text,
  p_liveness boolean
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not p_liveness then
    raise exception 'liveness failed';
  end if;

  insert into public.student_verifications(user_id, extracted_name, institution, liveness_passed)
  values (auth.uid(), p_name, p_institution, true);

  update public.profiles
  set role = 'student',
      institution = p_institution,
      bound_device_id = p_device_id,
      student_verified_at = now()
  where id = auth.uid();
end $$;

-- Vehicle Simulator Tick: advances vehicles along stops
create or replace function public.tick_vehicles()
returns void
language plpgsql security definer set search_path = public as $$
declare
  v record;
  n integer;
  s integer;
  d smallint;
  p real;
  a record;
  b record;
begin
  for v in select * from public.vehicles loop
    select max(seq) into n from public.route_stops where route_id = v.route_id;
    s := v.seq;
    d := v.dir;
    p := v.progress + 0.1;

    if p >= 1.0 then
      s := s + d;
      p := p - 1.0;
      if s + d < 1 or s + d > n then
        d := -d;
      end if;
    end if;

    select st.lat, st.lng into a
    from public.route_stops rs
    join public.stops st on st.id = rs.stop_id
    where rs.route_id = v.route_id and rs.seq = s;

    select st.lat, st.lng into b
    from public.route_stops rs
    join public.stops st on st.id = rs.stop_id
    where rs.route_id = v.route_id and rs.seq = least(greatest(s + d, 1), n);

    if a.lat is not null and b.lat is not null then
      update public.vehicles
      set seq = s,
          dir = d,
          progress = p,
          lat = a.lat + (b.lat - a.lat) * p,
          lng = a.lng + (b.lng - a.lng) * p,
          heading = degrees(atan2(b.lng - a.lng, b.lat - a.lat)),
          updated_at = now()
      where id = v.id;
    end if;
  end loop;
end $$;

-- Revoke & Grant permissions
revoke execute on all functions in schema public from public, anon;
grant execute on function public.top_up(integer, text) to authenticated;
grant execute on function public.issue_qr_token(text) to authenticated;
grant execute on function public.validate_qr(uuid, text) to authenticated;
grant execute on function public.upgrade_to_student(text, text, text, boolean) to authenticated;

-- 6. SEED DATA
insert into public.stops (id, name, network, lat, lng) values
  ('gajju_matta','Gajju Matta','metrobus',31.4040,74.2350),
  ('kalma_chowk','Kalma Chowk','metrobus',31.5040,74.3300),
  ('chauburji_mb','Chauburji (Metrobus)','metrobus',31.5560,74.3050),
  ('shahdara','Shahdara','metrobus',31.6190,74.2950),
  ('ali_town','Ali Town','orange',31.4430,74.2490),
  ('wahdat_road','Wahdat Road','orange',31.5100,74.2900),
  ('chauburji_ol','Chauburji (Orange)','orange',31.5565,74.3035),
  ('sp_kalma','Kalma Chowk (Speedo)','speedo',31.5042,74.3302),
  ('sp_liberty','Liberty Market','speedo',31.5110,74.3440),
  ('sp_gulberg','Gulberg Main','speedo',31.5200,74.3500)
on conflict (id) do nothing;

insert into public.routes (id, name, network, fare_pkr) values
  ('MB','Metrobus','metrobus',30),
  ('OL','Orange Line','orange',40),
  ('SP1','Speedo S1','speedo',20)
on conflict (id) do nothing;

insert into public.route_stops (route_id, seq, stop_id, minutes_from_prev) values
  ('MB',1,'gajju_matta',0),
  ('MB',2,'kalma_chowk',14),
  ('MB',3,'chauburji_mb',10),
  ('MB',4,'shahdara',8),
  ('OL',1,'ali_town',0),
  ('OL',2,'wahdat_road',9),
  ('OL',3,'chauburji_ol',8),
  ('SP1',1,'sp_kalma',0),
  ('SP1',2,'sp_liberty',6),
  ('SP1',3,'sp_gulberg',5)
on conflict (route_id, seq) do nothing;

insert into public.transfers (from_stop_id, to_stop_id, walk_minutes) values
  ('kalma_chowk','sp_kalma',2),
  ('sp_kalma','kalma_chowk',2),
  ('chauburji_mb','chauburji_ol',3),
  ('chauburji_ol','chauburji_mb',3)
on conflict (from_stop_id, to_stop_id) do nothing;

-- Initial vehicles
insert into public.vehicles(id, route_id, seq, lat, lng)
select r.id || '-' || g, r.id, g, s.lat, s.lng
from public.routes r
cross join generate_series(1, 2) g
join public.route_stops rs on rs.route_id = r.id and rs.seq = g
join public.stops s on s.id = rs.stop_id
on conflict (id) do nothing;
