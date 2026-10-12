// Sticky sahnelerin boyu svh/dvh ile verilmez: iPhone'da Safari çubuğu açılıp
// kapanınca ekran ~80px değişir, ekranın birkaç katı uzun sahne sayfayı
// kısaltır ve sayfa sıçrar. Bunun yerine açılışta BÜYÜK ekran (100lvh) ölçülür
// ve sabit px olarak --vh'ye yazılır. Dokunmatikte yalnız genişlik değişince
// (ör. döndürme) güncellenir. --bars = lvh − svh: çubuk açıkken alttaki
// öğelerin altında kalmaması için o kadar yukarı alınır.

function probe(height: string) {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = `position:fixed;top:0;left:0;width:0;height:${height};visibility:hidden;pointer-events:none;`
  document.body.appendChild(el)
  return el
}

export function initStableViewport() {
  const root = document.documentElement
  const large = probe('100lvh')
  const small = probe('100svh')
  const coarse = window.matchMedia('(pointer: coarse)').matches
  let lastWidth = -1

  const measure = (force: boolean) => {
    const width = window.innerWidth
    if (!force && coarse && width === lastWidth) return
    lastWidth = width
    const lvh = large.getBoundingClientRect().height || window.innerHeight
    const svh = small.getBoundingClientRect().height || window.innerHeight
    root.style.setProperty('--vh', `${Math.round(lvh)}px`)
    root.style.setProperty('--bars', `${Math.max(0, Math.round(lvh - svh))}px`)
  }

  measure(true)
  window.addEventListener('resize', () => measure(false))
}
