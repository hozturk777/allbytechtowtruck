// Bir kareden AVIF, WebP ve JPEG poster üretir: public/<ad>.{avif,webp,jpg}
// Kullanım: node scripts/make-poster.mjs kare.png [ad=poster]
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const [src, name = 'poster'] = process.argv.slice(2)
if (!src) throw new Error('kaynak kare ver: node scripts/make-poster.mjs kare.png [ad]')
const pub = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
const img = sharp(src)
const sizes = await Promise.all([
  img.clone().avif({ quality: 50 }).toFile(`${pub}/${name}.avif`),
  img.clone().webp({ quality: 72 }).toFile(`${pub}/${name}.webp`),
  img.clone().jpeg({ quality: 72, mozjpeg: true }).toFile(`${pub}/${name}.jpg`),
])
const { width, height } = await img.metadata()
console.log(`${name}: ${width}x${height} → avif ${Math.round(sizes[0].size / 1024)} KB, webp ${Math.round(sizes[1].size / 1024)} KB, jpg ${Math.round(sizes[2].size / 1024)} KB`)
