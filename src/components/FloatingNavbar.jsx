'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import styles from './FloatingNavbar.module.css'

/**
 * Floating in-page navigation.
 *   • Appears after the user scrolls past `threshold` px.
 *   • Centered horizontally via flex container (no transform-translate
 *     trickery that could clip on narrow viewports).
 *   • Click handler does smooth-scroll to the target section via
 *     `scrollIntoView({ behavior: 'smooth' })` for cross-browser support.
 *   • Active item is highlighted via IntersectionObserver — whichever
 *     section is most-visible in the viewport gets the active style.
 *
 * To hide a section from the nav, set `navHidden: true` on its config
 * entry in pageConfig.js. Override the label with `navLabel: '…'`.
 */
const DEFAULT_LABELS = {
  hero: 'Top',
  countdown: 'Countdown',
  ourStory: 'Story',
  eventDetails: 'Events',
  brideGroom: 'Couple',
  weddingParty: 'Party',
  gallery: 'Gallery',
  schedule: 'Schedule',
  rsvp: 'RSVP',
  weddingGift: 'Gift',
  registry: 'Registry',
  accommodations: 'Stay',
  faq: 'FAQ',
  guestbook: 'Notes',
  playlist: 'Playlist',
  footer: 'End',
}

export default function FloatingNavbar({ sections = [], threshold = 600 }) {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const listRef = useRef(null)

  // Show/hide based on scroll position
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  // Build the list of visible nav items
  const items = sections
    .filter((s) => s.enabled !== false && !s.navHidden)
    .map((s) => ({
      id: s.id,
      label: s.navLabel || DEFAULT_LABELS[s.type] || s.id,
    }))

  // Track which section the user is currently viewing
  useEffect(() => {
    if (items.length === 0) return undefined

    // Defer to a microtask to ensure section DOM nodes exist
    const setup = () => {
      const targets = items
        .map((it) => document.getElementById(it.id))
        .filter(Boolean)
      if (targets.length === 0) return null

      const observer = new IntersectionObserver(
        (entries) => {
          // Pick the entry with the largest intersectionRatio
          const sorted = [...entries]
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          if (sorted[0]) setActiveId(sorted[0].target.id)
        },
        {
          // Trigger when section's center ~ viewport center
          rootMargin: '-30% 0px -30% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1],
        },
      )
      targets.forEach((el) => observer.observe(el))
      return observer
    }

    let observer = setup()
    // Re-setup once after a short delay in case sections were
    // lazy-loaded and not yet in the DOM at first mount
    const t = setTimeout(() => {
      if (!observer) observer = setup()
    }, 300)

    return () => {
      clearTimeout(t)
      observer?.disconnect()
    }
  }, [items])

  const handleClick = (e, id) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Optimistic update — observer will sync the real active state shortly
      setActiveId(id)
    }
  }

  const checkScroll = () => {
    const el = listRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scrollNav = (dir) => {
    const el = listRef.current
    if (!el) return
    el.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = listRef.current
    if (!el) return undefined
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [visible, items.length])

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.shell}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!visible}
        >
          <nav className={styles.nav} aria-label="Section navigation">
            {canScrollLeft && (
              <button
                type="button"
                className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                onClick={() => scrollNav(-1)}
                aria-label="Scroll nav left"
              >‹</button>
            )}
            <ul ref={listRef} className={styles.list}>
              {items.map((it) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => handleClick(e, it.id)}
                    className={`${styles.link} ${
                      activeId === it.id ? styles.linkActive : ''
                    }`}
                    aria-current={activeId === it.id ? 'true' : undefined}
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
            {canScrollRight && (
              <button
                type="button"
                className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                onClick={() => scrollNav(1)}
                aria-label="Scroll nav right"
              >›</button>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
