# Wedding SaaS — Next.js

Multi-tenant wedding-invitation SaaS. One cinematic template, many couples — each with their own URL slug, password-protected admin dashboard, and per-couple RSVP / gift database.

```
weddingsite.com/                  ← marketing
weddingsite.com/<slug>            ← public invitation (read-only)
weddingsite.com/<slug>/dashboard  ← admin editor (password-gated)
```

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + the cinematic section components from the Vite template |
| Animation | motion + gsap (unchanged from the Vite project) |
| Backend | Supabase (Postgres + Storage) |
| Auth (admin) | bcryptjs + HTTP-only cookies, one password per invitation |
| Hosting | Vercel (subdomain in MVP, custom domains in Premium) |

## First-time setup

### 1. Install dependencies

```bash
cd wedding-saas-next
npm install
```

### 2. Create a Supabase project + run schema

1. Go to [supabase.com](https://supabase.com) → new project
2. Open **SQL Editor** → paste contents of `../Wedding Website Design new/supabase/schema.sql` → **Run**
3. Confirm in **Table Editor** that `invitations`, `rsvps`, `gift_confirmations`, etc. exist
4. Confirm in **Storage** that the `invitation-media` bucket exists

### 3. Fill in `.env.local`

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill the three Supabase keys (Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...            # SECRET, server-only
ADMIN_SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 4. Create your first invitation

```bash
node scripts/create-invitation.mjs rizky-amara demo1234 premium
```

This inserts a row into `invitations` with a bcrypt-hashed password, marks it `is_published=true`, and gives you:

- Public URL → `/rizky-amara`
- Dashboard → `/rizky-amara/dashboard` (login with password `demo1234`)

### 5. Run dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — marketing / showcase
- `/rizky-amara` — public invitation (loads from Supabase; falls back to the bundled demo config if the row's `config` JSONB is empty)
- `/rizky-amara/dashboard` — login → see overview + stub editor

## Project structure

```
wedding-saas-next/
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local.example       ← copy to .env.local, fill keys
├── scripts/
│   └── create-invitation.mjs  ← bootstrap a couple's record
└── src/
    ├── app/
    │   ├── layout.tsx                ← fonts + global styles
    │   ├── page.tsx                  ← marketing site
    │   ├── [slug]/
    │   │   ├── page.tsx              ← public invitation (server, fetches from Supabase)
    │   │   ├── InvitationView.tsx    ← client wrapper for the template
    │   │   ├── not-found.tsx         ← unpublished or missing slug
    │   │   └── dashboard/
    │   │       ├── page.tsx          ← auth gate + dashboard server component
    │   │       ├── LoginForm.tsx     ← password form
    │   │       └── DashboardClient.tsx ← tab UI (overview / rsvps / gifts / editor stub)
    │   └── api/
    │       ├── rsvp/route.ts         ← POST: insert into rsvps table
    │       └── gift/route.ts         ← POST: insert into gift_confirmations
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts             ← browser client
    │   │   ├── server.ts             ← server client (cookies, RLS-aware)
    │   │   └── admin.ts              ← service-role client (bypasses RLS, server-only)
    │   └── password.ts               ← bcrypt hash/verify
    ├── sections/                     ← ALL cinematic sections (copied from Vite project)
    ├── components/                   ← Theme, GlobalBackground, BotanicalBorder, FloatingNavbar
    ├── config/                       ← pageConfig, sectionRegistry, themes
    ├── hooks/                        ← useScrollReveal, etc.
    ├── renderers/                    ← SectionRenderer, BlockRenderer
    └── styles/                       ← global.css + tokens
```

## How data flows

```
┌───────────────────────┐
│  Visitor → /<slug>    │
└──────────┬────────────┘
           │ Server component reads cookies/slug
           ▼
┌───────────────────────┐         ┌──────────────────────┐
│ src/app/[slug]/page.tsx│◄────────│ Supabase invitations │
│  ─ fetch invitation    │  RLS    │   row by slug        │
│  ─ pass config to view │         └──────────────────────┘
└──────────┬────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  InvitationView (client)          │
│   ThemeProvider + SectionRenderer │
│   renders all sections from config│
└──────────┬────────────────────────┘
           │
           ▼ Guest submits RSVP / Gift
┌──────────────────────────────────┐
│  POST /api/rsvp or /api/gift     │
│   resolves slug → invitation_id  │
│   inserts row (service-role)     │
└──────────┬───────────────────────┘
           │
           ▼
       Supabase tables
       (rsvps, gift_confirmations)
```

## Editor (coming next)

The current dashboard is a stub showing the invitation record + a JSON preview of the config. The full editor planned for the next sprint:

- Block-based section reorder (drag-drop)
- Inline text edit
- Image / GIF upload to `invitation-media` storage bucket
- Live preview pane
- Publish toggle

For now, edit the `config` JSONB directly in Supabase Table Editor — the public page picks it up immediately.

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the repo in Vercel → add the same `.env.local` vars as Vercel env vars
3. Vercel builds + serves automatically. Default URL: `your-project.vercel.app`
4. To use a wildcard subdomain (e.g. `<slug>.weddingsite.com`), upgrade the DNS later — code is already slug-routed.

## What stays from the Vite project

All the cinematic section components are **byte-identical copies** with `'use client'` prepended. Animation knobs (`SECTION_HEIGHT_VH`, ease curves, stagger windows) work the same. The Vite project still lives at `../Wedding Website Design new/` as a backup.

The two are independent — edits in one do not affect the other.
