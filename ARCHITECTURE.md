# ARCHITECTURE

**Stack:** Expo (React Native) + TypeScript + Expo Router + React Native Paper + Supabase.
**Key decisions:** `react-native-maps` for the map (Expo Go works; the APK needs a Google Maps Android key at build time). Vehicle positions are simulated in Postgres and pushed with Supabase Realtime. Wallet and QR logic live only in SQL functions, so the client never writes money. `services/index.ts` returns mock or real services based on `EXPO_PUBLIC_USE_MOCK`. Routes, fares and coordinates are approximate demo data.

## 1. Screens (Expo Router)
| Route | File | Purpose |
|---|---|---|
| `/login` | `app/(auth)/login.tsx` | Email + password sign in |
| `/signup` | `app/(auth)/signup.tsx` | Create account (name, email, password) |
| `/` | `app/(tabs)/index.tsx` | Live map: moving vehicles, latency badge, my location |
| `/plan` | `app/(tabs)/plan.tsx` | Origin/destination, Fastest/Cheapest toggle, route result with time and fare |
| `/wallet` | `app/(tabs)/wallet.tsx` | Balance, top-up sheet (mock JazzCash/RAAST), rotating QR, recent transactions |
| `/profile` | `app/(tabs)/profile.tsx` | Account, role badge, Glare Mode switch, links to student flow and validator, sign out |
| `/student-verify` | `app/student-verify.tsx` | Consent, ID capture, OCR confirm, liveness prompt, upgrade result |
| `/validator` | `app/validator.tsx` | Conductor mode: pick route, scan QR, show pass/fail and fare |

## 2. Navigation map
```
app/_layout.tsx  (root Stack, auth gate, PaperProvider)
├─ no session ─► (auth) Stack:  /login  <->  /signup
└─ session ────► (tabs) Bottom tabs:  Map "/" | Plan "/plan" | Wallet "/wallet" | Profile "/profile"
                 ├─ /student-verify  (modal, from Profile or Wallet banner)
                 └─ /validator       (modal, from Profile > Conductor mode)
```
Redirects: no session -> `/login`; login success -> `/`; sign out -> `/login`.

## 3. Database
| Table | Columns | Relations |
|---|---|---|
| `profiles` | id uuid PK, full_name text, role text (citizen/student), institution text, bound_device_id text, student_verified_at timestamptz | id -> auth.users |
| `wallets` | user_id uuid PK, balance_pkr int >= 0, updated_at | user_id -> profiles |
| `transactions` | id uuid PK, user_id, type (topup/fare), amount_pkr int, method text, route_id text, created_at | user_id -> profiles |
| `stops` | id text PK, name, network (metrobus/orange/speedo), lat, lng float8 | |
| `routes` | id text PK, name, network, fare_pkr int | |
| `route_stops` | route_id, seq int, stop_id, minutes_from_prev int; PK (route_id, seq) | -> routes, stops |
| `transfers` | from_stop_id, to_stop_id, walk_minutes int | -> stops |
| `vehicles` | id text PK, route_id, dir (1/-1), seq int, progress real, lat, lng, heading, updated_at | route_id -> routes |
| `qr_tokens` | id uuid PK, user_id, device_id text, kind (paygo/student), expires_at, used_at | user_id -> profiles |
| `student_verifications` | id uuid PK, user_id, extracted_name, institution, liveness_passed bool, created_at | user_id -> profiles |

RPC functions: `top_up`, `issue_qr_token`, `validate_qr`, `upgrade_to_student`, `tick_vehicles`.

