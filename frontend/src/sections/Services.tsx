import * as m from 'motion/react-m'
import { site } from '../data/site'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { revealItem } from '../lib/motion'

/** Katalog dizini gibi satırlar; hover'da satır soldan sarıyla dolar. */
export function Services() {
  return (
    <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <SectionHeading
        id="hizmetler-baslik"
        code="01"
        eyebrow="Hizmetler"
        title="Ne olursa olsun,"
        accent="yolda bırakmayız."
        lead="Arıza, kaza ya da patlak lastik. Durumu söyleyin, doğru ekipmanla gelelim."
      />
      <Reveal as="ul" stagger={0.07} className="mt-12 border-t border-ink md:mt-16">
        {site.services.map((s, i) => (
          <m.li key={s.title} variants={revealItem} className="group relative border-b border-rule">
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out-soft group-hover:scale-x-100"
            />
            <div className="relative grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 gap-y-1.5 py-6 sm:grid-cols-[4rem_1fr_1.15fr_auto] sm:items-center sm:gap-x-6 sm:py-8">
              <span className="pt-1.5 text-sm font-bold text-muted tabular-nums transition-colors group-hover:text-ink sm:pt-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-[1.35rem] leading-tight font-extrabold tracking-tight transition-transform duration-500 group-hover:translate-x-1.5 sm:text-[1.7rem]">
                {s.title}
              </h3>
              <p className="col-start-2 col-end-4 leading-snug text-muted transition-colors group-hover:text-ink sm:col-auto">
                {s.text}
              </p>
              <span className="col-start-3 row-start-1 grid size-12 place-items-center rounded-full border border-rule bg-card transition-all duration-500 group-hover:-rotate-12 group-hover:border-ink group-hover:bg-ink group-hover:text-signal sm:col-auto sm:row-auto sm:size-14">
                <Icon name={s.icon} className="size-6" />
              </span>
            </div>
          </m.li>
        ))}
      </Reveal>
    </section>
  )
}
