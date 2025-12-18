-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnh_number text not null,
  cnh_category text,
  cnh_expiration text not null, -- ISO Date String (YYYY-MM-DD)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table drivers enable row level security;

-- Policies (Public for this version)
create policy "Public Select Drivers" on drivers for select using (true);
create policy "Public Insert Drivers" on drivers for insert with check (true);
create policy "Public Update Drivers" on drivers for update using (true);
create policy "Public Delete Drivers" on drivers for delete using (true);