```sql
-- supabase/schema.sql  (run once in Supabase SQL editor; not executed/tested outside Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'citizen' check (role in ('citizen','student')),
  institution text,
  bound_device_id text,
  student_verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_pkr integer not null default 0 check (balance_pkr >= 0),
  updated_at timestamptz not null default now()
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('topup','fare')),
  amount_pkr integer not null,
  method text,
  route_id text,
  created_at timestamptz not null default now()
);
create table public.stops (
  id text primary key,
  name text not null,
  network text not null check (network in ('metrobus','orange','speedo')),
  lat double precision not null,
  lng double precision not null
);
create table public.routes (
  id text primary key,
  name text not null,
  network text not null check (network in ('metrobus','orange','speedo')),
  fare_pkr integer not null
);
create table public.route_stops (
  route_id text not null references public.routes(id) on delete cascade,
  seq integer not null,
  stop_id text not null references public.stops(id),
  minutes_from_prev integer not null default 0,
  primary key (route_id, seq)
);
create table public.transfers (
  from_stop_id text not null references public.stops(id),
  to_stop_id text not null references public.stops(id),
  walk_minutes integer not null default 3,
  primary key (from_stop_id, to_stop_id)
);
create table public.vehicles (
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
create table public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id text not null,
  kind text not null check (kind in ('paygo','student')),
  expires_at timestamptz not null,
  used_at timestamptz
);
create table public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  extracted_name text,
  institution text,
  liveness_passed boolean not null default false,
  created_at timestamptz not null default now()
);

-- New user -> profile + wallet
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.wallets(user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users read only their own rows; transit data readable by signed-in users.
-- No insert/update policies: all writes go through the functions below.
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
create policy own_profile on public.profiles for select using (auth.uid() = id);
create policy own_wallet on public.wallets for select using (auth.uid() = user_id);
create policy own_tx on public.transactions for select using (auth.uid() = user_id);
create policy own_verif on public.student_verifications for select using (auth.uid() = user_id);
create policy read_stops on public.stops for select to authenticated using (true);
create policy read_routes on public.routes for select to authenticated using (true);
create policy read_route_stops on public.route_stops for select to authenticated using (true);
create policy read_transfers on public.transfers for select to authenticated using (true);
create policy read_vehicles on public.vehicles for select to authenticated using (true);
alter publication supabase_realtime add table public.vehicles;

-- Top-up (mock payment: no real gateway)
create function public.top_up(p_amount integer, p_method text) returns integer
language plpgsql security definer set search_path = public as $$
declare new_bal integer;
begin
  if p_amount <= 0 or p_amount > 10000 then raise exception 'invalid amount'; end if;
  if p_method not in ('jazzcash','raast') then raise exception 'invalid method'; end if;
  update public.wallets set balance_pkr = balance_pkr + p_amount, updated_at = now()
    where user_id = auth.uid() returning balance_pkr into new_bal;
  insert into public.transactions(user_id, type, amount_pkr, method)
    values (auth.uid(), 'topup', p_amount, p_method);
  return new_bal;
end $$;

-- QR token valid for 30 s; student tokens only on the bound device
create function public.issue_qr_token(p_device_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.profiles; t public.qr_tokens;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.role = 'student' and p.bound_device_id is distinct from p_device_id then
    raise exception 'device not bound';
  end if;
  insert into public.qr_tokens(user_id, device_id, kind, expires_at)
    values (auth.uid(), p_device_id,
            case when p.role = 'student' then 'student' else 'paygo' end,
            now() + interval '30 seconds')
    returning * into t;
  return jsonb_build_object('token_id', t.id, 'kind', t.kind, 'expires_at', t.expires_at);
end $$;

-- Validator: single-use, expiry check, fare deduction (0 for students)
create function public.validate_qr(p_token uuid, p_route_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.qr_tokens; v_fare integer; bal integer;
begin
  select * into t from public.qr_tokens where id = p_token for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  if t.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'already_used'); end if;
  if t.expires_at < now() then return jsonb_build_object('ok', false, 'reason', 'expired'); end if;
  select fare_pkr into v_fare from public.routes where id = p_route_id;
  if v_fare is null then return jsonb_build_object('ok', false, 'reason', 'unknown_route'); end if;
  if t.kind = 'student' then v_fare := 0; end if;
  if v_fare > 0 then
    update public.wallets set balance_pkr = balance_pkr - v_fare, updated_at = now()
      where user_id = t.user_id and balance_pkr >= v_fare returning balance_pkr into bal;
    if bal is null then return jsonb_build_object('ok', false, 'reason', 'insufficient_balance'); end if;
  else
    select balance_pkr into bal from public.wallets where user_id = t.user_id;
  end if;
  update public.qr_tokens set used_at = now() where id = t.id;
  insert into public.transactions(user_id, type, amount_pkr, route_id)
    values (t.user_id, 'fare', v_fare, p_route_id);
  return jsonb_build_object('ok', true, 'fare', v_fare, 'balance', bal);
end $$;

-- Student upgrade. DEMO ONLY: trusts the client's OCR/liveness result (disclose this).
create function public.upgrade_to_student(p_name text, p_institution text, p_device_id text, p_liveness boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not p_liveness then raise exception 'liveness failed'; end if;
  insert into public.student_verifications(user_id, extracted_name, institution, liveness_passed)
    values (auth.uid(), p_name, p_institution, true);
  update public.profiles set role = 'student', institution = p_institution,
    bound_device_id = p_device_id, student_verified_at = now() where id = auth.uid();
end $$;

-- Vehicle simulator: advances every vehicle along its route
create function public.tick_vehicles() returns void
language plpgsql security definer set search_path = public as $$
declare v record; n integer; s integer; d smallint; p real; a record; b record;
begin
  for v in select * from public.vehicles loop
    select max(seq) into n from public.route_stops where route_id = v.route_id;
    s := v.seq; d := v.dir; p := v.progress + 0.1;
    if p >= 1 then
      s := s + d; p := p - 1;
      if s + d < 1 or s + d > n then d := -d; end if;
    end if;
    select st.lat, st.lng into a from public.route_stops rs join public.stops st on st.id = rs.stop_id
      where rs.route_id = v.route_id and rs.seq = s;
    select st.lat, st.lng into b from public.route_stops rs join public.stops st on st.id = rs.stop_id
      where rs.route_id = v.route_id and rs.seq = s + d;
    update public.vehicles set seq = s, dir = d, progress = p,
      lat = a.lat + (b.lat - a.lat) * p, lng = a.lng + (b.lng - a.lng) * p,
      heading = degrees(atan2(b.lng - a.lng, b.lat - a.lat)), updated_at = now()
    where id = v.id;
  end loop;
end $$;

revoke execute on all functions in schema public from public, anon;
grant execute on function public.top_up(integer, text), public.issue_qr_token(text),
  public.validate_qr(uuid, text), public.upgrade_to_student(text, text, text, boolean) to authenticated;

-- Seed (approximate demo data; replace with official data if available)
insert into public.stops values
 ('gajju_matta','Gajju Matta','metrobus',31.4040,74.2350),
 ('kalma_chowk','Kalma Chowk','metrobus',31.5040,74.3300),
 ('chauburji_mb','Chauburji (Metrobus)','metrobus',31.5560,74.3050),
 ('shahdara','Shahdara','metrobus',31.6190,74.2950),
 ('ali_town','Ali Town','orange',31.4430,74.2490),
 ('wahdat_road','Wahdat Road','orange',31.5100,74.2900),
 ('chauburji_ol','Chauburji (Orange)','orange',31.5565,74.3035),
 ('sp_kalma','Kalma Chowk (Speedo)','speedo',31.5042,74.3302),
 ('sp_liberty','Liberty Market','speedo',31.5110,74.3440),
 ('sp_gulberg','Gulberg Main','speedo',31.5200,74.3500);
insert into public.routes values
 ('MB','Metrobus','metrobus',30), ('OL','Orange Line','orange',40), ('SP1','Speedo S1','speedo',20);
insert into public.route_stops values
 ('MB',1,'gajju_matta',0),('MB',2,'kalma_chowk',14),('MB',3,'chauburji_mb',10),('MB',4,'shahdara',8),
 ('OL',1,'ali_town',0),('OL',2,'wahdat_road',9),('OL',3,'chauburji_ol',8),
 ('SP1',1,'sp_kalma',0),('SP1',2,'sp_liberty',6),('SP1',3,'sp_gulberg',5);
insert into public.transfers values
 ('kalma_chowk','sp_kalma',2),('sp_kalma','kalma_chowk',2),
 ('chauburji_mb','chauburji_ol',3),('chauburji_ol','chauburji_mb',3);
insert into public.vehicles(id, route_id, seq, lat, lng)
select r.id || '-' || g, r.id, g, s.lat, s.lng
from public.routes r cross join generate_series(1,2) g
join public.route_stops rs on rs.route_id = r.id and rs.seq = g
join public.stops s on s.id = rs.stop_id;

-- Run the simulator every second (enable the pg_cron extension first; confirm seconds-based
-- schedules work on your project, otherwise run a local script that calls tick_vehicles()).
select cron.schedule('tick-vehicles', '1 seconds', 'select public.tick_vehicles()');
```
Auth setting: in Supabase Dashboard turn off "Confirm email" so demo signups work instantly.

