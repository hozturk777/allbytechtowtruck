import * as m from 'motion/react-m'
import { revealWord } from '../lib/motion'

/**
 * Metni kelimelere böler; her kelime kendi maskesinin altından yukarı kayar.
 * Üst öğe `animate` durumunu (show/hidden) ve stagger'ı sağlar.
 * Ekran okuyucu için metnin tamamı tek parça okunur.
 */
export function SplitWords({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={className}>
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <m.span className="inline-block" variants={revealWord}>
              {w}
            </m.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
