# Spec 1 — seed-full-config script

**Date:** 2026-05-24
**Status:** Approved

---

## Problem

After `create-invitation.mjs` bootstraps a new couple, their config only contains 6 starter
sections (hero, countdown, eventDetails, rsvp, weddingGift, footer). The full cinematic template
has 14+ sections. New couples see a very bare invitation until they manually fill the JSONB —
which is confusing for non-technical users.

---

## Goal

A second CLI script that seeds the complete `pageConfig.js` template into the `config` column
of an existing invitation row, with all placeholder names/dates/venue replaced with the couple's
real data and all sections set to `enabled: true`.

---

## Usage

```powershell
node scripts/seed-full-config.mjs made-nanda `
  --bride="Nanda Putri Sari" `
  --groom="Made Wirawan" `
  --date=2026-11-15T16:00 `
  --venue="The Grand Ballroom, Jakarta"
```

**Prerequisites:** Slug must already exist (created via `create-invitation.mjs`).
Script only updates `config` — does not create or delete rows.

---

## Arguments

| Argument | Required | Notes |
|---|---|---|
| positional `slug` | Yes | Must match existing row |
| `--bride` | Yes | Full name of bride |
| `--groom` | Yes | Full name of groom |
| `--date` | Yes | ISO datetime, e.g. `2026-11-15T16:00` |
| `--venue` | No | Used for ceremony + reception location |

---

## Implementation

### Source of truth

Load `src/config/pageConfig.js` via dynamic `import()` and deep-clone with
`JSON.parse(JSON.stringify(config))`. This keeps the script in sync with the live
template automatically — no duplication.

### Replacements (targeted, field-by-field — not regex on raw JSON)

The script iterates `config.sections` and does explicit field updates per section type:

| Section type | Fields updated |
|---|---|
| `hero` | `coupleName`, `brideName`, `groomName`, `weddingDate` |
| `countdown` | `weddingDate` |
| `ourStory` | last card's `date` only → set to `weddingDate` formatted |
| `eventDetails` | `date` in both ceremony + reception events, `location` → `venue` |
| `brideGroom` | `name` of bride person, `name` of groom person, `parents` placeholder |
| `schedule` | no replacement (times are generic) |
| `rsvp` | no replacement (generic labels) |
| `weddingGift` | `accountHolder` on first account → `brideName` |
| `footer` | `coupleName`, `monogram`, `hashtag` |

All other sections (gallery, accommodations, faq, etc.) — content is generic enough to keep as-is.

### Enabling all sections

After replacements, loop all `config.sections` and set `enabled: true` on each.

### Derivations

```js
const firstName = (name) => name.trim().split(/\s+/)[0]
const coupleName = `${firstName(brideName)} & ${firstName(groomName)}`  // bride first (matches create-invitation.mjs convention)
const monogram   = `${firstName(brideName)[0]} & ${firstName(groomName)[0]}`
const hashtag    = `#${firstName(brideName)}And${firstName(groomName)}`
const formattedDate = new Date(weddingDate).toLocaleDateString('en-US', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})
```

### Upsert

```js
await supabase
  .from('invitations')
  .update({ config })
  .eq('slug', slug)
```

Uses `.update()` not `.upsert()` — intentionally errors if slug doesn't exist yet.

---

## Output

```
✓ Full config seeded for made-nanda

  bride:     Nanda Putri Sari
  groom:     Made Wirawan
  couple:    Made & Nanda
  date:      Sunday, 15 November 2026
  venue:     The Grand Ballroom, Jakarta
  sections:  14 (all enabled)

  public URL:  /made-nanda
  dashboard:   /made-nanda/dashboard
```

---

## Error cases

| Condition | Behaviour |
|---|---|
| Slug not found | Supabase `.update()` returns 0 rows → script prints clear error and exits 1 |
| Missing required arg | Same validation pattern as `create-invitation.mjs` — prints usage and exits 1 |
| Missing `.env.local` vars | Prints hint and exits 1 |

---

## Spec 2 & 3 (future)

- **Spec 2 — Responsive invitation sections**: audit all 19 section CSS files, add
  mobile/tablet breakpoints to the 4 sections with zero media queries + fix incomplete
  breakpoints in others.
- **Spec 3 — Responsive dashboard**: convert `DashboardClient.tsx` inline styles to CSS
  Module with breakpoints; same for `LoginForm.tsx`, `RsvpsTab.tsx`, `GiftsTab.tsx`.
