# Wedding SaaS — Next.js

Multi-tenant wedding-invitation SaaS. Satu template cinematic, banyak pasangan — masing-masing punya URL slug, dashboard password-protected, dan database RSVP / Gift sendiri.

```
weddingsite.com/                  ← marketing
weddingsite.com/<slug>            ← public invitation (read-only)
weddingsite.com/<slug>/dashboard  ← admin editor (password-gated)
```

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + cinematic sections |
| Animation | motion 12 + GSAP 3.15 |
| Backend | Supabase (Postgres + Storage) |
| Auth (admin) | bcryptjs + HTTP-only cookies, 1 password per invitation |
| Email | Resend (untuk forgot-password) |
| Hosting | Vercel |

---

## First-time setup

### 1. Install dependencies

```bash
cd wedding-saas-next
npm install
```

### 2. Supabase setup

1. Buat project baru di [supabase.com](https://supabase.com)
2. **SQL Editor → New query** → paste schema utama (dari `../Wedding Website Design new/supabase/schema.sql`) → Run
3. **SQL Editor → New query** → paste isi `supabase/migrations/20260521_password_reset.sql` → Run (untuk fitur forgot-password)
4. Verify di **Table Editor** bahwa tabel berikut ada:
   - `invitations` (dengan kolom `email`)
   - `rsvps`
   - `gift_confirmations`
   - `password_reset_tokens`
5. **Storage** → bucket `invitation-media` harus ada (untuk upload foto pasangan)

### 3. Resend setup (untuk forgot-password)

1. Sign up gratis di [resend.com](https://resend.com)
2. **API Keys** → Create API Key → copy
3. (Optional, untuk production) **Domains** → verify domain Anda kalau mau sender custom

### 4. Fill `.env.local`

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

RESEND_API_KEY=re_xxxxxxxxxxxxxx
RESEND_FROM=onboarding@resend.dev
```

### 5. Run dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 📖 SOP — Operasional SaaS (untuk Anda sebagai admin)

Ini bagian utama. Daily workflow Anda sebagai pemilik SaaS.

### A. Onboarding pasangan baru

Setiap kali ada customer beli template:

```powershell
node scripts/create-invitation.mjs <slug> <password> --bride="Nama Wanita" --groom="Nama Pria" --date=2026-11-15T16:00 --venue="Nama Gedung & Alamat" --email=customer@gmail.com --plan=premium
```

**Contoh konkret:**
```powershell
node scripts/create-invitation.mjs budi-sari pass123aman --bride="Sari Wulandari" --groom="Budi Hartono" --date=2026-08-20T16:00 --venue="Hotel Grand Hyatt, Jakarta" --email=budi.hartono@gmail.com --plan=premium
```

Yang script lakukan otomatis:
- Hash password dengan bcrypt
- Bikin starter `config` dengan **6 section pre-filled**: Hero, Countdown, Event Details, RSVP, Wedding Gift, Footer — semua sudah pakai nama + tanggal + venue yang Anda kasih
- Insert ke tabel `invitations`
- Print URL + password ke screen

**Tips slug**: pakai format `nama-pria-nama-wanita` lowercase, tanpa spasi. Contoh: `budi-sari`, `rizky-amara`, `agus-maya`.

**Tips password**: 8+ karakter, random. Generate cepat:
```powershell
node -e "console.log(require('crypto').randomBytes(8).toString('base64'))"
```

### B. Kasih akses ke pasangan

Setelah script jalan, kirim ke customer (via WhatsApp/email aman):

```
Halo Mas Budi & Mbak Sari,

Undangan online Anda sudah jadi! 

🌐 URL undangan (share ke tamu):
https://wedding.kamu.id/budi-sari

⚙️ Dashboard admin (untuk edit & lihat RSVP):
https://wedding.kamu.id/budi-sari/dashboard
Password: pass123aman

📧 Lupa password? Buka:
https://wedding.kamu.id/forgot-password
Masukkan email budi.hartono@gmail.com — link reset 
akan dikirim ke email itu.

Cara pakai dashboard:
- Tab Editor: drag-drop section, edit teks, upload foto
- Tab RSVPs: lihat siapa hadir + download CSV
- Tab Gifts: lihat konfirmasi hadiah
- Toggle Published ↔ Draft kalau mau halaman live/sembunyi
```

### C. Yang BISA dilakukan pasangan sendiri (mereka tidak perlu Anda)

- Edit semua teks (nama, tanggal, venue, intro, dst)
- Upload foto pasangan + galeri (langsung ke Supabase Storage)
- Reorder section (drag-drop)
- Add/remove section dari template (17 jenis tersedia)
- Lihat RSVP + download CSV
- Lihat Gift confirmations
- Toggle publish/draft
- Reset password lewat /forgot-password (kalau email-nya benar)

### D. Customer support recipes

#### 🆘 "Saya lupa password" + email mereka juga ke-lock

Pertama, suruh coba `/forgot-password` dengan email yang terdaftar. Kalau email mereka juga ke-lock atau lupa, Anda reset manual:

**Generate password baru** (pakai script bawah ini, atau langsung set via Supabase):
```powershell
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('passwordbarudisini', 10))"
```

Output adalah bcrypt hash. Copy. Lalu:
- Supabase Dashboard → Table Editor → `invitations`
- Cari row dengan slug mereka
- Edit kolom `password_hash` → paste hash baru → Save
- Kasih tau customer password barunya (yang plaintext, sebelum di-hash)

#### 🆘 "Save tidak berhasil di dashboard"

Cek di DevTools → Network tab → klik request `PUT /api/invitation/.../config`:
- **403 Forbidden**: cookie expired/bermasalah → suruh login ulang
- **500 Server Error**: cek terminal `npm run dev` (atau Vercel logs di production) untuk pesan error
- **Network failed**: koneksi customer bermasalah, bukan masalah server

#### 🆘 "Upload foto gagal"

Cek:
- File < 5 MB?
- File format JPG/PNG/GIF/WEBP?
- Bucket `invitation-media` di Supabase masih ada + public?
- Supabase Storage quota tidak penuh (free tier: 1 GB)?

#### 🆘 "Saya mau ganti email recovery"

Supabase → Table Editor → `invitations` → row mereka → edit kolom `email` → Save.

#### 🆘 "Saya mau cabut invitation ini" (refund / cancel)

Option ringan — disable saja:
```sql
UPDATE invitations SET is_published = false WHERE slug = 'budi-sari';
```
Halaman public jadi not-found, data masih ada (kalau-kalau berubah pikiran).

Option permanent — hapus total:
```sql
DELETE FROM invitations WHERE slug = 'budi-sari';
```
Cascade delete otomatis hapus RSVP + Gift + reset tokens mereka. **Foto di Storage TIDAK auto-deleted** — perlu hapus manual via Supabase Storage browser kalau mau bersih.

#### 🆘 "Saya mau custom domain (kawinin.id/budi-sari)"

Kolom `custom_domain` ada di DB tapi belum di-wire ke routing. Untuk sekarang, semua pakai subdomain default Vercel atau path-based di domain utama. Custom domain per-couple = pekerjaan untuk Sprint berikutnya.

### E. Monitoring & data tasks

#### Lihat semua invitation aktif

Supabase → SQL Editor:
```sql
SELECT slug, plan, is_published, email, created_at
FROM invitations
ORDER BY created_at DESC;
```

#### Lihat RSVP / Gift totals per pasangan (cross-tenant)

```sql
SELECT i.slug,
       COUNT(DISTINCT r.id) AS rsvp_count,
       COUNT(DISTINCT g.id) AS gift_count,
       SUM(CASE WHEN r.attending THEN r.guest_count ELSE 0 END) AS total_guests
FROM invitations i
LEFT JOIN rsvps r ON r.invitation_id = i.id
LEFT JOIN gift_confirmations g ON g.invitation_id = i.id
GROUP BY i.slug
ORDER BY rsvp_count DESC;
```

#### Cleanup token reset password lama (jalankan kalau ingat, atau set Supabase cron)

```sql
DELETE FROM password_reset_tokens WHERE expires_at < now() - interval '7 days';
```

#### Backup data

Supabase otomatis backup harian (free tier 7 hari retention, paid lebih panjang). Manual backup:
- **Database**: Supabase Dashboard → Database → Backups → Download
- **Storage (foto)**: belum ada cara mudah untuk bulk download dari Supabase. Untuk MVP, OK.

### F. Quota & cost monitoring

| Service | Free tier limit | Action kalau nyentuh |
|---|---|---|
| Supabase database | 500 MB | Upgrade ke Pro ($25/bulan) atau archive invitation lama |
| Supabase storage | 1 GB | Hapus foto invitation yang sudah lewat tanggalnya |
| Supabase bandwidth | 5 GB/bulan | Upgrade Pro, atau optimize foto via Unsplash CDN |
| Resend email | 100/hari, 3000/bulan | Upgrade ke paid ($20/bulan) atau kurangi spam reset request |
| Vercel hosting | Unlimited free tier untuk hobby | Upgrade Pro ($20/bulan) kalau commercial |

Cek penggunaan: masing-masing dashboard service (Supabase → Settings → Usage, Resend → Dashboard, Vercel → Usage).

### G. Pricing tiers (catatan untuk Anda — belum di-enforce di kode)

Kolom `plan` di tabel invitations ada (values: `free`, `basic`, `premium`) tapi belum dipakai untuk gating fitur. Anda bisa pakai untuk:
- Tracking siapa bayar berapa
- Filter waktu lihat list invitation
- Future: gating fitur (mis. `premium` boleh custom domain, `basic` tidak)

Saran pricing awal (Indonesia):
- **Basic** (Rp 250-400rb): URL slug standard, semua section, hosting Vercel default
- **Premium** (Rp 600rb-1jt): + custom domain (nanti), + priority support, + remove "powered by"

---

## Project structure

```
wedding-saas-next/
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local.example       ← copy ke .env.local
├── scripts/
│   └── create-invitation.mjs  ← onboard pasangan baru
├── supabase/
│   └── migrations/
│       └── 20260521_password_reset.sql
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                       ← marketing
    │   ├── forgot-password/page.tsx       ← form lupa password
    │   ├── reset-password/page.tsx        ← set password baru via token
    │   ├── [slug]/
    │   │   ├── page.tsx                   ← public invitation
    │   │   ├── InvitationView.tsx
    │   │   ├── not-found.tsx
    │   │   └── dashboard/
    │   │       ├── page.tsx               ← auth gate
    │   │       ├── LoginForm.tsx
    │   │       ├── DashboardClient.tsx    ← 4 tabs: Overview/RSVPs/Gifts/Editor
    │   │       ├── RsvpsTab.tsx
    │   │       ├── GiftsTab.tsx
    │   │       └── lib/csv.ts
    │   └── api/
    │       ├── rsvp/route.ts              ← guest submit RSVP
    │       ├── gift/route.ts              ← guest submit gift
    │       ├── upload/route.ts            ← admin upload image
    │       ├── auth/
    │       │   ├── logout/route.ts
    │       │   ├── forgot-password/route.ts
    │       │   └── reset-password/route.ts
    │       └── invitation/[slug]/
    │           ├── config/route.ts        ← PUT config (save editor)
    │           └── publish/route.ts       ← toggle is_published
    ├── editor/                            ← BLOCK-BASED EDITOR
    │   ├── EditorRoot.tsx                  (3-column: list + form + preview)
    │   ├── EditorProvider.tsx              (state + reducer)
    │   ├── SectionList.tsx                 (drag-drop sections)
    │   ├── FieldEditor.tsx                 (schema-driven form)
    │   ├── PreviewPane.tsx                 (live iframe preview)
    │   ├── SaveBar.tsx                     (save + publish toggle)
    │   ├── AddSectionMenu.tsx
    │   ├── SectionRow.tsx
    │   ├── fields/                         (8 field types)
    │   ├── schemas/                        (17 section schemas + defaults)
    │   └── lib/                            (auth, deepEqual, useUpload)
    ├── sections/                          ← 17 cinematic section components
    ├── components/                        ← Theme, BotanicalBorder, Nav
    ├── config/                            ← pageConfig.js, registries
    ├── renderers/                         ← SectionRenderer, BlockRenderer
    └── styles/                            ← global.css + tokens
```

---

## How data flows

```
┌───────────────────────┐
│  Visitor → /<slug>    │
└──────────┬────────────┘
           │ Server reads cookies + slug
           ▼
┌───────────────────────┐         ┌──────────────────────┐
│ src/app/[slug]/       │◄────────│ Supabase invitations │
│  ─ fetch invitation   │  RLS    │   row by slug        │
│  ─ pass config → view │         └──────────────────────┘
└──────────┬────────────┘
           ▼
┌───────────────────────────────────┐
│  InvitationView (client)          │
│   ThemeProvider + SectionRenderer │
│   render all sections from config │
└──────────┬────────────────────────┘
           │ Guest submits RSVP / Gift
           ▼
┌──────────────────────────────────┐
│  POST /api/rsvp or /api/gift     │
│   resolve slug → invitation_id   │
│   insert row (service-role)      │
└──────────────────────────────────┘
```

Admin (couple) flow:

```
/<slug>/dashboard → login (bcrypt) → set cookie wsaas_admin_<slug>
                  → DashboardClient (4 tabs)
                      ├─ Overview  : plan, template, created date
                      ├─ RSVPs     : list + filter + CSV
                      ├─ Gifts     : list + CSV
                      └─ Editor    : SectionList | FieldEditor | PreviewPane
                                     └─ Save → PUT config → Supabase
```

---

## Deploying to Vercel

1. Push repo ke GitHub
2. Import di Vercel → tambah semua env var (sama persis seperti `.env.local`)
3. Vercel auto-deploy. Default URL: `your-project.vercel.app`
4. **PENTING**: ubah `NEXT_PUBLIC_SITE_URL` ke URL production (penting untuk forgot-password link)
5. (Optional) Set custom domain di Vercel → Domains

---

## Maintenance checklist (mingguan)

- [ ] Cek Supabase Usage → storage masih di bawah quota?
- [ ] Cek Resend Dashboard → ada bounce / complaint?
- [ ] Cek Vercel logs → ada error 500 yang repeat?
- [ ] Lihat list invitation aktif → ada yang siap diarsipkan (acara sudah lewat 6+ bulan)?
- [ ] Cleanup `password_reset_tokens` lama (lihat SQL di section E)

## Backup checklist (bulanan)

- [ ] Download backup `invitations` table (SQL Editor → export to CSV)
- [ ] (Optional) export `rsvps` + `gift_confirmations` untuk arsip
- [ ] Verifikasi Supabase auto-backup masih aktif

---

## Hal-hal yang sudah didokumentasikan di tempat lain

- `docs/superpowers/specs/2026-05-21-sprint-1-block-based-editor-design.md` — design doc untuk editor
- `docs/superpowers/plans/2026-05-21-sprint-1-block-based-editor.md` — implementation plan
- `CLAUDE.md` (di parent folder) — spec design Section 2 "Our Story"

Kalau Anda forget cara kerja editor atau routing, mulai dari design doc itu.
