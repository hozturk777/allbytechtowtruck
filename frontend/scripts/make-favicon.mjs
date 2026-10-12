// Yuvarlak köşeli kare ikondan favicon setini üretir: public/favicon-{32,48}.png,
// public/apple-touch-icon.png (180).
// Kaynak RGB (şeffaflık yok): köşelerin dışındaki beyaz, köşe bölgelerinde
// renk-alfa yöntemiyle saydamlaştırılır; ikonun içindeki beyazlara dokunulmaz.
// iPhone ana ekran ikonu saydamlık desteklemediği için köşeler ikonun kendi
// mavisiyle doldurulur (iOS kendi yuvarlatmasını uygular).
//
// Kullanım: node scripts/make-favicon.mjs ../favicon.png
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const src = process.argv[2]
if (!src) throw new Error('kullanım: node scripts/make-favicon.mjs favicon.png')
const pub = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = (x, y) => (y * W + x) * 3
const isWhite = (i) => data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235

// Köşe yarıçapı: üst kenarda ilk beyaz olmayan piksel
let R = 0
while (R < W / 2 && isWhite(px(R, 0))) R++
R = Math.max(R, 8)

// İkonun zemin mavisi (merkezin biraz üstünden örnek)
const s = px(Math.round(W / 2), Math.round(H * 0.12))
const blue = { r: data[s], g: data[s + 1], b: data[s + 2] }

const out = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = px(x, y)
    const j = (y * W + x) * 4
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const inCorner = (x < R || x >= W - R) && (y < R || y >= H - R)
    let a = 1
    if (inCorner) {
      a = Math.max(255 - r, 255 - g, 255 - b) / 255
      if (a < 0.06) a = 0
    }
    const un = (c) => (a ? Math.round(255 - (255 - c) / a) : 0)
    out[j] = inCorner ? un(r) : r
    out[j + 1] = inCorner ? un(g) : g
    out[j + 2] = inCorner ? un(b) : b
    out[j + 3] = Math.round(a * 255)
  }
}
const icon = sharp(out, { raw: { width: W, height: H, channels: 4 } }).png()
const buf = await icon.toBuffer()
for (const size of [32, 48]) {
  await sharp(buf).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(`${pub}/favicon-${size}.png`)
}
await sharp(buf)
  .flatten({ background: blue })
  .resize(180, 180, { kernel: 'lanczos3' })
  .png({ compressionLevel: 9 })
  .toFile(`${pub}/apple-touch-icon.png`)
console.log(`favicon: köşe yarıçapı ${R}px, zemin rgb(${blue.r},${blue.g},${blue.b}) → favicon-32/48.png, apple-touch-icon.png`)
