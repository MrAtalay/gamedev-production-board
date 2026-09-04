// backupStatus için doğrulama. Bu fonksiyonun tamamı saf olduğu için
// localStorage olmadan sınanabiliyor; damga dışarıdan veriliyor.
//
// Çalıştırma: node scripts/yedek-testi.mjs

import { backupStatus, storeSummary, yedekMetni } from '../src/lib/storage.js'

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

function gunOnce(gun) {
  return new Date(Date.now() - gun * 86400000).toISOString()
}

// Testin ihtiyacı olan alanlar storeSummary'nin okuduğu alanlar.
function proje(ad, oturumlar, adimlar) {
  const doneSteps = {}
  for (let i = 0; i < adimlar; i += 1) doneSteps['s' + i] = true
  return {
    name: ad,
    currentPhaseId: 'konsept',
    sessions: oturumlar,
    doneSteps,
    content: { items: [] },
  }
}

function store(p) {
  return { active: p, archive: [], sonDegisiklik: new Date().toISOString() }
}

// Günde 60 dakika, haftada 5 gün: haftalık karşılık 300 dakika.
const profil = { dailyMinutes: 60, daysPerWeek: 5 }

console.log('Yedek durumu')

console.log('\n1. Proje yokken gosterge cikmaz')
{
  const d = backupStatus(null, { active: null, archive: [] }, profil)
  kontrol('durum proje-yok', d.durum === 'proje-yok', d.durum)
  kontrol('uyari yok', d.uyari === false)
  kontrol('metin uretilmez', yedekMetni(d) === null)
}

console.log('\n2. Hic yedek alinmamissa uyarilir')
{
  const d = backupStatus(null, store(proje('Mytherra', [], 0)), profil)
  kontrol('durum hic', d.durum === 'hic', d.durum)
  kontrol('uyari var', d.uyari === true)
  kontrol('metin hic yedek alinmadigini soyluyor', yedekMetni(d).baslik.includes('hiç yedek alınmadı'))
}

console.log('\n3. Yedekten sonra degisiklik yoksa guncel')
{
  const p = proje('Mytherra', [{ minutes: 60 }], 3)
  const mark = { at: gunOnce(20), ozet: storeSummary(store(p)) }
  const d = backupStatus(mark, store(p), profil)
  kontrol('durum guncel', d.durum === 'guncel', d.durum)
  // 20 gun gecmis ama is birikmemis: uyarmak yanlis olurdu.
  kontrol('yirmi gun gecse de uyari yok', d.uyari === false)
  kontrol('gun sayisi dogru', d.gun === 20, String(d.gun))
}

console.log('\n4. Az is birikmisse ve bir hafta gecmemisse uyari yok')
{
  const eski = proje('Mytherra', [{ minutes: 60 }], 3)
  const mark = { at: gunOnce(2), ozet: storeSummary(store(eski)) }
  const yeni = proje('Mytherra', [{ minutes: 60 }, { minutes: 45 }], 4)
  const d = backupStatus(mark, store(yeni), profil)
  kontrol('durum birikti', d.durum === 'birikti', d.durum)
  kontrol('uyari yok', d.uyari === false)
  kontrol('dakika farki 45', d.fark.dakika === 45, String(d.fark.dakika))
  kontrol('adim farki 1', d.fark.adim === 1, String(d.fark.adim))
}

console.log('\n5. Bir hafta gecince uyarilir')
{
  const eski = proje('Mytherra', [{ minutes: 60 }], 3)
  const mark = { at: gunOnce(7), ozet: storeSummary(store(eski)) }
  const yeni = proje('Mytherra', [{ minutes: 60 }, { minutes: 20 }], 3)
  const d = backupStatus(mark, store(yeni), profil)
  kontrol('uyari var', d.uyari === true)
}

console.log('\n6. Bir haftalik tempo kadar is birikince takvim beklenmez')
{
  const eski = proje('Mytherra', [], 0)
  const mark = { at: gunOnce(2), ozet: storeSummary(store(eski)) }
  // 300 dakika: profilin haftalik karsiligi. Iki gunde yapilmis olmasi
  // risk miktarini degistirmiyor.
  const yeni = proje('Mytherra', [{ minutes: 300 }], 0)
  const d = backupStatus(mark, store(yeni), profil)
  kontrol('iki gunde uyari var', d.uyari === true)

  const azi = backupStatus(
    mark,
    store(proje('Mytherra', [{ minutes: 299 }], 0)),
    profil,
  )
  kontrol('esigin altinda uyari yok', azi.uyari === false)
}

console.log('\n7. Proje degistiyse sayilar cikarilmaz')
{
  const eski = proje('Mytherra', [{ minutes: 600 }], 20)
  const mark = { at: gunOnce(1), ozet: storeSummary(store(eski)) }
  const yeni = proje('Baska Oyun', [{ minutes: 30 }], 1)
  const d = backupStatus(mark, store(yeni), profil)
  kontrol('farkli proje isaretli', d.farkliProje === true)
  // Cikarma yapilsaydi fark negatif cikip sifira kirpilir ve
  // "degisiklik yok" denirdi. Oysa dosya bu projeyi hic icermiyor.
  kontrol('durum birikti', d.durum === 'birikti', d.durum)
  kontrol('dakika yeni projenin tamami', d.fark.dakika === 30, String(d.fark.dakika))
  kontrol('metin projenin degistigini soyluyor', yedekMetni(d).ayrinti.includes('proje değişmiş'))
}

console.log('\n8. Metin gun sayisini dogru okuyor')
{
  const p = proje('Mytherra', [], 0)
  const bugun = backupStatus({ at: gunOnce(0), ozet: storeSummary(store(p)) }, store(p), profil)
  kontrol('bugun alinan yedek bugun diyor', yedekMetni(bugun).baslik.includes('bugün alındı'))
  const dun = backupStatus({ at: gunOnce(1), ozet: storeSummary(store(p)) }, store(p), profil)
  kontrol('dun icin gun 1', dun.gun === 1, String(dun.gun))
}

console.log('\nSonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
if (kalan > 0) process.exit(1)
