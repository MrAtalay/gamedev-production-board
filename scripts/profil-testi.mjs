// Profil eskimesi gostergesinin dogrulanmasi.
//
// Nicin var: gosterge sessizce ise yaramaz hale gelebilir. Uc tetigi de
// (kapi gecildi, calisma birikti, takvim doldu) ayri ayri sinamak gerekiyor,
// cunku biri bozuldugunda kalan ikisi gostergeyi calisiyor gibi gosterir.
//
// Calistirma: node scripts/profil-testi.mjs

import {
  profileStatus,
  profileText,
  profileMark,
  PROFILE_DAY_LIMIT,
  PROFILE_WEEK_LIMIT,
} from '../src/lib/profile.js'
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

function gunOnce(gun) {
  return new Date(Date.now() - gun * 86400000).toISOString()
}

const proje = createProject({
  name: 'Test',
  genreId: 'rpg',
  scaleId: 'orta',
  experienceId: 'ilk',
  engineId: 'orta',
  artId: 'kendi',
  teamSize: 3,
  dailyMinutes: 60,
  daysPerWeek: 5,
  deadline: '2027-06-01',
  pitch: 'Test oyunu',
})

console.log('1. Yeni proje uyarmiyor')
const yeni = profileStatus(proje.profileCheck, proje)
kontrol('durum guncel', yeni.durum === 'guncel', yeni.durum)
kontrol('uyari yok', yeni.uyari === false)
kontrol('metin uretilmiyor', profileText(yeni) === null)

console.log('2. Damgasi olmayan eski kayit bilinmiyor diyor')
const damgasiz = profileStatus(null, proje)
kontrol('durum bilinmiyor', damgasiz.durum === 'bilinmiyor', damgasiz.durum)
kontrol('uyari var', damgasiz.uyari === true)
kontrol('metin tarih uydurmuyor',
  profileText(damgasiz).baslik.includes('bilinmiyor'),
  profileText(damgasiz).baslik)

console.log('3. Tetik: kapi gecildi')
const kapiliProje = { ...proje, gatePassed: { konsept: true } }
const kapi = profileStatus(proje.profileCheck, kapiliProje)
kontrol('uyari var', kapi.uyari === true)
kontrol('sebep kapi', kapi.sebepler.includes('kapi'), kapi.sebepler.join(','))
kontrol('gun esigi dolmadan tetikledi', kapi.gun < PROFILE_DAY_LIMIT, String(kapi.gun))

console.log('4. Tetik: kullanicinin kendi dort haftalik temposu')
// 60 dk x 5 gun x 4 hafta = 1200 dakika.
const esik = 60 * 5 * PROFILE_WEEK_LIMIT
const azCalisma = {
  ...proje,
  sessions: [{ id: '1', date: '2026-09-01', minutes: esik - 1, stepId: 'p-1' }],
}
const tamCalisma = {
  ...proje,
  sessions: [{ id: '1', date: '2026-09-01', minutes: esik, stepId: 'p-1' }],
}
kontrol('esigin bir dakika altinda uyarmiyor',
  profileStatus(proje.profileCheck, azCalisma).uyari === false)
kontrol('esikte uyariyor',
  profileStatus(proje.profileCheck, tamCalisma).uyari === true)
kontrol('sebep calisma',
  profileStatus(proje.profileCheck, tamCalisma).sebepler.includes('calisma'))

console.log('5. Tetik: takvim, panoya hic kayit girilmemisken bile')
// Yedek gostergesinden ayrildigi nokta burasi: is panonun disinda surmus
// olabilir, o yuzden "hic oturum yok" guvence degildir.
const eskiDamga = { at: gunOnce(PROFILE_DAY_LIMIT + 1), dakika: 0, kapi: 0 }
const takvim = profileStatus(eskiDamga, proje)
kontrol('uyari var', takvim.uyari === true)
kontrol('sebep takvim', takvim.sebepler.includes('takvim'), takvim.sebepler.join(','))
kontrol('tek sebep o', takvim.sebepler.length === 1, takvim.sebepler.join(','))
kontrol('metin kayit girilmedigini soyluyor',
  profileText(takvim).ayrinti.includes('hicbir kayit') ||
    profileText(takvim).ayrinti.includes('hiçbir kayıt'),
  profileText(takvim).ayrinti)

const esikAltinda = { at: gunOnce(PROFILE_DAY_LIMIT - 1), dakika: 0, kapi: 0 }
kontrol('esigin bir gun altinda uyarmiyor',
  profileStatus(esikAltinda, proje).uyari === false)

console.log('6. Dogrulamak sayaci sifirliyor')
const calisilmisProje = {
  ...tamCalisma,
  gatePassed: { konsept: true },
}
const yeniDamga = profileMark(calisilmisProje)
const sonra = profileStatus(yeniDamga, calisilmisProje)
kontrol('dogrulama sonrasi guncel', sonra.durum === 'guncel', sonra.durum)
kontrol('biriken calisma sifirlandi', sonra.dakika === 0, String(sonra.dakika))
kontrol('gecilen kapi sifirlandi', sonra.kapi === 0, String(sonra.kapi))

console.log('7. Ton: metin sucluyor mu')
const metin = profileText(kapi)
const suclayan = ['unuttun', 'ihmal', 'gerekirdi', 'hata yaptin']
kontrol('suclayan ifade yok',
  !suclayan.some((k) => (metin.baslik + metin.ayrinti).toLowerCase().includes(k)),
  metin.ayrinti)
kontrol('ne yapilacagini yaziyor',
  metin.ayrinti.includes('onayla') && metin.ayrinti.includes('düzelt'),
  metin.ayrinti)

console.log('')
console.log('Sonuc: ' + gecen + ' gecti, ' + kalan + ' kaldi')
process.exit(kalan > 0 ? 1 : 0)
