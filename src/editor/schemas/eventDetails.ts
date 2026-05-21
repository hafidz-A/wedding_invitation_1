import type { SectionSchema } from './types'

const ACCENTS = [
  { value: 'coral',   label: 'Coral' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'gold',    label: 'Gold' },
  { value: 'sky',     label: 'Sky' },
  { value: 'purple',  label: 'Purple' },
]

export const eventDetailsSchema: SectionSchema = {
  type: 'eventDetails',
  label: 'Event Details',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'events',
      label: 'Events',
      type: 'objectArray',
      itemLabelKey: 'label',
      newItem: { id: '', label: '', icon: '', date: '', time: '', location: '', accent: 'coral' },
      itemFields: [
        { key: 'label',    label: 'Label',    type: 'text' },
        { key: 'icon',     label: 'Icon',     type: 'text' },
        { key: 'date',     label: 'Date',     type: 'text' },
        { key: 'time',     label: 'Time',     type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'accent',   label: 'Accent',   type: 'select', options: ACCENTS },
      ],
    },
    { key: 'mapEmbed', label: 'Map embed URL', type: 'textarea', rows: 3 },
  ],
  defaults: {
    title: 'Event Details',
    subtitle: 'Join us as we celebrate the beginning of forever',
    events: [
      { id: 'ceremony',  label: 'Ceremony',   icon: 'rings',     date: 'Saturday, 12 December 2026', time: '16:00 — 17:30', location: 'St. Mary Chapel, Jakarta', accent: 'coral' },
      { id: 'reception', label: 'Reception',  icon: 'champagne', date: 'Saturday, 12 December 2026', time: '19:00 — 23:00', location: 'The Grand Ballroom, Jakarta', accent: 'emerald' },
    ],
    mapEmbed: '',
  },
}
