# Allbytech Çekici Hizmetleri — tek sayfalık site

Yolda kalmış, telefondan ve zayıf bağlantıyla giren kullanıcının **en hızlı şekilde
araması veya WhatsApp'tan yazması** için tasarlanmış demo site.

React + TypeScript (Vite), Tailwind CSS v4, Motion (Framer Motion), Lenis.

**Tasarım yönü: "teknik pafta".** Açık kâğıt zemin, milimetrik ızgara, ölçü çizgileri ve
kesim işaretleri; ikaz sarısı yalnızca fosforlu kalem vurgusu olarak. Footer bir teknik
çizim antet tablosudur.

## Kurulum ve çalıştırma

Node.js 20+ gerekir.

```bash
npm install
npm run dev       # geliştirme sunucusu → http://localhost:5173
npm run build     # üretim derlemesi (önceden render dahil) → dist/
npm run preview   # derlenmiş siteyi yerelde dene
npm start         # derle + önizle (aynı ağdaki telefondan da açılır: http://<bilgisayar-ip>:4317)
```

> **Hız testini `npm run dev` ile yapma.** Geliştirme sunucusunda önceden render yok,
> kod onlarca ayrı modül hâlinde iner; Slow 4G'de sayfa ~30 sn'de açılır. Üretim
> derlemesi (`npm start`) aynı koşulda ~1,3 sn'de açılır. Hız ve Lighthouse ölçümleri
> her zaman derlenmiş siteyle yapılmalı.

`dist/` klasörü herhangi bir statik barındırmaya (Vercel, Netlify, Cloudflare Pages,
cPanel) olduğu gibi yüklenebilir.

## Hero videosunu bağlama (kaydırmaya bağlı kare dizisi)

Hero, kaydırdıkça oynayan bir video sahnesidir. Video karelere bölünür, kaydırma
konumuna göre canvas'a çizilir.

```bash
npm run frames -- ../video.mp4 24 0.62 4 9   # şu anki video: 24 fps, kırpma 0.62, 4–9. saniyeler
npm run frames -- video.mp4                  # varsayılan: 30 fps, kırpma 0.6, videonun tamamı
npm run build
```

- Argümanlar: `video fps kırpma_merkezi başlangıç_sn bitiş_sn` (son ikisi isteğe bağlı).
- Script `public/frames/` altına masaüstü (en fazla 1600 px) ve telefon (3:4 kırpılmış;
  150 kareden uzun videoda her ikinci kare) setlerini JPEG olarak yazar, kullanılan
  aralığın ilk karesinden `public/poster.{avif,webp,jpg}` üretir ve `manifest.json` yazar. Manifest varsa hero kendiliğinden kare dizisine geçer; yoksa `public/poster.*`
  ve kamera hareketi taklidi gösterilir.
- Şu anki klip 5 sn (4–9. saniyeler). Masaüstü: hareket kestirimli ara karelerle 48 fps,
  237 kare, ~10,5 MB. Telefon: kaynağın 24 fps'i, 120 kare, ~1,7 MB. İkisi de tek
  dosyalık paket olarak, kabadan inceye sıralı ve akışla iner; ilk kaba katman
  (her 8. kare) masaüstünde ~1,4 MB'ta gelir ve tüm klip hemen kaydırılabilir.
- Telefon kırpma merkezi: aracın kadrajdaki yatay konumu (0 sol, 1 sağ).
- Metin aşamaları ve zamanlaması: `src/sections/HeroScene.tsx` (`STAGES`, `LOAD_RANGE`,
  `LOAD_FROM`, `useTransform` aralıkları). Klip değişirse bunları da ona göre ayarla. Sahne uzunluğu: `src/index.css` → `--scene-len` (dokunmatikte 1.7 katı).
- Kareler `<img>` + `img.decode()` ile, gösterilen kareye en yakından başlayarak ve sınırlı
  eşzamanlılıkla çözülür (`src/lib/frameSequence.ts`). Sahne boyu svh/dvh yerine açılışta
  ölçülen sabit `--vh` ile verilir (`src/lib/stableViewport.ts`).

## Galeri fotoğrafları

1. Fotoğrafları bir klasöre koyun (ör. `../galeri`). Dosya adları sırayı ve adı belirler:
   `01-tasima.jpg`, `02-sabitleme.jpg` … (telefon fotoğrafı da olur, yönü düzeltilir).
