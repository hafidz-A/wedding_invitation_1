import type { SectionSchema } from './types'

const ACCENTS = [
  { value: 'coral',   label: 'Coral' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'gold',    label: 'Gold' },
  { value: 'sky',     label: 'Sky' },
  { value: 'purple',  label: 'Purple' },
]

export const weddingGiftSchema: SectionSchema = {
  type: 'weddingGift',
  label: 'Wedding Gift',
  fields: [
    { key: 'title',               label: 'Title',                 type: 'text' },
    { key: 'subtitle',            label: 'Subtitle',              type: 'text' },
    { key: 'intro',               label: 'Intro',                 type: 'textarea', rows: 3 },
    { key: 'confirmationEnabled', label: 'Show confirmation form', type: 'boolean' },
    {
      key: 'accounts',
      label: 'Accounts',
      type: 'objectArray',
      itemLabelKey: 'name',
      newItem: { id: '', type: 'bank', name: '', accountNumber: '', accountHolder: '', accent: 'coral' },
      itemFields: [
        { key: 'type',          label: 'Type', type: 'select', options: [
          { value: 'bank',    label: 'Bank' },
          { value: 'ewallet', label: 'E-wallet' },
        ] },
        { key: 'name',          label: 'Bank / wallet name', type: 'text' },
        { key: 'accountNumber', label: 'Account number',     type: 'text' },
        { key: 'accountHolder', label: 'Account holder',     type: 'text' },
        { key: 'accent',        label: 'Accent',             type: 'select', options: ACCENTS },
      ],
    },
    { key: 'giftAddress', label: 'Physical-gift address', type: 'textarea', rows: 3 },
  ],
  defaults: {
    title: 'Wedding Gift',
    subtitle: 'Tanda kasih untuk perjalanan kami berikutnya',
    intro: 'Kehadiran Anda adalah hadiah terbesar bagi kami. Namun bila Anda berkenan memberikan tanda kasih, kami menyediakan beberapa opsi berikut.',
    confirmationEnabled: true,
    accounts: [
      { id: 'bca-bride',     type: 'bank', name: 'BCA',     accountNumber: '1234567890',    accountHolder: 'Aurelia Sastrawijaya', accent: 'coral'   },
      { id: 'mandiri-groom', type: 'bank', name: 'Mandiri', accountNumber: '1450098876543', accountHolder: 'Hadyan Pratama',       accent: 'emerald' },
    ],
    giftAddress: 'Untuk kado fisik, mohon kirimkan ke alamat: Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190.',
  },
}
