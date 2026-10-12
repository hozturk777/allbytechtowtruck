// Kayıpsız ara kareleri (PNG) mozjpeg ile JPEG'e çevirir.
// mozjpeg, ffmpeg'in JPEG kodlayıcısından aynı görüntüde ~%30–40 küçük dosya verir.
// Baseline (progressive değil) ve 4:2:0: iOS'ta en hızlı çözülen JPEG.
// Kullanım: node scripts/encode-frames.mjs <png_klasoru> <cikis_klasoru> <kalite>
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const [src, out, q] = process.argv.slice(2)
if (!src || !out) throw new Error('kullanım: encode-frames.mjs <png_klasoru> <cikis> [kalite]')
await mkdir(out, { recursive: true })
const files = (await readdir(src)).filter((f) => f.endsWith('.png')).sort()
let bytes = 0
for (let i = 0; i < files.length; i += 8) {
  const infos = await Promise.all(
    files.slice(i, i + 8).map((f) =>
      sharp(join(src, f))
        .jpeg({ quality: Number(q) || 65, mozjpeg: true, progressive: false, chromaSubsampling: '4:2:0' })
        .toFile(join(out, f.replace(/\.png$/, '.jpg'))),
    ),
  )
  bytes += infos.reduce((a, x) => a + x.size, 0)
}
console.log(`${out.split('/').slice(-1)[0]}: ${files.length} kare, ort. ${Math.round(bytes / files.length / 1024)} KB, toplam ${(bytes / 1048576).toFixed(1)} MB`)
