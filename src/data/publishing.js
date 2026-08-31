// Yayın ekonomisi: mağaza ücretleri, kesintiler ve varsayılanlar.
//
// BU DOSYADAKİ BİLGİNİN İKİ TÜRÜ VAR ve ayrımı korumak önemli:
//
//   1. Mağazanın açıkça ilan ettiği sayılar (Steam'in 100 dolarlık kayıt
//      ücreti, yüzde 30 payı gibi). Bunlar buraya yazılabilir.
//
//   2. Kişiye ve ülkeye göre değişen sayılar (stopaj, gelir vergisi, KDV
//      muamelesi). Bunlar BURAYA YAZILMAZ. Varsayılanları sıfırdır ve
//      kullanıcının kendi durumunu girmesi istenir.
//
// İkinci gruba uydurma bir oran yazmak, bu aracın var oluş sebebine aykırı
// olurdu: yanlış bir sayı, hiç sayı olmamasından kötüdür.
//
// ÜÇÜNCÜ BİR DURUM DAHA VAR: birinci gruptaki sayılar da zamanla eskir.
// Steam'in kayıt ücreti bugün doğru olabilir, iki yıl sonra olmayabilir.
// Bu yüzden yazılan her tutarın yanına BİLİNDİĞİ TARİH konuyor ve arayüz
// "sistemin son bildiği tutar bu, doğrula" diyor. Sessizce eski bir sayı
// göstermek, sayıyı hiç göstermemekten kötüdür.
//
// Bu tutarlar için bağlanabilecek bir API yok: ne Valve, ne Apple, ne de
// Google kayıt ücretlerini programatik bir uçtan yayınlıyor. Döviz kuru
// için API var ve bağlı (rates.js), ücretler için tek dürüst yol
// kullanıcının kontrol edip girmesi.

// Yazılı ücretlerin hangi tarih itibarıyla doğru kabul edildiği.
// Bu tarihten eskiyse arayüz uyarı gösterir.
export const FEE_KNOWN_AS_OF = '2026-05'

// Ücretin "eski" sayılacağı süre. Mağaza ücretleri sık değişmez, ama
// yıllar içinde değişir.
export const FEE_STALE_MONTHS = 12

export const STORES = [
  {
    id: 'steam',
    name: 'Steam',
    oneTimeFee: 100,
    feeKnownAsOf: FEE_KNOWN_AS_OF,
    feeCurrency: 'USD',
    revenueShare: 0.3,
    // Steam Direct ücreti, oyun 1000 dolar düzeltilmiş brüt gelire ulaşınca
    // geliştiriciye iade edilir.
    feeRefundThreshold: 1000,
    note:
      'Kayıt ücreti oyun başına 100 dolar ve 1000 dolar brüt gelire ulaşınca ' +
      'iade edilir. Valve payı yüzde 30.',
  },
  {
    id: 'itch',
    name: 'itch.io',
    oneTimeFee: 0,
    feeCurrency: 'USD',
    revenueShare: 0.1,
    note:
      'Kayıt ücreti yok. Mağaza payını kendin belirliyorsun, varsayılan ' +
      'yüzde 10 kabul edildi.',
  },
  {
    id: 'appstore',
    name: 'App Store (iOS)',
    // Apple'ın geliştirici programı YILLIK ücretlidir, tek seferlik değil.
    // Tutarı ülkeye ve zamana göre değiştiği için buraya yazılmadı:
    // dosyanın başındaki kural gereği kullanıcı kendi güncel tutarını girer.
    oneTimeFee: 0,
    verifyFee: true,
    feeCurrency: 'USD',
    revenueShare: 0.3,
    note:
      'Geliştirici programı ücreti YILLIK ödenir ve proje uzadıkça tekrar eder. ' +
      'Güncel tutarı Apple\'dan kontrol edip gir. Mağaza payı yüzde 30, ama ' +
      'küçük geliştiriciler için indirimli bir program var, uygunluğunu kontrol et.',
  },
  {
    id: 'googleplay',
    name: 'Google Play (Android)',
    // Kayıt ücreti tek seferliktir, ama tutar zamanla degistigi icin
    // yine kullanicidan isteniyor.
    oneTimeFee: 0,
    verifyFee: true,
    feeCurrency: 'USD',
    revenueShare: 0.3,
    note:
      'Kayıt ücreti tek seferlik. Güncel tutarı Google Play Console\'dan kontrol ' +
      'edip gir. Mağaza payı yüzde 30, ama küçük geliştiriciler için indirimli ' +
      'bir program var, uygunluğunu kontrol et.',
  },
  {
    id: 'diger',
    name: 'Kendi sitem veya diğer',
    oneTimeFee: 0,
    feeCurrency: 'USD',
    revenueShare: 0.06,
    note:
      'Ödeme altyapısı komisyonu için yaklaşık yüzde 6 varsayıldı. ' +
      'Kendi sağlayıcının oranını gir.',
  },
]

