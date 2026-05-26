import type { SectionSchema } from './types'

export const heroSchema: SectionSchema = {
  type: 'hero',
  label: 'Hero',
  fields: [
    {
      key: 'monogram',
      label: 'Monogram (favicon tab browser)',
      type: 'text',
      help: 'Inisial yang muncul di tab browser tamu. Pendek-pendek aja, mis. "A & R". Kalau kosong, otomatis pakai huruf pertama nama pengantin.',
    },
    { key: 'coupleName',       label: 'Couple name',   type: 'text' },
    { key: 'brideName',        label: 'Bride name',    type: 'text' },
    { key: 'groomName',        label: 'Groom name',    type: 'text' },
    { key: 'weddingDate',      label: 'Wedding date',  type: 'datetime' },
    { key: 'venue',            label: 'Venue',         type: 'text' },
    { key: 'welcomeText',      label: 'Welcome text',  type: 'textarea', rows: 2 },
    { key: 'scrollHint',       label: 'Scroll hint',   type: 'text' },
    { key: 'countdownEnabled', label: 'Show countdown', type: 'boolean' },
    { key: 'gateImage',        label: 'Gate image',     type: 'image' },
    { key: 'blastPhotos',      label: 'Blast photos',   type: 'imageArray' },
  ],
  defaults: {
    monogram: 'A & H',
    coupleName: 'Aurelia & Hadyan',
    brideName: 'Aurelia',
    groomName: 'Hadyan',
    weddingDate: '2026-12-12T16:00:00',
    venue: 'The Grand Ballroom, Jakarta',
    welcomeText: 'Welcome, our dear guest',
    scrollHint: 'Scroll to enter',
    countdownEnabled: true,
    gateImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
    blastPhotos: [
      'https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=500&q=80',
    ],
  },
}
