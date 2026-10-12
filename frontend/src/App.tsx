import { LazyMotion } from 'motion/react'
import { Header } from './components/Header'
import { StickyCallBar } from './components/StickyCallBar'
import { Contact } from './sections/Contact'
import { Gallery } from './sections/Gallery'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { HeroScene } from './sections/HeroScene'
import { HowItWorks } from './sections/HowItWorks'
import { Marquee } from './components/Marquee'
import { Regions } from './sections/Regions'
import { Services } from './sections/Services'
import { WhyUs } from './sections/WhyUs'
import { useSmoothScroll } from './lib/useSmoothScroll'

// Animasyon özellikleri sayfa göründükten sonra ayrı parça olarak gelir
const loadMotion = () => import('./lib/motionFeatures').then((r) => r.default)

export default function App() {
  useSmoothScroll()
  return (
    // strict: yalnızca hafif `m` bileşenleri; özellikler domAnimation ile sınırlı
    <LazyMotion features={loadMotion} strict>
      <a
        href="#icerik"
        className="sr-only z-[60] rounded-lg bg-ink px-4 py-2 font-bold text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        İçeriğe geç
      </a>
      <Header />
      <main id="icerik">
        <HeroScene />
        <Marquee />
        <Services />
        <WhyUs />
        <Regions />
        <HowItWorks />
        <Gallery />
        <Contact />
        <Faq />
      </main>
      <Footer />
      <StickyCallBar />
    </LazyMotion>
  )
}
