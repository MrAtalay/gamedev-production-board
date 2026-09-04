// Kalıcılık: tarayıcının localStorage'ı.
//
// Sunucu yok, çünkü bu kişisel bir planlama aracı. Bunun bedeli veriyi
// tek tarayıcıda tutmaktır, o yüzden dışa aktarma her zaman elinin altında.

const STORAGE_KEY = 'oyunUretimPanosu'
const THEME_KEY = 'oyunUretimPanosuTema'
const DRAFT_KEY = 'oyunUretimPanosuTaslak'

const EMPTY = { active: null, archive: [] }

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    return {
      active: parsed.active || null,
      archive: Array.isArray(parsed.archive) ? parsed.archive : [],
      // Son değişiklik damgası. İki bilgisayar arasında dosya taşınırken
      // hangi kopyanın daha yeni olduğunu söyleyebilmek için gerekli.
      sonDegisiklik: parsed.sonDegisiklik || null,
    }
  } catch {
    // Bozuk veri, uygulamanın açılmasını engellememeli.
    return { ...EMPTY }
  }
}

export function saveStore(store) {
  try {
    const damgali = { ...store, sonDegisiklik: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(damgali))
    return true
  } catch {
    return false
  }
}

// Sihirbaz taslağı.
//
// Yedi adımlık bir formda girilenler yalnızca bellekte tutulursa, sayfayı
// yenilemek veya sekmeyi kapatmak her şeyi siler. Bu bir kez gerçekten
// yaşandı ve girilen tüm veri kayboldu. Artık her değişiklik taslak olarak
// yazılıyor, proje başlatılınca taslak siliniyor.

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.form) return null
    return parsed
  } catch {
    return null
  }
}

export function saveDraft(form, step) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, at: Date.now() }))
  } catch {
    // Taslak yazılamazsa sihirbaz yine çalışır, sadece koruma olmaz.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Yok sayılabilir.
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Tema kaydedilemediyse uygulama yine çalışır.
  }
}

export function exportStore(store) {
  const payload = {
    uygulama: 'Oyun Üretim Panosu',
    disaAktarma: new Date().toISOString(),
    ...store,
  }
  const body = JSON.stringify(payload, null, 2)
  const blob = new Blob([body], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'oyun-uretim-panosu-' + new Date().toISOString().slice(0, 10) + '.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseImport(text) {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Dosya okunamadı.')
  }
  return {
    active: parsed.active || null,
    archive: Array.isArray(parsed.archive) ? parsed.archive : [],
    sonDegisiklik: parsed.sonDegisiklik || parsed.disaAktarma || null,
  }
}

// Bir veri kümesinin tek satırlık özeti.
//
// İçe aktarma öncesi karşılaştırma için. Ham JSON'a bakmadan "hangisi
// daha ileride" sorusuna cevap verebilmek gerekiyor.
export function storeSummary(store) {
  const p = store && store.active
  return {
    projeAdi: p ? p.name : null,
    faz: p ? p.currentPhaseId : null,
    oturum: p && p.sessions ? p.sessions.length : 0,
    dakika: p && p.sessions
      ? p.sessions.reduce((t, x) => t + (Number(x.minutes) || 0), 0)
      : 0,
    bilesen: p && p.content && p.content.items ? p.content.items.length : 0,
    adim: p && p.doneSteps ? Object.keys(p.doneSteps).filter((k) => p.doneSteps[k]).length : 0,
    arsiv: store && Array.isArray(store.archive) ? store.archive.length : 0,
    tarih: store ? store.sonDegisiklik : null,
  }
}

// İçe aktarılacak dosya ile mevcut veriyi karşılaştırır.
//
// NEDEN VAR: içe aktarma önceden hiçbir şey sormadan her şeyin üstüne
// yazıyordu ve yeşil bir "Veriler içe aktarıldı" bildirimi gösteriyordu.
// İki bilgisayar arasında dosya taşıyan biri için bu, eski bir dosyayla
// yeni işini silmek demekti. Bu projede bir kez gerçek veri kaybı yaşandı;
// aynı hatanın ikinci biçimi burasıydı.
export function compareForImport(text, currentStore) {
  const gelen = parseImport(text)
  const mevcut = storeSummary(currentStore)
  const yeni = storeSummary(gelen)

  let dahaEski = false
  if (mevcut.tarih && yeni.tarih) {
    dahaEski = new Date(yeni.tarih).getTime() < new Date(mevcut.tarih).getTime()
  }

  // Tarih olmasa bile ilerleme geriliyorsa uyarılır: tarih damgası
  // olmayan eski bir dosya da veri kaybettirebilir.
  const gerileme =
    yeni.oturum < mevcut.oturum ||
    yeni.adim < mevcut.adim ||
    yeni.bilesen < mevcut.bilesen ||
    yeni.dakika < mevcut.dakika

  return { gelen, mevcut, yeni, dahaEski, gerileme, bosMu: !gelen.active }
}

// Yedek damgası.
//
// NEDEN AYRI ANAHTAR: yedek, verinin değil BU TARAYICININ özelliği.
// Damga store'un içinde dursaydı dışa aktarılan dosyaya da girerdi ve
// başka bir bilgisayardan gelen dosyayı içe aktarmak, o bilgisayarın
// yedeğini burada alınmış gibi gösterirdi. Gösterge o anda yalan söyler.
//
// Damganın yanında o andaki özet de saklanıyor. Sebebi aşağıda,
// backupStatus'ta.
const BACKUP_KEY = 'oyunUretimPanosuYedek'

export function loadBackupMark() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.at) return null
    return parsed
  } catch {
    return null
  }
}

