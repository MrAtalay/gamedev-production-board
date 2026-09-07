// Sahipsiz iskolu hesabinin dogrulanmasi.
//
// Nicin var: bu madde bir eksik ozellik degil, panonun verdigi yanlis bir
// cevabin duzeltmesiydi. Ekip carpani sanat isini de ucuzlatiyordu. Sessizce
// geri donmesi mumkun bir hata, cunku carpim tek satir ve gozle fark edilmez.
//
// Calistirma: node scripts/sahiplik-testi.mjs

import { requiredHours, teamEffect } from '../src/lib/estimate.js'
import { runAutoCheck } from '../src/lib/gates.js'
import { createProject } from '../src/lib/project.js'
import { UNOWNED_WORK_LIMIT } from '../src/data/options.js'

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

// Mytherra profiline yakin bir kurulum: rol yapma turu, uc kisilik ekip.
// rpg turunun dagiliminda sanat 0,25 ile en buyuk ikinci pay.
const temel = {
  name: 'Test',
  genreId: 'rpg',
  scaleId: 'orta',
  experienceId: 'ilk',
  engineId: 'orta',
  artId: 'elle',
  teamId: 'ucdort',
  teamSize: 3,
  dailyMinutes: 360,
  daysPerWeek: 6,
  deadline: '2027-06-01',
  pitch: 'Test oyunu',
}

const sahipli = createProject(temel).profile
const sahipsiz = createProject({
  ...temel,
  unownedDisciplines: { sanat: true },
}).profile

console.log('1. Hicbir iskolu sahipsiz degilse davranis degismiyor')
const etkiSahipli = teamEffect(sahipli)
kontrol(
  'carpan ekip carpanina esit (uc kisi icin 0,51)',
  Math.abs(etkiSahipli.factor - etkiSahipli.teamMultiplier) < 0.0001,
  String(etkiSahipli.factor)
)
kontrol('sahipsiz pay sifir', etkiSahipli.unownedShare === 0, String(etkiSahipli.unownedShare))

console.log('2. Sanat sahipsizken o pay carpandan muaf')
const etkiSahipsiz = teamEffect(sahipsiz)
const sanatPayi = etkiSahipsiz.shares.sanat
kontrol('sanat payi 0,25', Math.abs(sanatPayi - 0.25) < 0.0001, String(sanatPayi))
kontrol(
  'sanatin carpani 1',
  etkiSahipsiz.perDiscipline.sanat.factor === 1,
  String(etkiSahipsiz.perDiscipline.sanat.factor)
)
kontrol(
  'kodun carpani ekip carpani olarak kaldi',
  etkiSahipsiz.perDiscipline.kod.factor === etkiSahipsiz.teamMultiplier,
  String(etkiSahipsiz.perDiscipline.kod.factor)
)
// Elle hesap: 0,75 x 0,51 + 0,25 x 1 = 0,6325
kontrol(
  'toplam carpan 0,6325',
  Math.abs(etkiSahipsiz.factor - 0.6325) < 0.0001,
  String(etkiSahipsiz.factor)
)

console.log('3. Sahipsiz isaretlemek tahmini kisaltmiyor, uzatiyor')
const saatSahipli = requiredHours(sahipli)
const saatSahipsiz = requiredHours(sahipsiz)
kontrol(
  'sahipsizken gereken saat daha fazla',
  saatSahipsiz > saatSahipli,
  saatSahipli + ' -> ' + saatSahipsiz
)

console.log('4. Yalniz calisirken sayi degismiyor')
const tekSahipli = createProject({ ...temel, teamSize: 1 }).profile
const tekSahipsiz = createProject({
  ...temel,
  teamSize: 1,
  unownedDisciplines: { sanat: true },
}).profile
kontrol(
  'tek kisilik ekipte iki tahmin esit',
  requiredHours(tekSahipli) === requiredHours(tekSahipsiz),
  requiredHours(tekSahipli) + ' / ' + requiredHours(tekSahipsiz)
)

console.log('5. Eski kayitta alan yoksa cokmuyor ve sonuc ayni')
const eskiKayit = { ...sahipli }
delete eskiKayit.unownedDisciplines
kontrol(
  'alansiz profil eski sonucu veriyor',
  requiredHours(eskiKayit) === saatSahipli,
  String(requiredHours(eskiKayit))
)

console.log('6. Kalite kapisi sahipsiz payi olcuyor')
const kapiSahipli = runAutoCheck({ profile: sahipli }, null, { verify: 'disciplinesOwned' })
kontrol('sahipli projede kapi geciyor', kapiSahipli.ok === true, kapiSahipli.detail)

const kapiSahipsiz = runAutoCheck({ profile: sahipsiz }, null, { verify: 'disciplinesOwned' })
kontrol('sanat sahipsizken kapi kaliyor', kapiSahipsiz.ok === false, kapiSahipsiz.detail)
kontrol(
  'gerekce yuzdeyi soyluyor',
  kapiSahipsiz.detail.includes('25'),
  kapiSahipsiz.detail
)

// Ses payi rpg turunde 0,05 ve sinirin altinda: kayitli ama engel degil.
const sesSahipsiz = createProject({
  ...temel,
  unownedDisciplines: { ses: true },
}).profile
const kapiSes = runAutoCheck({ profile: sesSahipsiz }, null, { verify: 'disciplinesOwned' })
kontrol(
  'sinirin altindaki pay kapiyi engellemiyor',
  kapiSes.ok === true && teamEffect(sesSahipsiz).unownedShare <= UNOWNED_WORK_LIMIT,
  kapiSes.detail
)
kontrol('ama gorunur kaliyor', kapiSes.detail.includes('Sahipsiz'), kapiSes.detail)

console.log('')
console.log('Sonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
process.exit(kalan > 0 ? 1 : 0)
