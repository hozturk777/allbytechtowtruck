// Kaydırmaya bağlı kare dizisi (canvas).
//
// Kurallar:
// - Kareler tek dosyalık bir paketten (frames/<set>.bin) TEK istekte, akış olarak
//   iner (sayfa yüklendikten hemen sonra, bkz. afterLoad); her kare tamamlandığı
//   anda kullanılabilir. Yavaş mobil ağda süre istek
//   sayısından gelir (Slow 4G ~560 ms gecikme): ayrı ayrı 60 dosya onlarca saniye
//   sürerken paket birkaç saniyede iner.
// - Paket kabadan inceye sıralıdır (bkz. scripts/pack-frames.mjs): küçük bir kısmı
//   inince videonun tamamı kaba hâliyle kaydırılabilir, gerisi geldikçe akıcılaşır.
// - Kareler <img> + img.decode() ile çözülür (createImageBitmap DEĞİL: WebKit
//   onu ana iş parçacığında çözüp kaydırmayı donduruyor).
// - Hepsi birden değil; gösterilen kareye en yakından başlayarak, sınırlı
//   eşzamanlılıkla ve yalnızca bir pencere içinde çözülür. Pencere dışı atılır.
// - Gösterilen kare hedefe sınırlı hızla yaklaşır (CONFIG.minClip);
//   hızlı savuruşta video sıçramaz, akar.
// - İstenen kare hazır değilse en yakın çözülmüş kare çizilir.
// - Konum iki kare arasındaysa ikisi oranına göre harmanlanır (crossfade): çok
//   yavaş kaydırmada bile kare değişimi adım adım değil akarak olur.
// - Dokunmatikte ayrı hafif set (mobile), daha dar pencere, 1x tuval.
// - Veri tasarrufu açıksa ya da bağlantı 2G ise kareler hiç indirilmez
//   (shouldLoadFrames); hero poster + kamera taklidiyle çalışır.

export type FrameSet = {
  count: number
  width: number
  height: number
  /** Kabadan inceye sıralı, art arda eklenmiş JPEG'ler */
  pack: string
  /** Paketteki k. parçanın kare numarası */
  order: number[]
  /** Paketteki k. parçanın bayt boyu */
  sizes: number[]
}

export type FrameManifest = {
  desktop: FrameSet
  mobile?: FrameSet
}

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// Pencere: gösterilen karenin önünde/arkasında çözülü tutulan kare sayısı.
// Telefonda 20 (406×540 çözülmüş ~0,9 MB), masaüstünde 32 (1280×720 ~3,7 MB).
// minClip: tüm klibin en az kaç saniyede geçilebileceği (hız sınırı kare sayısına
// göre ölçeklenir; sabit kare/sn sınırı 240 karelik sette hızlı kaydırmada videoyu
// geride bırakırdı).
const CONFIG = COARSE
  ? { window: 20, keep: 28, concurrency: 3, minClip: 0.6, dprCap: 1 }
  : { window: 32, keep: 40, concurrency: 4, minClip: 0.7, dprCap: 2 }

/** Veri tasarrufu açık ya da bağlantı çok yavaşsa kareler indirilmez */
export function shouldLoadFrames() {
  if (typeof navigator === 'undefined') return false
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !(c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ''))
}

export async function loadManifest(url = '/frames/manifest.json'): Promise<FrameManifest | null> {
  // Derlemede HTML'e gömülür (scripts/prerender.mjs): ayrı istek, ayrı gecikme yok
  const inline = typeof document !== 'undefined' ? document.getElementById('frames-manifest') : null
  if (inline?.textContent) {
    try {
      return JSON.parse(inline.textContent) as FrameManifest
    } catch {
      /* bozuksa ağdan dene */
    }
  }
  try {
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) return null
    if (!(res.headers.get('content-type') || '').includes('json')) return null
    const data = (await res.json()) as FrameManifest
    if (!data?.desktop?.count || !data.desktop.pack) return null
    return data
  } catch {
    return null
  }
}

