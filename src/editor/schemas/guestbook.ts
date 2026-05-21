import type { SectionSchema } from './types'

const COLORS = [
  { value: 'coral',  label: 'Coral' },
  { value: 'gold',   label: 'Gold' },
  { value: 'sky',    label: 'Sky' },
  { value: 'mint',   label: 'Mint' },
  { value: 'purple', label: 'Purple' },
]

export const guestbookSchema: SectionSchema = {
  type: 'guestbook',
  label: 'Guestbook',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'initialNotes',
      label: 'Seeded notes',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { id: '', name: '', message: '', color: 'gold' },
      itemFields: [
        { key: 'name',    label: 'Name',    type: 'text' },
        { key: 'message', label: 'Message', type: 'textarea', rows: 2 },
        { key: 'color',   label: 'Color',   type: 'select', options: COLORS },
      ],
    },
  ],
  defaults: {
    title: 'Leave a Note',
    subtitle: 'A digital guestbook of wishes from the people we love',
    initialNotes: [
      { id: 'n1', name: 'Maya',  message: 'So happy for you both — cannot wait for the big day!', color: 'gold' },
      { id: 'n2', name: 'Dimas', message: 'Brother, you found a gem. Cheers to forever.',         color: 'sky'  },
    ],
  },
}
