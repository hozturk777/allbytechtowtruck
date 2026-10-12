// Derleme sonrası: sayfayı HTML olarak önceden render eder; böylece ilk içerik
// JS indirilmeden görünür (zayıf mobil bağlantıda hızlı ilk boyama + SEO).
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const htmlPath = resolve(root, 'dist/index.html')
const ssrDir = resolve(root, 'dist-ssr')

const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const html = await readFile(htmlPath, 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('dist/index.html içinde <!--app-html--> yok')

// Hero başlığının fontu (Latin alt kümesi) erken insin
const font = (await readdir(resolve(root, 'dist/assets'))).find((f) =>
  /^archivo-latin-wide-.*\.woff2$/.test(f),
)
const preload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />\n  </head>`
  : '</head>'

// Küçük CSS'i satır içine al: render'ı engelleyen ayrı istek kalmasın (ilk boyama hızlanır)
let out = html.replace('<!--app-html-->', render()).replace('</head>', preload)
const cssLink = out.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (cssLink) {
  const css = await readFile(resolve(root, 'dist', cssLink[1].slice(1)), 'utf8')
  out = out.replace(cssLink[0], () => `<style>${css}</style>`)
}

// Kare manifesti HTML'e gömülür (ayrı istek yok). Kare paketi için <head>'de
// preload KULLANILMAZ: ilk boyamadan önce başlayan 1,7–10 MB'lık istek Lighthouse'un
// LCP/TTI simülasyonuna sayılıyor (11 sn, puan 75). Paketi FrameSequence sayfa
// yüklendikten hemen sonra ister (bkz. afterLoad).
try {
  const mf = await readFile(resolve(root, 'dist/frames/manifest.json'), 'utf8')
  out = out.replace(
    '</head>',
    `  <script id="frames-manifest" type="application/json">${mf.replace(/</g, '\\u003c')}</script>\n  </head>`,
  )
} catch {
  /* kare yoksa (npm run frames çalıştırılmadıysa) hero poster ile çalışır */
}

// Uygulama JS'i ilk boyamayla bant genişliği için yarışmasın: arama/WhatsApp
// butonları düz link olduğundan JS gelmeden de çalışır; JS düşük öncelikle iner.
out = out.replace('<script type="module" crossorigin', '<script type="module" fetchpriority="low" crossorigin')

await writeFile(htmlPath, out)
await rm(ssrDir, { recursive: true, force: true })
console.log('✓ prerender: dist/index.html')
