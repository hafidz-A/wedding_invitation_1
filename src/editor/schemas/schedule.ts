import type { SectionSchema } from './types'

const ACCENTS = [
  { value: 'coral',   label: 'Coral' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'gold',    label: 'Gold' },
  { value: 'sky',     label: 'Sky' },
  { value: 'purple',  label: 'Purple' },
]

export const scheduleSchema: SectionSchema = {
  type: 'schedule',
  label: 'Schedule',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'events',
      label: 'Schedule items',
      type: 'objectArray',
      itemLabelKey: 'title',
      newItem: { id: '', time: '', title: '', description: '', accent: 'coral', icon: '' },
      itemFields: [
        { key: 'time',        label: 'Time',        type: 'text' },
        { key: 'title',       label: 'Title',       type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'accent',      label: 'Accent',      type: 'select', options: ACCENTS },
        { key: 'icon',        label: 'Icon',        type: 'text' },
      ],
    },
  ],
  defaults: {
    title: 'Schedule of the Day',
    subtitle: 'A gentle guide so you never miss a moment',
    events: [
      { id: 's1', time: '15:30', title: 'Guest Arrival',       description: 'Welcome drinks and live acoustic music on the terrace.',        accent: 'coral',   icon: 'door'  },
      { id: 's2', time: '16:00', title: 'Ceremony',            description: 'The exchange of vows beneath an arch of fresh flowers.',         accent: 'emerald', icon: 'rings' },
      { id: 's3', time: '19:00', title: 'Dinner Reception',    description: 'A four-course meal followed by speeches and toasts.',            accent: 'purple',  icon: 'plate' },
      { id: 's4', time: '21:00', title: 'First Dance & Party', description: 'Music, dancing, and dessert until the late hour.',               accent: 'coral',   icon: 'music' },
    ],
  },
}
