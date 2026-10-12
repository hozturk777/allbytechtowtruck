import * as m from 'motion/react-m'
import { site } from '../data/site'
import { CountUp } from '../components/CountUp'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { revealItem } from '../lib/motion'

/** Teknik şartname tablosu gibi: büyük, sayarak gelen değerler. */
export function WhyUs() {
  return (
    <section id="neden-biz" aria-labelledby="neden-baslik" className="border-y border-rule bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          id="neden-baslik"
          code="02"
          eyebrow="Neden biz"
          title="Zor anda"
          accent="güvenilir el."
          lead="Stresli bir anda ihtiyacınız olan şey net bilgi ve hızlı bir ekip. İkisini de veriyoruz."
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <Reveal as="ul" stagger={0.1} className="grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-ink bg-card">
          {site.reasons.map((r, i) => (
            <m.li
              key={r.title}
              variants={revealItem}
              className={`group relative p-5 sm:p-8 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} border-rule`}
            >
              <div className="flex items-start justify-between gap-2">
                <CountUp
                  value={r.stat}
                  className="font-display text-[1.9rem] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap sm:text-6xl"
                />
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-2 transition-colors duration-300 group-hover:bg-signal sm:size-11">
                  <Icon name={r.icon} className="size-4.5 sm:size-5" />
                </span>
              </div>
              <h3 className="mt-6 font-display text-base font-extrabold tracking-tight sm:mt-10 sm:text-xl">{r.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-snug text-muted">{r.text}</p>
            </m.li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
