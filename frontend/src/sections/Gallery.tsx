import { useCallback, useEffect, useRef, useState } from 'react'
import * as m from 'motion/react-m'
import { site, type GalleryItem } from '../data/site'
import meta from '../data/gallery.gen.json'
import { CropMarks } from '../components/CropMarks'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { whatsappHref } from '../lib/contact'
import { ease } from '../lib/motion'
import { useReveal } from '../lib/useReveal'

type Meta = { width: number; height: number; widths: number[]; color: string }
type Photo = GalleryItem & Meta

// Görseli üretilmemiş (gallery.gen.json'da olmayan) kayıtlar atlanır
const photos: Photo[] = site.gallery.flatMap((g) => {
  const info = (meta as Record<string, Meta>)[g.file]
  return info ? [{ ...g, ...info }] : []
})

const pad = (n: number) => String(n).padStart(2, '0')
const srcset = (p: Photo, ext: string) => p.widths.map((w) => `/gallery/${p.file}-${w}.${ext} ${w}w`).join(', ')

/** AVIF → WebP → JPEG; boyutu `sizes` ile tarayıcı seçer */
function Picture({ p, sizes, className, eager }: { p: Photo; sizes: string; className: string; eager?: boolean }) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcset(p, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(p, 'webp')} sizes={sizes} />
      <img
        src={`/gallery/${p.file}.jpg`}
        width={p.width}
        height={p.height}
        alt={p.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={className}
      />
    </picture>
  )
}

// Masaüstünde 12 sütunluk pafta: ilk kare büyük (2 satır), sonra 5+5, sonra 4+4+4.
// Telefonda ilk kare tam genişlik, diğerleri ikişerli.
const layout = [
  { cell: 'col-span-2 aspect-[4/3] md:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto', sizes: '(min-width: 1152px) 640px, (min-width: 1024px) 56vw, 100vw' },
  { cell: 'lg:col-span-5', sizes: '(min-width: 1024px) 460px, 50vw' },
  { cell: 'lg:col-span-5', sizes: '(min-width: 1024px) 460px, 50vw' },
  { cell: 'lg:col-span-4', sizes: '(min-width: 1024px) 370px, 50vw' },
  { cell: 'lg:col-span-4', sizes: '(min-width: 1024px) 370px, 50vw' },
  { cell: 'lg:col-span-4', sizes: '(min-width: 1024px) 370px, 50vw' },
]
const extra = { cell: 'lg:col-span-6', sizes: '(min-width: 1024px) 560px, 50vw' }

/**
 * "Sahadan kareler": pafta düzeninde fotoğraflar. Her kare görünüme girince
 * üstündeki sarı kepenk kalkar; tıklanınca tam ekran görüntüleyici açılır.
 */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  if (!photos.length) return null

  return (
    <section id="galeri" aria-labelledby="galeri-baslik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <SectionHeading
          id="galeri-baslik"
          code="05"
          eyebrow="Galeri"
          title="Sahadan"
          accent="kareler."
          lead="Gebze ve çevresinde her gün yaptığımız işlerden birkaçı. Sizin aracınız da aynı özenle yüklenir, aynı özenle teslim edilir."
        />
        <Reveal delay={0.25} className="hidden shrink-0 md:block">
          <dl className="grid grid-cols-2 border-t border-ink text-sm">
            <div className="border-r border-rule py-3 pr-6">
              <dt className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Kayıt</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                {pad(1)}–{pad(photos.length)}
              </dd>
            </div>
            <div className="py-3 pl-6">
              <dt className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Ekipman</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">Kayar kasa</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-2.5 sm:gap-4 md:mt-16 lg:auto-rows-[15.5rem] lg:grid-cols-12">
        {photos.map((p, i) => (
          <Tile key={p.file} p={p} i={i} onOpen={() => setOpen(i)} />
        ))}
      </ul>

      <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
        <p className="max-w-md leading-snug text-muted">
          Aracınızın durumundan emin değil misiniz? Bir fotoğraf gönderin, ekipmanı ona göre getirelim.
        </p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 font-display font-bold underline decoration-signal decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink"
        >
          <Icon name="whatsapp" className="size-5 text-wa-deep" />
          Fotoğrafı WhatsApp’tan gönder
          <span className="sr-only"> (yeni sekmede açılır)</span>
          <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </Reveal>

      <Lightbox index={open} onChange={setOpen} />
    </section>
  )
}

