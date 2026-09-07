// Profilin ne zaman doğrulandığı ve o günden beri ne değiştiği.
//
// NEDEN VAR: profil bir kez doldurulup aylarca dokunulmadan durabiliyor ve
// sistem o süre boyunca artık doğru olmayan bir tahmini güvenle gösteriyor.
// Bu gerçekten yaşandı: pano tek kişilik ve henüz başlamamış bir proje
// tarif ederken, gerçek proje aylardır üç kişiyle sürüyordu.
//
// Kural zaten yazılıydı, sadece profile uygulanmamıştı: bir sayının ne zaman
// doğru olduğu da yazılır ve arayüz bunu söyler.
//
// YEDEK GÖSTERGESİNDEN FARKI: yedekte "hiç çalışılmadıysa risk yok" doğru bir
// varsayım, çünkü yedeklenecek yeni veri yoktur. Burada aynı varsayım YANLIŞ
// olur: panoya hiç oturum girilmemiş olması işin durduğu anlamına gelmez, iş
// panonun göremediği yerde (motorda, depoda, ekipte) sürüyor olabilir. Denetim
// tam olarak böyle bir durumdu. Bu yüzden burada takvim eşiği de var.
//
// Saf fonksiyon: damgayı kendisi okumaz, dışarıdan alır. Böylece sınanabiliyor.

import { PHASES } from '../data/phases.js'

// Takvim eşiği. Bu sayı ölçülmüş değil, çizilmiş bir sınırdır.
//
// Gerekçesi: ekip, sanat yaklaşımı ve ölçek, panoya hiç dokunulmadan da
// değişebilen alanlar. Doksan gün, bu alanların hiçbirinin değişmediğini
// varsaymanın makul kaldığı en uzun süre olarak seçildi. Daha sık sormak
// gürültü olur ve gürültü okunmaz hale gelir.
export const PROFILE_DAY_LIMIT = 90

// Çalışma eşiği: kullanıcının kendi dört haftalık temposu kadar iş.
//
// Sabit bir saat sayısı yerine kişinin kendi planı kullanılıyor, çünkü aynı
// işi üç haftada yapan biri için profil de aynı hızda eskir.
export const PROFILE_WEEK_LIMIT = 4

export function totalMinutes(project) {
  return (project.sessions || []).reduce(
    (toplam, oturum) => toplam + (Number(oturum.minutes) || 0),
    0
  )
}

export function passedGateCount(project) {
  const gecti = project.gatePassed || {}
  return PHASES.filter((phase) => gecti[phase.id]).length
}

// Profilin doğrulandığı anın damgası.
export function profileMark(project) {
  return {
    at: new Date().toISOString(),
    dakika: totalMinutes(project),
    kapi: passedGateCount(project),
  }
}

export function profileStatus(mark, project) {
  if (!project) return { durum: 'proje-yok', uyari: false }

  // Damgası olmayan kayıt, bu gösterge eklenmeden önce kurulmuş demektir.
  // Ne zaman doğrulandığı bilinmiyor ve bilinmediğini söylemek, bir tarih
  // uydurmaktan iyidir.
  if (!mark || !mark.at) {
    return { durum: 'bilinmiyor', uyari: true, gun: null, tarih: null }
  }

  const gecen = Date.now() - new Date(mark.at).getTime()
  const gun = Math.max(0, Math.floor(gecen / 86400000))
  const dakika = Math.max(0, totalMinutes(project) - (Number(mark.dakika) || 0))
  const kapi = Math.max(0, passedGateCount(project) - (Number(mark.kapi) || 0))

  const profile = project.profile || {}
  const haftalikDakika =
    (Number(profile.dailyMinutes) || 0) * (Number(profile.daysPerWeek) || 0)
  const calismaEsigi = haftalikDakika * PROFILE_WEEK_LIMIT

  // Üç ayrı sebep, üçü de tek başına yeterli:
  //
  // 1. Kapı geçilmiş. Faz değiştiyse proje, profilin tarif ettiği proje
  //    değildir. Bu tahmin değil, panonun kendi kaydından gelen bir olay.
  // 2. Kullanıcının kendi dört haftalık temposu kadar iş birikmiş.
  // 3. Takvim dolmuş. İşin panonun dışında sürüyor olma ihtimali için.
  const sebepler = []
  if (kapi > 0) sebepler.push('kapi')
  if (calismaEsigi > 0 && dakika >= calismaEsigi) sebepler.push('calisma')
  if (gun >= PROFILE_DAY_LIMIT) sebepler.push('takvim')

  return {
    durum: sebepler.length > 0 ? 'sorulmali' : 'guncel',
    uyari: sebepler.length > 0,
    sebepler,
    gun,
    tarih: mark.at,
    dakika,
    kapi,
  }
}

function sure(dakika) {
  const s = Math.floor(dakika / 60)
  const d = dakika % 60
  if (s === 0) return d + ' dk'
  if (d === 0) return s + ' sa'
  return s + ' sa ' + d + ' dk'
}

// Durumun tek satırlık karşılığı. İki ekran da aynı cümleyi kullanır.
//
// Ton: profili güncellememiş olmak suçlanmaz ve emir verilmez. Ne zaman
// doğrulandığı söylenir, o günden beri ne olduğu yazılır, karar kullanıcıda.
export function profileText(durum) {
  if (!durum || durum.durum === 'proje-yok' || durum.durum === 'guncel') return null

  if (durum.durum === 'bilinmiyor') {
    return {
      baslik: 'Profilin ne zaman doğrulandığı bilinmiyor',
      ayrinti:
        'Bu proje, doğrulama tarihi tutulmaya başlanmadan önce kurulmuş. ' +
        'Tahmin bu profilden çıkıyor, bir kez üstünden geçmek yeter.',
    }
  }

  const ne =
    durum.gun === 0 ? 'bugün' : durum.gun === 1 ? 'dün' : durum.gun + ' gün önce'

  const parcalar = []
  if (durum.sebepler.includes('kapi')) {
    parcalar.push(durum.kapi === 1 ? 'bir faz kapısı geçildi' : durum.kapi + ' faz kapısı geçildi')
  }
  if (durum.sebepler.includes('calisma')) {
    parcalar.push(sure(durum.dakika) + ' çalışma kaydedildi')
  }
  if (durum.sebepler.includes('takvim') && parcalar.length === 0) {
    parcalar.push('panoya bu konuda hiçbir kayıt girilmedi')
  }

  return {
    baslik: 'Profil en son ' + ne + ' doğrulandı',
    ayrinti:
      'O günden beri ' +
      parcalar.join(', ') +
      '. Ekip, sanat yaklaşımı ve ölçek en çok değişen alanlar; hâlâ doğrularsa ' +
      'tek tıkla onayla, değilse düzelt.',
  }
}
