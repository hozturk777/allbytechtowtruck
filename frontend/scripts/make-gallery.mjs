// Galeri fotoğraflarını web için hazırlar.
// Kullanım:  npm run gallery -- ../galeri
//
// Klasördeki her .jpg/.jpeg/.png/.webp/.avif için (dosya adı sırasıyla):
//   public/gallery/<ad>-<genişlik>.{avif,webp}  (480, 960, 1600; kaynaktan büyük yapılmaz)
//   public/gallery/<ad>.jpg                      (eski tarayıcılar için tek boy, 960)
// ve src/data/gallery.gen.json (boyutlar, baskın renk). <ad>: dosya adının
// küçük harfli, Türkçe karaktersiz hâli (ör. "01 Taşıma.JPG" → "01-tasima").
// Yazılar (başlık, yer, alt metin) src/data/site.ts → gallery'de; aynı <ad> ile.
import sharp from 'sharp'
import { readdir, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname, basename } from 'node:path'

const src = process.argv[2]
if (!src) throw new Error('klasör ver: npm run gallery -- ../galeri')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = `${root}/public/gallery`
const WIDTHS = [480, 960, 1600]

const slug = (s) =>
  s
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort()
if (!files.length) throw new Error(`${src} içinde görsel yok`)

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

const manifest = {}
for (const f of files) {
  const name = slug(basename(f, extname(f)))
  // EXIF yönünü uygula (telefon fotoğrafları)
  const img = sharp(`${src}/${f}`).rotate()
  const { width, height } = await img.metadata()
  const { dominant } = await img.clone().stats()
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, width)))]
  let bytes = 0
  for (const w of widths) {
    const r = img.clone().resize({ width: w })
    const [a, b] = await Promise.all([
      r.clone().avif({ quality: 52, effort: 6 }).toFile(`${out}/${name}-${w}.avif`),
      r.clone().webp({ quality: 74 }).toFile(`${out}/${name}-${w}.webp`),
    ])
    if (w === widths.at(-1)) bytes += a.size
  }
  await img.clone().resize({ width: Math.min(960, width) }).jpeg({ quality: 74, mozjpeg: true }).toFile(`${out}/${name}.jpg`)
  // EXIF döndürmesi sonrası gerçek boyut
  const h = (await img.clone().toBuffer({ resolveWithObject: true })).info
  manifest[name] = {
    width: h.width,
    height: h.height,
    widths,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
  }
  console.log(`${name}: ${h.width}x${h.height} → ${widths.join('/')} px, en büyük avif ${Math.round(bytes / 1024)} KB`)
}
await writeFile(`${root}/src/data/gallery.gen.json`, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${files.length} görsel → public/gallery, src/data/gallery.gen.json`)
console.log('Yazıları src/data/site.ts → gallery içinde aynı adlarla düzenleyin.')
