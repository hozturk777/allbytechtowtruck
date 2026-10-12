import { nav, site } from '../data/site'
import { LogoImage } from '../components/Logo'

/**
 * Teknik çizim antet tablosu biçiminde footer: milimetrik pafta zemini, üstte
 * ikaz şeridi.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const cells = [
    { k: 'Biz Kimiz ?', v: site.name, span: 'col-span-2' },
    { k: 'Bölge', v: `${site.city} · ${site.region}`, span: '' },
    { k: 'Hizmet', v: `${site.hoursShort} açık`, span: '' },
    { k: 'Pafta', v: '07 / 07', span: '' },
    { k: 'Yıl', v: String(year), span: '' },
  ]
  return (
    <footer className="relative overflow-hidden bg-paper-2">
      <div aria-hidden="true" className="hazard-tape h-2.5" />
      <div aria-hidden="true" className="paper-grid pointer-events-none absolute inset-0 top-2.5" />
      <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-28 sm:px-6 md:pb-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoImage className="h-9 w-auto sm:h-11" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {site.areaLine.replaceAll(' · ', ', ')}, {site.region} geneli ve{' '}
              {site.roads.map((r) => r.code).join(' / ')} hattında {site.hoursShort} oto çekici ve yol yardım.
            </p>
          </div>
          <nav aria-label="Alt bağlantılar">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm font-bold text-muted">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="transition-colors hover:text-ink">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <dl className="mt-12 grid grid-cols-2 border-t border-l border-ink bg-paper text-sm md:grid-cols-6">
          {cells.map((c) => (
            <div key={c.k} className={`border-r border-b border-ink px-3 py-2.5 ${c.span}`}>
              <dt className="text-[0.65rem] font-bold tracking-[0.16em] text-muted uppercase">{c.k}</dt>
              <dd className="mt-0.5 font-bold">{c.v}</dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-1 border-r border-b border-ink bg-ink px-3 py-3 text-paper md:col-span-6 md:flex-row md:items-center md:justify-between">
            <dt className="sr-only">Hazırlayan</dt>
            <dd className="font-bold">
              {site.credit.before}
              <a
                href={site.credit.url}
                target="_blank"
                rel="noopener"
                className="text-signal underline decoration-signal/50 underline-offset-4 transition-colors hover:decoration-signal"
              >
                {site.credit.name}
              </a>
              {site.credit.after}
            </dd>
            <dd className="text-paper/70">
              © {year} {site.name}
            </dd>
          </div>
        </dl>
      </div>
    </footer>
  )
}
