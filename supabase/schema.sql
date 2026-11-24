-- ============================================================================
-- PixelPilot AI: database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- ============================================================================

-- Projects: a named group of components (e.g. "Ìyá Àlàkẹ́ Kitchen website")
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Components: every generated section. project_id is optional.
create table if not exists public.components (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id      uuid references public.projects (id) on delete set null,
  position        integer not null default 0,
  prompt          text check (char_length(prompt) <= 2000),
  component_type  text not null check (char_length(component_type) <= 60),
  framework       text not null check (char_length(framework) <= 30),
  design_style    text check (char_length(design_style) <= 30),
  primary_color   text check (primary_color ~* '^#[0-9a-f]{6}$'),
  code            text not null check (char_length(code) <= 200000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists components_user_created_idx on public.components (user_id, created_at desc);
create index if not exists components_project_idx on public.components (project_id, position);
create index if not exists projects_user_idx on public.projects (user_id, created_at desc);

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists components_updated_at on public.components;
create trigger components_updated_at before update on public.components
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only see and change their own rows.
alter table public.projects enable row level security;
alter table public.components enable row level security;

drop policy if exists "Own projects" on public.projects;
create policy "Own projects" on public.projects
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Own components" on public.components;
create policy "Own components" on public.components
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
    )
  );

-- Let signed-in users reach these tables through the API (RLS above still
-- limits them to their own rows). Signed-out visitors get nothing.
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.components to authenticated;
revoke all on public.projects from anon;
revoke all on public.components from anon;
