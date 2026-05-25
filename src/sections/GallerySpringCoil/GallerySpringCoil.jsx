'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BotanicalSketchLayer } from '../../components/BotanicalBorder.tsx'

gsap.registerPlugin(ScrollTrigger)

const buildConfig = (N) => {
  const safeN = Math.max(1, N)

  return {
    scrollPerPhoto: 130,
    rotationPerPhoto: 360 / safeN,
    pitchY: Math.max(44, Math.min(72, 560 / safeN)),
    radius: Math.max(170, Math.min(230, 135 + safeN * 4)),
    coilTiltX: 9,
    cardWidth: 160,
    cardHeight: 206,
    frontScale: 1.12,
    neighborGap: 65,
    depthOpacityMin: 0.2,
    depthBlurMax: 2.75,
    depthScaleMin: 0.4,
    sideOpacityMax: 0.36,
  }
}

const COMPONENT_STYLES = `
.gsc-section {
  position: relative;
  width: 100%;
  background: var(--color-bg, var(--color-cream, #f5f0eb));
  color: var(--color-text, var(--color-charcoal, #2a2118));
}

.gsc-scene {
  position: relative;
  height: 100vh;
  overflow: hidden;
  isolation: isolate;
}

.gsc-stage {
  position: absolute;
  inset: 0;
  z-index: 10;
  perspective: 820px;
  perspective-origin: 50% 48%;
}

.gsc-gallerySketch {
  mix-blend-mode: multiply;
}

/* ── Romantic bouquet silhouettes framing the scene at left & right.
   mix-blend-mode multiply ties them visually to the cream background
   without harsh edges. Photos that swing to the edges blend through
   the silhouette organically. */
.gsc-bouquet {
  position: absolute;
  bottom: -4%;
  height: clamp(300px, 60vh, 540px);
  width: auto;
  aspect-ratio: 200 / 320;
  color: var(--color-text, var(--color-charcoal, #6b5c4a));
  opacity: 0.18;
  pointer-events: none;
  z-index: 35;
  mix-blend-mode: multiply;
}

.gsc-bouquet svg { width: 100%; height: 100%; display: block; }

.gsc-bouquetLeft {
  left: -5%;
  transform: rotate(-10deg);
  transform-origin: bottom right;
}

.gsc-bouquetRight {
  right: -5%;
  transform: rotate(10deg) scaleX(-1);
  transform-origin: bottom left;
}

@media (max-width: 760px) {
  .gsc-bouquet { height: clamp(200px, 42vh, 320px); opacity: 0.14; }
  .gsc-bouquetLeft  { left: -16%; }
  .gsc-bouquetRight { right: -16%; }
}

.gsc-coilAnchor {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
}

.gsc-coil {
  position: relative;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  will-change: transform;
}

.gsc-coilCard {
  position: absolute;
  top: calc(var(--gsc-card-h, 230px) / -2);
  left: calc(var(--gsc-card-w, 170px) / -2);
  width: var(--gsc-card-w, 170px);
  height: var(--gsc-card-h, 230px);
  overflow: visible;
  pointer-events: none;
  transform-style: preserve-3d;
  will-change: transform, opacity, filter;
  transition: box-shadow 0.35s ease;
}

.gsc-coilButton {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
}

.gsc-coilFrame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border, rgba(255,255,255,0.34));
  border-radius: 12px;
  background: var(--color-card, rgba(255,255,255,0.16));
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}

.gsc-coilCard[data-front="true"] .gsc-coilFrame {
  border-color: rgba(255,255,255,0.78);
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.72),
    0 18px 70px rgba(0,0,0,0.22),
    0 0 90px var(--color-accent, rgba(200,180,150,0.3));
}

.gsc-coilButton:focus-visible .gsc-coilFrame {
  box-shadow:
    0 0 0 2px var(--color-bg, #f5f0eb),
    0 0 0 5px var(--color-accent, rgba(200,180,150,0.5)),
    0 18px 70px rgba(0,0,0,0.22);
}

.gsc-coilEntry,
.gsc-coilImage,
.gsc-lightboxImage {
  display: block;
  width: 100%;
  height: 100%;
}

.gsc-coilImage,
.gsc-lightboxImage {
  object-fit: cover;
  user-select: none;
}

.gsc-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, var(--color-card, rgba(255,255,255,0.22)), transparent),
    var(--color-bg, #f5f0eb);
  color: var(--color-text-muted, rgba(42,33,24,0.42));
  font-family: var(--font-display, serif);
  font-size: 22px;
  font-style: italic;
}

.gsc-coilCaption {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  width: min(100%, 20rem);
  margin: 0;
  color: var(--color-text, rgba(42,33,24,0.52));
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-style: italic;
  letter-spacing: 0.04em;
  line-height: 1.45;
  text-align: center;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.gsc-coilCard[data-front="true"] .gsc-coilCaption {
  opacity: 1;
}

.gsc-vignette,
.gsc-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gsc-vignette {
  z-index: 30;
  background: radial-gradient(
    ellipse 68% 68% at 50% 48%,
    transparent 26%,
    color-mix(in srgb, var(--color-bg, #f5f0eb) 58%, transparent) 58%,
    var(--color-bg, var(--color-cream, #f5f0eb)) 100%
  );
}

.gsc-fade {
  z-index: 31;
  background: linear-gradient(
    to bottom,
    var(--color-bg, var(--color-cream, #f5f0eb)) 0%,
    transparent 16%,
    transparent 82%,
    var(--color-bg, var(--color-cream, #f5f0eb)) 100%
  );
}

.gsc-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  padding: clamp(28px, 5vw, 48px) clamp(22px, 4vw, 40px);
  pointer-events: none;
}

.gsc-title {
  margin: 0 0 10px;
  color: var(--color-text, var(--color-charcoal, #2a2118));
  font-family: var(--font-display, serif);
  font-size: clamp(42px, 6vw, 76px);
  font-style: italic;
  font-weight: 500;
  line-height: 0.95;
}

.gsc-subtitle {
  margin: 0;
  max-width: 620px;
  color: var(--color-text-muted, var(--color-charcoal-light, rgba(42,33,24,0.62)));
  font-family: var(--font-body, sans-serif);
  font-size: clamp(15px, 2vw, 22px);
  letter-spacing: 0.08em;
  line-height: 1.55;
}

.gsc-counter {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(24px, 4vw, 42px);
  z-index: 60;
  display: grid;
  justify-items: center;
  gap: 8px;
  color: var(--color-text-muted, rgba(42,33,24,0.62));
  font-family: var(--font-body, sans-serif);
  text-align: center;
  text-transform: uppercase;
  pointer-events: none;
}

.gsc-count {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.18em;
}

.gsc-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.gsc-dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-text, rgba(0,0,0,0.15));
  opacity: 0.28;
  transition: width 0.3s ease, opacity 0.3s ease, background-color 0.3s ease;
}

.gsc-dotActive {
  width: 18px;
  background: var(--color-text, rgba(0,0,0,0.5));
  opacity: 0.7;
}

.gsc-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.gsc-lightboxFigure {
  max-width: min(92vw, 1120px);
  max-height: 88vh;
  margin: 0;
  display: grid;
  justify-items: center;
  gap: 14px;
}

.gsc-lightboxImage {
  max-width: 100%;
  max-height: 78vh;
  border-radius: 12px;
  box-shadow: 0 24px 72px rgba(0,0,0,0.52);
}

.gsc-lightboxCaption {
  margin: 0;
  max-width: 64ch;
  color: rgba(255,255,255,0.92);
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}

.gsc-lightboxButton {
  position: absolute;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 1px solid rgba(255,255,255,0.24);
  border-radius: 999px;
  color: #fff;
  background: rgba(255,255,255,0.10);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  backdrop-filter: blur(10px);
}

.gsc-lightboxButton:hover,
.gsc-lightboxButton:focus-visible {
  background: rgba(255,255,255,0.22);
}

.gsc-close { top: 24px; right: 24px; }
.gsc-prev { top: 50%; left: 24px; transform: translateY(-50%); }
.gsc-next { top: 50%; right: 24px; transform: translateY(-50%); }

@media (max-width: 760px) {
  .gsc-coilCard {
    --gsc-card-w: 131px !important;
    --gsc-card-h: 165px !important;
  }

  .gsc-stage {
    perspective: 720px;
  }

  .gsc-title {
    font-size: clamp(36px, 12vw, 56px);
  }

  .gsc-subtitle {
    max-width: 18rem;
    font-size: 13px;
  }
}
`

