import { useId, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { Icon } from './Icon'

interface Item {
  q: string
  a: string
}

/**
 * Erişilebilir accordion. Cevaplar DOM'da kalır (arama motorları okur);
 * kapalıyken `inert` ile odak ve ekran okuyucudan gizlenir.
 */
export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()
  const uid = useId()

  return (
    <ul className="border-t border-ink">
      {items.map((it, i) => {
        const isOpen = open === i
        const btnId = `${uid}-b${i}`
        const panelId = `${uid}-p${i}`
        return (
          <li key={it.q} className="relative border-b border-rule">
            {/* Açık öğenin solunda sarı işaret */}
            <span
              aria-hidden="true"
              className={`absolute top-0 bottom-0 -left-4 w-1 origin-top bg-signal transition-transform duration-500 sm:-left-6 ${
                isOpen ? 'scale-y-100' : 'scale-y-0'
              }`}
            />
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-5 py-6 text-left font-display text-[1.08rem] font-bold sm:text-xl"
              >
                <span className="flex gap-4">
                  <span className="font-sans text-sm font-bold text-muted tabular-nums sm:pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {it.q}
                </span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    isOpen ? 'rotate-45 border-ink bg-ink text-signal' : 'border-rule text-ink group-hover:border-ink'
                  }`}
                  aria-hidden="true"
                >
                  <Icon name="plus" className="size-5" />
                </span>
              </button>
            </h3>
            <m.div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl pb-7 pl-9 text-[1.05rem] leading-relaxed text-muted">{it.a}</p>
            </m.div>
          </li>
        )
      })}
    </ul>
  )
}
