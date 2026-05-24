# GalleryMasonry AutoScroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the old `Gallery` and `GalleryHelix` sections completely, then create `GalleryMasonry` — a vertical conveyor-belt gallery with 4 columns, infinite seamless looping, alternating up/down directions per column, and no hover-pause.

**Architecture:** The component distributes `photos[]` round-robin to 4 columns, renders each column's photos twice (original + clone), and uses CSS `translateY(0 → -50%)` / `(-50% → 0)` animations with `linear infinite`. Because each cell's height is controlled via explicit `aspect-ratio`, the `-50%` translation is deterministic from first render — no JS height measurement needed and no jump on loop.

**Tech Stack:** React 18, CSS Modules, pure CSS animation (no GSAP/motion needed), Next.js 14 App Router conventions (`'use client'`).

---

## File Map

| File | Action |
|---|---|
| `src/sections/Gallery/Gallery.jsx` | **Delete** |
| `src/sections/Gallery/Gallery.module.css` | **Delete** |
| `src/sections/GalleryHelix/GalleryHelix.jsx` | **Delete** |
| `src/sections/GalleryHelix/GalleryHelix.module.css` | **Delete** |
| `src/sections/GalleryHelix/index.js` | **Delete** |
| `src/config/sectionRegistry.js` | **Modify** — remove `gallery` + `galleryHelix`, add `galleryMasonry` |
| `src/config/pageConfig.js` | **Modify** — remove `gallery` + `galleryHelix` entries, add `galleryMasonry` entry |
| `src/sections/GalleryMasonry/GalleryMasonry.jsx` | **Create** — component |
| `src/sections/GalleryMasonry/GalleryMasonry.module.css` | **Create** — all styles |
| `src/sections/GalleryMasonry/index.js` | **Create** — re-export |

---

## Task 1: Delete old gallery sections + update registry + update pageConfig

**Files:**
- Delete: `src/sections/Gallery/Gallery.jsx`
- Delete: `src/sections/Gallery/Gallery.module.css`
- Delete: `src/sections/GalleryHelix/GalleryHelix.jsx`
- Delete: `src/sections/GalleryHelix/GalleryHelix.module.css`
- Delete: `src/sections/GalleryHelix/index.js`
- Modify: `src/config/sectionRegistry.js`
- Modify: `src/config/pageConfig.js`

- [ ] **Step 1.1: Delete the Gallery component folder**

```powershell
Remove-Item -Recurse -Force "src\sections\Gallery"
```

- [ ] **Step 1.2: Delete the GalleryHelix component folder**

```powershell
Remove-Item -Recurse -Force "src\sections\GalleryHelix"
```

- [ ] **Step 1.3: Remove `gallery` and `galleryHelix` from sectionRegistry.js**

Open `src/config/sectionRegistry.js`. The current content is:

```js
import { lazy } from 'react'

export const sectionRegistry = {
  hero:           lazy(() => import('../sections/Hero/Hero.jsx')),
  countdown:      lazy(() => import('../sections/Countdown/Countdown.jsx')),
  ourStory:       lazy(() => import('../sections/OurStoryStack/OurStory.jsx')),
  eventDetails:   lazy(() => import('../sections/EventDetails/EventDetails.jsx')),
  brideGroom:     lazy(() => import('../sections/BrideGroom/BrideGroom.jsx')),
  weddingParty:   lazy(() => import('../sections/WeddingParty/WeddingParty.jsx')),
  gallery:        lazy(() => import('../sections/Gallery/Gallery.jsx')),
  galleryHelix:   lazy(() => import('../sections/GalleryHelix/index.js')),
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
  blocks:         lazy(() => import('../sections/BlocksSection/BlocksSection.jsx')),
}

export default sectionRegistry
```

Replace with (removes `gallery` and `galleryHelix` lines):

