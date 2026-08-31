// Zaman gerçekliği: harcanan saati planla ve tahminle karşılaştırır.
//
// Buradaki hesapların hepsi kayıtlı veriye dayanır. Veri yoksa sayı
// uydurulmaz, "henüz ölçülmedi" denir. Bir sapma görülse bile emir kipi
// kullanılmaz, durum bildirilir.

import { PHASES } from '../data/phases.js'
import { phaseDeliverables } from './project.js'
import { computeEstimate, hoursByPhase } from './estimate.js'
import { availableHours } from './estimate.js'

const GUN_MS = 24 * 60 * 60 * 1000

export const GUN_ADLARI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function isoOf(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

// Haftanın ilk günü pazartesi. Türkiye takviminde hafta pazartesi başlar,
// getDay() ise pazarı sıfır sayar, o yüzden kaydırma gerekiyor.
export function haftaBasi(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const gun = d.getDay()
  const kaydir = gun === 0 ? 6 : gun - 1
  d.setDate(d.getDate() - kaydir)
  return d
}

// Adım kimliğinden faz kimliğine eşleme.
//
// Türe özel teslimatların adımları da dahil, çünkü onlar da gerçek
// çalışma. Eşleme projeye bağlı: tür değişirse ekstra teslimatlar değişir.
export function adimFazHaritasi(project) {
  const harita = {}
  PHASES.forEach((phase) => {
    phaseDeliverables(project, phase.id).forEach((teslimat) => {
      ;(teslimat.steps || []).forEach((adim) => {
        harita[adim.id] = phase.id
      })
    })
  })
  return harita
}

// Bir haftanın çalışma özeti.
//
// Hedef, kullanıcının kendi girdiği tempodur (günlük dakika kere haftalık
// gün). Gerçeklik katsayısı burada uygulanmaz: katsayı kapasite planlaması
// içindir, "bu hafta ne kadar çalıştım" sorusunun cevabı ham sayıdır.
export function haftaOzeti(project, referans = new Date()) {
  const bas = haftaBasi(referans)
  const gunler = []
  let toplam = 0

  for (let i = 0; i < 7; i += 1) {
    const g = new Date(bas.getTime() + i * GUN_MS)
    const iso = isoOf(g)
    const dakika = project.sessions
      .filter((s) => s.date === iso)
      .reduce((sum, s) => sum + (Number(s.minutes) || 0), 0)
    toplam += dakika
    gunler.push({ iso, ad: GUN_ADLARI[i], dakika, bugun: iso === isoOf(new Date()) })
  }

  const profile = project.profile || {}
  const gunlukDakika = Number(profile.dailyMinutes) || 0
  const haftalikGun = Number(profile.daysPerWeek) || 0
  const hedefDakika = gunlukDakika * haftalikGun

  const calisilanGun = gunler.filter((g) => g.dakika > 0).length
  const fark = hedefDakika > 0 ? toplam - hedefDakika : null

  return {
    baslangic: isoOf(bas),
    bitis: isoOf(new Date(bas.getTime() + 6 * GUN_MS)),
    gunler,
    toplamDakika: toplam,
    hedefDakika,
    hedefVar: hedefDakika > 0,
    farkDakika: fark,
    calisilanGun,
    planlananGun: haftalikGun,
    enUzunGun: gunler.reduce((en, g) => (g.dakika > en.dakika ? g : en), gunler[0]),
  }
}

// Son dört haftanın toplamları. Tek haftaya bakmak yanıltıcı olabilir,
// eğilim ancak birkaç hafta yan yana konunca görünür.
export function sonHaftalar(project, adet = 4) {
  const bugun = new Date()
  const liste = []
  for (let i = adet - 1; i >= 0; i -= 1) {
    const ref = new Date(bugun.getTime() - i * 7 * GUN_MS)
    const o = haftaOzeti(project, ref)
    liste.push({
      baslangic: o.baslangic,
      toplamDakika: o.toplamDakika,
      hedefDakika: o.hedefDakika,
      calisilanGun: o.calisilanGun,
      buHafta: i === 0,
    })
  }
  return liste
}

// Faz başına gerçekleşen süre.
//
// Oturumun bağlı olduğu adımdan faz bulunur. Adım bilgisi olmayan
// kayıtlar gizlenmez, ayrı bir kalem olarak gösterilir: nereye gittiği
// bilinmeyen süreyi toplama karıştırmak sayıyı yanlış yapar.
export function fazGerceklesen(project) {
  const harita = adimFazHaritasi(project)
  const byPhase = {}
  let dagitilmamis = 0

  project.sessions.forEach((s) => {
    const dakika = Number(s.minutes) || 0
    if (dakika <= 0) return
    const fazId = s.stepId ? harita[s.stepId] : null
    if (fazId) {
      byPhase[fazId] = (byPhase[fazId] || 0) + dakika
    } else {
      dagitilmamis += dakika
    }
  })

  return { byPhase, dagitilmamis }
}

// Fazın durumu: bitti, devam ediyor, başlamadı.
// Karşılaştırmanın anlamı buna bağlı. Devam eden bir fazda tahminin
// altında kalmak iyi haber değildir, sadece işin bitmemiş olmasıdır.
function fazDurumu(project, phaseId, index, aktifIndex) {
  if (project.gatePassed[phaseId]) return 'bitti'
  if (index === aktifIndex) return 'devam'
  if (index < aktifIndex) return 'devam'
  return 'baslamadi'
}

// Faz bazlı tahmin ve gerçek karşılaştırması.
export function fazKarsilastirmasi(project) {
  const estimate = computeEstimate(project.profile)
  const tahminler = hoursByPhase(estimate.required)
  const { byPhase, dagitilmamis } = fazGerceklesen(project)

  const aktifIndex = PHASES.findIndex((p) => !project.gatePassed[p.id])
  const gecerliAktif = aktifIndex === -1 ? PHASES.length - 1 : aktifIndex

  const satirlar = PHASES.map((phase, i) => {
    const tahmin = tahminler.find((t) => t.id === phase.id)
    const gercekDakika = byPhase[phase.id] || 0
    const gercekSaat = Math.round((gercekDakika / 60) * 10) / 10
    const tahminSaat = tahmin ? tahmin.hours : 0
    const durum = fazDurumu(project, phase.id, i, gecerliAktif)
    const olculdu = gercekDakika > 0

    return {
      id: phase.id,
      ad: phase.name,
      durum,
      tahminSaat,
      gercekSaat,
      olculdu,
      // Sapma yalnızca bitmiş fazda anlamlı. Devam edenlerde kıyas
      // yapılmaz, çünkü işin ne kadarının bittiği bilinmiyor.
      sapmaSaat: durum === 'bitti' && olculdu ? Math.round((gercekSaat - tahminSaat) * 10) / 10 : null,
      katsayi:
        durum === 'bitti' && olculdu && tahminSaat > 0
          ? Math.round((gercekSaat / tahminSaat) * 100) / 100
          : null,
    }
  })

  return {
    satirlar,
    dagitilmamisSaat: Math.round((dagitilmamis / 60) * 10) / 10,
    toplamTahminSaat: estimate.required,
  }
}

// Genel karşılaştırma. Post-mortem fazında kullanılır.
//
// Sapma katsayısı, kullanıcının kendi tahmin alışkanlığını öğrenmesi
// içindir: 1.4 çıkıyorsa bir sonraki projede tahminlerini 1.4 ile
// çarpması gerektiğini bilir. Bu sayı ancak bitmiş fazlardan çıkar.
export function genelKarsilastirma(project) {
  const { satirlar, dagitilmamisSaat, toplamTahminSaat } = fazKarsilastirmasi(project)
  const bitmisler = satirlar.filter((s) => s.durum === 'bitti' && s.olculdu)

  const bitmisTahmin = bitmisler.reduce((t, s) => t + s.tahminSaat, 0)
  const bitmisGercek = bitmisler.reduce((t, s) => t + s.gercekSaat, 0)

  const toplamGercekDakika = project.sessions.reduce(
    (sum, s) => sum + (Number(s.minutes) || 0),
    0
  )
  const toplamGercekSaat = Math.round((toplamGercekDakika / 60) * 10) / 10

  // İlk tahmin yalnızca projede saklanmışsa vardır. Yoksa uydurulmaz:
  // arayüz "bu proje ilk tahmini kaydetmeden önce açılmış" der.
  const ilkTahminSaat = project.baseline ? project.baseline.requiredHours : null

  return {
    ilkTahminSaat,
    ilkTahminTarihi: project.baseline ? project.baseline.at : null,
    // İlk tahmin ile şu anki tahmin farklıysa, kapsam yol boyunca
    // değişmiş demektir. Bu kendi başına bir bilgi.
    tahminDegistiMi:
      ilkTahminSaat !== null && Math.abs(ilkTahminSaat - toplamTahminSaat) >= 1,
    toplamTahminSaat,
    toplamGercekSaat,
    dagitilmamisSaat,
    bitmisFazSayisi: bitmisler.length,
    bitmisTahminSaat: Math.round(bitmisTahmin * 10) / 10,
    bitmisGercekSaat: Math.round(bitmisGercek * 10) / 10,
    // Yeterli veri yoksa katsayı verilmez. Tek fazdan çıkarılan bir
    // katsayı, olmayan bir katsayıdan daha yanıltıcıdır.
    sapmaKatsayisi:
      bitmisler.length >= 2 && bitmisTahmin > 0
        ? Math.round((bitmisGercek / bitmisTahmin) * 100) / 100
        : null,
    yeterliVeri: bitmisler.length >= 2,
  }
}

// Kalan iş için, ölçülen sapmaya göre düzeltilmiş süre tahmini.
// Yalnızca sapma katsayısı güvenilirse hesaplanır.
export function duzeltilmisKalan(project) {
  const genel = genelKarsilastirma(project)
  if (!genel.sapmaKatsayisi) return null

  const { satirlar } = fazKarsilastirmasi(project)
  const kalanTahmin = satirlar
    .filter((s) => s.durum !== 'bitti')
    .reduce((t, s) => t + s.tahminSaat, 0)

  const duzeltilmis = Math.round(kalanTahmin * genel.sapmaKatsayisi)
  const elde = availableHours(project.profile)

  return {
    kalanTahminSaat: kalanTahmin,
    duzeltilmisSaat: duzeltilmis,
    katsayi: genel.sapmaKatsayisi,
    eldekiSaat: elde.hours,
    sigiyorMu: duzeltilmis <= elde.hours,
  }
}
