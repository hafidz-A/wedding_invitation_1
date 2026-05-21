import type { SectionSchema } from './types'

export const weddingPartySchema: SectionSchema = {
  type: 'weddingParty',
  label: 'Wedding Party',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'people',
      label: 'People',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { id: '', name: '', role: '', photo: '' },
      itemFields: [
        { key: 'name',  label: 'Name',  type: 'text' },
        { key: 'role',  label: 'Role',  type: 'text' },
        { key: 'photo', label: 'Photo', type: 'image' },
      ],
    },
  ],
  defaults: {
    title: 'Wedding Party',
    subtitle: 'The people who make our story brighter',
    people: [
      { id: 'p1', name: 'Maya Larasati', role: 'Maid of Honor', photo: '' },
      { id: 'p2', name: 'Dimas Aji',     role: 'Best Man',      photo: '' },
    ],
  },
}
