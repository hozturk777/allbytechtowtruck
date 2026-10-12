import { useEffect, useRef } from 'react'
import { useReveal } from '../lib/useReveal'

/**
 * Metindeki ilk sayıyı görünüme girince 0'dan sayarak getirir ("7/24" → 0/24 … 7/24).
 * HTML'de son değer yazılıdır; sayma yalnızca JS yüklendikten sonra ve
 * ekrana henüz girmemiş öğede başlar. Sayı yoksa düz metin.
 */
export function CountUp({ value, className = '', duration = 1300 }: { value: string; className?: string; duration?: number }) {
  const { ref, show, hydrated, reduce } = useReveal<HTMLSpanElement>('0px 0px -15% 0px')
  const numRef = useRef<HTMLSpanElement>(null)
  const match = value.match(/\d+/)
  const target = match ? Number(match[0]) : 0
  const before = match ? value.slice(0, match.index) : value
  const after = match ? value.slice(match.index! + match[0].length) : ''
  const hasNum = !!match
  const armed = useRef(false)

  useEffect(() => {
    const el = numRef.current
    if (!el || !hasNum || reduce || !hydrated) return
    if (!show) {
      el.textContent = '0'
      armed.current = true
      return
    }
    if (!armed.current) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration)
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [show, hydrated, reduce, target, duration, hasNum])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {before}
        {match && <span ref={numRef}>{target}</span>}
        {after}
      </span>
    </span>
  )
}
