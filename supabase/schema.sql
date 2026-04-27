-- =========================================================
-- Rutas Piratas — Schéma Supabase v2
-- =========================================================
-- À exécuter dans le SQL Editor de Supabase, en une seule passe.
-- Idempotent autant que possible (peut être rejoué en dev).
--
-- ⚠ SI TU AVAIS DÉJÀ EXÉCUTÉ LA V1, RESET D'ABORD :
--   Supabase Dashboard → Settings → Database → Reset database
--   (ou drop manuellement les tables : profiles, randonnees, votes, inscriptions)
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- 1. PROFILES (miroir de auth.users)
-- =========================================================
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  avatar_url          text,
  role                text not null default 'member' check (role in ('member', 'admin')),
  is_federated_guide  boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Création automatique du profil à l'inscription (magic link inclus)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =========================================================
-- 2. MEMBERSHIPS (cotisations annuelles, échéance 30 sept)
-- =========================================================
-- Le calcul de ends_at (pro-rata + prix plancher) est géré côté app.
-- Insertion réelle : via Netlify Function Stripe (service_role).
create table if not exists public.memberships (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  starts_at          date not null,
  ends_at            date not null,
  amount_cents       int not null default 0,
  stripe_payment_id  text,
  created_at         timestamptz not null default now()
);
create index if not exists idx_memberships_user_ends on public.memberships(user_id, ends_at desc);

-- Helper : ce user a-t-il une cotisation valide aujourd'hui ?
create or replace function public.is_active_member(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = uid
      and starts_at <= current_date
      and ends_at   >= current_date
  );
$$;


-- =========================================================
-- 3. RANDONNEES (propositions et programmées, typées)
-- =========================================================
create table if not exists public.randonnees (
  id                uuid primary key default gen_random_uuid(),

  -- Auteurs
  proposed_by       uuid references public.profiles(id) on delete set null,
  scheduled_by      uuid references public.profiles(id) on delete set null,

  -- Cycle de vie
  status            text not null default 'suggestion'
                      check (status in ('suggestion', 'programmed', 'past', 'cancelled')),

  -- Type : NULL tant que suggestion, obligatoire dès programmed
  type              text check (type in ('corsaria', 'pirata')),

  -- Contenu
  title             text not null,
  description       text,
  cover_photo_url   text,
  photos            jsonb not null default '[]'::jsonb,

  -- Caractéristiques (4 niveaux, codes anglais)
  difficulty        text check (difficulty in ('easy', 'medium', 'hard', 'very_hard')),
  duration          text,                                     -- ex: "4–5 horas"

  -- Date : NULL tant que suggestion, obligatoire dès programmed
  scheduled_at      timestamptz,

  -- Logistique (renseignée à la programmation)
  meeting_point_url text,                                     -- google maps url
  meeting_time      time,
  transport         text check (transport in ('car', 'transit')),
  transit_station   text,
  transit_time      time,
  spots_total       int check (spots_total is null or spots_total > 0),

  -- Spécifique corsaria
  price_cents       int check (price_cents is null or price_cents >= 0),

  -- Spécifique pirata
  whatsapp_url      text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Cohérence : si programmed, alors type ET scheduled_at requis
  constraint programmed_needs_type_and_date
    check (status = 'suggestion' or (type is not null and scheduled_at is not null))
);

create index if not exists idx_randonnees_status       on public.randonnees(status);
create index if not exists idx_randonnees_scheduled_at on public.randonnees(scheduled_at);
create index if not exists idx_randonnees_type         on public.randonnees(type);


