import type { SectionSchema } from './types'

export const playlistSchema: SectionSchema = {
  type: 'playlist',
  label: 'Playlist',
  fields: [
    { key: 'title',    label: 'Title',    type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    {
      key: 'initialSongs',
      label: 'Seeded songs',
      type: 'objectArray',
      itemLabelKey: 'song',
      newItem: { id: '', song: '', artist: '' },
      itemFields: [
        { key: 'song',   label: 'Song',   type: 'text' },
        { key: 'artist', label: 'Artist', type: 'text' },
      ],
    },
  ],
  defaults: {
    title: 'Build the Playlist',
    subtitle: 'What song would get you on the dance floor?',
    initialSongs: [
      { id: 'pl1', song: 'Perfect',   artist: 'Ed Sheeran'         },
      { id: 'pl2', song: 'September', artist: 'Earth, Wind & Fire' },
    ],
  },
}