## 4. Service functions (`services/`)
Shared types in `services/types.ts` (one type per table plus `Itinerary`, `QrToken`, `ValidationResult`). Every function throws an `Error` with a readable message on failure.
- **`transit.ts`**: `getStops() -> Stop[]`; `getRoutes() -> Route[]`; `getVehicles() -> Vehicle[]`; `subscribeVehicles(onChange: (v: Vehicle) => void) -> () => void` (returns unsubscribe).
- **`planner.ts`**: `findNearestStop(lat, lng) -> Stop`; `planTrip(fromStopId, toStopId, mode: 'fastest' | 'cheapest') -> Itinerary` (legs with route, stops, minutes, fare; total minutes; total fare; transfers).
- **`wallet.ts`**: `getWallet() -> {balancePkr}`; `topUp(amountPkr, method: 'jazzcash' | 'raast') -> {balancePkr}`; `getTransactions(limit) -> Transaction[]`.
- **`qr.ts`**: `getQrToken(deviceId) -> {tokenId, kind, expiresAt}`; `validateQr(tokenId, routeId) -> {ok, reason?, fare?, balance?}`.
- **`student.ts`**: `getDeviceId() -> string`; `extractIdDetails(imageBase64) -> {fullName, institution}` (calls `lib/ai.ts`); `submitStudentUpgrade(fullName, institution, deviceId, livenessPassed) -> void`.
- **`profile.ts`**: `getProfile() -> Profile`.
- **`mock.ts` / `index.ts`**: `mock.ts` implements every function above with identical names and return shapes. `index.ts` re-exports mock or real. Screens import only from `@/services`.

