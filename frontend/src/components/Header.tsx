import { useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import * as m from 'motion/react-m'
import { nav, site } from '../data/site'
import { telHref } from '../lib/contact'
import { Icon } from './Icon'
import { LogoImage } from './Logo'

/** Aşağı kaydırınca gizlenir, yukarı kaydırınca geri gelir; altta okuma ilerleme çizgisi. */
export function Header() {
  const { scrollY, scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 8)
    if (reduce) return
    if (y > 320 && y > prev + 4) setHidden(true)
    else if (y < prev - 4 || y < 320) setHidden(false)
  })

  // Alt çizgi border değil gölge: header tam 64px kalır, altındaki sahne 1px kaymaz
  return (
    <m.header
      initial={false}
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className={`sticky top-0 z-40 bg-paper/95 transition-shadow duration-300 ${
        scrolled && !hidden ? 'shadow-[0_1px_0_var(--color-rule)]' : ''
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <LogoImage />
        <nav aria-label="Bölümler" className="hidden lg:block">
          <ul className="flex gap-5 text-[0.95rem] font-bold whitespace-nowrap text-muted xl:gap-8">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="relative py-1 transition-colors hover:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-rule bg-card lg:hidden xl:flex px-3 py-1.5 text-xs font-bold tracking-[0.1em] whitespace-nowrap uppercase max-[379px]:px-2.5 max-[379px]:tracking-[0.06em]">
            <span className="relative flex size-2">
              <span className="ring-pulse absolute inset-0 rounded-full bg-wa" aria-hidden="true" />
              <span className="relative size-2 rounded-full bg-wa-deep" aria-hidden="true" />
            </span>
            7/24
          </span>
          <a
            href={telHref}
            aria-label={`Ara, ${site.phoneDisplay}`}
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 whitespace-nowrap font-display text-[0.95rem] font-bold text-paper tabular-nums transition-transform hover:-translate-y-0.5 md:flex"
          >
            <Icon name="phone" className="size-4 text-signal" />
            {site.phoneDisplay}
          </a>
        </div>
      </div>
      <m.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-signal"
        style={{ scaleX: scrollYProgress }}
      />
    </m.header>
  )
}
