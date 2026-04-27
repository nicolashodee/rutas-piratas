# Rutas Piratas — Roadmap

Découpage en 7 sprints. Chaque sprint se termine par un **livrable testable**
— si tu ne peux pas le démontrer en 30 secondes, le sprint n'est pas fini.

Estimation en "jours de dev concentré". En mode soir/weekend, multiplie par ~2.5.

---

## Sprint 0 — Fondations (1–2 j)

**But :** que le front parle à Supabase, rien de plus.

- [ ] Créer le projet Supabase (région EU)
- [ ] Jouer `supabase/schema.sql` dans le SQL Editor
- [ ] Créer les buckets Storage : `gpx` (privé) et `photos` (public)
- [ ] Installer les deps : `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`
- [ ] Init Tailwind + config
- [ ] Remplir `.env.local` à partir de `.env.example`
- [ ] Créer `src/lib/supabase.ts`

**✅ Livrable :** `supabase.from('randonnees').select()` renvoie `[]` dans la console du navigateur.

---

## Sprint 1 — Auth magic link + shell (2–4 j)

**But :** un membre peut se connecter, on sait qui il est.

- [ ] `AuthProvider` (context React qui expose la session Supabase)
- [ ] `useAuth()` hook
- [ ] `LoginPage` — formulaire email → `signInWithOtp`
- [ ] Page "callback" pour gérer le retour du magic link
- [ ] `Layout` avec Header (login/logout) + Footer
- [ ] Route protégée `<RequireAuth>` qui redirige vers `/login`

**✅ Livrable :** je tape mon email, je reçois un lien, je clique, je vois "Connecté en tant que X" dans le header.

