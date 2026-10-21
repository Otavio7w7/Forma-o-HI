-- =========================================================
-- FORMAÇÃO HI — LOGIN E PROGRESSO DOS COLABORADORES
-- Rodar uma vez no Supabase: SQL Editor → New query → colar → Run.
-- Usado por Assets/conta.js (alunos) e Assets/admin.html (painel ADM).
-- =========================================================

-- Progresso de cada colaborador (uma linha por conta)
create table if not exists public.progresso (
    user_id       uuid primary key references auth.users (id) on delete cascade,
    nome          text not null,
    email         text,
    etapas        integer[] not null default '{}',
    ultima_etapa  integer check (ultima_etapa between 1 and 15),
    ultimo_acesso timestamptz not null default now(),
    criado_em     timestamptz not null default now()
);

-- Quem pode ver o painel ADM
create table if not exists public.admins (
    user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.progresso enable row level security;
alter table public.admins    enable row level security;

-- true se quem está logado é ADM
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Regras de acesso (RLS)
drop policy if exists "progresso: ler o proprio ou admin" on public.progresso;
create policy "progresso: ler o proprio ou admin"
    on public.progresso for select to authenticated
    using (user_id = auth.uid() or public.eh_admin());

drop policy if exists "progresso: criar o proprio" on public.progresso;
create policy "progresso: criar o proprio"
    on public.progresso for insert to authenticated
    with check (user_id = auth.uid());

drop policy if exists "progresso: alterar o proprio" on public.progresso;
create policy "progresso: alterar o proprio"
    on public.progresso for update to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

drop policy if exists "admins: ver a propria linha" on public.admins;
create policy "admins: ver a propria linha"
    on public.admins for select to authenticated
    using (user_id = auth.uid());

-- Permissões da API (usuário logado; visitante sem login não acessa nada)
revoke all on public.progresso from anon;
revoke all on public.admins    from anon;
grant select, insert, update on public.progresso to authenticated;
grant select                 on public.admins    to authenticated;
grant execute on function public.eh_admin() to authenticated;


-- =========================================================
-- DEPOIS de criar a SUA conta pelo site, rode só a linha abaixo
-- (trocando o e-mail) para virar ADM:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'seu.email@exemplo.com';
-- =========================================================