-- =========================================================
-- 4. ROUTES (itinéraires votables d'une randonnée)
-- =========================================================
-- Une randonnée peut proposer plusieurs itinéraires (wikiloc/komoot/...).
-- Les inscrits votent ensuite pour leur préféré (vote 2).
create table if not exists public.routes (
  id            uuid primary key default gen_random_uuid(),
  randonnee_id  uuid not null references public.randonnees(id) on delete cascade,
  name          text not null,
  distance_km   numeric(5,2),
  elevation_m   int,
  external_url  text,                                         -- wikiloc, komoot, etc.
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_routes_randonnee on public.routes(randonnee_id);


-- =========================================================
-- 5. VOTES (vote 1 : intérêt sur une proposition de rando)
-- =========================================================
-- Like unique par user / randonnée. Un user peut retirer son vote.
create table if not exists public.votes (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  randonnee_id uuid not null references public.randonnees(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, randonnee_id)
);
create index if not exists idx_votes_randonnee on public.votes(randonnee_id);

-- Vue pratique : randos + compteur de votes (pour le top-N)
create or replace view public.randonnees_with_votes as
select
  r.*,
  coalesce(v.vote_count, 0) as vote_count
from public.randonnees r
left join (
  select randonnee_id, count(*)::int as vote_count
  from public.votes
  group by randonnee_id
) v on v.randonnee_id = r.id;


-- =========================================================
-- 6. INSCRIPTIONS (sur randos programmées)
-- =========================================================
-- INSERT : volontairement non autorisé côté client.
-- Tout passe par la Netlify Function Stripe avec service_role
-- pour éviter la falsification du prix.
create table if not exists public.inscriptions (
  id                     uuid primary key default gen_random_uuid(),
  randonnee_id           uuid not null references public.randonnees(id) on delete cascade,
  user_id                uuid not null references public.profiles(id) on delete cascade,

  -- Vote 2 : choix d'itinéraire parmi les routes proposées
  voted_route_id         uuid references public.routes(id) on delete set null,

  -- Covoiturage
  car_offering           boolean not null default false,
  car_seats              int check (car_seats is null or car_seats > 0),
  joined_car_id          uuid references public.inscriptions(id) on delete set null,

  -- Paiement (corsaria seulement)
  payment_status         text not null default 'pending'
                           check (payment_status in ('pending', 'paid', 'free', 'refunded', 'failed')),
  stripe_session_id      text,
  stripe_payment_intent  text,
  amount_cents           int,

  -- Décharge (pirata seulement) — preuve d'acceptation horodatée
  disclaimer_accepted_at timestamptz,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Une seule inscription par user par rando
  unique (randonnee_id, user_id)
);
create index if not exists idx_inscriptions_randonnee on public.inscriptions(randonnee_id);
create index if not exists idx_inscriptions_user      on public.inscriptions(user_id);


-- =========================================================
-- 7. Trigger générique updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists randonnees_updated_at   on public.randonnees;
drop trigger if exists inscriptions_updated_at on public.inscriptions;

create trigger randonnees_updated_at
  before update on public.randonnees
  for each row execute function public.set_updated_at();

create trigger inscriptions_updated_at
  before update on public.inscriptions
  for each row execute function public.set_updated_at();


-- =========================================================
-- 8. Row Level Security
-- =========================================================
alter table public.profiles     enable row level security;
alter table public.memberships  enable row level security;
alter table public.randonnees   enable row level security;
alter table public.routes       enable row level security;
alter table public.votes        enable row level security;
alter table public.inscriptions enable row level security;


-- ───────── Helpers ───────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_federated_guide()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_federated_guide = true
  );
$$;


-- ───────── PROFILES ──────────────────────────────────────
drop policy if exists profiles_select_auth   on public.profiles;
drop policy if exists profiles_update_owner  on public.profiles;
drop policy if exists profiles_admin_all     on public.profiles;

create policy profiles_select_auth
  on public.profiles for select to authenticated using (true);

create policy profiles_update_owner
  on public.profiles for update to authenticated using (id = auth.uid());

create policy profiles_admin_all
  on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ───────── MEMBERSHIPS ───────────────────────────────────
drop policy if exists memberships_read_self on public.memberships;
drop policy if exists memberships_admin_all on public.memberships;

create policy memberships_read_self
  on public.memberships for select to authenticated
  using (user_id = auth.uid());

create policy memberships_admin_all
  on public.memberships for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- (Insert via Netlify Function Stripe avec service_role → bypass RLS)


-- ───────── RANDONNEES ────────────────────────────────────
drop policy if exists randonnees_anon_read         on public.randonnees;
drop policy if exists randonnees_auth_read_all     on public.randonnees;
drop policy if exists randonnees_member_propose    on public.randonnees;
drop policy if exists randonnees_author_edit       on public.randonnees;
drop policy if exists randonnees_admin_all         on public.randonnees;

-- Lecture anon : suggestions et programmées (pour bridge WordPress)
create policy randonnees_anon_read
  on public.randonnees for select to anon
  using (status in ('suggestion', 'programmed'));

create policy randonnees_auth_read_all
  on public.randonnees for select to authenticated using (true);

-- Proposer = cotisant uniquement, status='suggestion', type=NULL
create policy randonnees_member_propose
  on public.randonnees for insert to authenticated
  with check (
    proposed_by = auth.uid()
    and status = 'suggestion'
    and type is null
    and public.is_active_member(auth.uid())
  );

-- Editer = auteur (proposant ou scheduler) ou admin
-- Contrainte critique : passer en type='corsaria' exige guide fédéré (ou admin)
create policy randonnees_author_edit
  on public.randonnees for update to authenticated
  using (
    proposed_by = auth.uid()
    or scheduled_by = auth.uid()
    or public.is_admin()
  )
  with check (
    type is null
    or type = 'pirata'
    or (type = 'corsaria' and (public.is_federated_guide() or public.is_admin()))
  );

create policy randonnees_admin_all
  on public.randonnees for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ───────── ROUTES ────────────────────────────────────────
drop policy if exists routes_read_anon   on public.routes;
drop policy if exists routes_read_auth   on public.routes;
drop policy if exists routes_write_owner on public.routes;

-- Lecture publique (pour affichage WP)
create policy routes_read_anon
  on public.routes for select to anon using (true);

create policy routes_read_auth
  on public.routes for select to authenticated using (true);

-- Écriture : auteur de la randonnée associée, ou admin
create policy routes_write_owner
  on public.routes for all to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.randonnees r
      where r.id = routes.randonnee_id
        and (r.proposed_by = auth.uid() or r.scheduled_by = auth.uid())
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.randonnees r
      where r.id = routes.randonnee_id
        and (r.proposed_by = auth.uid() or r.scheduled_by = auth.uid())
    )
  );


