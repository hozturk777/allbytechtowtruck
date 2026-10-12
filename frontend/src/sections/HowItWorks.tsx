import { useRef } from 'react'
import { useReducedMotion, useScroll } from 'motion/react'
import * as m from 'motion/react-m'
import { site } from '../data/site'
import { telHref } from '../lib/contact'
import { ShareLocationButton } from '../components/CtaButtons'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { revealItem } from '../lib/motion'

/** Her adımın küçük, sürekli dönen hareketli ikonu */
const stepIcons = [
  <Icon key="p" name="phone" className="wiggle size-6" />,
  <Icon key="l" name="pin" className="drop size-6" />,
  <Icon key="t" name="tow" className="drive size-6" />,
]

export function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // Kaydırdıkça adımları birleştiren çizgi dolar (kare dizisi değil, tek bir ölçek değeri)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 80%', 'end 55%'] })
  const progress = reduce ? 1 : scrollYProgress

  // Her adımın altında o adımı hemen yapmayı sağlayan kısa eylem
  const actions = [
    <a
      key="call"
      href={telHref}
      aria-label={`Ara, ${site.phoneDisplay}`}
      className="group inline-flex items-center gap-2 font-display text-xl font-extrabold tabular-nums"
    >
      <span className="marker">{site.phoneDisplay}</span>
      <Icon name="arrow" className="size-5 transition-transform group-hover:translate-x-1" />
    </a>,
    <ShareLocationButton key="loc" className="max-w-xs" label="Konumumu gönder" />,
    <p key="go" className="inline-flex items-center gap-2 font-bold text-ink">
      <Icon name="clock" className="size-5" />
      Ortalama {site.avgArrivalMinutes} dakikada yanınızda
    </p>,
  ]

  return (
    <section id="nasil-calisir" aria-labelledby="nasil-baslik" className="border-y border-rule bg-paper-2">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
        <SectionHeading id="nasil-baslik" code="04" eyebrow="Nasıl çalışır" title="Üç adımda" accent="yeniden yoldasınız." />
        <div ref={listRef} className="relative mt-14 md:mt-20">
          {/* İz + dolan çizgi: mobilde dikey, masaüstünde yatay */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[27px] w-[3px] bg-rule md:hidden" />
          <m.span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[27px] w-[3px] origin-top bg-ink md:hidden"
            style={{ scaleY: progress }}
          />
          <span aria-hidden="true" className="absolute top-[27px] right-0 left-0 hidden h-[3px] bg-rule md:block" />
          <m.span
            aria-hidden="true"
            className="absolute top-[27px] right-0 left-0 hidden h-[3px] origin-left bg-ink md:block"
            style={{ scaleX: progress }}
          />
          <Reveal as="ol" stagger={0.15} className="relative grid gap-14 md:grid-cols-3 md:gap-10">
          {site.steps.map((s, i) => (
            <m.li key={s.title} variants={revealItem} className="relative flex gap-5 md:flex-col md:gap-7">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-signal text-ink">
                {stepIcons[i % stepIcons.length]}
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-paper tabular-nums">
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 flex-1 pt-1 md:pt-0">
                <h3 className="font-display text-2xl leading-tight font-extrabold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
                <div className="mt-5">{actions[i]}</div>
              </div>
            </m.li>
          ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
