import type { SectionSchema } from './types'

const ACCENTS = [
  { value: 'coral',   label: 'Coral' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'gold',    label: 'Gold' },
  { value: 'sky',     label: 'Sky' },
  { value: 'purple',  label: 'Purple' },
]

export const registrySchema: SectionSchema = {
  type: 'registry',
  label: 'Registry',
  fields: [
    { key: 'title',   label: 'Title',   type: 'text' },
    { key: 'message', label: 'Message', type: 'textarea', rows: 3 },
    {
      key: 'platforms',
      label: 'Registry platforms',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { id: '', name: '', description: '', url: '', accent: 'coral' },
      itemFields: [
        { key: 'name',        label: 'Name',        type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'url',         label: 'URL',         type: 'text' },
        { key: 'accent',      label: 'Accent',      type: 'select', options: ACCENTS },
      ],
    },
  ],
  defaults: {
    title: 'Wedding Registry',
    message: 'Your presence is the greatest gift of all — but if you wish to contribute, here are a few places we have curated together.',
    platforms: [
      { id: 'r1', name: 'Tokopedia Wishlist', description: 'Home essentials for our new apartment.', url: '#', accent: 'coral'  },
      { id: 'r2', name: 'Honeymoon Fund',     description: 'Help us explore Kyoto in spring.',       url: '#', accent: 'purple' },
    ],
  },
}
