
# Prosa — Full Feature Rollout

You asked for the entire checklist. That's 30+ features — realistically a multi-day build across many turns. I'll do it in phases so each step ships something usable instead of a half-broken everything. After each phase you can review and tell me to keep going, reorder, or skip.

Some items don't fit Prosa naturally (e.g. "appointment booking", "drag-and-drop interfaces", "voice input as code"). I'll adapt them to the product (e.g. voice input = dictate a Prosa program; bookings = N/A, replaced with something useful) and flag anything I drop.

## Phase 1 — Foundations (this turn)
- Enable Lovable Cloud (auth + DB + storage)
- Add a sitewide layout: header, footer, theme toggle
- **Dark / light theme switching** with persisted preference
- **Mobile optimization** — responsive nav, fluid editor, tap targets ≥44px
- **Accessibility** — landmarks, focus-visible, ARIA on icon buttons, keyboard shortcuts (⌘/Ctrl+Enter = Run)
- **Search** across the grammar cheatsheet (filter sentences live)
- Lazy-load non-critical routes; meta tags on every page

## Phase 2 — Accounts & Profiles
- `/login`, `/signup`, `/reset-password` (email/password + Google)
- `profiles` table + RLS + auto-create trigger
- `/profile` page (username, avatar via Storage, bio)
- Protected `_authenticated` layout
- Auth state in router context, `onAuthStateChange` at root

## Phase 3 — Snippets (saved programs, favorites, history)
- `snippets` table (owner, title, language, source, visibility public/private)
- `favorites` table (user ↔ snippet)
- `run_history` table (last N runs per user, auto-pruned)
- New routes: `/snippets` (mine), `/snippets/$id` (view/run), `/explore` (public)
- "Save", "Fork", "Star" actions from the editor

## Phase 4 — Engagement
- **Comments** on public snippets (threaded, 1 level deep)
- **Ratings** (1–5 stars, one per user per snippet)
- **Share buttons** (Twitter/X, Reddit, copy link, OG image per snippet)
- **Notifications** — bell icon, in-app feed for comments/stars on your snippets (no email push in this phase)
- **Newsletter signup** — single-field form → `newsletter_subscribers` table

## Phase 5 — Trust pages (static)
- `/faq`, `/privacy`, `/terms`, `/about` with proper SEO heads
- `/testimonials` page (seeded; admin can add later)
- "Case studies" → reframed as `/showcase` (curated public snippets)

## Phase 6 — Business / Modern
- **Analytics dashboard** at `/admin/analytics` (role-gated via `user_roles`) — daily runs, top languages, signups, popular snippets. Charts via Recharts.
- **Contact form** → server fn stores in `contact_messages` + emails admin
- **Payments / subscriptions** — Lovable-managed Stripe; **Free** (current), **Pro** ($5/mo: private snippets, longer history, no ads), **Team** ($15/mo: shared workspace)
  - I'll run `recommend_payment_provider` first; if Paddle is recommended I'll switch to it
- **Real-time updates** — Supabase Realtime on comments + notifications
- **2FA** (TOTP) + **rate limiting** (per-IP run limit, per-user write limit) via server-fn middleware
- **Voice input** — Web Speech API dictation → fills the editor (browser-side, no backend)
- **Drag-and-drop** — reorder snippets in your library; drag `.txt`/`.prosa` files into the editor to load

## Items I'm intentionally dropping (don't fit Prosa)
- **Appointment booking** — no use case here. Say the word if you actually want it and I'll add a generic booking flow.
- **Interactive dashboards & charts as a product feature** — kept only for the admin analytics page (Phase 6).

## What ships this turn (Phase 1 only)
1. Enable Lovable Cloud
2. Theme toggle + dark/light tokens audit
3. Responsive header/footer with mobile menu
4. Search box above the cheatsheet that filters rows
5. A11y pass on the editor, run/reset buttons, language switcher
6. SEO meta on the index route

After Phase 1 lands and you've kicked the tires, reply "next" to proceed to Phase 2, or tell me to reorder.
