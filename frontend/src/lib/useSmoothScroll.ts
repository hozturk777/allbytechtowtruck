import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const MAX_STEP = 140 // tek olayda en fazla px (bir fare tıkı ~100px, kırpılmasın)
const MAX_LEAD = 360 // hedef, mevcut konumun en fazla bu kadar önünde

export function useSmoothScroll(lerp = 0.14) {
  useEffect(() => {
    const lenis: Lenis = new Lenis({
      lerp,
      virtualScroll: (data) => {
        const { event } = data
        const type = event.type
        if (type !== 'wheel') return true
        const sign = Math.sign(data.deltaY)
        let delta = sign * Math.min(Math.abs(data.deltaY), MAX_STEP)
        const lead = lenis.targetScroll - lenis.animatedScroll
        const room = Math.max(0, MAX_LEAD - sign * lead)
        delta = sign * Math.min(Math.abs(delta), room)
        if (delta === 0) {
          // ÖNEMLİ: olayı yutarken preventDefault şart. `false` dönünce Lenis
          // preventDefault çağırmadan çıkar; tarayıcı sayfayı kendisi kaydırır,
          // Lenis sonraki karede geri çeker → sayfa ileri-geri titrer.
          if (event.cancelable) event.preventDefault()
          return false
        }
        data.deltaY = delta
        return true
      },
      autoRaf: true,
      // Başlık payı CSS'teki scroll-margin-top'tan gelir (Lenis onu hesaba katar);
      // burada ayrıca offset verilirse pay iki kat olur
      anchors: true,
      respectReducedMotion: true,
    })
    return () => lenis.destroy()
  }, [lerp])
}
