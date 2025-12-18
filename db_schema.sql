-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE

-- 1. Create Vehicles Table
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'CAVALO' or 'CARRETA'
  plate text not null,
  model text, -- Nullable for trailers
  current_km numeric, -- Nullable for trailers
  next_oil_change_km numeric, -- Nullable for trailers
  axles numeric, -- Nullable for trucks
  last_lubrication_date text, -- Storing date as text to match ISO format from frontend
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Checklists Table
create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  date text not null, -- ISO String
  status text not null, -- 'COMPLETED', 'DRAFT'
  items jsonb not null, -- Store the array of items/status/comments as JSON
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable RLS (Optional but good practice)
alter table vehicles enable row level security;
alter table checklists enable row level security;

-- 4. Create Policies (Public access for this demo)
create policy "Public Select Vehicles" on vehicles for select using (true);
create policy "Public Insert Vehicles" on vehicles for insert with check (true);
create policy "Public Update Vehicles" on vehicles for update using (true);

create policy "Public Select Checklists" on checklists for select using (true);
create policy "Public Insert Checklists" on checklists for insert with check (true);
