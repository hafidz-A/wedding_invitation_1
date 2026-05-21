import type { SectionSchema } from './types'

export const ourStorySchema: SectionSchema = {
  type: 'ourStory',
  label: 'Our Story',
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    {
      key: 'stories',
      label: 'Story cards',
      type: 'objectArray',
      itemLabelKey: 'title',
      newItem: { id: '', year: '', date: '', title: '', description: '', image: '' },
      itemFields: [
        { key: 'year',        label: 'Year',        type: 'text' },
        { key: 'date',        label: 'Date',        type: 'text' },
        { key: 'title',       label: 'Title',       type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'image',       label: 'Image',       type: 'image' },
      ],
    },
  ],
  defaults: {
    title: 'Our Story',
    stories: [
      {
        id: 'story-1',
        year: '2020',
        date: '14 February 2020',
        title: 'The First Meeting',
        description: 'A quiet evening by the sea, where laughter became the language we both understood without saying a single word.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
      },
      {
        id: 'story-2',
        year: '2022',
        date: '15 December 2022',
        title: 'Our Holiday Together',
        description: 'Silly hats, shared snacks, and the kind of joy you only get when home is wherever the other person is.',
        image: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=1400&q=80',
      },
      {
        id: 'story-3',
        year: '2024',
        date: '08 March 2024',
        title: 'The Proposal',
        description: 'A single quiet question on a slow Sunday — answered with tears, laughter, and a yes that has not stopped ringing since.',
        image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=80',
      },
    ],
  },
}
