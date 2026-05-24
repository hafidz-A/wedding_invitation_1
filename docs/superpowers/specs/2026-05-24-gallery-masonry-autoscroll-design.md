# Spec — GalleryMasonry AutoScroll + Remove Old Galleries

**Date:** 2026-05-24
**Status:** Approved

---

## Goal

1. Delete `Gallery` and `GalleryHelix` sections completely (components, CSS, registry, config).
2. Create `GalleryMasonry` — a vertical conveyor-belt gallery: 4 columns, each column loops its own set of photos infinitely, alternating up/down direction, different speeds. No hover-pause.
3. Register `galleryMasonry` in `sectionRegistry.js` and add a default entry to `pageConfig.js`.

---

## Part 1 — Delete old gallery sections

### Files to delete

```
src/sections/Gallery/Gallery.jsx
src/sections/Gallery/Gallery.module.css
src/sections/GalleryHelix/GalleryHelix.jsx
src/sections/GalleryHelix/GalleryHelix.module.css
src/sections/GalleryHelix/index.js
```

### Files to update

**`src/config/sectionRegistry.js`** — remove entries:
```js
// DELETE these two lines:
gallery:      lazy(() => import('../sections/Gallery/Gallery.jsx')),
galleryHelix: lazy(() => import('../sections/GalleryHelix/index.js')),
```

**`src/config/pageConfig.js`** — remove the two section objects with `type: 'gallery'` and `type: 'galleryHelix'`, keep `type: 'gallerySpringCoil'`.

---

## Part 2 — GalleryMasonry component

### File map

| File | Action |
|---|---|
| `src/sections/GalleryMasonry/GalleryMasonry.jsx` | Create — React component |
| `src/sections/GalleryMasonry/GalleryMasonry.module.css` | Create — all styles |
| `src/sections/GalleryMasonry/index.js` | Create — re-export |

---

### Visual behaviour

- **4 columns**, each column is an independent vertical conveyor belt.
- Columns 1 & 3 scroll **up**. Columns 2 & 4 scroll **down**.
- Each column has a different scroll speed (col1: 20s, col2: 26s, col3: 16s, col4: 22s per full cycle).
- **No hover-pause.** Columns always move.
- **Seamless infinite loop:** every column contains its assigned photos **twice** (original + identical clone appended). CSS animation translates `0 → -50%` (up) or `-50% → 0` (down) — when it resets, the clone is in the same visual position as the original → zero jump.
- Each photo cell uses an **explicit `aspect-ratio`** (not natural image height) so the `-50%` translation is deterministic from first render, before images finish loading.
- **Aspect-ratio pattern per column** (cycles through 4 photos → repeats):
  - Portrait `3/4`, Landscape `4/3`, Portrait `3/4`, Square `1/1`
  - Next column starts offset: Square, Portrait, Landscape, Portrait — etc.
  - This creates natural height variety across columns.
- **Soft fade mask** top and bottom (`mask-image` linear-gradient) so photos fade in/out at edges.
- **No caption overlay.** Clean, no text on photos.
- Section background: `#d6d1be` (warmCream, consistent with other sections).

---

### Props

```js
{
  sectionTitle:    'Memories',           // string
  sectionSubtitle: 'Our favorite moments together',  // string
  eyebrow:         'Our Moments',        // string
  photos: [
    { src: '...', alt: '' },
    // … ideally 16 photos (4 per column). If fewer, photos repeat to fill.
  ]
}
```

Photos are distributed to columns **round-robin by index**:
- Col 1 → photos[0], photos[4], photos[8], photos[12]
- Col 2 → photos[1], photos[5], photos[9], photos[13]
- Col 3 → photos[2], photos[6], photos[10], photos[14]
- Col 4 → photos[3], photos[7], photos[11], photos[15]

If `photos.length < 16`, repeat the array until each column has at least 4 photos.

---

### Responsive breakpoints

| Viewport | Columns |
|---|---|
| ≥ 1024px | 4 |
| 768–1023px | 2 (cols 1&2 only, cols 3&4 hidden) |
| < 768px | 1 (col 1 only) |

On tablet/mobile, the hidden columns' photos can be merged into the visible columns — or simply hide the column elements with `display: none`. **Simpler approach: hide with CSS.** The section still works correctly.

---

### CSS animation — key rules

```css
/* Seamless loop — photos duplicated in HTML, translate exactly -50% */
@keyframes beltUp {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
@keyframes beltDown {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0); }
}

/* No animation-play-state change on hover */
.belt { animation: beltUp var(--spd) linear infinite; }
```

---

### Section height

Fixed at `520px` on desktop. `overflow: hidden` on the stage container clips the scrolling belts.

---

## Part 3 — Register + pageConfig entry

### `sectionRegistry.js`

Add:
```js
galleryMasonry: lazy(() => import('../sections/GalleryMasonry/index.js')),
```

### `pageConfig.js`

Replace the removed `gallery` and `galleryHelix` entries with one `galleryMasonry` entry (enabled: `true`), placed between `brideGroom` and `gallerySpringCoil`:

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

---

## Conventions to preserve

- `'use client'` at top of component file (all section components are client-only).
- CSS Modules for all styles — no inline style objects except `style={{ '--spd': '20s' }}` custom properties.
- No Tailwind, no styled-components.
- `motion` / `gsap` not needed — pure CSS animation suffices.
- Section component receives a flat props object (destructured from `section.props` by SectionRenderer).
