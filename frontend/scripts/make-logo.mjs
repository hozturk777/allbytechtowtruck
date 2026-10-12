// Beyaz zeminli logoyu saydam zeminli, kırpılmış ve header'a göre boyutlanmış
// palet PNG'ye çevirir: src/assets/brand/logo.png (düz renkli logoda palet PNG,
// AVIF ve WebP'den küçük çıkıyor: 674×96 → ~20 KB)
//
// Beyaz → saydam "renk-alfa" yöntemiyle yapılır (GIMP Color to Alpha): her piksel
// beyazdan ne kadar uzaksa o kadar opak kalır, renk de buna göre geri çözülür.
// Böylece kenar yumuşatması (antialias) korunur, açık zeminde beyaz hale kalmaz.
//
// Kullanım: node scripts/make-logo.mjs ../logo.png [yükseklik_px=96]
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const [src, h = '96'] = process.argv.slice(2)
if (!src) throw new Error('kullanım: node scripts/make-logo.mjs logo.png [yükseklik]')
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/brand')

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const out = Buffer.alloc(info.width * info.height * 4)
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  let a = Math.max(255 - r, 255 - g, 255 - b) / 255
  if (a < 0.06) a = 0 // zemindeki hafif gürültü tamamen saydam olsun
  const un = (c) => (a ? Math.round(255 - (255 - c) / a) : 0)
  out[j] = un(r)
  out[j + 1] = un(g)
  out[j + 2] = un(b)
  out[j + 3] = Math.round(a * 255)
}
const trimmed = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer()
const png = await sharp(trimmed)
  .resize({ height: Number(h), kernel: 'lanczos3' })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(`${outDir}/logo.png`)
console.log(`logo: ${png.width}x${png.height} · ${Math.round(png.size / 1024)} KB → src/assets/brand/logo.png`)
