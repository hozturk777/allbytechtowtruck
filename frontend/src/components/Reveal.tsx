import type { ReactNode } from 'react'
import * as m from 'motion/react-m'
import { revealGroup, revealSingle } from '../lib/motion'
import { useReveal } from '../lib/useReveal'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  /** true ise kendisi değil, revealItem kullanan çocukları sırayla gelir */
  stagger?: boolean | number
  as?: 'div' | 'ul' | 'ol'
}

/** Görünüme girince fade/slide (bkz. useReveal: içerik JS'siz de görünür). */
export function Reveal({ children, className, delay = 0, stagger = false, as = 'div' }: Props) {
  const { ref, state } = useReveal()
  const Comp = as === 'ul' ? m.ul : as === 'ol' ? m.ol : m.div
  const variants = stagger
    ? revealGroup(delay, typeof stagger === 'number' ? stagger : 0.08)
    : revealSingle(delay)

  return (
    <Comp ref={ref as never} className={className} initial={false} animate={state} variants={variants}>
      {children}
    </Comp>
  )
}
