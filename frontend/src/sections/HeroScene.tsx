import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { site } from '../data/site'
import { CallButton, ShareLocationButton, WhatsAppButton } from '../components/CtaButtons'
import { Icon } from '../components/Icon'
import { FrameSequence, loadManifest, shouldLoadFrames, type FrameManifest } from '../lib/frameSequence'

/**
 * Sahnenin aşamaları: [başlangıç, bitiş] kaydırma oranı. video.mp4'ün 4–9. saniyelerine
 * göre ayarlı: araç baştan sona kasaya çekiliyor, kamera sona doğru tam yan açıya geliyor.
 */
const STAGES = [
  { label: 'Çağrı', range: [0, 0.24] },
  { label: 'Yükleme', range: [0.24, 0.76] },
  { label: 'Taşıma', range: [0.76, 1] },
] as const
/** Telemetrinin aktığı kaydırma aralığı (videoda aracın kasaya çekildiği bölüm) */
const LOAD_RANGE = [0.04, 0.94] as const
/** Klip 4. saniyeden başladığı için araç zaten yarı yolda: yükleme %40'tan, kasa 8°'den */
const LOAD_FROM = 40
const ANGLE_FROM = 8

/**
 * Tek sticky sahne. Arkada kaydırmaya bağlı video kareleri (public/frames,
 * `npm run frames -- video.mp4`); kareler yokken poster + kamera hareketi taklidi.
 * Önde kaydırmaya bağlı üç metin aşaması, telemetri kartı ve aşama çizelgesi.
 * Aşama 1 (başlık + butonlar) animasyonsuzdur, önceden render edilen HTML'de anında görünür.
 */
