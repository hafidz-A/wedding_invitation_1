import type { SectionSchema } from './types'

export const footerSchema: SectionSchema = {
  type: 'footer',
  label: 'Footer',
  fields: [
    { key: 'monogram',   label: 'Monogram',   type: 'text' },
    { key: 'hashtag',    label: 'Hashtag',    type: 'text' },
    { key: 'message',    label: 'Message',    type: 'textarea', rows: 2 },
    { key: 'coupleName', label: 'Couple name', type: 'text' },
    {
      key: 'socials',
      label: 'Socials',
      type: 'objectArray',
      itemLabelKey: 'label',
      newItem: { id: '', label: '', url: '' },
      itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'url',   label: 'URL',   type: 'text' },
      ],
    },
  ],
  defaults: {
    monogram: 'A & H',
    hashtag: '#AureliaAndHadyan',
    message: 'Thank you for being part of our story.',
    coupleName: 'Aurelia & Hadyan',
    socials: [
      { id: 's-ig',   label: 'Instagram', url: '#' },
      { id: 's-mail', label: 'Email',     url: 'mailto:hello@example.com' },
    ],
  },
}