> ⚠️ À ce stade, configure **dès maintenant** un SMTP custom dans Supabase (Resend gratuit jusqu'à 3k mails/mois). Les magic links via le SMTP par défaut atterrissent souvent en spam.

---

## Sprint 2 — Library en lecture (4–7 j)

**But :** afficher les randos existantes.

- [ ] `seed.sql` avec 5–10 randos de test (status variés)
- [ ] Page `/library` — liste des suggestions
- [ ] `RandoCard` (cover, titre, distance, dénivelé, difficulté, compteur votes)
- [ ] Filtres : "à proposer" / "programmées" / "toutes"
- [ ] Page détail `/library/:id`
- [ ] `useRandos()` hook qui branche `randonnees_with_votes`

**✅ Livrable :** tu navigues dans la librairie, les randos du seed s'affichent, le top par votes est visible.

---

## Sprint 3 — Library en écriture + Votes (5–7 j)

**But :** un membre peut proposer une rando et voter.

- [ ] `ProposeRandoForm` (titre, description, difficulté, distance, dénivelé)
- [ ] Upload cover + photos dans bucket `photos` (URL publique)
- [ ] Upload GPX dans bucket `gpx` (stocke le path, signed URL à la lecture)
- [ ] `VoteButton` avec mise à jour optimiste (like/unlike instantané côté UI, rollback si erreur)
- [ ] Affichage "Ma proposition" sur `RandoCard` si `author_id === user.id`

**✅ Livrable :** tu proposes une rando avec photo + GPX, un autre compte peut la voter, le compteur s'incrémente.

---

## Sprint 4 — Admin scheduling (3–5 j)

**But :** transformer une suggestion populaire en sortie datée.

- [ ] Passer ton compte en `role='admin'` manuellement dans Supabase
- [ ] Route `/admin` protégée par `is_admin()`
- [ ] Dashboard admin : liste triée par `vote_count` desc
- [ ] `ProgramForm` — date, prix (€), nombre de places → `status='programmed'`
- [ ] Page `/sorties` (randos avec `status='programmed'`) visible de tous

**✅ Livrable :** tu prends la rando la plus votée, tu la programmes, elle apparaît dans "Prochaines sorties".

---

## Sprint 5 — Paiement Stripe (7–10 j)

**But :** un membre paie sa place, la DB sait qu'il a payé.

- [ ] Compte Stripe en mode test + webhook endpoint
- [ ] `netlify/functions/stripe-create-checkout.mjs` : crée l'inscription en `pending` + session Stripe
- [ ] `netlify/functions/stripe-webhook.mjs` : vérifie la signature, passe en `paid`
- [ ] `CheckoutButton` côté React
- [ ] Pages `/inscription/success` et `/inscription/cancel`
- [ ] Vue SQL `sorties_disponibles` qui calcule `spots_left = spots_total - count(paid)`
- [ ] Empêcher la double inscription (déjà fait au niveau DB via UNIQUE)
- [ ] Email de confirmation (Resend ou Supabase)

**✅ Livrable :** en mode test Stripe, le paiement bout en bout fonctionne, l'inscription bascule `pending → paid`, les places restantes diminuent.

> ⚠️ Point de vigilance : le webhook doit être idempotent. Stripe peut le retry. Vérifie `stripe_session_id` avant de créer/modifier.

---

## Sprint 6 — Bridge WordPress (2–4 j)

**But :** le site vitrine affiche les randos en dynamique.

- [ ] `netlify/functions/public-randos.mjs` — endpoint JSON avec CORS `*` et cache 5min, modes `kind=top` et `kind=upcoming`
- [ ] `wordpress-bridge/rutas-bridge.js` — Web Component `<rutas-top-randos count="3">` et `<rutas-upcoming-randos>`
- [ ] Uploader le JS sur le thème WP (ou via un plugin "Header Footer Code Manager")
- [ ] Poser le Web Component sur la home WP et sur une page "Nos randos"
- [ ] Style minimal dans le shadow DOM pour cohabiter avec le thème WP

**✅ Livrable :** la home WordPress affiche les 3 randos les plus votées + les prochaines sorties, data live depuis Supabase.

---

## Sprint 7 — Polish + mise en prod (5–7 j)

**But :** c'est utilisable par tes vrais membres.

- [ ] Pass responsive sur toute l'app
- [ ] Email templates propres (Resend)
- [ ] Domaine `app.rutas-piratas.fr` sur Netlify
- [ ] Stripe en mode **live**
- [ ] Page `/mon-compte` (mes inscriptions, mes propositions)
- [ ] Doc utilisateur courte (1 page) : "Comment proposer une rando / Comment voter / Comment s'inscrire"
- [ ] Backup Supabase programmé
- [ ] Analytics basique (Plausible ou similaire)

**✅ Livrable :** tu invites 3 membres beta, ils proposent/votent/s'inscrivent sans ton aide.

---

## Timeline condensée

| Sprint | Durée dev | Cumul |
|--------|-----------|-------|
| 0 — Fondations | 1–2 j | 2 j |
| 1 — Auth | 2–4 j | 6 j |
| 2 — Library lecture | 4–7 j | 13 j |
| 3 — Library écriture + votes | 5–7 j | 20 j |
| 4 — Admin scheduling | 3–5 j | 25 j |
| 5 — Stripe | 7–10 j | 35 j |
| 6 — WP Bridge | 2–4 j | 39 j |
| 7 — Polish / prod | 5–7 j | 46 j |

**~6–7 semaines** de dev concentré à plein temps.
**~3 mois** en mode soir/weekend (10–15h/semaine).

## Règles du jeu

1. **On ne passe au sprint suivant que quand le livrable précédent marche.** Pas de "on finira plus tard" qui devient de la dette.
2. **Sprint 5 (Stripe) est le plus risqué.** Si tu veux dérisquer, fais un spike webhook en Sprint 0 sur un compte Stripe test — 2h de boulot, te rassure pour la suite.
3. **Sprint 6 (WP Bridge) peut être fait en parallèle** de Sprint 4 ou 5 sans bloquer.
4. **Sprint 7 n'est pas optionnel.** La dernière mile fait la différence entre "ça marche chez moi" et "ça marche pour les membres".
