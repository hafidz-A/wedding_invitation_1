import type { SectionSchema } from './types'

export const accommodationsSchema: SectionSchema = {
  type: 'accommodations',
  label: 'Accommodations',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'hotels',
      label: 'Hotels',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { id: '', name: '', distance: '', description: '', price: '', phone: '', tag: '' },
      itemFields: [
        { key: 'name',        label: 'Name',        type: 'text' },
        { key: 'distance',    label: 'Distance',    type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'price',       label: 'Price',       type: 'text' },
        { key: 'phone',       label: 'Phone',       type: 'text' },
        { key: 'tag',         label: 'Tag',         type: 'text' },
      ],
    },
    {
      key: 'tips',
      label: 'Travel tips',
      type: 'objectArray',
      itemLabelKey: 'text',
      newItem: { id: '', icon: '', text: '' },
      itemFields: [
        { key: 'icon', label: 'Icon', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea', rows: 2 },
      ],
    },
  ],
  defaults: {
    title: 'Where to Stay',
    subtitle: 'A few favorites for our out-of-town guests',
    hotels: [
      { id: 'h1', name: 'Hotel Indonesia Kempinski', distance: '0.4 km', description: 'Five-star luxury directly across from the venue.',  price: 'From IDR 3.500.000 / night', phone: '+62 21 2358 3838', tag: 'Luxury'    },
      { id: 'h2', name: 'Pullman Jakarta Indonesia', distance: '1.1 km', description: 'Modern comfort with a beautiful rooftop pool.',     price: 'From IDR 2.100.000 / night', phone: '+62 21 3192 1111', tag: 'Mid-range' },
    ],
    tips: [
      { id: 't1', icon: 'plane', text: 'Soekarno-Hatta Intl. Airport (CGK) is about 45 minutes from the venue.' },
      { id: 't2', icon: 'car',   text: 'Grab and Gojek are reliable and inexpensive — keep the app installed.'  },
    ],
  },
}
