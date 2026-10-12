import * as m from 'motion/react-m'
import { site } from '../data/site'
import { telHref } from '../lib/contact'
import { revealGroup, revealItem } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import { CropMarks } from '../components/CropMarks'
import { ShareLocationButton, WhatsAppButton } from '../components/CtaButtons'
import { Reveal } from '../components/Reveal'
import { RollingNumber } from '../components/RollingNumber'
import { SplitWords } from '../components/SplitWords'

export function Contact() {
  const { ref, state } = useReveal<HTMLDivElement>()
  const info = [
    { k: 'Çalışma saatleri', v: site.hoursText },
    { k: 'Telefon / WhatsApp', v: site.phoneDisplay, href: telHref },
    {
      k: 'Hizmet bölgeleri',
      v: [...site.regions.map((r) => r.name), ...site.roads.map((r) => `${r.code} hattı`)].join(', '),
    },
  ]

  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="relative overflow-hidden bg-signal text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(22_25_29/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(22_25_29/0.07)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-32 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <m.div ref={ref} initial={false} animate={state} variants={revealGroup(0, 0.07)}>
          <m.p variants={revealItem} className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-ink-2 uppercase">
            <span className="inline-block h-2.5 w-7 rounded-[2px] bg-ink" aria-hidden="true" />
            Pafta 06
            <span className="h-px w-6 bg-ink/40" aria-hidden="true" />
            İletişim
          </m.p>
          <h2
            id="iletisim-baslik"
            className="mt-4 font-display text-[2.3rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-6xl"
          >
            <SplitWords text="Yoldaysanız beklemeyin." />
          </h2>
          <a
            href={telHref}
            className="group mt-8 inline-block font-display text-[clamp(2.3rem,11.5vw,6.2rem)] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap"
          >
            <span className="sr-only">Hemen ara: {site.phoneDisplay}</span>
            <RollingNumber text={site.phoneDisplay} />
            <span
              aria-hidden="true"
              className="mt-3 block h-1.5 origin-left scale-x-[0.18] bg-ink transition-transform duration-500 ease-out-soft group-hover:scale-x-100"
            />
          </a>
          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
            <WhatsAppButton size="md" />
            <ShareLocationButton label="Konumumu gönder" />
          </div>
        </m.div>

        <Reveal delay={0.15} className="relative self-end">
          <dl className="relative grid gap-6 rounded-[1.75rem] border border-ink bg-paper p-6 sm:p-8">
            <CropMarks className="border-ink" />
            {info.map((i) => (
              <div key={i.k}>
                <dt className="text-[0.7rem] font-bold tracking-[0.16em] text-muted uppercase">{i.k}</dt>
                <dd className="mt-1.5 text-lg leading-snug font-bold">
                  {i.href ? (
                    <a href={i.href} className="tabular-nums underline-offset-4 hover:underline">
                      {i.v}
                    </a>
                  ) : (
                    i.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
