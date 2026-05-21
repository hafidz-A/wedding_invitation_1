#!/usr/bin/env node
/**
 * scripts/create-invitation.mjs
 *
 * Onboard a new couple. Hashes the password, builds a starter `config` with
 * their names / date / venue pre-filled, and upserts the row into Supabase.
 *
 * Usage:
 *   node scripts/create-invitation.mjs <slug> <password> --bride="X" --groom="Y" \
 *     --date=2026-11-15T16:00 --venue="The Grand Ballroom" \
 *     --email=couple@gmail.com [--plan=premium]
 *
 * Example:
 *   node scripts/create-invitation.mjs rizky-amara demo1234 \
 *     --bride="Amara Sastrawijaya" \
 *     --groom="Rizky Pratama" \
 *     --date=2026-11-15T16:00 \
 *     --venue="The Grand Ballroom, Jakarta" \
 *     --email=rizky@gmail.com \
 *     --plan=premium
 *
 * After running, share with the couple:
 *   • Public URL:   /<slug>
 *   • Dashboard:    /<slug>/dashboard   (password you gave them)
 *   • Forgot pwd:   /forgot-password    (uses the email above)
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

/* ────────────────────────── env loader ────────────────────────── */

function loadDotEnv(file) {
  try {
    const text = readFileSync(resolve(file), 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const [, k, raw] = m
      if (process.env[k]) continue
      let v = raw.trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      process.env[k] = v
    }
  } catch {
    // optional
  }
}

loadDotEnv('.env.local')

/* ────────────────────────── arg parsing ─────────────────────────
   Two positional args (slug, password) followed by --key=value flags. */

const argv = process.argv.slice(2)
const positional = argv.filter((a) => !a.startsWith('--'))
const flags = Object.fromEntries(
  argv
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const eq = a.indexOf('=')
      if (eq === -1) return [a.slice(2), 'true']
      return [a.slice(2, eq), a.slice(eq + 1)]
    }),
)

const slug = positional[0]
const password = positional[1]
const brideName = flags.bride
const groomName = flags.groom
const weddingDate = flags.date
const venue = flags.venue || ''
const email = flags.email
const plan = flags.plan || 'free'

const required = { slug, password, brideName, groomName, weddingDate, email }
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`Missing required: ${missing.join(', ')}\n`)
  console.error('Usage:')
  console.error('  node scripts/create-invitation.mjs <slug> <password> \\')
  console.error('    --bride="Bride Full Name" \\')
  console.error('    --groom="Groom Full Name" \\')
  console.error('    --date=2026-11-15T16:00 \\')
  console.error('    --venue="Venue name & address" \\')
  console.error('    --email=couple@gmail.com \\')
  console.error('    [--plan=free|basic|premium]')
  process.exit(1)
}

/* ────────────────────────── supabase ────────────────────────── */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

/* ────────────────────────── starter config ──────────────────────
   Minimal but functional. Couple can grow it via "+ Add section"
   in the editor (which has full default props per type).            */

const coupleName = `${brideName} & ${groomName}`
const monogram = `${brideName.trim()[0]} & ${groomName.trim()[0]}`
const config = {
  meta: {
    title: `${coupleName} — Our Wedding`,
    description: 'Cinematic wedding invitation',
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      theme: 'darkLuxury',
      props: {
        coupleName,
        brideName,
        groomName,
        weddingDate,
        venue,
        welcomeText: 'Welcome, our dear guest',
        scrollHint: 'Scroll to enter',
        countdownEnabled: true,
        gateImage:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
        blastPhotos: [
          'https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=500&q=80',
        ],
      },
    },
    {
      id: 'countdown',
      type: 'countdown',
      enabled: true,
      theme: 'warmCream',
      navLabel: 'Countdown',
      props: {
        weddingDate,
        eyebrow: 'Save the date',
        title: 'Menuju Hari Bahagia',
        subtitle: 'Hitung mundur sampai janji suci diucapkan',
        messageDuring: 'Hari ini, kami menikah! 💍',
        messageAfter: 'Terima kasih telah menjadi bagian dari kisah kami.',
        labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
        style: 'card',
      },
    },
    {
      id: 'eventDetails',
      type: 'eventDetails',
      enabled: true,
      theme: 'warmCream',
      props: {
        title: 'Event Details',
        subtitle: 'Join us as we celebrate the beginning of forever',
        events: [
          {
            id: 'ceremony',
            label: 'Ceremony',
            icon: 'rings',
            date: new Date(weddingDate).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            time: '16:00 — 17:30',
            location: venue,
            accent: 'coral',
          },
          {
            id: 'reception',
            label: 'Reception',
            icon: 'champagne',
            date: new Date(weddingDate).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            time: '19:00 — 23:00',
            location: venue,
            accent: 'emerald',
          },
        ],
        mapEmbed: '',
      },
    },
    {
      id: 'rsvp',
      type: 'rsvp',
      enabled: true,
      theme: 'warmCream',
      props: {
        title: 'Will You Join Us?',
        subtitle: 'Kindly respond by 1 month before the date',
        mealOptions: [
          { value: 'beef', label: 'Beef Tenderloin' },
          { value: 'fish', label: 'Pan-Seared Fish' },
          { value: 'vegetarian', label: 'Garden Vegetarian' },
        ],
        maxGuests: 5,
      },
    },
    {
      id: 'weddingGift',
      type: 'weddingGift',
      enabled: true,
      theme: 'warmCream',
      navLabel: 'Gift',
      props: {
        title: 'Wedding Gift',
        subtitle: 'Tanda kasih untuk perjalanan kami berikutnya',
        intro:
          'Kehadiran Anda adalah hadiah terbesar bagi kami. Namun bila Anda berkenan memberikan tanda kasih, kami menyediakan beberapa opsi berikut.',
        confirmationEnabled: true,
        accounts: [
          // Couple should fill these in via the editor.
          {
            id: 'bank-1',
            type: 'bank',
            name: 'Bank Name',
            accountNumber: '0000000000',
            accountHolder: brideName,
            accent: 'coral',
          },
        ],
        giftAddress: '',
      },
    },
    {
      id: 'footer',
      type: 'footer',
      enabled: true,
      theme: 'warmCream',
      props: {
        monogram,
        hashtag: `#${brideName.trim().split(/\s+/)[0]}And${groomName.trim().split(/\s+/)[0]}`,
        message: 'Thank you for being part of our story.',
        coupleName,
        socials: [],
      },
    },
  ],
}

/* ────────────────────────── insert ────────────────────────── */

const password_hash = await bcrypt.hash(password, 10)

const { data, error } = await supabase
  .from('invitations')
  .upsert(
    {
      slug,
      password_hash,
      email,
      plan,
      template_id: 'classic',
      is_published: true,
      config,
    },
    { onConflict: 'slug' },
  )
  .select()
  .single()

if (error) {
  console.error('Insert failed:', error.message)
  if (error.message.includes('email')) {
    console.error('\nHint: did you run supabase/migrations/20260521_password_reset.sql?')
    console.error('That migration adds the `email` column to invitations.')
  }
  process.exit(1)
}

console.log('\n✓ Invitation created/updated\n')
console.log('  slug:       ', data.slug)
console.log('  couple:     ', coupleName)
console.log('  date:       ', weddingDate)
console.log('  venue:      ', venue || '(not set)')
console.log('  email:      ', data.email || '(not set — forgot-password disabled)')
console.log('  plan:       ', data.plan)
console.log('  published:  ', data.is_published)
console.log('  public URL: ', `/${data.slug}`)
console.log('  dashboard:  ', `/${data.slug}/dashboard  (password: ${password})`)
console.log('')
