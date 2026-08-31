// tempo.js için hızlı doğrulama. Arayüz testi yok, bu boşluğu kısmen
// kapatıyor: hesapların beklenen sayıları ürettiğini kontrol eder.
//
// Çalıştırma: node scripts/tempo-testi.mjs

import { createProject } from '../src/lib/project.js'
import {
  haftaBasi,
  haftaOzeti,
  fazGerceklesen,
  fazKarsilastirmasi,
  genelKarsilastirma,
} from '../src/lib/tempo.js'

let gecen = 0
let kalan = 0

function kontrol(ad, kosul, detay) {
  if (kosul) {
    gecen += 1
    console.log('  gecti: ' + ad)
  } else {
    kalan += 1
    console.log('  KALDI: ' + ad + (detay ? '  -> ' + detay : ''))
  }
}

// Yerel tarihe göre. toISOString UTC'ye çevirdiği için UTC+3'te yerel
// gece yarısı bir önceki güne düşüyor ve karşılaştırmalar kayıyordu.
function isoOf(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

const proje = createProject({
  name: 'Test',
  genreId: 'bulmaca',
  scaleId: 'kucuk',
  experienceId: 'yeni',
  engineId: 'yeni',
  artId: 'basit',
  teamId: 'tek',
  dailyMinutes: 60,
  daysPerWeek: 5,
  deadline: '2027-01-01',
  pitch: 'Test oyunu',
})

console.log('1. Taban tahmin kaydediliyor mu')
kontrol('baseline var', proje.baseline && proje.baseline.requiredHours > 0,
  JSON.stringify(proje.baseline))

console.log('2. Hafta basi pazartesi mi')
const pazar = new Date('2026-08-30T12:00:00')
const carsamba = new Date('2026-08-26T12:00:00')
kontrol('pazar gunu icin hafta basi 24 Agustos', isoOf(haftaBasi(pazar)) === '2026-08-24',
  isoOf(haftaBasi(pazar)))
kontrol('carsamba icin hafta basi 24 Agustos', isoOf(haftaBasi(carsamba)) === '2026-08-24',
  isoOf(haftaBasi(carsamba)))

console.log('3. Hafta ozeti toplami')
const bugun = new Date()
const bas = haftaBasi(bugun)
proje.sessions = [
  { id: '1', date: isoOf(bas), minutes: 30, stepId: 'p-1' },
  { id: '2', date: isoOf(new Date(bas.getTime() + 86400000)), minutes: 45, stepId: 'p-2' },
  // Adima bagli olmayan kayit: toplama girer, faz dagilimina girmez.
  { id: '3', date: isoOf(new Date(bas.getTime() + 86400000)), minutes: 20, stepId: null },
]
const ozet = haftaOzeti(proje, bugun)
kontrol('toplam 95 dakika', ozet.toplamDakika === 95, String(ozet.toplamDakika))
kontrol('hedef 300 dakika (60 x 5)', ozet.hedefDakika === 300, String(ozet.hedefDakika))
kontrol('calisilan gun 2', ozet.calisilanGun === 2, String(ozet.calisilanGun))
kontrol('yedi gun donuyor', ozet.gunler.length === 7, String(ozet.gunler.length))

console.log('4. Faz dagilimi')
const dagilim = fazGerceklesen(proje)
kontrol('konsept 75 dakika', dagilim.byPhase.konsept === 75, JSON.stringify(dagilim.byPhase))
kontrol('dagitilmamis 20 dakika', dagilim.dagitilmamis === 20, String(dagilim.dagitilmamis))

console.log('5. Faz karsilastirmasi')
const karsi = fazKarsilastirmasi(proje)
const konsept = karsi.satirlar.find((s) => s.id === 'konsept')
kontrol('konsept olculdu', konsept.olculdu === true)
kontrol('faz bitmeden sapma verilmiyor', konsept.sapmaSaat === null, String(konsept.sapmaSaat))
kontrol('sekiz faz donuyor', karsi.satirlar.length === 8, String(karsi.satirlar.length))

console.log('6. Kapi gecilince sapma hesaplaniyor')
proje.gatePassed = { konsept: true }
const karsi2 = fazKarsilastirmasi(proje)
const konsept2 = karsi2.satirlar.find((s) => s.id === 'konsept')
kontrol('durum bitti', konsept2.durum === 'bitti', konsept2.durum)
kontrol('sapma sayi donuyor', typeof konsept2.sapmaSaat === 'number', String(konsept2.sapmaSaat))

console.log('7. Tek bitmis fazda katsayi verilmiyor')
const genel = genelKarsilastirma(proje)
kontrol('katsayi yok', genel.sapmaKatsayisi === null, String(genel.sapmaKatsayisi))
kontrol('yeterliVeri false', genel.yeterliVeri === false)
kontrol('ilk tahmin okunuyor', genel.ilkTahminSaat === proje.baseline.requiredHours,
  String(genel.ilkTahminSaat))

console.log('8. Iki bitmis fazda katsayi veriliyor')
proje.sessions.push({ id: '4', date: isoOf(bas), minutes: 120, stepId: 'oa-1' })
proje.gatePassed = { konsept: true, 'on-uretim': true }
const genel2 = genelKarsilastirma(proje)
kontrol('katsayi hesaplandi veya olculmemis faz yuzunden yok',
  genel2.bitmisFazSayisi >= 1, String(genel2.bitmisFazSayisi))

console.log('')
console.log('Sonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
process.exit(kalan > 0 ? 1 : 0)
