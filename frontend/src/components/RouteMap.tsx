import { useId, type CSSProperties } from 'react'
import * as m from 'motion/react-m'
import type { Variants } from 'motion/react'
import { site } from '../data/site'
import { ease, revealLine } from '../lib/motion'
import { useReveal } from '../lib/useReveal'

const roadColor = { otoyol: 'var(--color-otoyol)', devlet: 'var(--color-devlet)' } as const

const node: Variants = {
  hidden: { scale: 0, opacity: 0, transition: { duration: 0 } },
  show: (i: number) => ({ scale: 1, opacity: 1, transition: { duration: 0.5, ease, delay: 0.9 + i * 0.12 } }),
}
const fade: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  show: { opacity: 1, transition: { duration: 0.8, delay: 0.6 } },
}

const labelOffset = {
  top: { dx: 0, dy: -18, anchor: 'middle' },
  bottom: { dx: 0, dy: 30, anchor: 'middle' },
  left: { dx: -14, dy: 5, anchor: 'end' },
  right: { dx: 14, dy: 5, anchor: 'start' },
  topLeft: { dx: 10, dy: -18, anchor: 'end' },
} as const

/** Etiketlerin arkasında kâğıt renginde hale (okunurluk) */
const halo: CSSProperties = { paintOrder: 'stroke', stroke: 'var(--color-paper)', strokeWidth: 5, strokeLinejoin: 'round' }

/**
 * Hizmet bölgesinin şematik haritası. Ölçekli değildir; veriler site.ts'teki `map`ten gelir.
 * Görünüme girince yollar çizilir, ilçeler sırayla belirir; merkezden menzil halkaları
 * yayılır ve bir çekici simgesi ana yolda sürekli dolaşır (SMIL, JS gerektirmez).
 */
export function RouteMap({ active, reduce }: { active: string | null; reduce: boolean }) {
  const { ref, state } = useReveal<SVGSVGElement>('0px 0px -20% 0px')
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { map, regions, roads } = site
  const hq = regions.find((r) => r.name === map.hq) ?? regions[0]
  const truckRoad = map.roads.find((r) => r.code === map.truckRoad) ?? map.roads[0]

  return (
    <m.svg
      ref={ref}
      viewBox="0 0 600 380"
      width={600}
      height={380}
      className="h-auto w-full"
      role="img"
      aria-label={`Hizmet bölgesi şeması: ${regions.map((r) => r.name).join(', ')}; ${roads.map((r) => r.code).join(' ve ')} hattı`}
      initial={false}
      animate={state}
    >
      <defs>
        <pattern id={`${uid}sea`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="var(--color-sea)" />
          <path d="M0 0V8" stroke="#c4d2d7" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Deniz */}
      <m.path d={map.coast} fill={`url(#${uid}sea)`} variants={fade} />
      <m.text x={300} y={350} textAnchor="middle" className="fill-muted text-[13px] font-bold tracking-[0.3em]" variants={fade}>
        MARMARA · İZMİT KÖRFEZİ
      </m.text>

      {/* Menzil halkaları */}
      <g transform={`translate(${hq.pos[0]} ${hq.pos[1]})`}>
        <circle r={150} fill="none" stroke="var(--color-ink)" strokeOpacity={0.25} strokeDasharray="4 6" />
        {[0, 0.9, 1.8].map((dl) => (
          <circle
            key={dl}
            r={150}
            fill="var(--color-signal)"
            fillOpacity={0.18}
            className="radar"
            style={{ '--d': `${dl}s` } as CSSProperties}
          />
        ))}
        <text y={-158} textAnchor="middle" className="fill-muted text-[12px] font-bold tracking-[0.18em]" style={halo}>
          {site.avgArrivalMinutes} DK MENZİL
        </text>
      </g>

      {/* Bağlantı yolları */}
      {map.links.map((d) => (
        <m.path key={d} d={d} fill="none" stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="5 5" variants={fade} />
      ))}

      {/* Ana yollar: kenar + renk, kendini çizer */}
      {map.roads.map((r) => (
        <g key={r.code}>
          <m.path d={r.d} fill="none" stroke="var(--color-card)" strokeWidth={11} strokeLinecap="round" variants={revealLine} />
          <m.path d={r.d} fill="none" stroke={roadColor[r.kind]} strokeWidth={6} strokeLinecap="round" variants={revealLine} />
        </g>
      ))}
      {map.roads.map((r) => (
        <m.g key={r.code} transform={`translate(${r.label[0]} ${r.label[1]})`} variants={fade}>
          <rect width={r.code.length * 11 + 16} height={22} rx={4} fill={roadColor[r.kind]} stroke="#fff" strokeWidth={2} />
          <text x={(r.code.length * 11 + 16) / 2} y={16} textAnchor="middle" fill="#fff" className="font-display text-[13px] font-extrabold">
            {r.code}
          </text>
        </m.g>
      ))}

      {/* Yolda dolaşan çekici */}
      <g>
        {reduce ? null : (
          <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={truckRoad.d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        )}
        <g transform={reduce ? `translate(${hq.pos[0]} ${hq.pos[1]})` : undefined}>
          <rect x={-15} y={-10} width={30} height={20} rx={6} fill="var(--color-ink)" />
          <path d="M-9,3 H3 V-4 H7 L10,0 V3 Z" fill="var(--color-signal)" />
          <circle cx={-5} cy={5} r={2} fill="var(--color-signal)" />
          <circle cx={6} cy={5} r={2} fill="var(--color-signal)" />
        </g>
      </g>

      {/* İlçeler */}
      {regions.map((r, i) => {
        const isHq = r.name === map.hq
        const isActive = active === r.name
        const o = labelOffset[r.label ?? 'top']
        return (
          <m.g key={r.name} custom={i} variants={node}>
            <circle
              cx={r.pos[0]}
              cy={r.pos[1]}
              r={isActive ? 12 : isHq ? 10 : 7}
              fill={isHq || isActive ? 'var(--color-signal)' : 'var(--color-card)'}
              stroke="var(--color-ink)"
              strokeWidth={2.5}
              style={{ transition: 'r .3s, fill .3s' }}
            />
            <text
              x={r.pos[0] + o.dx}
              y={r.pos[1] + o.dy}
              textAnchor={o.anchor}
              className={`fill-ink font-display ${isActive ? 'text-[22px] font-extrabold' : 'text-[18px] font-bold'}`}
              style={{ ...halo, transition: 'font-size .3s' }}
            >
              {r.name}
            </text>
          </m.g>
        )
      })}

      {/* Kuzey oku + ölçek notu */}
      <g transform="translate(566 34)" className="fill-ink">
        <path d="M0,-18 L7,6 L0,1 L-7,6 Z" />
        <text y={24} textAnchor="middle" className="text-[11px] font-bold">
          K
        </text>
      </g>
      <text x={12} y={372} className="fill-muted text-[10px] font-bold tracking-[0.2em]">
        ŞEMATİK · ÖLÇEKSİZ
      </text>
    </m.svg>
  )
}
