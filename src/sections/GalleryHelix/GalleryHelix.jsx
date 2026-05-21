'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './GalleryHelix.module.css'

/* ────────────────────────────────────────────────────────────────
 *  CONFIG — kumpulan konstanta yang gampang di-tweak
 *  Semua parameter layout dihitung otomatis dari jumlah foto.
 * ──────────────────────────────────────────────────────────────── */
const CONFIG = {
  goldenAngle: 137.508,    // golden angle untuk distribusi spiral
  tiltXBase: 8,            // tilt forward fixed (derajat)
  tiltMaxParallax: 6,      // tilt parallax dari mouse (derajat)
  lerpFactor: 0.08,        // smoothing scroll (0..1). makin kecil = makin halus
  cardWidth: 100,
  cardHeight: 150,
  opacityMin: 0.12,
  opacityMax: 1.0,
  scaleMin: 0.78,
  scaleMax: 1.0,
}

/** Auto-calculate layout parameters based on photo count. */
function calcLayout(N) {
  return {
    radius: Math.max(120, Math.min(220, 80 + N * 5)),
    yStep: Math.max(40, Math.min(70, 500 / Math.max(1, N))),
  }
}

/** Modular distance between two angles (degrees). */
function angleDelta(a, b) {
  const d = Math.abs(((a - b) % 360 + 360) % 360)
  return Math.min(d, 360 - d)
}

