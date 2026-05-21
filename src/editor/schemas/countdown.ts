import type { SectionSchema } from './types'

export const countdownSchema: SectionSchema = {
  type: 'countdown',
  label: 'Countdown',
  fields: [
    { key: 'weddingDate',   label: 'Wedding date',   type: 'datetime' },
    { key: 'eyebrow',       label: 'Eyebrow',        type: 'text' },
    { key: 'title',         label: 'Title',          type: 'text' },
    { key: 'subtitle',      label: 'Subtitle',       type: 'text' },
    { key: 'messageDuring', label: 'Message (on the day)',    type: 'textarea', rows: 2 },
    { key: 'messageAfter',  label: 'Message (after the day)', type: 'textarea', rows: 2 },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      options: [
        { value: 'card',   label: 'Card per unit (default)' },
        { value: 'mono',   label: 'Monospace inline' },
        { value: 'italic', label: 'Italic serif' },
      ],
    },
    // Note: `labels` (Hari/Jam/Menit/Detik) is a nested object — current schema
    // framework supports only flat / array fields. Keep the default labels; if
    // a couple needs different unit names they can edit `props.labels.*` via
    // Supabase Table Editor directly.
  ],
  defaults: {
    weddingDate: '2026-12-12T16:00:00+07:00',
    eyebrow: 'Save the date',
    title: 'Menuju Hari Bahagia',
    subtitle: 'Hitung mundur sampai janji suci diucapkan',
    messageDuring: 'Hari ini, kami menikah!',
    messageAfter: 'Terima kasih telah menjadi bagian dari kisah kami.',
    style: 'card',
  },
}