/**
 * Sayfa yüklendikten kısa süre sonra çözülür. Büyük kare paketi ilk boyamayla
 * (LCP) yarışmasın: erken başlayan MB'lık istek Lighthouse simülasyonunda LCP'yi
 * 2 sn'den 11 sn'ye çıkarıyor. Gerçek telefonda gecikme ~0,3 sn; o sırada aynı
 * kareyi gösteren poster ekrandadır.
 */
function afterLoad(delay = 300) {
  return new Promise<void>((done) => {
    const later = () => setTimeout(done, delay)
    if (document.readyState === 'complete') later()
    else addEventListener('load', later, { once: true })
  })
}

export class FrameSequence {
  private set: FrameSet
  private ctx: CanvasRenderingContext2D
  /** paketten gelmiş karelerin blob URL'leri */
  private urls = new Map<number, string>()
  private decoded = new Map<number, HTMLImageElement>()
  private loading = new Set<number>()
  private failed = new Set<number>()
  private pos = -1
  private dir = 1
  private drawn = -1
  private drawnKey = -1
  private dirty = true
  private raf = 0
  private last = 0
  private ro: ResizeObserver
  private abort = new AbortController()
  private destroyed = false

  private canvas: HTMLCanvasElement
  private getProgress: () => number
  private onFirstFrame?: () => void

  constructor(
    canvas: HTMLCanvasElement,
    manifest: FrameManifest,
    getProgress: () => number,
    onFirstFrame?: () => void,
  ) {
    this.canvas = canvas
    this.getProgress = getProgress
    this.onFirstFrame = onFirstFrame
    this.set = COARSE && manifest.mobile ? manifest.mobile : manifest.desktop
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('2D canvas yok')
    this.ctx = ctx
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()
    this.stream()
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    this.destroyed = true
    this.abort.abort()
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.decoded.forEach((img) => (img.src = ''))
    this.decoded.clear()
    this.urls.forEach((u) => URL.revokeObjectURL(u))
    this.urls.clear()
  }

