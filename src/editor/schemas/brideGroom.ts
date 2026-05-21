import type { SectionSchema } from './types'

export const brideGroomSchema: SectionSchema = {
  type: 'brideGroom',
  label: 'Bride & Groom',
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    {
      key: 'people',
      label: 'People',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { role: '', name: '', photo: '', parents: '', bio: '', instagram: '', direction: 'right' },
      itemFields: [
        { key: 'role',      label: 'Role',      type: 'text' },
        { key: 'name',      label: 'Name',      type: 'text' },
        { key: 'photo',     label: 'Photo',     type: 'image' },
        { key: 'parents',   label: 'Parents',   type: 'text' },
        { key: 'bio',       label: 'Bio',       type: 'textarea', rows: 3 },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'direction', label: 'Image side', type: 'select', options: [
          { value: 'left',  label: 'Left' },
          { value: 'right', label: 'Right' },
        ] },
      ],
    },
  ],
  defaults: {
    title: 'The Bride & Groom',
    people: [
      {
        role: 'Bride',
        name: 'Aurelia Sastrawijaya',
        photo: 'https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?auto=format&fit=crop&w=800&q=80',
        parents: 'Daughter of Mr. & Mrs. Sastrawijaya',
        bio: 'A daughter, a dreamer, a designer of warm spaces and warmer conversations.',
        instagram: '@aurelia.s',
        direction: 'right',
      },
      {
        role: 'Groom',
        name: 'Hadyan Pratama',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        parents: 'Son of Mr. & Mrs. Pratama',
        bio: 'A son, a builder, a believer in slow Sundays.',
        instagram: '@hadyan.p',
        direction: 'left',
      },
    ],
  },
}