```js
import { lazy } from 'react'

export const sectionRegistry = {
  hero:             lazy(() => import('../sections/Hero/Hero.jsx')),
  countdown:        lazy(() => import('../sections/Countdown/Countdown.jsx')),
  ourStory:         lazy(() => import('../sections/OurStoryStack/OurStory.jsx')),
  eventDetails:     lazy(() => import('../sections/EventDetails/EventDetails.jsx')),
  brideGroom:       lazy(() => import('../sections/BrideGroom/BrideGroom.jsx')),
  weddingParty:     lazy(() => import('../sections/WeddingParty/WeddingParty.jsx')),
  galleryMasonry:   lazy(() => import('../sections/GalleryMasonry/index.js')),
  gallerySpringCoil: lazy(() => import('../sections/GallerySpringCoil/index.js')),
  schedule:         lazy(() => import('../sections/Schedule/Schedule.jsx')),
  rsvp:             lazy(() => import('../sections/Rsvp/Rsvp.jsx')),
  weddingGift:      lazy(() => import('../sections/WeddingGift/WeddingGift.jsx')),
  registry:         lazy(() => import('../sections/Registry/Registry.jsx')),
  accommodations:   lazy(() => import('../sections/Accommodations/Accommodations.jsx')),
  faq:              lazy(() => import('../sections/Faq/Faq.jsx')),
  guestbook:        lazy(() => import('../sections/Guestbook/Guestbook.jsx')),
  playlist:         lazy(() => import('../sections/Playlist/Playlist.jsx')),
  footer:           lazy(() => import('../sections/Footer/Footer.jsx')),
  blocks:           lazy(() => import('../sections/BlocksSection/BlocksSection.jsx')),
}

export default sectionRegistry
```

Note: `galleryMasonry` entry is added even though the component doesn't exist yet — the registry uses `lazy()` which only resolves at render time, so Next.js won't crash on startup. The component is created in Task 2.

- [ ] **Step 1.4: Remove `gallery` and `galleryHelix` blocks from pageConfig.js, add `galleryMasonry`**

In `src/config/pageConfig.js`, find and **delete** the entire block from line 238 to line 290 (the `gallery` and `galleryHelix` entries, including the blank line between them).

Then, in the same location (between the `weddingParty` block and the `gallerySpringCoil` block), **insert** this new entry:

```js
    {
      id: 'galleryMasonry',
      type: 'galleryMasonry',
      enabled: true,
      theme: 'warmCream',
      navLabel: 'Gallery',
      props: {
        eyebrow: 'Our Moments',
        sectionTitle: 'Memories',
        sectionSubtitle: 'A small collection of our favorite memories together',
        photos: [
          { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', alt: 'The proposal' },
          { src: 'https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?auto=format&fit=crop&w=600&q=80', alt: 'Just us' },
          { src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=600&q=80', alt: 'Birthday surprise' },
          { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80', alt: 'Our wedding' },
          { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80', alt: 'Lazy Sunday' },
          { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', alt: 'Road trip' },
          { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', alt: 'Holiday together' },
          { src: 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&w=600&q=80', alt: 'First date' },
          { src: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80', alt: 'Coffee mornings' },
          { src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80', alt: 'City lights' },
          { src: 'https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=600&q=80', alt: 'Sunset walk' },
          { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80', alt: 'The proposal 2' },
          { src: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=600&q=80', alt: 'First holiday' },
          { src: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=600&q=80', alt: 'Cooking together' },
          { src: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e2e?auto=format&fit=crop&w=600&q=80', alt: 'Family dinner' },
          { src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=600&q=80', alt: 'First dance' },
        ],
      },
    },
```

- [ ] **Step 1.5: Verify Next.js still compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error|Error|✓ Compiled" | Select-Object -First 20
```

Expected: `✓ Compiled` or build completes. The only acceptable errors are TypeScript complaints about the not-yet-existing `GalleryMasonry` module — those disappear after Task 2.

- [ ] **Step 1.6: Commit**

```powershell
git add src/config/sectionRegistry.js src/config/pageConfig.js
git commit -m "refactor: remove Gallery and GalleryHelix sections, add galleryMasonry to registry and config"
```

---

## Task 2: Create GalleryMasonry component

**Files:**
- Create: `src/sections/GalleryMasonry/GalleryMasonry.module.css`
- Create: `src/sections/GalleryMasonry/GalleryMasonry.jsx`
- Create: `src/sections/GalleryMasonry/index.js`

- [ ] **Step 2.1: Create the CSS module**

Create `src/sections/GalleryMasonry/GalleryMasonry.module.css`:

```css
/* GalleryMasonry — vertical conveyor belt gallery */

