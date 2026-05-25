import type { SectionSchema } from './types'

export const musicPopupSchema: SectionSchema = {
  type: 'musicPopup',
  label: 'Music Popup',
  defaults: {
    audioUrl: '',
    title: 'Putar musik latar?',
    subtitle: 'Nikmati pengalaman undangan lebih lengkap',
    acceptLabel: 'Putar',
    dismissLabel: 'Nanti',
    delayMs: 1500,
    loop: true,
  },
  fields: [
    {
      type: 'audio',
      key: 'audioUrl',
      label: 'Background music (MP3)',
      help: 'Maks 12 MB. Looping otomatis. Tamu harus klik "Putar" dulu — autoplay diblok browser.',
    },
    { type: 'text',     key: 'title',        label: 'Popup title',    help: 'Maks ~30 karakter' },
    { type: 'text',     key: 'subtitle',     label: 'Popup subtitle', help: 'Baris kecil di bawah judul' },
    { type: 'text',     key: 'acceptLabel',  label: 'Button "Accept"' },
    { type: 'text',     key: 'dismissLabel', label: 'Button "Dismiss"' },
    { type: 'boolean',  key: 'loop',         label: 'Loop / repeat musik' },
  ],
}
