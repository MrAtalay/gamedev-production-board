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

export const STORES = [
  {
    id: 'steam',
    name: 'Steam',
    oneTimeFee: 100,
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