function normalizePhotos(photos) {
  return photos.map((photo, index) => ({
    id: photo.id ?? index,
    src: photo.src || '',
    caption: photo.caption || photo.alt || '',
  }))
}

function clampIndex(index, total) {
  return Math.max(0, Math.min(total - 1, index))
}

/**
 * Stylised bouquet silhouette — used twice (left + right) to frame the
 * coil scene. The right side mirrors via `scaleX(-1)` in CSS. Inherits
 * its colour from the parent via `fill="currentColor"`.
 */
function BouquetSilhouette() {
  return (
    <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYEnd meet">
      <g fill="currentColor">
        {/* Stems descending into the ribbon wrap */}
        <g stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M 100 200 C 88 240 70 280 60 320" />
          <path d="M 100 200 L 100 320" />
          <path d="M 100 200 C 112 240 130 280 140 320" />
        </g>
        {/* Ribbon at base */}
        <path d="M 78 220 L 122 220 L 120 248 L 80 248 Z" opacity="0.55" />

        {/* Leaves (back and side) */}
        <ellipse cx="48"  cy="160" rx="14" ry="42" opacity="0.40" transform="rotate(-32 48 160)" />
        <ellipse cx="152" cy="155" rx="14" ry="42" opacity="0.40" transform="rotate(32 152 155)" />
        <ellipse cx="34"  cy="110" rx="11" ry="32" opacity="0.32" transform="rotate(-55 34 110)" />
        <ellipse cx="166" cy="105" rx="11" ry="32" opacity="0.32" transform="rotate(55 166 105)" />
        <ellipse cx="80"  cy="190" rx="9"  ry="22" opacity="0.36" transform="rotate(-15 80 190)" />
        <ellipse cx="120" cy="190" rx="9"  ry="22" opacity="0.36" transform="rotate(15 120 190)" />

        {/* Central main flower (peony silhouette) */}
        <g transform="translate(100 108)" opacity="0.78">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-26" rx="22" ry="34" transform={`rotate(${r})`} />
          ))}
          <circle r="14" opacity="0.9" />
        </g>

        {/* Top-left rose */}
        <g transform="translate(60 75)" opacity="0.68">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-18" rx="13" ry="22" transform={`rotate(${r})`} />
          ))}
          <circle r="9" opacity="0.9" />
        </g>

        {/* Top-right rose */}
        <g transform="translate(140 80)" opacity="0.68">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-16" rx="12" ry="20" transform={`rotate(${r})`} />
          ))}
          <circle r="8" opacity="0.9" />
        </g>

        {/* Buds */}
        <circle cx="78"  cy="158" r="10" opacity="0.6" />
        <circle cx="128" cy="170" r="9"  opacity="0.6" />
        <circle cx="105" cy="180" r="11" opacity="0.6" />
      </g>
    </svg>
  )
}

