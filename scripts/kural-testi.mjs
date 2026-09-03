// KURALLAR.md icindeki mekanik olarak dogrulanabilir maddeleri kilitler.
//
// Nicin var: bir kural belgede yazili olmasi sayesinde tutulmuyor, biri onu
// hatirladigi surece tutuluyor. Uc madde (emoji, em dash, alert/confirm) su
// anda eksiksiz tutuluyor; bu testin isi o durumu korumak, duzeltmek degil.
// Ilk yazildiginda sifir bulgu vermesi beklenen bir testtir.
//
// Kapsam disi birakilan madde ve gerekcesi dosyanin sonunda.
//
// Calistirma: node scripts/kural-testi.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let gecen = 0
let kalan = 0

function kontrol(ad, kosul, detay) {
  if (kosul) {
    gecen += 1
    console.log('  gecti: ' + ad)
  } else {
    kalan += 1
    console.log('  KALDI: ' + ad + (detay ? '\n         ' + detay : ''))
  }
}

// Taranmayacaklar. node_modules ve dist uretilen icerik; KARARLAR.md ile
// pano.html .gitignore icinde, yani repoya girmiyor ve kural kapsami disinda.
const ATLA = new Set(['node_modules', 'dist', '.git', 'KARARLAR.md', 'pano.html'])
const UZANTILAR = new Set(['.js', '.jsx', '.mjs', '.css', '.md', '.html', '.json', '.yml'])

function dosyalar(dizin) {
  const liste = []
  for (const ad of fs.readdirSync(dizin)) {
    if (ATLA.has(ad)) continue
    const tam = path.join(dizin, ad)
    if (fs.statSync(tam).isDirectory()) {
      liste.push(...dosyalar(tam))
    } else if (UZANTILAR.has(path.extname(ad))) {
      liste.push(tam)
    }
  }
  return liste
}

const hepsi = dosyalar(kok)
const goreli = (p) => path.relative(kok, p).split(path.sep).join('/')

// Bir desene uyan satirlari toplar. Bulgu listesi dondurur.
function tara(desen) {
  const bulgular = []
  for (const dosya of hepsi) {
    const satirlar = fs.readFileSync(dosya, 'utf8').split('\n')
    satirlar.forEach((satir, i) => {
      desen.lastIndex = 0
      const esl = satir.match(desen)
      if (esl) {
        bulgular.push(goreli(dosya) + ':' + (i + 1) + '  ' + satir.trim().slice(0, 70))
      }
    })
  }
  return bulgular
}

console.log('KURALLAR.md kilidi')
console.log('')

// ── 1. Emoji kullanilmaz ──────────────────────────────────────────────────
// Ikon gerekiyorsa Lucide cizim stilinde gomulu SVG kullaniliyor
// (src/components/Icon.jsx).
console.log('1. Emoji kullanilmaz')
// FE0F (variation selector) karakter sinifinin disinda, alternatif olarak
// yazildi. Sinifin icindeyken oxlint no-misleading-character-class uyarisi
// veriyor: birlesen bir karakter, aralikla yan yana durunca yaniltici.
const emojiBulgu = tara(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\u{FE0F}/u)
kontrol('hicbir dosyada emoji yok', emojiBulgu.length === 0, emojiBulgu.slice(0, 8).join('\n         '))

// ── 2. Em dash kullanilmaz ────────────────────────────────────────────────
// Gerekirse virgul, iki nokta ust uste, parantez veya ayri cumleler.
console.log('2. Em dash kullanilmaz')
// Desen kod noktasindan uretiliyor: bu dosya da kurala tabi ve icinde
// gercek em dash karakteri bulunmamali. Aksi halde tarayici kendi kaynagini
// ihlal olarak isaretlerdi.
const emDashBulgu = tara(new RegExp(String.fromCharCode(0x2014)))
kontrol('hicbir dosyada em dash yok', emDashBulgu.length === 0, emDashBulgu.slice(0, 8).join('\n         '))

// ── 3. alert() ve confirm() kullanilmaz ───────────────────────────────────
// Yerine toast bildirimleri ve bilesen icinde onay adimi kullaniliyor.
// Yorum satirlari haric tutuluyor: kuralin kendisini anlatan yorumlar var.
console.log('3. Tarayici diyaloglari kullanilmaz')
const cagriBulgu = []
for (const dosya of hepsi) {
  if (!['.js', '.jsx', '.mjs', '.html'].includes(path.extname(dosya))) continue
  fs.readFileSync(dosya, 'utf8').split('\n').forEach((satir, i) => {
    const kirpik = satir.trim()
    if (kirpik.startsWith('//') || kirpik.startsWith('*') || kirpik.startsWith('/*')) return
    if (/(?:^|[^.\w])(?:window\.)?(alert|confirm)\s*\(/.test(satir)) {
      cagriBulgu.push(goreli(dosya) + ':' + (i + 1) + '  ' + kirpik.slice(0, 70))
    }
  })
}
kontrol('tarayici diyalogu cagrilmiyor', cagriBulgu.length === 0, cagriBulgu.slice(0, 8).join('\n         '))

// ── 4. Tarayici gercekten dosya buluyor ───────────────────────────────────
// Ustteki uc test, dosya listesi bos kalirsa sessizce gecerdi. Bu testin tek
// isi bunu engellemek: bir tarayici hatasi yesil sonuc uretmemeli.
console.log('4. Tarama gecerli')
kontrol('yeterli sayida dosya tarandi', hepsi.length > 20, 'bulunan: ' + hepsi.length)
kontrol('src altindaki bilesenler kapsamda',
  hepsi.some((d) => goreli(d).startsWith('src/components/')),
  'src/components/ altindan dosya gelmedi')

console.log('')
console.log('Sonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
process.exit(kalan > 0 ? 1 : 0)

// ── Bilincli olarak kapsam disi ───────────────────────────────────────────
//
// "Buton olarak kullanilan her ogede color acikca tanimlanir" kurali test
// EDILMEDI. Denendi ve vazgecildi: index.css:356'da temel bir `button` blogu
// var ve pek cok secici rengi kaskadla oradan aliyor. Bir secicinin rengi
// gercekten alip almadigini statik olarak anlamak, CSS kaskadini yeniden
// hesaplamayi gerektiriyor. Yaklasik bir tarama yanlis pozitif uretir.
//
// Yanlis pozitif ureten test, testsizlikten kotudur: birkac kez bosuna
// kirildiginda kimse bakmaz ve gercek bulgu araya karisir. Bu madde
// KURALLAR.md'de kaliyor ve gozden gecirmede insan tarafindan kontrol
// ediliyor, yani zorlama merdiveninde belge basamaginda.
//
// Ton kurallari (sistem dogruyu soyler, cezalandirilmaz, bilinmeyen sayi
// uydurulmaz) da mekanik olarak dogrulanamaz. Onlar insan yargisi gerektiriyor.