function Tile({ p, i, onOpen }: { p: Photo; i: number; onOpen: () => void }) {
  const { ref, state } = useReveal<HTMLLIElement>('0px 0px -12% 0px')
  const { cell, sizes } = layout[i] ?? extra
  const big = i === 0
  // Aynı satırdakiler sırayla açılsın
  const delay = (i % 3) * 0.09

  return (
    <li ref={ref} className={`relative ${big ? '' : 'aspect-[4/5] md:aspect-[4/3] lg:aspect-auto'} ${cell}`}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${p.title}, ${p.place}: büyük görüntüle`}
        className="group absolute inset-0 overflow-hidden rounded-md text-left focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
        style={{ backgroundColor: p.color }}
      >
        <m.span
          initial={false}
          animate={state}
          variants={{
            hidden: { scale: 1.12, transition: { duration: 0 } },
            show: { scale: 1, transition: { duration: 1.4, ease, delay } },
          }}
          className="absolute inset-0 block"
        >
          <Picture
            p={p}
            sizes={sizes}
            className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.045]"
          />
        </m.span>

        {/* Alt yazının okunması için koyu geçiş */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgb(22_25_29/0.82),rgb(22_25_29/0.45)_40%,transparent)] transition-opacity duration-500 lg:opacity-80 lg:group-hover:opacity-100"
        />

        {/* Vizör köşeleri: hover'da içeri kayar */}
        <span
          aria-hidden="true"
          className="absolute inset-5 hidden opacity-0 transition-all duration-500 group-hover:inset-3 group-hover:opacity-100 md:block"
        >
          <CropMarks className="border-paper/90" />
        </span>

        <span className="absolute top-2.5 left-2.5 flex items-center gap-2 sm:top-3.5 sm:left-3.5">
          <span className="rounded-[3px] bg-signal px-1.5 py-0.5 font-display text-[0.7rem] font-extrabold text-ink tabular-nums sm:text-xs">
            {pad(i + 1)}
          </span>
          {big && (
            <span className="hidden rounded-[3px] bg-ink/70 px-1.5 py-0.5 text-[0.7rem] font-bold tracking-[0.14em] text-paper uppercase sm:inline">
              Kayıt
            </span>
          )}
        </span>

        <span
          aria-hidden="true"
          className="absolute top-2.5 right-2.5 grid size-9 scale-75 place-items-center rounded-full bg-paper text-ink opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:top-3.5 sm:right-3.5"
        >
          <Icon name="plus" className="size-4" />
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 text-paper sm:p-5">
          <span className="min-w-0">
            <span
              className={`block font-display leading-tight font-extrabold tracking-tight ${
                big ? 'text-lg sm:text-[1.6rem]' : 'text-[0.95rem] sm:text-lg'
              }`}
            >
              {p.title}
            </span>
            <span className={`mt-1 items-center gap-1.5 text-sm text-paper/80 ${big ? 'flex' : 'hidden sm:flex'}`}>
              <Icon name="pin" className="size-3.5 shrink-0 text-signal" />
              {p.place}
            </span>
          </span>
        </span>

        {/* Sarı kepenk: görünüme girince yukarı kalkar */}
        <m.span
          aria-hidden="true"
          initial={false}
          animate={state}
          variants={{
            hidden: { scaleY: 1, transition: { duration: 0 } },
            show: { scaleY: 0, transition: { duration: 0.85, ease: [0.7, 0, 0.2, 1], delay } },
          }}
          className="hazard-shutter absolute inset-0 block origin-top"
        />
      </button>
    </li>
  )
}

/**
 * Tam ekran görüntüleyici. Yerel <dialog>: odak içeride kalır, Esc kapatır,
 * arka plan erişilemez olur. Ok tuşları ve kaydırma (swipe) ile gezilir.
 */
function Lightbox({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [dir, setDir] = useState(1)
  const touch = useRef<number | null>(null)
  const n = photos.length

  const go = useCallback(
    (d: number) => {
      if (index === null) return
      setDir(d)
      onChange((index + d + n) % n)
    },
    [index, n, onChange],
  )

  const isOpen = index !== null
  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (isOpen && !dlg.open) {
      dlg.showModal()
      // Sayfa arkada kaymasın (Lenis de data-lenis-prevent ile karışmaz)
      document.documentElement.style.overflow = 'hidden'
    } else if (!isOpen && dlg.open) dlg.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, go])

  const p = index !== null ? photos[index] : null

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      aria-labelledby="galeri-lb-baslik"
      onClose={() => {
        document.documentElement.style.overflow = ''
        onChange(null)
      }}
      // Görselin dışına (zemine) tıklayınca kapanır
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) ref.current?.close()
      }}
      className="lightbox m-0 h-full max-h-none w-full max-w-none bg-ink/97 p-0 text-paper backdrop:bg-ink/80"
    >
      {p && index !== null && (
        <div data-backdrop="1" className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
            <p className="flex min-w-0 items-baseline gap-3">
              <span className="font-display text-sm font-extrabold text-signal tabular-nums">
                {pad(index + 1)} / {pad(n)}
              </span>
              <span id="galeri-lb-baslik" className="truncate font-display text-lg font-extrabold sm:text-xl">
                {p.title}
              </span>
              <span className="hidden items-center gap-1.5 text-sm text-paper/70 sm:flex">
                <Icon name="pin" className="size-3.5 text-signal" />
                {p.place}
              </span>
            </p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Kapat"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-paper/25 transition-colors hover:border-signal hover:bg-signal hover:text-ink"
            >
              <Icon name="plus" className="size-5 rotate-45" />
            </button>
          </div>

          <div
            data-backdrop="1"
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-24 sm:py-6"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return
              const dx = e.changedTouches[0].clientX - touch.current
              touch.current = null
              if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
            }}
          >
            <figure
              key={p.file}
              className="lightbox__img relative max-h-full"
              style={{ ['--from' as string]: `${dir * 40}px` }}
            >
              <Picture
                p={p}
                sizes="(min-width: 640px) 85vw, 100vw"
                eager
                className="max-h-[calc(100dvh-11rem)] w-auto rounded-md object-contain sm:max-h-[calc(100dvh-13rem)]"
              />
              <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-paper/70 sm:sr-only">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" className="size-3.5 text-signal" />
                  {p.place}
                  <span className="sr-only">. {p.alt}</span>
                </span>
                {n > 1 && <span aria-hidden="true">← kaydırın →</span>}
              </figcaption>
            </figure>

            {n > 1 && (
              <>
                <NavButton side="left" onClick={() => go(-1)} />
                <NavButton side="right" onClick={() => go(1)} />
              </>
            )}
          </div>

          {/* Küçük resimler */}
          <ol
            data-backdrop="1"
            className="flex gap-2 overflow-x-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6"
          >
            {photos.map((t, i) => (
              // ilk/son öğede auto kenar: sığınca ortalı, taşınca baştan kaydırılır
              <li key={t.file} className="shrink-0 first:ml-auto last:mr-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDir(i > index ? 1 : -1)
                    onChange(i)
                  }}
                  aria-label={`${pad(i + 1)}: ${t.title}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`block h-11 w-16 overflow-hidden rounded-[4px] outline-offset-2 transition-all sm:h-14 sm:w-20 ${
                    i === index ? 'opacity-100 outline-2 outline-signal' : 'opacity-45 hover:opacity-80'
                  }`}
                  style={{ backgroundColor: t.color }}
                >
                  <img
                    src={`/gallery/${t.file}-${t.widths[0]}.webp`}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </dialog>
  )
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Önceki fotoğraf' : 'Sonraki fotoğraf'}
      className={`absolute top-1/2 hidden size-14 -translate-y-1/2 place-items-center rounded-full border border-paper/25 transition-colors hover:border-signal hover:bg-signal hover:text-ink sm:grid ${
        side === 'left' ? 'left-6' : 'right-6'
      }`}
    >
      <Icon name="arrow" className={`size-5 ${side === 'left' ? 'rotate-180' : ''}`} />
    </button>
  )
}