## 5. AI integration points
Only one: **ID card OCR** in `lib/ai.ts` via Gemini vision. `extractIdFromImage(base64, mimeType) -> {fullName, institution}`; called by `student.extractIdDetails`. If the call fails or no key is set, fall back to mock extraction and show an editable form either way. The image is sent only after the user consents and is never stored. Liveness is a scripted on-screen prompt (blink/turn), not AI; disclose it as simulated. Do not add other AI features.

## 6. Mock data (same shapes as the tables)
```json
{
  "profile": {"id":"u1","full_name":"Ayesha Khan","role":"citizen","institution":null,"bound_device_id":null,"student_verified_at":null},
  "wallet": {"user_id":"u1","balance_pkr":250},
  "stop": {"id":"kalma_chowk","name":"Kalma Chowk","network":"metrobus","lat":31.504,"lng":74.33},
  "route": {"id":"MB","name":"Metrobus","network":"metrobus","fare_pkr":30},
  "route_stop": {"route_id":"MB","seq":2,"stop_id":"kalma_chowk","minutes_from_prev":14},
  "vehicle": {"id":"MB-1","route_id":"MB","dir":1,"seq":2,"progress":0.4,"lat":31.51,"lng":74.33,"heading":20,"updated_at":"2026-10-03T10:00:00Z"},
  "transaction": {"id":"t1","user_id":"u1","type":"topup","amount_pkr":200,"method":"jazzcash","route_id":null,"created_at":"2026-10-03T09:58:00Z"},
  "qr_token": {"token_id":"q1","kind":"paygo","expires_at":"2026-10-03T10:00:30Z"},
  "validation": {"ok":true,"fare":30,"balance":220},
  "itinerary": {"mode":"cheapest","total_minutes":38,"total_fare_pkr":50,"transfers":1,"legs":[{"route_id":"MB","from":"kalma_chowk","to":"chauburji_mb","minutes":10,"fare_pkr":30}]}
}
```
`mock.ts` moves the mock vehicles along their stops every second with a timer so the map demos without a backend.

## 7. Who builds what
- **Dev1 (lead, auth, navigation):** project scaffold and packages, `app/_layout.tsx` (auth gate, theme provider), `app/(auth)/*`, `lib/auth.ts`, `app/student-verify.tsx`, `app/validator.tsx`, app/EAS config, integration, final APK.
- **Dev2 (frontend):** `app/(tabs)/*` (Map, Plan, Wallet with top-up sheet and QR, Profile), `components/`, `constants/theme.ts` (#3b8132 palette plus high-contrast Glare theme), `hooks/ui/` (including Auto Glare Mode with the light sensor).
- **Dev3 (backend, services, delivery):** Supabase project, `supabase/schema.sql`, `lib/supabase.ts`, `lib/ai.ts`, all of `services/` (mock first), demo seed data, then slides, demo video, README.
- **Handoffs:** Dev3 -> everyone: `services/types.ts` + `mock.ts` + `index.ts` by 0:25. Dev3 -> Dev1: `lib/supabase.ts` by 0:40. Dev2 -> Dev1: `useAppTheme` hook by 0:20. Dev1 installs packages: `react-native-maps`, `expo-location`, `expo-camera`, `expo-sensors`, `expo-application`, `react-native-paper`, `react-native-qrcode-svg`, `react-native-svg`, `react-native-reanimated`, `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`.
