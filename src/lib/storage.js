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
