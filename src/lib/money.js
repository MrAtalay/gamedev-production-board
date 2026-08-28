// Başabaş noktası ve geri dönüş hesabı.
//
// Sistemin üçüncü ekseni. Saat ve para giderken, bu da paranın geri gelip
// gelmeyeceğini soruyor.

import { STORES, REVENUE_DEFAULTS, FEE_STALE_MONTHS } from '../data/publishing.js'
import { computeEstimate } from './estimate.js'

export function findStore(id) {
  return STORES.find((s) => s.id === id) || STORES[0]
}

export function revenueSettings(profile) {
  return { ...REVENUE_DEFAULTS, ...(profile.revenue || {}) }
}

// Mağaza kayıt ücreti ve o ücretin ne kadar güvenilir olduğu.
//
// Üç durum var ve arayüzde üçü de ayrı görünür:
//   - Kullanıcı kendi kontrol edip girmiş: en güvenilir. Kontrol tarihi
//     de saklanır ve eskidiğinde uyarılır.
//   - Sisteme yazılı, tarihi belli (Steam): "son bildiğim tutar bu" denir.
//   - Hiçbiri yok: sıfır kabul edilir ve maliyetin eksik olduğu söylenir.
//
// Sessizce eski bir sayı göstermek, bu aracın var oluş sebebine aykırı.
export function storeFeeInfo(profile) {
  const store = findStore(profile.storeId)
  // Ücret mağaza başına saklanır. Tek bir alanda tutulduğunda, App Store
  // için girilen tutar mağaza Steam'e çevrilince Steam'in ücreti gibi
  // görünüyordu: yanlış mağazanın sayısıyla hesap yapmak.
  const entered = (profile.storeFees || {})[profile.storeId]
  const hasEntered =
    entered !== undefined && entered !== '' && !Number.isNaN(Number(entered))

  if (hasEntered) {
    const checkedAt = (profile.storeFeeCheckedAt || {})[profile.storeId] || ''
    return {
      value: Number(entered),
      source: 'kullanici',
      asOf: checkedAt,
      stale: checkedAt ? monthsSince(checkedAt) > FEE_STALE_MONTHS : false,
      ageMonths: checkedAt ? monthsSince(checkedAt) : null,
      unknown: false,
    }
  }

  if (store.verifyFee) {
    // Bu mağaza için sisteme bir tutar yazılmadı ve kullanıcı da girmedi.
    return { value: 0, source: 'yok', asOf: null, stale: false, ageMonths: null, unknown: true }
  }

  return {
    value: store.oneTimeFee,
    source: 'sistem',
    asOf: store.feeKnownAsOf || null,
    stale: store.feeKnownAsOf ? monthsSince(store.feeKnownAsOf) > FEE_STALE_MONTHS : false,
    ageMonths: store.feeKnownAsOf ? monthsSince(store.feeKnownAsOf) : null,
    unknown: false,
  }
}

// 'YYYY-MM' veya 'YYYY-MM-DD' biçiminden bugüne kaç ay geçtiği.
function monthsSince(yyyymm) {
  const parts = String(yyyymm).split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  if (!year || !month) return 0
  const now = new Date()
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
}

export function storeFeeFor(profile) {
  return storeFeeInfo(profile).value
}

// Bir kopyanın satışından cebine gerçekten giren para.
// Zincirdeki her adım ayrı gösteriliyor, çünkü kayıpların nerede olduğunu
// görmek tek bir sonuç sayısından daha öğretici.
export function perUnitChain(profile) {
  const r = revenueSettings(profile)
  const store = findStore(profile.storeId)

  const steps = []
  let value = Number(r.price) || 0
  steps.push({ label: 'Liste fiyatı', value, note: '' })

  value = value * (1 - (1 - Number(r.regionalFactor)))
  steps.push({
    label: 'Bölgesel fiyatlandırma sonrası',
    value,
    note: 'ortalama gerçekleşen fiyat',
  })

  value = value * (1 - Number(r.launchDiscount))
  steps.push({ label: 'Lansman indirimi sonrası', value, note: '' })

  value = value * (1 - Number(r.refundRate))
  steps.push({
    label: 'İadeler düşüldükten sonra',
    value,
    note: 'satılan başına ortalama',
  })

  const grossToStore = value
  value = value * (1 - store.revenueShare)
  steps.push({
    label: store.name + ' payı düşüldükten sonra',
    value,
    note: 'mağaza payı yüzde ' + Math.round(store.revenueShare * 100),
  })

  value = value * (1 - Number(r.withholdingRate))
  steps.push({ label: 'Stopaj sonrası', value, note: '' })

  value = value * (1 - Number(r.incomeTaxRate))
  steps.push({ label: 'Gelir vergisi sonrası (net)', value, note: 'eline geçen' })

  return {
    steps,
    net: value,
    grossForThreshold: grossToStore,
    store,
  }
}

export function breakEven(project) {
  const profile = project.profile
  const estimate = computeEstimate(profile)
  const chain = perUnitChain(profile)
  const r = revenueSettings(profile)
  const store = chain.store

  // Gerçek maliyet: proje gerçekten süreceği kadar sürerse ne kadar tutar.
  // Planlanan tarihe göre olan değil, çünkü asıl ödenen budur.
  const recurring =
    estimate.cost.realisticTotal !== undefined
      ? estimate.cost.realisticTotal
      : estimate.cost.total
  const feeInfo = storeFeeInfo(profile)
  const storeFee = feeInfo.value
  const totalCost = recurring + storeFee

  const net = chain.net
  const unitsToBreakEven = net > 0 ? Math.ceil(totalCost / net) : null

  const expected = Number(r.expectedUnits) || 0
  const expectedRevenue = Math.round(expected * net)
  const expectedProfit = expectedRevenue - totalCost

  // Steam kayıt ücreti belli bir brüt gelirden sonra iade edilir.
  const grossAtExpected = expected * chain.grossForThreshold
  const feeRefunded =
    store.feeRefundThreshold !== undefined &&
    grossAtExpected >= store.feeRefundThreshold

  // Harcanan saatin karşılığı. Çoğu bağımsız geliştiricinin bakmadığı sayı.
  const hourlyReturn = estimate.required > 0 ? expectedRevenue / estimate.required : 0

  return {
    totalCost,
    recurringCost: recurring,
    storeFee,
    feeInfo,
    netPerUnit: net,
    unitsToBreakEven,
    expectedUnits: expected,
    expectedRevenue,
    expectedProfit,
    profitable: expectedProfit > 0,
    feeRefunded,
    grossAtExpected: Math.round(grossAtExpected),
    feeRefundThreshold: store.feeRefundThreshold,
    hourlyReturn,
    requiredHours: estimate.required,
    chain,
  }
}

// Kaç kopya satarsan ne olur. Tek bir tahmin yerine aralık göstermek,
// beklentiyi tek bir sayıya bağlamaktan dürüsttür.
export function scenarios(project) {
  const chain = perUnitChain(project.profile)
  const be = breakEven(project)
  const points = [100, 250, 500, 1000, 2500, 5000, 10000]

  return points.map((units) => {
    const revenue = Math.round(units * chain.net)
    return {
      units,
      revenue,
      profit: revenue - be.totalCost,
      covers: revenue >= be.totalCost,
    }
  })
}
