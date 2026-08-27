// Döviz kuru.
//
// Tasarım kararı: kur bilgisi uygulamanın çalışması için gerekli DEĞİL.
// İnternet yoksa, API kapanmışsa veya tarayıcı isteği engellerse uygulama
// aynen çalışmaya devam eder, sadece dönüştürme yapmaz. Kişisel bir
// planlama aracının bir dış servise bağımlı olması kabul edilemez.
//
// Kur, alındığında localStorage'a tarihiyle birlikte yazılır. Kullanıcı
// isterse elle de girebilir ve elle girilen değer her zaman önceliklidir.

const CACHE_KEY = 'oyunUretimPanosuKur'
const MAX_AGE_HOURS = 12

// ECB verisini kullanan, anahtar istemeyen ücretsiz bir servis.
const PRIMARY = 'https://api.frankfurter.app/latest?from=USD&to='
const FALLBACK = 'https://open.er-api.com/v6/latest/USD'

export const CURRENCIES = ['TRY', 'EUR', 'GBP', 'USD']

export function loadCachedRate(currency) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.currency !== currency) return null
    const ageHours = (Date.now() - parsed.at) / (1000 * 60 * 60)
    return { ...parsed, stale: ageHours > MAX_AGE_HOURS, ageHours }
  } catch {
    return null
  }
}

function cacheRate(currency, rate, source) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ currency, rate, source, at: Date.now() })
    )
  } catch {
    // Önbellek yazılamazsa sorun değil, sadece her seferinde tekrar sorar.
  }
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchRate(currency) {
  if (currency === 'USD') {
    return { rate: 1, source: 'sabit', at: Date.now() }
  }

  try {
    const data = await fetchWithTimeout(PRIMARY + currency, 6000)
    const rate = data && data.rates && data.rates[currency]
    if (rate) {
      cacheRate(currency, rate, 'frankfurter.app')
      return { rate, source: 'frankfurter.app', at: Date.now(), date: data.date }
    }
  } catch {
    // Birinci kaynak başarısız, ikinciyi dene.
  }

  try {
    const data = await fetchWithTimeout(FALLBACK, 6000)
    const rate = data && data.rates && data.rates[currency]
    if (rate) {
      cacheRate(currency, rate, 'open.er-api.com')
      return { rate, source: 'open.er-api.com', at: Date.now() }
    }
  } catch {
    // İkisi de olmadı.
  }

  return null
}
