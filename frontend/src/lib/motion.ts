import type { Variants } from 'motion/react'

export const ease = [0.2, 0.7, 0.2, 1] as const

/** Stagger'lı grupların çocukları bu varyantı kullanır. */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 22, transition: { duration: 0 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

/** Başlık kelimeleri: maskenin altından yukarı kayar */
export const revealWord: Variants = {
  hidden: { y: '105%', transition: { duration: 0 } },
  show: { y: '0%', transition: { duration: 0.7, ease } },
}

/** Çizgiler kendini çizer */
export const revealLine: Variants = {
  hidden: { pathLength: 0, transition: { duration: 0 } },
  show: { pathLength: 1, transition: { duration: 1.6, ease } },
}

export const revealGroup = (delay: number, stagger = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const revealSingle = (delay: number): Variants => ({
  hidden: revealItem.hidden,
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay } },
})
