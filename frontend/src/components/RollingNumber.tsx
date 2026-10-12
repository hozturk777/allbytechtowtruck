import { useReveal } from '../lib/useReveal'

const DIGITS = '0123456789'

/**
 * Kilometre sayacı gibi: her rakam kendi silindirinde dönerek yerine oturur.
 * HTML'de rakamlar zaten doğru konumdadır (JS'siz de okunur).
 */
export function RollingNumber({ text, className = '' }: { text: string; className?: string }) {
  const { ref, show } = useReveal<HTMLSpanElement>('0px 0px -10% 0px')
  let n = 0
  return (
    <span ref={ref} className={`inline-flex tabular-nums ${className}`} aria-hidden="true">
      {[...text].map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i}>{ch === ' ' ? ' ' : ch}</span>
        const idx = n++
        const d = Number(ch)
        return (
          <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none">
            <span
              className="flex flex-col transition-transform ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{
                transform: `translateY(${show ? -d * 10 : 0}%)`,
                transitionDuration: show ? `${1100 + idx * 90}ms` : '0ms',
              }}
            >
              {[...DIGITS].map((x) => (
                <span key={x} className="h-[1em] leading-none">
                  {x}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