.section {
  background: #d6d1be;
  padding: 80px 0 0;
  overflow: hidden;
}

/* ── Header ── */
.header {
  text-align: center;
  padding: 0 48px 52px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8a7f6e;
  margin-bottom: 12px;
}

.title {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-style: italic;
  font-size: clamp(40px, 6vw, 72px);
  color: #1a1a1a;
  margin-bottom: 10px;
  line-height: 1.1;
}

.subtitle {
  font-size: 14px;
  color: #6b6254;
  letter-spacing: 0.04em;
}

/* ── Scroll stage ── */
.stage {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 0 24px;
  height: 520px;
  overflow: hidden;
  /* Soft fade at top and bottom */
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
}

/* ── Belt (one column) ── */
.belt {
  display: flex;
  flex-direction: column;
  gap: 10px;
  will-change: transform;
}

/*
  Seamless loop:
  - Each belt contains photos TWICE (original + clone).
  - beltUp:   translateY(0 → -50%)  — when CSS resets to 0, clone is
    visually where the original was → zero jump.
  - beltDown: translateY(-50% → 0)  — same principle, reversed.
  - Duration set via --spd CSS custom property on the element.
*/
.beltUp {
  animation: beltUp var(--spd, 20s) linear infinite;
}

.beltDown {
  animation: beltDown var(--spd, 20s) linear infinite;
}

@keyframes beltUp {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}

@keyframes beltDown {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0); }
}

/* ── Photo cell ── */
/*
  aspect-ratio is set inline per cell so heights are deterministic
  from first render — CSS knows exactly what -50% means before
  images finish loading.
*/
.cell {
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.85);
}

/* ── Responsive ── */
@media (max-width: 1023px) {
  .stage {
    grid-template-columns: repeat(2, 1fr);
  }
  /* Hide columns 3 and 4 */
  .belt:nth-child(3),
  .belt:nth-child(4) {
    display: none;
  }
}

@media (max-width: 767px) {
  .stage {
    grid-template-columns: 1fr;
    height: 480px;
    padding: 0 16px;
  }
  /* Hide columns 2, 3, and 4 */
  .belt:nth-child(2),
  .belt:nth-child(3),
  .belt:nth-child(4) {
    display: none;
  }
  .header {
    padding: 0 24px 40px;
  }
}
```

- [ ] **Step 2.2: Create the component**

Create `src/sections/GalleryMasonry/GalleryMasonry.jsx`:

```jsx
'use client'

import styles from './GalleryMasonry.module.css'

/*
  Aspect-ratio pattern per column (4 entries, cycles).
  Each column starts offset so neighbouring columns have
  different height rhythms — creating natural masonry variety.
*/
const COL_RATIOS = [
  ['3/4', '4/3', '3/4', '1/1'],   // col 0: portrait, landscape, portrait, square
  ['1/1', '3/4', '4/3', '3/4'],   // col 1: square, portrait, landscape, portrait
  ['4/3', '3/4', '1/1', '3/4'],   // col 2: landscape, portrait, square, portrait
  ['3/4', '1/1', '3/4', '4/3'],   // col 3: portrait, square, portrait, landscape
]

/* Scroll speed (CSS animation duration) per column */
const COL_SPEEDS = ['20s', '26s', '16s', '22s']

/* Animation direction per column — alternates for visual dynamism */
const COL_DIRS = ['up', 'down', 'up', 'down']