// Gelir zincirindeki her adım ayrı ayrı düzenlenebilir olmalı, çünkü
// hepsi projeye ve kişiye göre değişir.
export const REVENUE_DEFAULTS = {
  // Liste fiyatı (mağazanın ana para biriminde, genellikle dolar).
  price: 10,
  // Bölgesel fiyatlandırma yüzünden ortalama gerçekleşen fiyat, liste
  // fiyatının altındadır. Ülkeler arası fiyat farkı buradan gelir.
  regionalFactor: 0.75,
  // Lansman indirimi. Çıkışta indirim yapmak yaygındır.
  launchDiscount: 0.15,
  // İade oranı. Steam iki hafta ve iki saat kuralıyla iade veriyor.
  refundRate: 0.1,
  // Stopaj. Ülkeye ve vergi anlaşmasına göre değişir, VARSAYILAN SIFIR.
  withholdingRate: 0,
  // Gelir vergisi. Tamamen kişisel duruma bağlı, VARSAYILAN SIFIR.
  incomeTaxRate: 0,
  // Beklenen satış adedi. Kullanıcının kendi tahmini.
  expectedUnits: 500,
}

// Kullanıcıya doğrulaması gerektiği açıkça söylenen alanlar.
export const MUST_VERIFY = ['withholdingRate', 'incomeTaxRate']

// Piyasa gerçekliği.
//
// Beklenen satış adedi kullanıcının kendi tahminidir ve sistem bu sayıya
// bugüne kadar hiç itiraz etmiyordu: 50.000 yazılsa da sessizce hesaplıyordu.
// Bu, aracın "sistem doğruyu söyler" kuralına aykırıydı. Kapsam sığmıyorsa
// söylüyorsak, satış beklentisi piyasanın çok üstündeyse de söylenmeli.
//
// Buradaki sayılar da eskir, o yüzden ücretlerdeki gibi tarihi yazılı ve
// arayüz doğrulanması gerektiğini söylüyor. Bu bir hedef değil, bir
// dağılımın ortancasıdır: yorumu kullanıcıya bırakılır.
export const MARKET_KNOWN_AS_OF = '2026-08'
export const MARKET_STALE_MONTHS = 12

export const MARKET_REALITY = {
  // Ortanca brüt gelir: yayınlanan oyunların yarısı bunun altında kalıyor.
  // Mağaza payı ve vergiler kesilmeden ÖNCEki tutardır.
  medianGrossUsd: 249,
  releasesPerYear: 20282,
  reachedThousandReviews: 608,
  year: 2025,
  store: 'Steam',
  source: 'Video Game Insights, 2025 Steam yılı verisi',
  knownAsOf: MARKET_KNOWN_AS_OF,
}

// Kullanıcının beklentisi ortancanın kaç katı.
// Ortanca yoksa hesap yapılmaz, sayı uydurulmaz.
export function marketComparison(expectedGrossUsd) {
  const m = MARKET_REALITY.medianGrossUsd
  if (!m || m <= 0 || !expectedGrossUsd || expectedGrossUsd <= 0) return null
  return {
    medianGrossUsd: m,
    kat: Math.round((expectedGrossUsd / m) * 10) / 10,
    ustunde: expectedGrossUsd > m,
  }
}

export const REVENUE_FIELDS = [
  {
    key: 'price',
    label: 'Liste fiyatı',
    suffix: 'USD',
    step: 1,
    help: 'Mağazadaki etiket fiyatı.',
  },
  {
    key: 'regionalFactor',
    label: 'Bölgesel gerçekleşme oranı',
    percent: true,
    help:
      'Bölgesel fiyatlandırma yüzünden ortalama satış fiyatı liste fiyatının ' +
      'altında kalır. Ucuz bölgelerden çok satarsan bu oran düşer.',
  },
  {
    key: 'launchDiscount',
    label: 'Lansman indirimi',
    percent: true,
    help: 'Çıkışta uygulayacağın indirim.',
  },
  {
    key: 'refundRate',
    label: 'İade oranı',
    percent: true,
    help: 'Steam iki hafta ve iki saat kuralıyla iade veriyor.',
  },
  {
    key: 'withholdingRate',
    label: 'Stopaj',
    percent: true,
    verify: true,
    help:
      'Mağaza ödeme yaparken kesilen vergi. Ülkene ve vergi anlaşmasına göre ' +
      'değişir. Buraya uydurma bir oran yazmıyorum: kendi durumunu öğrenip gir.',
  },
  {
    key: 'incomeTaxRate',
    label: 'Gelir vergisi',
    percent: true,
    verify: true,
    help:
      'Kazanç üstünden ödeyeceğin vergi. Şahıs şirketi, muafiyet ve gider ' +
      'düşme durumuna göre tamamen değişir. Muhasebecine sor ve buraya gir.',
  },
]

// Platformun izin verdiği mağazalar. Mobil seçildiyse Steam'i seçenek
// olarak göstermek anlamsız olurdu. İzin listesi options.js içindeki
// PLATFORM_TARGETS kayıtlarından gelir.
export function storesFor(allowedIds) {
  if (!allowedIds || allowedIds.length === 0) return STORES
  return STORES.filter((s) => allowedIds.includes(s.id))
}
