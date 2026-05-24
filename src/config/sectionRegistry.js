import { lazy } from 'react'

/* ============================================================================
   SECTION REGISTRY

   Maps each section `type` from pageConfig.js → its React component.
   All sections are lazy-loaded (code-split) for fast initial paint.

   To add a new section:
     1. Build the component under src/sections/<Name>/
     2. Add an entry below: `<type>: lazy(() => import('...'))`
     3. Reference it from pageConfig.js with the matching `type`

   To add a generic block-composed section (built from BlockRenderer),
   import the `BlocksSection` and register it under whatever type you want.
   ============================================================================ */

export const sectionRegistry = {
  hero:           lazy(() => import('../sections/Hero/Hero.jsx')),
  countdown:      lazy(() => import('../sections/Countdown/Countdown.jsx')),
  ourStory:       lazy(() => import('../sections/OurStoryStack/OurStory.jsx')),
  eventDetails:   lazy(() => import('../sections/EventDetails/EventDetails.jsx')),
  brideGroom:        lazy(() => import('../sections/BrideGroom/BrideGroom.jsx')),
  weddingParty:      lazy(() => import('../sections/WeddingParty/WeddingParty.jsx')),
  galleryMasonry:    lazy(() => import('../sections/GalleryMasonry/index.js')),
  gallerySpringCoil: lazy(() => import('../sections/GallerySpringCoil/index.js')),
  schedule:       lazy(() => import('../sections/Schedule/Schedule.jsx')),
  rsvp:           lazy(() => import('../sections/Rsvp/Rsvp.jsx')),
  weddingGift:    lazy(() => import('../sections/WeddingGift/WeddingGift.jsx')),
  registry:       lazy(() => import('../sections/Registry/Registry.jsx')),
  accommodations: lazy(() => import('../sections/Accommodations/Accommodations.jsx')),
  faq:            lazy(() => import('../sections/Faq/Faq.jsx')),
  guestbook:      lazy(() => import('../sections/Guestbook/Guestbook.jsx')),
  playlist:       lazy(() => import('../sections/Playlist/Playlist.jsx')),
  footer:         lazy(() => import('../sections/Footer/Footer.jsx')),

  // Generic block-composed section — for future templates that want
  // to build their content from primitive blocks (Text / Image / etc.)
  blocks:         lazy(() => import('../sections/BlocksSection/BlocksSection.jsx')),
}

export default sectionRegistry