/*
  Distribute photos round-robin to 4 columns.
  If photos.length < 16, repeat the array until each column has ≥ 4 photos.
*/
function distributeToColumns(photos) {
  const MIN_PER_COL = 4
  const needed = 4 * MIN_PER_COL
  let pool = [...photos]
  while (pool.length < needed) pool = [...pool, ...photos]

  const cols = [[], [], [], []]
  pool.forEach((photo, i) => cols[i % 4].push(photo))
  return cols
}

export default function GalleryMasonry({
  eyebrow = 'Our Moments',
  sectionTitle = 'Memories',
  sectionSubtitle = 'A small collection of our favorite memories together',
  photos = [],
}) {
  const cols = distributeToColumns(photos)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{sectionTitle}</h2>
        {sectionSubtitle && <p className={styles.subtitle}>{sectionSubtitle}</p>}
      </div>

      <div className={styles.stage}>
        {cols.map((colPhotos, colIdx) => {
          /*
            Duplicate the column's photos: [a, b, c, d] → [a, b, c, d, a, b, c, d].
            Animation translates -50% (or starts at -50% for down), so when CSS
            resets the loop, the clone is in the exact visual position of the
            original → zero jump, seamless infinite loop.
          */
          const doubled = [...colPhotos, ...colPhotos]
          const beltClass = COL_DIRS[colIdx] === 'up' ? styles.beltUp : styles.beltDown

          return (
            <div
              key={colIdx}
              className={`${styles.belt} ${beltClass}`}
              style={{ '--spd': COL_SPEEDS[colIdx] }}
            >
              {doubled.map((photo, i) => (
                <div
                  key={i}
                  className={styles.cell}
                  style={{ aspectRatio: COL_RATIOS[colIdx][i % 4] }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt || ''}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2.3: Create the index re-export**

Create `src/sections/GalleryMasonry/index.js`:

```js
export { default } from './GalleryMasonry.jsx'
```

- [ ] **Step 2.4: Start dev server and verify the section renders**

If dev server is already running, it will hot-reload. Otherwise:

```powershell
npm run dev
```

Open `http://localhost:3000` (or whichever port is active — check terminal output).

Verify:
- Page loads without error
- `GalleryMasonry` section appears with 4 scrolling columns
- Columns 1 & 3 scroll upward, columns 2 & 4 scroll downward
- Photos loop seamlessly — no jump or flash when the belt resets
- `Gallery` and `GalleryHelix` sections no longer appear

- [ ] **Step 2.5: Verify responsive behaviour**

In browser DevTools, resize to:
- **767px wide** → only 1 column visible
- **900px wide** → exactly 2 columns visible
- **1200px wide** → 4 columns visible

All three states should show smooth scrolling with no layout overflow.

- [ ] **Step 2.6: Commit**

```powershell
git add src/sections/GalleryMasonry/
git commit -m "feat: add GalleryMasonry vertical conveyor-belt section"
```

---

## Self-Review

**Spec coverage:**
- ✅ Delete Gallery + GalleryHelix files → Task 1 steps 1.1–1.2
- ✅ Remove from sectionRegistry → Task 1 step 1.3
- ✅ Remove from pageConfig → Task 1 step 1.4
- ✅ 4 columns, alternating up/down → `COL_DIRS`, Task 2
- ✅ Different speeds per column → `COL_SPEEDS`, Task 2
- ✅ Seamless loop via photo duplication + `-50%` translation → comment in JSX + CSS, Task 2
- ✅ No hover-pause → no `animation-play-state` rule anywhere
- ✅ `aspect-ratio` inline for deterministic heights → Task 2 step 2.2
- ✅ Round-robin photo distribution → `distributeToColumns`, Task 2
- ✅ Responsive 4→2→1 → CSS @media rules, Task 2 step 2.1
- ✅ Register in sectionRegistry → Task 1 step 1.3
- ✅ pageConfig entry with 16 Unsplash photos → Task 1 step 1.4
- ✅ `'use client'` → present in GalleryMasonry.jsx
- ✅ CSS Modules only, no Tailwind → confirmed

**No placeholders:** All code blocks are complete and runnable.

**Type consistency:** `distributeToColumns` returns `Array<Array<{src, alt}>>`, consumed directly in JSX — consistent throughout.
