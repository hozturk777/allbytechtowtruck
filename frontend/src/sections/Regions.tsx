import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { site } from '../data/site'
import { CropMarks } from '../components/CropMarks'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { RouteMap } from '../components/RouteMap'
import { SectionHeading } from '../components/SectionHeading'
import { revealItem } from '../lib/motion'

export function Regions() {
  const [active, setActive] = useState<string | null>(null)
  const reduce = !!useReducedMotion()

  return (
    <section id="bolgeler" aria-labelledby="bolgeler-baslik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <SectionHeading
        id="bolgeler-baslik"
        code="03"
        eyebrow="Hizmet bölgeleri"
        title={`${site.city} merkezli,`}
        accent={`tüm ${site.region}.`}
        lead="Şehir içinde ya da otoyolda kaldıysanız fark etmez; bulunduğunuz yere geliyoruz."
      />

      <div className="mt-12 grid items-start gap-8 md:mt-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
        <Reveal className="relative rounded-[1.75rem] border border-rule bg-card p-3 sm:p-5">
          <CropMarks />
          <div className="flex items-center justify-between border-b border-dashed border-rule px-1 pb-3 text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
            <span>Pafta 03 — Hizmet ağı</span>
            <span className="flex items-center gap-1.5">
              <span className="beacon size-2 rounded-full bg-wa-deep" aria-hidden="true" />
              Canlı şema
            </span>
          </div>
          <div className="paper-grid mt-3 overflow-hidden rounded-2xl">
            <RouteMap active={active} reduce={reduce} />
          </div>
        </Reveal>

        <div>
          <Reveal as="ul" stagger={0.08} className="border-t border-ink">
            {site.regions.map((r) => (
              <m.li key={r.name} variants={revealItem} className="border-b border-rule">
                <button
                  type="button"
                  onMouseEnter={() => setActive(r.name)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(r.name)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(active === r.name ? null : r.name)}
                  aria-pressed={active === r.name}
                  aria-label={`${r.name}, ortalama varış ${r.note.replace('~', '')}; haritada göster`}
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="flex items-center gap-3 font-display text-xl font-extrabold tracking-tight">
                    <span
                      className={`size-3 rounded-full border-2 border-ink transition-colors ${
                        active === r.name ? 'bg-signal' : 'bg-card'
                      }`}
                      aria-hidden="true"
                    />
                    {r.name}
                  </span>
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-ink-2 tabular-nums">
                    {r.note}
                    <Icon
                      name="arrow"
                      className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </span>
                </button>
              </m.li>
            ))}
          </Reveal>
          <Reveal delay={0.3} className="mt-6 flex flex-wrap gap-2">
            {site.roads.map((r) => (
              <span
                key={r.code}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-white ${
                  r.kind === 'otoyol' ? 'bg-otoyol' : 'bg-devlet'
                }`}
              >
                <span className="font-display font-extrabold">{r.code}</span>
                {r.label} hattı
              </span>
            ))}
          </Reveal>
          <p className="mt-4 text-sm text-muted">Süreler ortalamadır; trafiğe göre değişebilir.</p>
        </div>
      </div>
    </section>
  )
}
