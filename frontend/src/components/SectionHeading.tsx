import type { ReactNode } from 'react'
import * as m from 'motion/react-m'
import { revealGroup, revealItem } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import { SplitWords } from './SplitWords'

interface Props {
  /** Pafta numarası, ör. "01" */
  code: string
  eyebrow: string
  /** Başlık; `accent` kısmı fosforlu kalemle vurgulanır */
  title: string
  accent?: string
  lead?: ReactNode
  id: string
  className?: string
}

/** "PAFTA 01 / HİZMETLER" etiketi + kelime kelime açılan başlık */
export function SectionHeading({ code, eyebrow, title, accent, lead, id, className = '' }: Props) {
  const { ref, state } = useReveal<HTMLDivElement>()
  return (
    <m.div
      ref={ref}
      initial={false}
      animate={state}
      variants={revealGroup(0, 0.06)}
      className={`max-w-2xl ${className}`}
    >
      <m.p variants={revealItem} className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-muted uppercase">
        <span className="hazard-sm inline-block h-2.5 w-7 rounded-[2px]" aria-hidden="true" />
        <span className="tabular-nums">Pafta {code}</span>
        <span className="h-px w-6 bg-rule" aria-hidden="true" />
        {eyebrow}
      </m.p>
      <h2 id={id} className="mt-4 font-display text-[2.15rem] leading-[1.02] font-extrabold tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]">
        <SplitWords text={title} />
        {accent && (
          <>
            {' '}
            <span className="marker">
              <SplitWords text={accent} />
            </span>
          </>
        )}
      </h2>
      {lead && (
        <m.p variants={revealItem} className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {lead}
        </m.p>
      )}
    </m.div>
  )
}
