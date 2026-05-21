/* ============================================================================
   ANIMATION PRESETS — reusable Framer Motion variants & easings.

   Pass these into <motion.*> components, or import the easing curve
   directly into any transition object.

   import { fadeUp, EASE_OUT_QUART } from '../utils/animationPresets.js'
   <motion.div variants={fadeUp} initial="hidden" whileInView="visible" />
   ============================================================================ */

// Premium ease-out curves
export const EASE_OUT_QUART = [0.16, 1, 0.3, 1]
export const EASE_OUT_EXPO  = [0.19, 1, 0.22, 1]
export const EASE_IN_OUT    = [0.45, 0, 0.55, 1]

// Spring physics
export const SPRING_GENTLE = { type: 'spring', stiffness: 110, damping: 22 }
export const SPRING_SOFT   = { type: 'spring', stiffness: 80,  damping: 18 }
export const SPRING_QUICK  = { type: 'spring', stiffness: 220, damping: 26 }

// Variant presets
export const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT_QUART },
  },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.85, ease: EASE_OUT_QUART },
  },
}

export const slideFromLeft = {
  hidden:  { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.95, ease: EASE_OUT_QUART },
  },
}

export const slideFromRight = {
  hidden:  { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.95, ease: EASE_OUT_QUART },
  },
}

export const stagger = (childDelay = 0.18) => ({
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: childDelay,
      delayChildren: 0.2,
    },
  },
})

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_OUT_QUART },
  },
}

export const clipReveal = {
  hidden:  { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.1, ease: EASE_OUT_QUART },
  },
}

export default {
  EASE_OUT_QUART,
  EASE_OUT_EXPO,
  EASE_IN_OUT,
  SPRING_GENTLE,
  SPRING_SOFT,
  SPRING_QUICK,
  fadeUp,
  fadeIn,
  slideFromLeft,
  slideFromRight,
  stagger,
  scaleIn,
  clipReveal,
}