/** Tiny camera icon for the placeholder card. */
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h3l2-2h4l2 2h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export default function GalleryHelix({
  photos = [],
  sectionTitle = 'Gallery',
  sectionSubtitle = '',
}) {
  const N = photos.length
  const { radius, yStep } = calcLayout(N)
  const totalHeight = N * yStep

  /* Refs — animation state via refs only (no setState in rAF). */
  const sectionRef = useRef(null)
  const sceneRef = useRef(null)
  const helixRef = useRef(null)
  const cardRefs = useRef([])

  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  const setCardRef = (i) => (el) => { if (el) cardRefs.current[i] = el }

  /* Single useEffect = single closure, all listeners + rAF together. */
  useEffect(() => {
    const sectionEl = sectionRef.current
    const sceneEl = sceneRef.current
    const helixEl = helixRef.current
    if (!sectionEl || !sceneEl || !helixEl) return undefined

    let raf = 0
    let visible = false
    let scrollTarget = 0
    let scrollCurrent = 0
    let tiltXTarget = 0
    let tiltXCurrent = 0
    let tiltYTarget = 0
    let tiltYCurrent = 0
    let lastReportedIdx = -1
    let frameCounter = 0

    /** Compute scroll progress 0→1 as the section traverses the viewport. */
    const readScroll = () => {
      const rect = sectionEl.getBoundingClientRect()
      const total = window.innerHeight + rect.height
      if (total <= 0) return
      const p = 1 - rect.bottom / total
      scrollTarget = Math.max(0, Math.min(1, p))
    }

    /** Single rAF tick: lerp values, write transforms. */
    const tick = () => {
      if (!visible) { raf = 0; return }

      // Lerp scroll + tilt toward targets for buttery feel
      scrollCurrent += (scrollTarget - scrollCurrent) * CONFIG.lerpFactor
      tiltXCurrent  += (tiltXTarget  - tiltXCurrent)  * CONFIG.lerpFactor
      tiltYCurrent  += (tiltYTarget  - tiltYCurrent)  * CONFIG.lerpFactor

      const p = scrollCurrent
      const rotY = p * 360
      const riseY = totalHeight > 0
        ? -((p * totalHeight) % totalHeight)
        : 0

      helixEl.style.transform =
        `rotateX(${CONFIG.tiltXBase + tiltXCurrent}deg) ` +
        `rotateY(${rotY + tiltYCurrent}deg) ` +
        `translateY(${riseY}px)`

      // Per-card depth → opacity decay. Front photo = effective angle 270°.
      let closestIdx = 0
      let closestDist = Infinity

      for (let i = 0; i < N; i++) {
        const eff = ((i * CONFIG.goldenAngle + rotY) % 360 + 360) % 360
        const sinEff = Math.sin(eff * Math.PI / 180)
        // normalized depth: 0 = farthest (back), 1 = closest (front)
        const depth = (1 - sinEff) / 2

        const opacity = CONFIG.opacityMin + (CONFIG.opacityMax - CONFIG.opacityMin) * depth
        const scale = CONFIG.scaleMin + (CONFIG.scaleMax - CONFIG.scaleMin) * depth

        const card = cardRefs.current[i]
        if (card) {
          card.style.opacity = opacity.toFixed(3)
          card.style.setProperty('--depth-scale', scale.toFixed(3))
        }

        const d = angleDelta(eff, 270)
        if (d < closestDist) { closestDist = d; closestIdx = i }
      }

      // Throttle activeIdx updates every 4 frames to keep React re-renders cheap
      if ((frameCounter++ & 3) === 0 && closestIdx !== lastReportedIdx) {
        lastReportedIdx = closestIdx
        setActiveIdx(closestIdx)
      }

      raf = requestAnimationFrame(tick)
    }

    /** Mouse parallax — tilt the scene a few degrees toward the cursor. */
    const onMouseMove = (e) => {
      const rect = sceneEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      tiltXTarget = -dy * CONFIG.tiltMaxParallax
      tiltYTarget =  dx * CONFIG.tiltMaxParallax
    }
    const onMouseLeave = () => { tiltXTarget = 0; tiltYTarget = 0 }

    /** Visibility observer — start/stop rAF based on viewport intersection. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) {
          readScroll()
          raf = requestAnimationFrame(tick)
        }
      },
      { threshold: 0 },
    )
    observer.observe(sectionEl)

    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    sceneEl.addEventListener('mousemove', onMouseMove)
    sceneEl.addEventListener('mouseleave', onMouseLeave)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
      sceneEl.removeEventListener('mousemove', onMouseMove)
      sceneEl.removeEventListener('mouseleave', onMouseLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [N, yStep, radius, totalHeight])

  /* Lightbox keyboard navigation. */
  useEffect(() => {
    if (lightboxIdx === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape')    setLightboxIdx(null)
      if (e.key === 'ArrowLeft')  setLightboxIdx((i) => (i - 1 + N) % N)
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % N)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, N])

  /* Static per-card base transform (set once via inline style). */
  const baseTransform = (i) => {
    const angle = i * CONFIG.goldenAngle
    const yOff  = (i - N / 2) * yStep
    return `rotateY(${angle}deg) translateX(${radius}px) translateY(${yOff}px)`
  }

  const lightboxPhoto = lightboxIdx !== null ? photos[lightboxIdx] : null

  return (
    <section ref={sectionRef} className={styles.section} aria-label={sectionTitle}>
      {(sectionTitle || sectionSubtitle) && (
        <header className={styles.header}>
          {sectionTitle && <h2 className={styles.title}>{sectionTitle}</h2>}
          {sectionSubtitle && <p className={styles.subtitle}>{sectionSubtitle}</p>}
        </header>
      )}

      <div ref={sceneRef} className={styles.scene}>
        <div ref={helixRef} className={styles.helix}>
          {photos.map((p, i) => (
            <button
              key={i}
              ref={setCardRef(i)}
              type="button"
              className={styles.card}
              style={{ transform: baseTransform(i) }}
              onClick={() => setLightboxIdx(i)}
              aria-label={p.caption || `Foto ${i + 1}`}
            >
              {p.src ? (
                <img
                  src={p.src}
                  alt={p.caption || ''}
                  className={styles.cardImg}
                  loading="lazy"
                  draggable={false}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <span className={styles.placeholder} aria-hidden="true">
                  <CameraIcon />
                  <span className={styles.placeholderNum}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
              )}
              {p.caption && <span className={styles.caption}>{p.caption}</span>}
            </button>
          ))}
        </div>

        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.fade} aria-hidden="true" />
      </div>

      <div className={styles.counter} aria-live="polite">
        <span className={styles.diamond}>◆</span>
        <span>Foto {activeIdx + 1} dari {N}</span>
        <span className={styles.diamond}>◆</span>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxIdx !== null && lightboxPhoto && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={`${styles.lbBtn} ${styles.lbClose}`}
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null) }}
            aria-label="Tutup"
          >✕</button>

          {N > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lbBtn} ${styles.lbPrev}`}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + N) % N) }}
                aria-label="Sebelumnya"
              >‹</button>
              <button
                type="button"
                className={`${styles.lbBtn} ${styles.lbNext}`}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % N) }}
                aria-label="Berikutnya"
              >›</button>
            </>
          )}

          <figure className={styles.lbFigure} onClick={(e) => e.stopPropagation()}>
            {lightboxPhoto.src ? (
              <img src={lightboxPhoto.src} alt={lightboxPhoto.caption || ''} className={styles.lbImg} />
            ) : (
              <div className={styles.lbPlaceholder} aria-hidden="true">
                <CameraIcon />
              </div>
            )}
            {lightboxPhoto.caption && (
              <figcaption className={styles.lbCaption}>{lightboxPhoto.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  )
}