  /** Paketi tek istekte akış olarak oku; her kare tamamlanınca blob URL'ini kaydet */
  private async stream() {
    const { pack, order, sizes } = this.set
    const total = sizes.reduce((a, b) => a + b, 0)
    const buf = new Uint8Array(total)
    let received = 0
    let k = 0
    let start = 0
    const flush = () => {
      while (k < order.length && received >= start + sizes[k]) {
        const blob = new Blob([buf.subarray(start, start + sizes[k])], { type: 'image/jpeg' })
        this.urls.set(order[k], URL.createObjectURL(blob))
        start += sizes[k]
        k++
        this.dirty = true
      }
    }
    try {
      await afterLoad()
      if (this.destroyed) return
      const res = await fetch(pack, { signal: this.abort.signal })
      if (!res.ok || !res.body) throw new Error(String(res.status))
      const reader = res.body.getReader()
      for (;;) {
        const { done, value } = await reader.read()
        if (done || this.destroyed) break
        const n = Math.min(value.length, total - received)
        buf.set(value.subarray(0, n), received)
        received += n
        flush()
      }
    } catch {
      /* iptal ya da ağ hatası: gelen kareler kullanılır, gelmeyen yerine en yakın çizilir */
    }
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap)
    const w = Math.round(this.canvas.clientWidth * dpr)
    const h = Math.round(this.canvas.clientHeight * dpr)
    if (w && h && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w
      this.canvas.height = h
      this.dirty = true
    }
  }

  private tick = (now: number) => {
    if (this.destroyed) return
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.1) : 0
    this.last = now

    const max = this.set.count - 1
    const target = Math.min(Math.max(this.getProgress(), 0), 1) * max
    if (this.pos < 0) this.pos = target

    // Hız sınırı: klip en az minClip saniyede geçilir
    const diff = target - this.pos
    const step = (this.set.count / CONFIG.minClip) * dt
    if (Math.abs(diff) <= step) this.pos = target
    else this.pos += Math.sign(diff) * step
    if (diff !== 0) this.dir = Math.sign(diff)

    const index = Math.round(this.pos)
    this.evict(index)
    this.pump(index)
    this.draw(this.pos)

    this.raf = requestAnimationFrame(this.tick)
  }

  // Gösterilen kareye en yakından başla, gidiş yönündekine öncelik ver.
  // Yalnız paketten gelmiş kareler çözülür.
  private pump(center: number) {
    const max = this.set.count - 1
    let near = false
    for (let d = 0; d <= CONFIG.window && this.loading.size < CONFIG.concurrency; d++) {
      const ahead = center + d * this.dir
      const behind = center - d * this.dir
      for (const i of d === 0 ? [center] : [ahead, behind]) {
        if (this.loading.size >= CONFIG.concurrency) break
        if (i < 0 || i > max) continue
        if (this.decoded.has(i) || this.loading.has(i)) {
          near = true
          continue
        }
        if (this.failed.has(i) || !this.urls.has(i)) continue
        near = true
        this.load(i)
      }
    }
    // Pencerede hiç kare yoksa (paket henüz inerken) pencere dışındaki en yakın
    // gelmiş kareyi çöz: ekranda hep bir kare olsun
    if (!near && this.loading.size < CONFIG.concurrency) {
      let best = -1
      this.urls.forEach((_, i) => {
        if (!this.failed.has(i) && (best < 0 || Math.abs(i - center) < Math.abs(best - center))) best = i
      })
      if (best >= 0 && !this.decoded.has(best) && !this.loading.has(best)) this.load(best)
    }
  }

  private load(i: number) {
    this.loading.add(i)
    const img = new Image()
    img.decoding = 'async'
    img.src = this.urls.get(i)!
    img
      .decode()
      .then(() => {
        if (this.destroyed) return
        this.decoded.set(i, img)
        this.dirty = true
      })
      .catch(() => this.failed.add(i))
      .finally(() => this.loading.delete(i))
  }

  private evict(center: number) {
    const keep = CONFIG.keep
    // ekrandaki kare ve harman komşusu atılmasın
    this.decoded.forEach((img, i) => {
      if (Math.abs(i - center) > keep && i !== this.drawn && i !== this.drawn + 1) {
        img.src = ''
        this.decoded.delete(i)
      }
    })
  }

  private nearestDecoded(index: number) {
    if (this.decoded.has(index)) return index
    for (let d = 1; d <= this.set.count; d++) {
      if (this.decoded.has(index - d)) return index - d
      if (this.decoded.has(index + d)) return index + d
      if (index - d < 0 && index + d >= this.set.count) break
    }
    return -1
  }

  private paint(img: HTMLImageElement, alpha = 1) {
    const cw = this.canvas.width
    const ch = this.canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    this.ctx.globalAlpha = alpha
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    this.ctx.globalAlpha = 1
  }

  private draw(pos: number) {
    const a = Math.floor(pos)
    const b = Math.min(a + 1, this.set.count - 1)
    // harman oranı 1/16 adımlarla: aynı görüntüyü her karede yeniden çizme
    const t = Math.round((pos - a) * 16) / 16
    const blend = b !== a && t > 0 && t < 1 && this.decoded.has(a) && this.decoded.has(b)
    const i = blend ? a : this.nearestDecoded(Math.round(pos))
    if (i < 0) return
    const key = blend ? a + t : i
    if (key === this.drawnKey && !this.dirty) return
    this.paint(this.decoded.get(i)!)
    if (blend) this.paint(this.decoded.get(b)!, t)
    if (this.drawn < 0) this.onFirstFrame?.()
    this.drawn = i
    this.drawnKey = key
    this.dirty = false
  }
}
