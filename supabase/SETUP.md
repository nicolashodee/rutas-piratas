# Setup Supabase — Rutas Piratas

Checklist à suivre dans l'ordre, dans le dashboard Supabase de ton projet.

## 1. Reset (si v1 déjà exécutée)

Si tu as déjà exécuté la première version du schéma :

- Dashboard → **Settings** → **Database** → **Reset database**
- (Ou alternativement : SQL Editor → `drop table profiles, randonnees, votes, inscriptions cascade;`)

## 2. Exécuter le schéma

- SQL Editor → **New query** → coller le contenu de [`schema.sql`](./schema.sql) → **Run**
- Vérifier qu'il n'y a pas d'erreur. Tu devrais voir 6 tables dans Table Editor : `profiles`, `memberships`, `randonnees`, `routes`, `votes`, `inscriptions`.

## 3. Activer Email Auth (magic link)

- Dashboard → **Authentication** → **Providers** → **Email**
  - Enable Email provider : ON
  - Confirm email : OFF (pour magic link sans validation, plus simple en MVP)
  - Secure email change : ON
- Dashboard → **Authentication** → **URL Configuration**
  - Site URL : `http://localhost:5173` (en dev) — passer à `https://rutas-piratas.netlify.app` quand on déploie
  - Redirect URLs (ajouter les deux) :
    - `http://localhost:5173/**`
    - `https://rutas-piratas.netlify.app/**`

## 4. Récupérer les clés

- Dashboard → **Project Settings** → **API**
- Copier dans `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

SUPABASE_URL=https://xxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

⚠ La `SERVICE_ROLE_KEY` ne doit **jamais** être préfixée `VITE_` (elle bypass le RLS, à protéger).

## 5. Créer le bucket Storage

- Dashboard → **Storage** → **New bucket**
  - Name : `photos`
  - Public bucket : **ON**
- Storage → photos → **Policies** → **New policy** (4 policies à créer) :
  - SELECT : `bucket_id = 'photos'` (public)
  - INSERT : `bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]` (auth seulement, dans son dossier)
  - UPDATE : idem INSERT
  - DELETE : idem INSERT

## 6. Créer ton premier compte admin

Une fois l'app capable de faire un signup (jalon 2 du refactor) :

1. Sign up via l'app avec ton email
2. SQL Editor :
   ```sql
   update profiles set role = 'admin', is_federated_guide = true 
   where id = (select id from auth.users where email = 'contact@nicolashodee.com');
   ```

## 7. (Plus tard) Configurer Stripe

À faire quand on attaquera le jalon paiements :

- Récupérer `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (mode test d'abord)
- Les ajouter dans Netlify → Site settings → Environment variables
- (Pas dans `.env` local pour ne jamais risquer de les commit)
