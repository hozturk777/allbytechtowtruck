// Kare klasörlerini tek dosyalık paketlere çevirir ve public/frames/manifest.json yazar.
//
// Neden: yavaş mobil ağda (Slow 4G ~560 ms gecikme) her kare ayrı istek olunca
// süre boyuttan değil istek sayısından gelir; 60 küçük dosya bile onlarca saniye
// sürer. Paket tek istekte, akış olarak iner; oynatıcı her kareyi geldiği anda
// kullanır.
//
// Sıra kabadan inceye: önce ilk/son kare ve her 16. kare, sonra 8., 4., 2. ve
// tekler. Paketin küçük bir kısmı indiğinde videonun tamamı kaba hâliyle
// kaydırılabilir; gerisi geldikçe akıcılaşır.
//
// Kullanım: node scripts/pack-frames.mjs <frames_klasoru> desktop mobile
import { readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const [root, ...sets] = process.argv.slice(2)

function coarseToFine(count) {
  const order = []
  const seen = new Set()
  const add = (i) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  add(0)
  add(count - 1)
  let step = 1
  while (step * 2 < count) step *= 2
  for (; step >= 1; step /= 2) for (let i = 0; i < count; i += step) add(i)
  return order
}

const manifest = {}
for (const name of sets) {
  const dir = join(root, name)
  const files = (await readdir(dir)).filter((f) => f.endsWith('.jpg')).sort()
  const order = coarseToFine(files.length)
  const bufs = await Promise.all(order.map((i) => readFile(join(dir, files[i]))))
  const { width, height } = await sharp(bufs[0]).metadata()
  await writeFile(join(root, `${name}.bin`), Buffer.concat(bufs))
  await rm(dir, { recursive: true, force: true })
  const total = bufs.reduce((a, b) => a + b.length, 0)
  manifest[name] = {
    count: files.length,
    width,
    height,
    pack: `/frames/${name}.bin`,
    order,
    sizes: bufs.map((b) => b.length),
  }
  console.log(`${name}: ${files.length} kare, ${(total / 1048576).toFixed(2)} MB tek dosya`)
}
await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest))
