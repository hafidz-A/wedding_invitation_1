import type { SectionSchema } from './types'

export const rsvpSchema: SectionSchema = {
  type: 'rsvp',
  label: 'RSVP',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'mealOptions',
      label: 'Meal options',
      type: 'objectArray',
      itemLabelKey: 'label',
      newItem: { value: '', label: '' },
      itemFields: [
        { key: 'value', label: 'Value (machine)', type: 'text' },
        { key: 'label', label: 'Label (display)', type: 'text' },
      ],
    },
    { key: 'maxGuests', label: 'Max guests per RSVP', type: 'text' },
  ],
  defaults: {
    title: 'Will You Join Us?',
    subtitle: 'Kindly respond by 1 November 2026',
    mealOptions: [
      { value: 'beef',       label: 'Beef Tenderloin'   },
      { value: 'fish',       label: 'Pan-Seared Fish'   },
      { value: 'vegetarian', label: 'Garden Vegetarian' },
    ],
    maxGuests: '5',
  },
}
