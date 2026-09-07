// Ekip carpani egrisinin dogrulanmasi.
//
// Nicin var: carpan artik bir tablodan degil bir formulden geliyor.
// Formulun eski tablonun kesin noktalarini yeniden uretmesi, egrinin yeni
// bir varsayim getirmediginin tek kaniti. O uyum sessizce bozulabilir.
//
// Calistirma: node scripts/ekip-testi.mjs

import { teamSize, teamMultiplier, requiredHours } from '../src/lib/estimate.js'
import { TEAM_SIZES, TEAM_SIZE_MAX } from '../src/data/options.js'
import { createProject } from '../src/lib/project.js'

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

console.log('1. Egri eski tablonun kesin noktalarini uretiyor')
// Egrinin uzeri oturtuldugu iki nokta. Bunlar tutmuyorsa egri artik eski
// tablonun devami degil, bagimsiz bir varsayimdir.
kontrol('bir kisi 1,00', teamMultiplier({ teamSize: 1 }) === 1,
  String(teamMultiplier({ teamSize: 1 })))
kontrol('iki kisi 0,65', teamMultiplier({ teamSize: 2 }) === 0.65,
  String(teamMultiplier({ teamSize: 2 })))

console.log('2. Uc ve dort kisi eski kademenin iki yanina dusuyor')
const uc = teamMultiplier({ teamSize: 3 })
const dort = teamMultiplier({ teamSize: 4 })
// Eski tabloda ikisi de 0,45'ti. Kademe bir ortalamaydi.
const eskiKademe = TEAM_SIZES.find((t) => t.id === 'ucdort').multiplier
kontrol('uc kisi 0,51', uc === 0.51, String(uc))
kontrol('dort kisi 0,42', dort === 0.42, String(dort))
kontrol('eski kademe ikisinin arasinda', dort < eskiKademe && eskiKademe < uc,
  dort + ' < ' + eskiKademe + ' < ' + uc)

console.log('3. Egri hicbir yerde artmiyor ve sifira inmiyor')
// Ust sinira dogru iki basamaga yuvarlama duzlukler uretiyor (17 ve 18
// kisi ikisi de 0,17). Bu kabul edilir: o araligi arayuz zaten uzatma
// olarak isaretliyor. Yasak olan artmasi.
let oncekiCarpan = 2
let hicArtmadi = true
for (let kisi = 1; kisi <= TEAM_SIZE_MAX; kisi++) {
  const c = teamMultiplier({ teamSize: kisi })
  if (c > oncekiCarpan || c <= 0) hicArtmadi = false
  oncekiCarpan = c
}
kontrol('1..' + TEAM_SIZE_MAX + ' arasinda hic artmiyor ve pozitif', hicArtmadi)

// Guvenilir araliktaki her adim gercekten ucuzlatmali: burada duzluk
// olmasi, kisi eklemenin hesaba hic yansimadigi anlamina gelirdi.
let oncekiGuvenilir = 2
let hepAzaldi = true
for (let kisi = 1; kisi <= 6; kisi++) {
  const c = teamMultiplier({ teamSize: kisi })
  if (c >= oncekiGuvenilir) hepAzaldi = false
  oncekiGuvenilir = c
}
kontrol('1..6 arasinda her adim azaliyor', hepAzaldi)
kontrol('dort kisi tek kisinin yarisindan pahali',
  teamMultiplier({ teamSize: 4 }) > 1 / 4,
  String(teamMultiplier({ teamSize: 4 })))

console.log('4. Kisi sayisi sinirlaniyor ve bozuk girdi cokmuyor')
kontrol('ust sinir uygulaniyor', teamSize({ teamSize: 500 }) === TEAM_SIZE_MAX,
  String(teamSize({ teamSize: 500 })))
kontrol('sifir ve eksi tek kisiye dusuyor', teamSize({ teamSize: 0 }) === 1 &&
  teamSize({ teamSize: -3 }) === 1)
kontrol('yazi girdi tek kisiye dusuyor', teamSize({ teamSize: 'abc' }) === 1)
kontrol('ondalik yuvarlaniyor', teamSize({ teamSize: 3.4 }) === 3,
  String(teamSize({ teamSize: 3.4 })))

console.log('5. Eski kayitlar kisi sayisina cevriliyor')
kontrol('teamId tek -> 1 kisi', teamSize({ teamId: 'tek' }) === 1)
kontrol('teamId iki -> 2 kisi', teamSize({ teamId: 'iki' }) === 2)
kontrol('teamId ucdort -> 3 kisi', teamSize({ teamId: 'ucdort' }) === 3)
kontrol('hicbir alan yoksa 1 kisi', teamSize({}) === 1)

console.log('6. Dortten fazla kisi artik girilebiliyor')
const temel = {
  name: 'Test',
  genreId: 'rpg',
  scaleId: 'orta',
  experienceId: 'ilk',
  engineId: 'orta',
  artId: 'kendi',
  dailyMinutes: 360,
  daysPerWeek: 6,
  deadline: '2027-06-01',
  pitch: 'Test oyunu',
}
const uckisi = createProject({ ...temel, teamSize: 3 }).profile
const sekiz = createProject({ ...temel, teamSize: 8 }).profile
kontrol('sekiz kisi kaydediliyor', sekiz.teamSize === 8, String(sekiz.teamSize))
kontrol('sekiz kisi uc kisiden az saat gerektiriyor',
  requiredHours(sekiz) < requiredHours(uckisi),
  requiredHours(uckisi) + ' -> ' + requiredHours(sekiz))

console.log('')
console.log('Sonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
process.exit(kalan > 0 ? 1 : 0)
