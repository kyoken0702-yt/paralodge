create extension if not exists pgcrypto;

create table if not exists paralodge_guests (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null unique,
  display_name text not null default '匿名住民',
  line_user_id text,
  google_subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists paralodge_wishes (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null references paralodge_guests(guest_id) on delete cascade,
  space_key text not null,
  gate_key text not null,
  place_key text,
  room_label text not null,
  text text not null check (char_length(text) between 1 and 500),
  visibility text not null default 'anonymous_public',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists paralodge_reactions (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null references paralodge_guests(guest_id) on delete cascade,
  wish_id uuid not null references paralodge_wishes(id) on delete cascade,
  kind text not null check (kind in ('same', 'lamp', 'bless')),
  created_at timestamptz not null default now()
);

create unique index if not exists paralodge_one_lamp_per_guest_wish
  on paralodge_reactions (guest_id, wish_id)
  where kind = 'lamp';

create table if not exists paralodge_returns (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null references paralodge_guests(guest_id) on delete cascade,
  wish_id uuid references paralodge_wishes(id) on delete set null,
  status text not null,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists paralodge_meetup_signups (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null references paralodge_guests(guest_id) on delete cascade,
  source_space text,
  source_gate text,
  note text,
  status text not null default 'interested',
  created_at timestamptz not null default now()
);

create table if not exists paralodge_events (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null references paralodge_guests(guest_id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table paralodge_guests enable row level security;
alter table paralodge_wishes enable row level security;
alter table paralodge_reactions enable row level security;
alter table paralodge_returns enable row level security;
alter table paralodge_meetup_signups enable row level security;
alter table paralodge_events enable row level security;

drop policy if exists "public read anonymous wishes" on paralodge_wishes;
create policy "public read anonymous wishes"
  on paralodge_wishes for select
  using (visibility = 'anonymous_public');

drop policy if exists "public read reactions" on paralodge_reactions;
create policy "public read reactions"
  on paralodge_reactions for select
  using (true);