export function saveBackupMark(store) {
  const mark = { at: new Date().toISOString(), ozet: storeSummary(store) }
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(mark))
  } catch {
    // Damga yazılamazsa dışa aktarma yine çalışır, sadece gösterge boş kalır.
  }
  return mark
}

// Yedek durumu. Damga ile bugünkü veri karşılaştırılır.
//
// NEDEN SADECE GÜN SAYMIYOR: iki hafta çalışılmadıysa iki haftalık bir
// yedek eksiksizdir, uyarmak yanlış olur. Risk, geçen zaman değil o
// zamanda BİRİKEN İŞ. Damganın yanında özet saklanmasının sebebi bu.
//
// Saf fonksiyon: damgayı kendisi okumaz, dışarıdan alır. Böylece
// localStorage olmadan da sınanabiliyor (scripts/yedek-testi.mjs).
export function backupStatus(mark, store, profile) {
  const simdi = storeSummary(store)
  if (!store || !store.active) return { durum: 'proje-yok', uyari: false }

  if (!mark) {
    return { durum: 'hic', uyari: true, gun: null, tarih: null, fark: null }
  }

  const gecen = Date.now() - new Date(mark.at).getTime()
  const gun = Math.max(0, Math.floor(gecen / 86400000))
  const eski = mark.ozet || {}

  // Proje değiştiyse (yeni proje başlatıldı, arşivden dönüldü) sayıları
  // çıkarmak anlamsız: veri kümesi başka bir kümedir, tamamı yedeksizdir.
  const farkliProje = (simdi.projeAdi || null) !== (eski.projeAdi || null)

  const artis = (alan) => Math.max(0, (simdi[alan] || 0) - (eski[alan] || 0))
  const fark = {
    oturum: farkliProje ? simdi.oturum : artis('oturum'),
    dakika: farkliProje ? simdi.dakika : artis('dakika'),
    adim: farkliProje ? simdi.adim : artis('adim'),
    bilesen: farkliProje ? simdi.bilesen : artis('bilesen'),
    arsiv: farkliProje ? simdi.arsiv : artis('arsiv'),
  }
  const degisti =
    farkliProje ||
    fark.oturum > 0 ||
    fark.dakika > 0 ||
    fark.adim > 0 ||
    fark.bilesen > 0 ||
    fark.arsiv > 0

  // İki eşik, ikisi de uydurma değil:
  //
  // 1. Bir haftalık takvim. Elle alınan bir yedeğin tutturulabilir en
  //    sık ritmi haftalıktır; pano zaten haftalık özet çıkarıyor
  //    (tempo.js). Daha sık hatırlatmak gürültü olur ve gürültü
  //    okunmaz hale gelir.
  // 2. Kullanıcının kendi bir haftalık tempo karşılığı. Aynı işi üç
  //    günde yapan biri için risk aynıdır, takvimin dolmasını beklemek
  //    riski olduğundan küçük gösterir.
  const haftalikDakika =
    (Number(profile && profile.dailyMinutes) || 0) *
    (Number(profile && profile.daysPerWeek) || 0)
  const uyari =
    degisti && (gun >= 7 || (haftalikDakika > 0 && fark.dakika >= haftalikDakika))

  return {
    durum: degisti ? 'birikti' : 'guncel',
    uyari,
    gun,
    tarih: mark.at,
    fark,
    farkliProje,
  }
}

function sure(dakika) {
  const s = Math.floor(dakika / 60)
  const d = dakika % 60
  if (s === 0) return d + ' dk'
  if (d === 0) return s + ' sa'
  return s + ' sa ' + d + ' dk'
}

// Durumun tek satırlık karşılığı. İki ekran da aynı cümleyi kullanır,
// çünkü iki ayrı yerde iki ayrı sayı görmek göstergeyi güvenilmez yapar.
//
// Ton: ara verilmiş olmak veya yedek almamış olmak suçlanmaz. Sayı
// söylenir, ne yapılacağı yazılır, gerisi kullanıcının kararı.
export function yedekMetni(yedek) {
  if (!yedek || yedek.durum === 'proje-yok') return null

  if (yedek.durum === 'hic') {
    return {
      baslik: 'Bu tarayıcıdan hiç yedek alınmadı',
      ayrinti:
        'Bütün proje verisi tek bir tarayıcının deposunda duruyor. Tarayıcı verisi ' +
        'temizlenirse veya bilgisayar değişirse geri getirilemez.',
    }
  }

  const ne =
    yedek.gun === 0 ? 'bugün' : yedek.gun === 1 ? 'dün' : yedek.gun + ' gün önce'

  if (yedek.durum === 'guncel') {
    return {
      baslik: 'Son yedek ' + ne + ' alındı',
      ayrinti: 'O günden beri yeni kayıt yok, dosya güncel.',
    }
  }

  const parcalar = []
  if (yedek.fark.dakika > 0) parcalar.push(sure(yedek.fark.dakika) + ' çalışma')
  if (yedek.fark.oturum > 0) parcalar.push(yedek.fark.oturum + ' oturum kaydı')
  if (yedek.fark.adim > 0) parcalar.push(yedek.fark.adim + ' tamamlanan adım')
  if (yedek.fark.bilesen > 0) parcalar.push(yedek.fark.bilesen + ' içerik bileşeni')
  if (yedek.fark.arsiv > 0) parcalar.push(yedek.fark.arsiv + ' arşivlenen proje')

  return {
    baslik: 'Son yedek ' + ne + ' alındı',
    ayrinti: yedek.farkliProje
      ? 'Yedekten sonra proje değişmiş. Elindeki dosya bu projeyi hiç içermiyor.'
      : parcalar.length > 0
        ? 'O günden beri eklenenler dosyada yok: ' + parcalar.join(', ') + '.'
        : 'O günden beri değişiklik var ama sayıya yansımıyor.',
  }
}
