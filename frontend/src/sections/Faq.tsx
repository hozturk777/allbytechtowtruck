import { site } from '../data/site'
import { Accordion } from '../components/Accordion'
import { CallButton } from '../components/CtaButtons'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'

export function Faq() {
  return (
    <section id="sss" aria-labelledby="sss-baslik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="sss-baslik"
            code="07"
            eyebrow="SSS"
            title="Sık sorulan"
            accent="sorular"
            lead="Aklınıza takılanların cevapları burada. Yoksa bir telefon uzağınızdayız."
          />
          <Reveal delay={0.2} className="mt-8 hidden max-w-sm lg:block">
            <CallButton />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Accordion items={site.faq} />
        </Reveal>
      </div>
    </section>
  )
}