2. Çalıştırın:
   ```bash
   npm run gallery -- ../galeri
   ```
   Her fotoğraf için 480/960/1600 px AVIF + WebP ve yedek JPEG üretir
   (`public/gallery/`), boyutları ve baskın rengi `src/data/gallery.gen.json`'a yazar.
3. `src/data/site.ts` → `gallery` içinde her fotoğrafın başlığını, yerini ve alt
   metnini yazın (`file`: uzantısız, küçük harfli, Türkçe karaktersiz dosya adı).
   Sıra buradan belirlenir; ilki büyük gösterilir. Düzen 6 fotoğrafa göre; 4–8 arası da olur.

Şu anki 6 fotoğraf yer tutucudur (`../img` görselleri ve videodan alınmış kareler).

## Başka bir firmaya uyarlama

Firma bilgilerinin tamamı tek dosyada: **`src/data/site.ts`**

- Ad, telefon, WhatsApp numarası, hazır WhatsApp mesajı
- Ortalama varış süresi, çalışma saatleri
- Hizmet bölgeleri ve yollar, hizmetler, "neden biz" maddeleri, adımlar, SSS
- Site adresi (`url`), SEO başlığı ve açıklaması, koordinat
- Bölge haritası (`map`): yolların SVG path verisi ve `regions[].pos` konumları (600×380 şema)

`<title>`, meta etiketleri ve JSON-LD şeması (TowingService/LocalBusiness + FAQPage)
derleme sırasında bu dosyadan üretilir; başka bir yere dokunmanız gerekmez.

## Proje yapısı

```
src/
  data/site.ts        ← firma bilgileri (tek kaynak)
  sections/           ← sayfa bölümleri (Hero, Hizmetler, Neden biz, Bölgeler, Nasıl çalışır, SSS, İletişim, Footer)
  components/         ← butonlar, sabit arama çubuğu, accordion, ikonlar, levha
  lib/                ← iletişim linkleri + konum, SEO/JSON-LD, animasyon varyantları, yumuşak kaydırma
  entry-server.tsx    ← derlemede HTML'i önceden render eder
scripts/prerender.mjs ← render edilen HTML'i dist/index.html'e yazar
```

## Notlar

- **Önceden render (prerender):** Sayfa derlemede HTML olarak üretilir, CSS satır içine
  gömülür. Böylece içerik JS beklenmeden görünür. Arama ve WhatsApp butonları düz
  `tel:` / `wa.me` linkleri olduğu için JS yüklenmeden de çalışır.
- **Konum paylaşımı:** Tarayıcıdan konum istenir ve WhatsApp mesajına Google Maps linki
  eklenir. İzin verilmezse ya da konum 8 saniyede alınamazsa WhatsApp konumsuz mesajla
  açılır. Konum yalnızca HTTPS'te (ve `localhost`'ta) çalışır.
- **Animasyonlar:**
  - Hero metni ve butonları animasyonsuzdur. Fosforlu kalem ve kendini çizen çekici
    yalnızca CSS ile çalışır, JS'i beklemez.
  - Kaydırınca başlıklar kelime kelime açılır. "Neden biz" değerleri sayarak gelir,
    iletişimdeki numara sayaç gibi döner.
  - Harita yolları kendini çizer. Gebze'den menzil halkaları yayılır, D-100'de bir
    çekici sürekli dolaşır (SVG SMIL).
  - "Nasıl çalışır" çizgisi kaydırdıkça dolar. Header aşağı kaydırınca gizlenir, üstte
    okuma ilerleme çizgisi vardır.
  - `prefers-reduced-motion` açıksa tüm hareket kapanır, her şey son hâliyle görünür.
  - İçerik JS'siz de görünürdür: gizleme yalnızca JS yüklendikten sonra, ekran dışındaki
    öğelere uygulanır.
- **Görseller:** Sitede raster görsel yoktur; levha, ikon ve dokular SVG/CSS'tir. Gerçek
  fotoğraf eklenirse WebP/AVIF kullanın ve `width`, `height`, `loading="lazy"` verin.
  Hero'daki görsele `loading="lazy"` vermeyin.
- **Fontlar:** Archivo (başlık) ve Atkinson Hyperlegible Next (metin) yerelde barındırılır.
  Yalnızca Latin ve Türkçe karakter alt kümeleri yüklenir. Archivo dosyası, genişlik
  ekseni 112'de sabitlenmiş bir örnektir; böylece 90 KB yerine ~34 KB tutar
  (fontTools `instancer` ile üretildi).
- Telefon numarası ve site adresi şu an yer tutucudur; yayına almadan önce
  `src/data/site.ts` içinde güncelleyin.