-- ───────── VOTES ─────────────────────────────────────────
drop policy if exists votes_read_public on public.votes;
drop policy if exists votes_like        on public.votes;
drop policy if exists votes_unlike      on public.votes;

-- Compteur public (anon + auth)
create policy votes_read_public
  on public.votes for select to anon, authenticated using (true);

-- Voter = self + cotisant
create policy votes_like
  on public.votes for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member(auth.uid()));

-- Retirer son vote = self
create policy votes_unlike
  on public.votes for delete to authenticated
  using (user_id = auth.uid());


-- ───────── INSCRIPTIONS ──────────────────────────────────
-- Pas d'INSERT côté client : passe par Netlify Function (service_role)
drop policy if exists inscriptions_read_own    on public.inscriptions;
drop policy if exists inscriptions_update_own  on public.inscriptions;
drop policy if exists inscriptions_delete_own  on public.inscriptions;
drop policy if exists inscriptions_admin_all   on public.inscriptions;

create policy inscriptions_read_own
  on public.inscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Update self : modifier covoiturage, vote itinéraire, signer décharge
create policy inscriptions_update_own
  on public.inscriptions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Delete self : se désinscrire (la fonction Netlify gère le remboursement)
create policy inscriptions_delete_own
  on public.inscriptions for delete to authenticated
  using (user_id = auth.uid());

create policy inscriptions_admin_all
  on public.inscriptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- =========================================================
-- 9. Storage (à créer manuellement dans Supabase Studio → Storage)
-- =========================================================
-- Bucket "photos" : public, pour cover_photo_url et photos de randonnées
-- Pas de bucket gpx : les itinéraires sont des URLs externes (wikiloc/komoot)
--   stockées dans routes.external_url
--
-- Policies Storage (à configurer via l'UI Storage) :
--   - SELECT : public
--   - INSERT/UPDATE : authenticated, dans son propre dossier user_id/...
--   - DELETE : self ou admin
-- =========================================================