function CoilPhoto({ photo, index, config, cardRef, hasEntered, onOpen }) {
  const label = photo.caption || `Foto ${index + 1}`

  return (
    <div
      ref={cardRef}
      className="gsc-coilCard"
      style={{
        '--gsc-card-w': `${config.cardWidth}px`,
        '--gsc-card-h': `${config.cardHeight}px`,
      }}
      data-front="false"
    >
      <motion.div
        className="gsc-coilEntry"
        initial={{ y: 80, opacity: 0 }}
        animate={hasEntered ? { y: 0, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 80, damping: 14, delay: index * 0.04 }}
      >
        <button
          type="button"
          className="gsc-coilButton"
          onClick={() => onOpen(index)}
          aria-label={label}
          tabIndex={-1}
        >
          <span className="gsc-coilFrame">
            {photo.src ? (
              <img
                className="gsc-coilImage"
                src={photo.src}
                alt={label}
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={(event) => { event.currentTarget.style.display = 'none' }}
              />
            ) : (
              <span className="gsc-placeholder">foto {index + 1}</span>
            )}
          </span>
          {photo.caption && <span className="gsc-coilCaption">{photo.caption}</span>}
        </button>
      </motion.div>
    </div>
  )
}

export default function GallerySpringCoil({
  photos = [],
  sectionTitle = 'Moments',
  sectionSubtitle = 'Memori kami menjalin dalam spiral kenangan',
}) {
  const displayPhotos = useMemo(() => normalizePhotos(photos), [photos])
  const total = displayPhotos.length
  const config = useMemo(() => buildConfig(total), [total])
  const gallerySketchSeed = useMemo(() => (Date.now() ^ 0x6D2B79F5 ^ total) >>> 0, [total])

  const sectionRef = useRef(null)
  const sceneRef = useRef(null)
  const coilRef = useRef(null)
  const cardsRef = useRef([])
  const scrollProgress = useRef(0)
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const lastActiveRef = useRef(-1)

  const [hasEntered, setHasEntered] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [sectionElement, setSectionElement] = useState(null)
  const [gallerySketchVisible, setGallerySketchVisible] = useState(false)

  const lightboxPhoto = lightboxIndex !== null ? displayPhotos[lightboxIndex] : null

  const setCardRef = (index) => (element) => {
    if (element) cardsRef.current[index] = element
  }

  const setSectionRef = useCallback((element) => {
    sectionRef.current = element
    setSectionElement(element)
  }, [])

  // ScrollTrigger pins the section; rAF moves the actual coil cards.
  useEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    const coil = coilRef.current
    if (!section || !scene || !coil || total === 0) return undefined

    cardsRef.current.length = total

    let raf = 0
    let inView = false

    const applyFrame = () => {
      if (!inView) {
        raf = 0
        return
      }

      const progress = scrollProgress.current
      const activeRaw = progress * (total - 1)
      const nextActive = clampIndex(Math.round(activeRaw), total)
      const rotY = -(activeRaw * config.rotationPerPhoto)
      const activeBaseY = (activeRaw - (total - 1) / 2) * config.pitchY
      const riseY = -activeBaseY
      const tiltX = (mouse.current.y - 0.5) * 7
      const tiltY = (mouse.current.x - 0.5) * 10

      coil.style.transform =
        `rotateX(${config.coilTiltX + tiltX}deg) rotateY(${rotY + tiltY}deg) translateY(${riseY}px)`

      for (let index = 0; index < total; index += 1) {
        const card = cardsRef.current[index]
        if (!card) continue

        const button = card.querySelector('.gsc-coilButton')
        const staticAngle = index * config.rotationPerPhoto
        const effective = ((staticAngle + rotY) % 360 + 360) % 360
        const depthNorm = effective > 180 ? 360 - effective : effective
        const depthT = depthNorm / 180
        const indexDelta = index - activeRaw
        const frontness = Math.max(0, 1 - Math.abs(indexDelta))
        const easedFrontness = frontness * frontness * (3 - 2 * frontness)
        const nearNeighbor = Math.max(0, 1 - Math.abs(Math.abs(indexDelta) - 1))
        const yGap = Math.sign(indexDelta) * config.neighborGap * nearNeighbor
        const yOffset = (index - (total - 1) / 2) * config.pitchY + yGap
        const isFront = index === nextActive
        const sideScale = Math.max(config.depthScaleMin, config.sideOpacityMax + (1 - depthT) * 0.18)
        const scale = sideScale + (config.frontScale - sideScale) * easedFrontness
        const sideOpacity = Math.max(config.depthOpacityMin, config.sideOpacityMax * (1 - depthT * 0.82))
        const opacity = sideOpacity + (1 - sideOpacity) * easedFrontness
        const blur = depthT * config.depthBlurMax * (1 - easedFrontness)

        card.style.opacity = opacity.toFixed(3)
        card.style.filter = `blur(${blur.toFixed(2)}px)`
        card.style.transform = [
          `rotateY(${staticAngle}deg)`,
          `translateZ(${config.radius}px)`,
          `translateY(${yOffset}px)`,
          `scale(${scale.toFixed(3)})`,
        ].join(' ')
        card.style.zIndex = String(Math.round((1 - depthT) * 40 + easedFrontness * 100))
        card.style.pointerEvents = isFront ? 'auto' : 'none'
        card.dataset.front = isFront ? 'true' : 'false'

        if (button) {
          button.tabIndex = isFront ? 0 : -1
        }
      }

      if (nextActive !== lastActiveRef.current) {
        lastActiveRef.current = nextActive
        setActiveIndex(nextActive)
      }

      raf = requestAnimationFrame(applyFrame)
    }

    const startLoop = () => {
      inView = true
      if (!raf) raf = requestAnimationFrame(applyFrame)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
          setGallerySketchVisible(true)
          startLoop()
        }
      },
      { threshold: 0.05 },
    )

    observer.observe(section)

    const onPointerMove = (event) => {
      const rect = scene.getBoundingClientRect()
      mouse.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      }
    }

    const onPointerLeave = () => {
      mouse.current = { x: 0.5, y: 0.5 }
    }

    scene.addEventListener('pointermove', onPointerMove)
    scene.addEventListener('pointerleave', onPointerLeave)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${total * config.scrollPerPhoto}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => {
          setGallerySketchVisible(true)
          startLoop()
        },
        onEnterBack: () => {
          setGallerySketchVisible(true)
          startLoop()
        },
        onLeave: () => {
          inView = false
          setGallerySketchVisible(false)
        },
        onLeaveBack: () => {
          inView = false
          setGallerySketchVisible(false)
        },
        onUpdate: (self) => {
          scrollProgress.current = self.progress
          startLoop()
        },
        onRefresh: (self) => {
          // After GSAP recalculates on viewport resize, restart the loop
          // if the section is currently active (progress 0–1 exclusive).
          if (self.progress > 0 && self.progress < 1) {
            inView = true
            startLoop()
          }
        },
      })
    }, section)

    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setHasEntered(true)
      startLoop()
    }

    return () => {
      observer.disconnect()
      scene.removeEventListener('pointermove', onPointerMove)
      scene.removeEventListener('pointerleave', onPointerLeave)
      if (raf) cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [config, total])

  // Lightbox keyboard controls.
  useEffect(() => {
    if (lightboxIndex === null || total === 0) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowLeft') setLightboxIndex((index) => (index - 1 + total) % total)
      if (event.key === 'ArrowRight') setLightboxIndex((index) => (index + 1) % total)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, total])

  return (
    <>
      <style>{COMPONENT_STYLES}</style>
      <section ref={setSectionRef} className="gsc-section" aria-label={sectionTitle}>
        <div ref={sceneRef} className="gsc-scene">
          <BotanicalSketchLayer
            seed={gallerySketchSeed}
            fixed={false}
            hiddenBelow={520}
            color="var(--color-text, #6b5c4a)"
            desktopOpacity={0.22}
            tabletOpacity={0.16}
            desktopWidth="clamp(120px, 14vw, 220px)"
            tabletWidth="clamp(70px, 12vw, 120px)"
            leftId="gallery-botanical-left"
            rightId="gallery-botanical-right"
            zIndex={2}
            scrollTrigger={sectionElement}
            animateOnScroll={false}
            visible={gallerySketchVisible}
            style={{ position: 'absolute' }}
          />

          {/* Romantic bouquet silhouettes framing the coil scene */}
          <div className="gsc-bouquet gsc-bouquetLeft" aria-hidden="true">
            <BouquetSilhouette />
          </div>
          <div className="gsc-bouquet gsc-bouquetRight" aria-hidden="true">
            <BouquetSilhouette />
          </div>

          <div className="gsc-stage">
            <div className="gsc-coilAnchor">
              <div ref={coilRef} className="gsc-coil">
                {displayPhotos.map((photo, index) => (
                  <CoilPhoto
                    key={photo.id}
                    photo={photo}
                    index={index}
                    config={config}
                    cardRef={setCardRef(index)}
                    hasEntered={hasEntered}
                    onOpen={setLightboxIndex}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="gsc-vignette" aria-hidden="true" />
          <div className="gsc-fade" aria-hidden="true" />

          {(sectionTitle || sectionSubtitle) && (
            <header className="gsc-header">
              {sectionTitle && <h2 className="gsc-title">{sectionTitle}</h2>}
              {sectionSubtitle && <p className="gsc-subtitle">{sectionSubtitle}</p>}
            </header>
          )}

          {total > 0 && (
            <div className="gsc-counter" aria-live="polite">
              <p className="gsc-count">FOTO {activeIndex + 1} DARI {total}</p>
              <div className="gsc-dots" aria-hidden="true">
                {displayPhotos.map((photo, index) => (
                  <span
                    key={photo.id}
                    className={index === activeIndex ? 'gsc-dot gsc-dotActive' : 'gsc-dot'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightboxPhoto && lightboxIndex !== null && (
          <motion.div
            className="gsc-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxPhoto.caption || `Foto ${lightboxIndex + 1}`}
            onClick={() => setLightboxIndex(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              className="gsc-lightboxButton gsc-close"
              onClick={(event) => {
                event.stopPropagation()
                setLightboxIndex(null)
              }}
              aria-label="Tutup lightbox"
            >
              x
            </button>

            {total > 1 && (
              <>
                <button
                  type="button"
                  className="gsc-lightboxButton gsc-prev"
                  onClick={(event) => {
                    event.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + total) % total)
                  }}
                  aria-label="Foto sebelumnya"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="gsc-lightboxButton gsc-next"
                  onClick={(event) => {
                    event.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % total)
                  }}
                  aria-label="Foto berikutnya"
                >
                  &gt;
                </button>
              </>
            )}

            <motion.figure
              className="gsc-lightboxFigure"
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.86, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 190, damping: 22 }}
            >
              {lightboxPhoto.src ? (
                <img
                  className="gsc-lightboxImage"
                  src={lightboxPhoto.src}
                  alt={lightboxPhoto.caption || `Foto ${lightboxIndex + 1}`}
                />
              ) : (
                <span className="gsc-placeholder">foto {lightboxIndex + 1}</span>
              )}
              {lightboxPhoto.caption && (
                <figcaption className="gsc-lightboxCaption">
                  {lightboxPhoto.caption}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
