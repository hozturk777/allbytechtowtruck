#!/usr/bin/env bash
# Videodan kaydırma kareleri üretir: public/frames/{desktop,mobile}.bin (tek dosyalık,
# akışla inen paketler) ve public/frames/manifest.json.
#
# Kullanım:  npm run frames -- video.mp4 [fps] [mobil_kirpma_merkezi_x] [baslangic_sn] [bitis_sn]
#   fps                 saniyedeki kare (varsayılan 30)
#   mobil_kirpma_x      telefonda kırpılacak şeridin yatay merkezi, 0..1
#                       (varsayılan 0.6 — araç sağda; videoya göre ayarla)
#   baslangic_sn        videonun kullanılacak ilk saniyesi (varsayılan 0)
#   bitis_sn            videonun kullanılacak son saniyesi (varsayılan: sonuna kadar)
#
# Örnek (şu anki video, 4–9. saniyeler):  npm run frames -- ../video.mp4 24 0.62 4 9
#
# Masaüstü: hareket kestirimli ara karelerle (minterpolate) kaynağın 2 katı fps
#           (24 → 48): yavaş kaydırmada bile kareler adım adım değil akarak değişir.
#           En fazla 1280 px genişlik (kaynaktan büyük yapılmaz), mozjpeg q56.
# Telefon:  dikey ekranda cover yalnız orta şeridi gösterir → o şerit (3:4) kırpılır,
#           540 px yükseklik (tuval telefonda 1x çizilir; ekrandaki alan ~390×460),
#           kaynaktaki her kare (ara kare yok: Slow 4G'de paket ~1,7 MB kalsın),
#           mozjpeg q60.
# JPEG: iOS JPEG'i WebP'den ~2 kat hızlı çözer.
#
# Ortam değişkenleri: DFPS (masaüstü fps, varsayılan 2×fps), MSTEP (telefonda her
# kaçıncı kare, varsayılan 1), DQ, MQ (kalite), MH (telefon yüksekliği).
set -euo pipefail

IN="${1:?video dosyası ver: npm run frames -- video.mp4}"
FPS="${2:-30}"
CX="${3:-0.6}"
START="${4:-0}"
END="${5:-}"
DFPS="${DFPS:-$((FPS * 2))}"
MSTEP="${MSTEP:-1}"
DQ="${DQ:-56}"
MQ="${MQ:-60}"
MH="${MH:-540}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/frames"
TMP="$(mktemp -d -t framesXXXX)"
trap 'rm -rf "$TMP"' EXIT

# Kırpma: -ss/-to girişte; yeniden kodlandığı için kare doğruluğunda kesilir
TRIM=(-ss "$START")
[ -n "$END" ] && TRIM+=(-to "$END")

mkdir -p "$TMP/desktop" "$TMP/mobile"

ffmpeg -loglevel error "${TRIM[@]}" -i "$IN" \
  -vf "fps=$FPS,minterpolate=fps=$DFPS:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale='min(1280,iw)':-2:flags=lanczos" \
  "$TMP/desktop/f_%04d.png"

ffmpeg -loglevel error "${TRIM[@]}" -i "$IN" \
  -vf "fps=$FPS,select='not(mod(n\,$MSTEP))',crop='ih*3/4:ih:max(0\,min(iw-ih*3/4\,iw*$CX-ih*3/8)):0',scale=-2:'min($MH,ih)':flags=lanczos" \
  -fps_mode vfr "$TMP/mobile/f_%04d.png"

rm -rf "$OUT/desktop" "$OUT/mobile" "$OUT"/*.bin
node "$ROOT/scripts/encode-frames.mjs" "$TMP/desktop" "$OUT/desktop" "$DQ"
node "$ROOT/scripts/encode-frames.mjs" "$TMP/mobile" "$OUT/mobile" "$MQ"

# Kullanılan aralığın ilk karesi → poster: masaüstü public/poster.* ve telefon
# public/poster-m.* (kırpılmış, küçük). Sayfa açılırken ve kareler çözülene kadar
# gösterilir; önceden render edilen HTML de bunları kullanır.
node "$ROOT/scripts/make-poster.mjs" "$TMP/desktop/f_0001.png" poster
node "$ROOT/scripts/make-poster.mjs" "$TMP/mobile/f_0001.png" poster-m

# Kareleri tek dosyalık paketlere çevir (kabadan inceye sıralı) + manifest.json
node "$ROOT/scripts/pack-frames.mjs" "$OUT" desktop mobile
rm -f "$OUT"/*.jpg
ls -lh "$OUT"/*.bin | awk '{print $5, $9}'
