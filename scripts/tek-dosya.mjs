// Derlenmiş panoyu tek bir HTML dosyasına gömer.
//
// NEDEN VAR
//
// Bu pano iki bilgisayar arasında taşınıyor: planlama iş bilgisayarında,
// oyun geliştirme kişisel bilgisayarda yapılıyor. Ayrıca bu makinedeki
// geliştirme araçları 30 gün sonunda kaldırılacak.
//
// `dist` klasörünü olduğu gibi taşıyıp `index.html` açmak çalışmıyor:
// tarayıcılar `file://` üstünden ES modülü yüklemeyi CORS gereği
// engelliyor. Sayfa bomboş açılıyor ve hata bile vermiyor.
//
// Ama SATIR İÇİ modül betikleri `file://` üstünde çalışıyor, çünkü
// engellenen şey modül DOSYASINI getirmek. Bu betik CSS ve JS'i
// index.html içine gömüp tek dosya üretiyor.
//
// Sonuç: `pano.html` tek başına taşınabilir, çift tıklanarak açılır,
// Node veya sunucu gerektirmez.
//
// SINIR: veriler tarayıcının localStorage'ında ve `file://` kaynağı
// sunucu kaynağından ayrıdır. Yani localhost'ta girdiğin veri bu
// dosyada görünmez. Taşıma için Ayarlar ekranındaki JSON dışa/içe
// aktarma kullanılır. Bu betik dosyayı taşır, veriyi değil.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(kok, 'dist')
const girdi = join(dist, 'index.html')
const cikti = join(kok, 'pano.html')

if (!existsSync(girdi)) {
  console.error('dist/index.html yok. Önce "npm run build" çalıştır.')
  process.exit(1)
}

let html = readFileSync(girdi, 'utf8')

// <script type="module" ... src="./assets/x.js"></script> -> içeriği göm
html = html.replace(
  /<script([^>]*)\ssrc="\.\/([^"]+)"([^>]*)><\/script>/g,
  (tam, once, yol, sonra) => {
    const dosya = join(dist, yol)
    if (!existsSync(dosya)) return tam
    const kod = readFileSync(dosya, 'utf8')
    // crossorigin, satır içi betikte anlamsız.
    const nitelikler = (once + sonra).replace(/\scrossorigin/g, '').trim()
    console.log('  gomuldu: ' + yol + ' (' + Math.round(kod.length / 1024) + ' KB)')
    return '<script ' + nitelikler + '>\n' + kod + '\n</script>'
  }
)

// <link rel="stylesheet" href="./assets/x.css"> -> <style>
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g,
  (tam, yol) => {
    const dosya = join(dist, yol)
    if (!existsSync(dosya)) return tam
    const css = readFileSync(dosya, 'utf8')
    console.log('  gomuldu: ' + yol + ' (' + Math.round(css.length / 1024) + ' KB)')
    return '<style>\n' + css + '\n</style>'
  }
)

// Kalan yerel varlık referansı var mı? Varsa tek dosya değil demektir.
const kalan = [...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map((m) => m[1])
if (kalan.length > 0) {
  console.warn('  UYARI: gömülemeyen yerel dosyalar var: ' + kalan.join(', '))
  console.warn('  Bu dosya tek başına çalışmayabilir.')
}

writeFileSync(cikti, html, 'utf8')
console.log('pano.html yazıldı (' + Math.round(html.length / 1024) + ' KB)')
console.log('Bu dosyayı tek başına taşıyıp çift tıklayarak açabilirsin.')
