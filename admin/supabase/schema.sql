-- =====================================================================
-- СХЕМА БАЗЫ ДАННЫХ АДМИН-ПАНЕЛИ
--
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Скрипт можно запускать повторно: он не удаляет данные.
--
-- Роли:
--   owner   — владелец: видит всё, включая закупочные цены, расходы и прибыль;
--   manager — менеджер: заявки, клиенты, техника, поставщики, но НЕ закупочные цены и прибыль.
-- Новый пользователь создаётся НЕАКТИВНЫМ и ничего не видит, пока владелец его не включит.
--
-- Защита работает на уровне базы (Row Level Security): даже зная адрес базы,
-- без входа и без активного профиля получить данные нельзя.
-- =====================================================================

-- ---------- Типы ----------
do $$ begin
  create type public.staff_role as enum ('owner', 'manager');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('new', 'in_progress', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- Сотрудники ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.staff_role not null default 'manager',
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Проверки прав. security definer — чтобы функция могла читать profiles в обход RLS.
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active);
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active and role = 'owner');
$$;

-- Профиль создаётся автоматически при добавлении пользователя в Supabase → Authentication.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Пользователи, созданные до запуска скрипта, тоже получают профиль.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Автоматическое обновление поля updated_at.
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Поставщики ----------
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  contact_person text not null default '',
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Техника (то, что предлагаем клиентам) ----------
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  category text not null check (category in
    ('excavators', 'backhoe-loaders', 'truck-cranes', 'dump-trucks', 'rollers', 'wheel-loaders')),
  specs text not null default '',
  -- Цена для клиента за смену
  client_price_per_shift numeric(12, 2) not null default 0 check (client_price_per_shift >= 0),
  min_shifts integer not null default 1 check (min_shifts > 0),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Закупочные цены: какая техника у какого поставщика и почём (ТОЛЬКО ВЛАДЕЛЕЦ) ----------
create table if not exists public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  cost_per_shift numeric(12, 2) not null check (cost_per_shift >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (equipment_id, supplier_id)
);

-- ---------- Клиенты ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  kind text not null default 'company' check (kind in ('company', 'person')),
  phone text not null default '',
  email text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Заявки ----------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity unique,
  client_id uuid references public.clients (id) on delete set null,
  contact_name text not null check (length(trim(contact_name)) > 0),
  contact_phone text not null default '',
  source text not null default 'phone' check (source in ('site', 'phone', 'messenger', 'repeat', 'other')),
  category text check (category in
    ('excavators', 'backhoe-loaders', 'truck-cranes', 'dump-trucks', 'rollers', 'wheel-loaders')),
  equipment_id uuid references public.equipment (id) on delete set null,
  address text not null default '',
  start_date date,
  shifts integer check (shifts > 0),
  -- Цена для клиента за смену по этой заявке
  client_price_per_shift numeric(12, 2) check (client_price_per_shift >= 0),
  status public.request_status not null default 'new',
  comment text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Расходы по заявке: у кого взяли технику и за сколько (ТОЛЬКО ВЛАДЕЛЕЦ) ----------
create table if not exists public.request_costs (
  request_id uuid primary key references public.requests (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  cost_per_shift numeric(12, 2) not null default 0 check (cost_per_shift >= 0),
  -- Доставка, топливо и прочие разовые расходы
  extra_costs numeric(12, 2) not null default 0 check (extra_costs >= 0),
  notes text not null default '',
  updated_at timestamptz not null default now()
);

-- updated_at
do $$
declare t text;
begin
  foreach t in array array['suppliers', 'equipment', 'supplier_offers', 'clients', 'requests', 'request_costs'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_start_date_idx on public.requests (start_date);
create index if not exists supplier_offers_equipment_idx on public.supplier_offers (equipment_id);

-- =====================================================================
-- ПРАВА ДОСТУПА (Row Level Security)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.equipment enable row level security;
alter table public.supplier_offers enable row level security;
alter table public.clients enable row level security;
alter table public.requests enable row level security;
alter table public.request_costs enable row level security;

-- Неавторизованные посетители не получают ничего.
revoke all on all tables in schema public from anon;

-- Профили: каждый видит свой профиль (чтобы узнать, активен ли он), активные сотрудники — всех.
-- Менять роли и включать сотрудников может только владелец.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- Общие рабочие таблицы: активные сотрудники читают, добавляют и меняют; удаляет только владелец.
do $$
declare t text;
begin
  foreach t in array array['suppliers', 'equipment', 'clients', 'requests'] loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_staff())', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_staff())', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_owner())', t || '_delete', t);
  end loop;
end $$;

-- Деньги: закупочные цены и расходы по заявкам — только владелец, любые действия.
do $$
declare t text;
begin
  foreach t in array array['supplier_offers', 'request_costs'] loop
    execute format('drop policy if exists %I on public.%I', t || '_owner', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())', t || '_owner', t);
  end loop;
end $$;