export function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loadRef = useRef<HTMLSpanElement>(null)
  const angleRef = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  // undefined: yükleniyor · null: kare yok (poster + kamera taklidi) · nesne: kare dizisi
  const [manifest, setManifest] = useState<FrameManifest | null | undefined>(undefined)
  const [frameReady, setFrameReady] = useState(false)
  const [stage, setStage] = useState(0)

  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    let cancelled = false
    // Veri tasarrufu / 2G: kare indirme, poster + kamera taklidiyle devam
    if (!shouldLoadFrames()) {
      Promise.resolve().then(() => !cancelled && setManifest(null))
      return () => {
        cancelled = true
      }
    }
    loadManifest().then((mf) => !cancelled && setManifest(mf))
    return () => {
      cancelled = true
    }
  }, [])

  // Canvas ancak manifest gelince render edilir; motor ondan sonra kurulur
  useEffect(() => {
    if (!manifest || !canvasRef.current) return
    const seq = new FrameSequence(canvasRef.current, manifest, () => p.get(), () => setFrameReady(true))
    return () => seq.destroy()
  }, [manifest, p])

  // Aşama + telemetri: yeniden render yok, yalnız aşama değişince
  useMotionValueEvent(p, 'change', (v) => {
    const s = STAGES.findIndex((st) => v < st.range[1])
    setStage(s < 0 ? STAGES.length - 1 : s)
    const k = Math.min(1, Math.max(0, (v - LOAD_RANGE[0]) / (LOAD_RANGE[1] - LOAD_RANGE[0])))
    if (loadRef.current) loadRef.current.textContent = `%${Math.round(LOAD_FROM + k * (100 - LOAD_FROM))}`
    if (angleRef.current) angleRef.current.textContent = `${Math.round(ANGLE_FROM * (1 - k))}°`
  })

  // Video yokken: araç kasaya çekilirken kamera yavaşça tam yan açıya döner hissi
  const camScale = useTransform(p, [0, 1], [1.2, 1.02])
  const camX = useTransform(p, [0, 1], ['-6%', '1%'])
  const camRotate = useTransform(p, [0, 1], [-9, 0])
  // Yalnız karelerin olmadığı kesinleşince: manifest yüklenirken taklit devreye girip sıçramasın
  const fake = manifest === null && !reduce ? { scale: camScale, x: camX, rotateY: camRotate } : undefined

  // Metin aşamaları
  const o1 = useTransform(p, [0, 0.14, 0.22], [1, 1, 0])
  const y1 = useTransform(p, [0, 0.22], [0, -40])
  const o2 = useTransform(p, [0.26, 0.34, 0.64, 0.72], [0, 1, 1, 0])
  const y2 = useTransform(p, [0.26, 0.34, 0.64, 0.72], [28, 0, 0, -28])
  const o3 = useTransform(p, [0.76, 0.86], [0, 1])
  const y3 = useTransform(p, [0.76, 0.86], [28, 0])
  const hint = useTransform(p, [0, 0.05], [1, 0])
  const telemetry = useTransform(p, [0.18, 0.28], [0, 1])

  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-baslik" className="scene relative -mt-16">
      <div className="scene__sticky sticky top-0 overflow-hidden">
        {/* ---- Arka plan: kareler / poster ---- */}
        <div className="scene__media absolute inset-0 overflow-hidden bg-paper [perspective:1200px]" aria-hidden={manifest ? 'true' : undefined}>
          {(!manifest || !frameReady) && (
            <m.picture className="absolute inset-0 block" style={fake}>
              {/* Klibin ilk karesi (npm run frames üretir); telefonda kırpılmış küçük poster */}
              <source media="(max-width: 767px)" srcSet="/poster-m.avif" type="image/avif" />
              <source media="(max-width: 767px)" srcSet="/poster-m.webp" type="image/webp" />
              <source srcSet="/poster.avif" type="image/avif" />
              <source srcSet="/poster.webp" type="image/webp" />
              <img
                src="/poster.jpg"
                width={1280}
                height={720}
                fetchPriority="high"
                decoding="async"
                alt="Kayar kasalı çekiciye geri geri çekilen gri otomobil"
                className="h-full w-full object-cover object-[62%_50%]"
              />
            </m.picture>
          )}
          {manifest && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />}
          {/* Kâğıt rengine geçiş: metin her zaman açık zemin üstünde okunur */}
          <div className="scene__shade absolute inset-0" />
          <div className="paper-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,black_0%,transparent_55%)] max-md:hidden" />
        </div>

        {/* ---- Metin aşamaları ---- */}
        <div className="scene__copy relative mx-auto grid h-full max-w-6xl px-4 sm:px-6">
          <m.div className="phase" style={{ opacity: o1, y: y1, pointerEvents: stage === 0 ? 'auto' : 'none' }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-rule bg-card/90 px-3 py-1.5 text-[0.8rem] font-bold text-ink-2">
              <span className="relative flex size-2">
                <span className="ring-pulse absolute inset-0 rounded-full border-2 border-wa-deep" aria-hidden="true" />
                <span className="relative size-2 rounded-full bg-wa-deep" aria-hidden="true" />
              </span>
              {site.hoursShort} açık · {site.areaLine}
            </p>
            <h1
              id="hero-baslik"
              className="mt-3 font-display text-[2.3rem] leading-[1.02] sm:mt-4 font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]"
            >
              Yolda mı kaldınız?{' '}
              <span className="marker marker-sweep">{site.hoursShort} yanınızdayız.</span>
            </h1>
            <p className="mt-4 hidden max-w-md text-lg leading-relaxed text-ink-2 sm:block">
              {site.city} merkezde ortalama {site.avgArrivalMinutes} dakikada yanınızdayız. Arayın ya da konumunuzu
              gönderin; gerisini biz halledelim.
            </p>
            {/* Telefonda butonlar yok: arama ve WhatsApp alttaki sabit çubukta */}
            <div className="mt-6 grid max-w-md gap-3 max-md:hidden">
              <CallButton />
              <div className="grid gap-3 sm:grid-cols-2">
                <WhatsAppButton size="md">
                  <span className="whitespace-nowrap">WhatsApp</span>
                </WhatsAppButton>
                <ShareLocationButton label="Konumumu gönder" />
              </div>
            </div>
          </m.div>

          <m.div className="phase" style={{ opacity: o2, y: y2 }}>
            <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Aşama 01 — Yükleme</p>
            <h2 className="mt-3 font-display text-[2.3rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-6xl">
              Kayar kasa, <span className="marker">sıfır sürtünme.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">
              Hidrolik kasa yere kadar iner; aracınız vinçle, tamponu sürtmeden kasaya çekilir.
            </p>
          </m.div>

          <m.div className="phase" style={{ opacity: o3, y: y3, pointerEvents: stage === 2 ? 'auto' : 'none' }}>
            <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Aşama 02 — Taşıma</p>
            <h2 className="mt-3 font-display text-[2.3rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-6xl">
              Aracınız <span className="marker">emin ellerde.</span>
            </h2>
            <ul className="mt-6 flex max-w-md flex-wrap gap-2">
              {['Tekerlek kayışıyla sabitleme', 'Sigortalı taşıma', `${site.roads.map((r) => r.code).join(' · ')} hattı`].map(
                (t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-rule bg-card/90 px-3.5 py-2 text-sm font-bold"
                  >
                    <Icon name="check" className="size-4" />
                    {t}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-6 max-w-md max-md:hidden">
              <CallButton />
            </div>
          </m.div>
        </div>

        {/* ---- Telemetri kartı (masaüstü) ---- */}
        <m.dl
          style={{ opacity: telemetry }}
          className="absolute right-6 bottom-24 hidden w-64 rounded-2xl border border-rule bg-card/90 p-4 text-sm shadow-[0_30px_60px_-30px_rgb(22_25_29/0.5)] lg:block xl:right-[max(1.5rem,calc((100vw-72rem)/2))]"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between border-b border-dashed border-rule pb-2 text-[0.68rem] font-bold tracking-[0.14em] text-muted uppercase">
            <span>Canlı yükleme</span>
            <span className="beacon size-2 rounded-full bg-wa-deep" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dt className="font-bold text-muted">Yükleme</dt>
            <dd className="font-display text-2xl font-extrabold tabular-nums">
              <span ref={loadRef}>%{LOAD_FROM}</span>
            </dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dt className="font-bold text-muted">Kasa açısı</dt>
            <dd className="font-display text-2xl font-extrabold tabular-nums">
              <span ref={angleRef}>{ANGLE_FROM}°</span>
            </dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <dt className="font-bold text-muted">Aşama</dt>
            <dd className="font-display text-lg font-extrabold">{STAGES[stage].label}</dd>
          </div>
        </m.dl>

        {/* ---- Aşama çizelgesi ---- */}
        <div className="scene__rail absolute inset-x-0 mx-auto max-w-6xl px-4 sm:px-6" aria-hidden="true">
          <div className="relative h-[3px] bg-ink/15">
            <m.span className="absolute inset-0 origin-left bg-ink" style={{ scaleX: p }} />
          </div>
          <ol className="mt-2.5 grid grid-cols-3 text-[0.7rem] font-bold tracking-[0.14em] uppercase">
            {STAGES.map((s, i) => (
              <li
                key={s.label}
                className={`flex items-center gap-2 transition-colors duration-300 ${i === 1 ? 'justify-center' : i === 2 ? 'justify-end' : ''} ${
                  stage === i ? 'text-ink' : 'text-muted'
                }`}
              >
                <span className={`size-2 rounded-full transition-colors ${stage >= i ? 'bg-signal ring-2 ring-ink' : 'bg-rule'}`} />
                {String(i + 1).padStart(2, '0')} {s.label}
              </li>
            ))}
          </ol>
        </div>

        <m.div
          style={{ opacity: hint }}
          className="absolute right-8 bottom-28 hidden flex-col items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-muted uppercase md:flex lg:right-auto lg:left-1/2 lg:-translate-x-1/2"
          aria-hidden="true"
        >
          Kaydırın
          <span className="scroll-drip h-10 w-px bg-ink" />
        </m.div>
      </div>
    </section>
  )
}
