# Rutas Piratas — Architecture

## Vue d'ensemble

Trois briques découplées, chacune fait une seule chose :

```
  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │   WordPress    │      │  React (Vite)  │      │    Supabase    │
  │  (vitrine SEO) │◀────▶│   app métier   │◀────▶│  Auth + DB + S │
  │                │      │   Netlify      │      │                │
  └────────────────┘      └────────────────┘      └────────────────┘
           │                       │                       ▲
           │                       ▼                       │
           │              ┌────────────────┐               │
           └─────────────▶│ Netlify Funcs  │───────────────┘
             (CORS JSON)  │ (Stripe, etc.) │  (service_role)
                          └────────────────┘
```

- **WordPress** : pages statiques, blog, SEO. N'héberge aucune donnée métier.
- **React/Netlify** : toute la logique utilisateur (librairie, votes, inscription, espace membre, admin).
- **Supabase** : source de vérité unique (auth, DB, storage GPX/photos).
- **Netlify Functions** : tout ce qui touche à une clé secrète (Stripe, service_role Supabase).

## Arborescence cible du repo

```
rutas-piratas/
├── docs/
│   └── ARCHITECTURE.md                 # ce fichier
│
├── supabase/
│   ├── schema.sql                      # à jouer dans Supabase SQL Editor
│   └── seed.sql                        # (optionnel) données de dev
│
├── netlify/
│   └── functions/
│       ├── stripe-create-checkout.mjs  # crée une session Stripe Checkout
│       ├── stripe-webhook.mjs          # webhook → passe inscription en "paid"
│       ├── public-randos.mjs           # endpoint CORS JSON pour WordPress
│       └── _lib/
│           ├── supabaseAdmin.mjs       # client service_role (jamais côté front)
│           └── stripe.mjs              # init Stripe SDK
│
├── wordpress-bridge/
│   └── rutas-bridge.js                 # Web Component à poser dans le thème WP
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts                 # client Supabase (anon key, côté front)
│   │   └── api.ts                      # wrappers fetch vers /api/*
│   │
│   ├── features/                       # découpage par domaine métier
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx        # context + session Supabase
│   │   │   ├── LoginPage.tsx           # magic link
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── library/                    # la "librairie collaborative"
│   │   │   ├── LibraryPage.tsx         # liste des suggestions + filtres
│   │   │   ├── RandoCard.tsx
│   │   │   ├── ProposeRandoForm.tsx    # formulaire + upload GPX/photos
│   │   │   └── useRandos.ts
│   │   │
│   │   ├── votes/
│   │   │   ├── VoteButton.tsx          # like/unlike optimiste
│   │   │   └── useVote.ts
│   │   │
│   │   ├── scheduling/                 # côté admin uniquement
│   │   │   ├── AdminSchedulePage.tsx   # dashboard des suggestions populaires
│   │   │   └── ProgramForm.tsx         # date, prix, places → status=programmed
│   │   │
│   │   └── registrations/
│   │       ├── ProgrammedList.tsx      # sorties à venir
│   │       ├── CheckoutButton.tsx      # appel /api/stripe-create-checkout
│   │       └── MyRegistrations.tsx     # espace membre
│   │
│   ├── components/
│   │   ├── ui/                         # primitifs (Button, Input, Modal, Toast)
│   │   └── layout/                     # Header, Footer, Shell
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── NotFound.tsx
│   │
│   └── styles/
│       └── tailwind.css
│
├── .env.example                        # template des variables
├── .env.local                          # (gitignored)
├── index.html
├── netlify.toml                        # déjà configuré
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## Principes de découpage

**Par feature, pas par type de fichier.** `features/library/` contient à la fois
la page, les composants, les hooks et les types de ce domaine. Ça évite le piège
classique `components/` + `hooks/` + `pages/` qui devient illisible à 50 fichiers.

**`lib/`** = code transversal sans logique métier (client Supabase, wrappers fetch).

**`components/ui/`** = primitifs réutilisables, zéro connaissance du domaine.

**Netlify Functions = frontière de sécurité.** Dès qu'une opération touche à
Stripe ou au `service_role` Supabase, elle vit dans `/netlify/functions/`,
jamais dans `src/`.

## Flux clés

### Propose → Vote → Programme → Paye

1. Membre connecté POST `randonnees` avec `status='suggestion'` (via client Supabase, RLS autorise).
2. Autres membres INSERT dans `votes` (PK composite = unicité garantie).
3. Admin UPDATE une rando : `status='programmed'`, `scheduled_at`, `price_cents`, `spots_total`.
4. Membre clique "Je m'inscris" → appelle `/api/stripe-create-checkout` avec `rando_id`.
5. Netlify Function crée l'inscription (`pending`) + la session Stripe, renvoie l'URL.
6. Stripe redirige vers succès → webhook `/api/stripe-webhook` passe l'inscription en `paid`.

### Bridge WordPress

Le Web Component `<rutas-top-randos count="3">` fetch `/api/public-randos?kind=top`
(endpoint Netlify avec CORS `*`, cache 5min). Même principe pour `kind=upcoming`.
Avantage : zéro couplage entre WP et la DB — si tu changes de CMS, le bridge suit.

## Variables d'environnement

Voir `.env.example`. Règle simple :
- préfixe `VITE_` → exposé au navigateur (OK pour la clé **anon** Supabase)
- pas de préfixe → uniquement côté Netlify Function (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

## Prochaines étapes

1. Créer le projet Supabase, jouer `supabase/schema.sql`, créer les buckets `gpx` (privé) et `photos` (public).
2. Installer les deps côté front : `supabase-js`, `react-router-dom`, Tailwind, `stripe`.
3. Scaffolder `src/lib/supabase.ts` + `AuthProvider` → tester le magic link.
4. Construire la Library avant le paiement — c'est la feature qui prouve la valeur.
5. Payment Stripe en dernier : tu n'en as pas besoin pour valider la boucle propose/vote.
