import type { SectionSchema } from './types'
import { heroSchema } from './hero'
import { countdownSchema } from './countdown'
import { ourStorySchema } from './ourStory'
import { eventDetailsSchema } from './eventDetails'
import { brideGroomSchema } from './brideGroom'
import { weddingPartySchema } from './weddingParty'
import { gallerySchema } from './gallery'
import { galleryHelixSchema } from './galleryHelix'
import { gallerySpringCoilSchema } from './gallerySpringCoil'
import { scheduleSchema } from './schedule'
import { rsvpSchema } from './rsvp'
import { weddingGiftSchema } from './weddingGift'
import { registrySchema } from './registry'
import { accommodationsSchema } from './accommodations'
import { faqSchema } from './faq'
import { guestbookSchema } from './guestbook'
import { playlistSchema } from './playlist'
import { footerSchema } from './footer'
import { musicPopupSchema } from './musicPopup'

export const schemaRegistry: Record<string, SectionSchema> = {
  hero:              heroSchema,
  countdown:         countdownSchema,
  ourStory:          ourStorySchema,
  eventDetails:      eventDetailsSchema,
  brideGroom:        brideGroomSchema,
  weddingParty:      weddingPartySchema,
  gallery:           gallerySchema,
  galleryHelix:      galleryHelixSchema,
  gallerySpringCoil: gallerySpringCoilSchema,
  schedule:          scheduleSchema,
  rsvp:              rsvpSchema,
  weddingGift:       weddingGiftSchema,
  registry:          registrySchema,
  accommodations:    accommodationsSchema,
  faq:               faqSchema,
  guestbook:         guestbookSchema,
  playlist:          playlistSchema,
  footer:            footerSchema,
  musicPopup:        musicPopupSchema,
}

export type { SectionSchema, FieldDef } from './types'
