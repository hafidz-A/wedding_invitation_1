import type { SectionSchema } from './types'

export const gallerySchema: SectionSchema = {
  type: 'gallery',
  label: 'Gallery',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'images',
      label: 'Images',
      type: 'objectArray',
      itemLabelKey: 'caption',
      newItem: { id: '', src: '', caption: '', tall: false },
      itemFields: [
        { key: 'src',     label: 'Image',     type: 'image' },
        { key: 'caption', label: 'Caption',   type: 'text' },
        { key: 'tall',    label: 'Tall (2-row)', type: 'boolean' },
      ],
    },
  ],
  defaults: {
    title: 'Moments',
    subtitle: 'A small collection of our favorite memories',
    images: [
      { id: 'g1', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', caption: 'The proposal',  tall: true  },
      { id: 'g2', src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80', caption: 'A road trip',   tall: false },
      { id: 'g3', src: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=900&q=80', caption: 'First holiday', tall: false },
      { id: 'g4', src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80', caption: 'Lazy Sunday',   tall: true  },
    ],
  },
}
