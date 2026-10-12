import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { useHydrated } from './useHydrated'

/**
 * Görünüme girme durumu.
 * Sunucuda/hydration'da `show` true döner: önceden render edilen HTML'de içerik
 * GÖRÜNÜR gelir (JS geç yüklense de okunur). Gizleme yalnızca hydration'dan sonra,
 * henüz ekrana girmemiş öğelere uygulanır. Reduced motion açıksa hep true.
 */
export function useReveal<T extends Element = HTMLElement>(margin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, margin: margin as `${number}px` })
  const hydrated = useHydrated()
  const reduce = !!useReducedMotion()
  const show = reduce || !hydrated || inView
  return { ref, show, reduce, hydrated, state: show ? 'show' : 'hidden' }
}
