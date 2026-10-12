import { site } from '../data/site'

export const telHref = `tel:${site.phoneE164}`

export function whatsappHref(extra = '') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage + extra)}`
}

export function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
}

/**
 * Tarayıcıdan konumu ister. İzin verilmezse, desteklenmiyorsa ya da zaman aşımına
 * uğrarsa null döner; çağıran taraf konumsuz mesajla devam eder.
 */
export function getPosition(timeoutMs = 8000): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null)
    let done = false
    const finish = (v: GeolocationCoordinates | null) => {
      if (done) return
      done = true
      resolve(v)
    }
    // Bazı tarayıcılar izin penceresi açıkken timeout'u saymaz; yedek zamanlayıcı.
    const guard = window.setTimeout(() => finish(null), timeoutMs + 4000)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(guard)
        finish(pos.coords)
      },
      () => {
        window.clearTimeout(guard)
        finish(null)
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}
