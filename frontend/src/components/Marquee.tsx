import { site } from '../data/site'

/** Sonsuz kayan bölge/yol şeridi (dekoratif; aynı bilgi sayfada metin olarak var) */
export function Marquee() {
  const items = [...site.regions.map((r) => r.name), ...site.roads.map((r) => `${r.code} hattı`), `${site.hoursShort} açık`]
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-6 pr-6 font-display text-xl font-bold whitespace-nowrap sm:text-2xl">
          {t}
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="M10 1 19 10 10 19 1 10Z" fill="currentColor" />
          </svg>
        </li>
      ))}
    </ul>
  )
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-ink bg-signal py-3.5 text-ink">
      <div className="marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  )
}
