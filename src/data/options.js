// Kurulum sihirbazindaki secenekler ve saat tahmini carpanlari.
//
// Buradaki carpanlar uydurma degil: kucuk stüdyo/solo gelistirici
// postmortem'lerinde tekrar eden oranlara dayaniyor. Kesin sayilar degil,
// buyukluk mertebesi verirler. Amac "kesin sure" soylemek degil, kisiyi
// imkansiz bir kapsama girmeden once uyarmak.

// Projenin buyuklugu. Saat araligi, "kucuk" olcegin 1x kabul edildigi
// carpanla hesaplanir.
export const SCALES = [
  {
    id: 'mikro',
    name: 'Mikro',
    multiplier: 0.25,
    summary: 'Game jam boyutu. Tek mekanik, tek ekran, 10-20 dakikalik oyun.',
    example: 'Bir hafta sonunda bitirilebilecek bir sey.',
  },
  {
    id: 'kucuk',
    name: 'Küçük',
    multiplier: 1,
    summary: 'Portfolyo veya ilk ticari oyun. 30-90 dakikalik oyun suresi.',
    example: 'itch.io\'da yayinlanabilir, Steam\'de kucuk bir oyun.',
  },
  {
    id: 'orta',
    name: 'Orta',
    multiplier: 3,
    summary: 'Ciddi bir bagimsiz oyun. 3-8 saatlik oyun suresi.',
    example: 'Steam\'de tam fiyatli satilabilecek bir oyun.',
  },
  {
    id: 'buyuk',
    name: 'Büyük',
    multiplier: 8,
    summary: 'Cok yillik bagimsiz proje. 10+ saat oyun suresi.',
    example: 'Tek kisilik bir ekip icin genellikle 3-5 yil.',
  },
]

// Deneyim, en buyuk belirsizlik kaynagi. Ilk oyununu yapan biri neyi
// bilmedigini de bilmez, bu yuzden carpan yuksek.
export const EXPERIENCE_LEVELS = [
  {
    id: 'ilk',
    name: 'İlk oyunum',
    multiplier: 1.6,
    note: 'Hic oyun bitirmedin. Ogrenme suresi tahmine dahil edildi.',
  },
  {
    id: 'birkac',
    name: 'Birkaç oyun bitirdim',
    multiplier: 1.2,
    note: '1-2 kucuk oyun veya jam oyunu bitirdin.',
  },
  {
    id: 'deneyimli',
    name: 'Deneyimliyim',
    multiplier: 1,
    note: 'Birden fazla oyun yayinladin, sureleri tahmin edebiliyorsun.',
  },
]

export const ENGINE_FAMILIARITY = [
  {
    id: 'yeni',
    name: 'Motoru yeni öğreniyorum',
    multiplier: 1.25,
    note: 'Motoru ogrenmek ilk aylarin buyuk kismini alir.',
  },
  {
    id: 'biliyorum',
    name: 'Motoru biliyorum',
    multiplier: 1,
    note: 'Belge okumadan temel islerini yapabiliyorsun.',
  },
]

// Sanat yaklasimi, solo gelistiricide en cok sapan kalem. Kendi sanatini
// sifirdan uretmek projeyi kolayca uzatir.
export const ART_APPROACHES = [
  {
    id: 'minimal',
    name: 'Minimal / geometrik',
    multiplier: 0.7,
    note: 'Kutular, basit sekiller, tek renk paleti. En hizli yol.',
  },
  {
    id: 'hazir',
    name: 'Hazır varlık kullanacağım',
    multiplier: 0.85,
    note: 'Asset store veya ucretsiz paketler. Tutarlilik riski var.',
  },
  {
    id: 'kendi',
    name: 'Kendi sanatımı üreteceğim',
    multiplier: 1.35,
    note: 'En cok zaman alan secenek. Sanat, kodun onune gecebilir.',
  },
]

// Iki kisi, bir kisinin iki kati hizli degildir: iletisim ve
// koordinasyon payi vardir.
export const TEAM_SIZES = [
  { id: 'tek', name: 'Yalnızım', multiplier: 1 },
  { id: 'iki', name: 'İki kişiyiz', multiplier: 0.65 },
  { id: 'ucdort', name: 'Üç veya dört kişiyiz', multiplier: 0.45 },
]

// Çok oyunculu, solo geliştiricide en çok hafife alınan kalem. Sonradan
// eklenen bir özellik değildir: her sistemi baştan etkiler. Durum
// eşitleme, sunucu/istemci ayrımı, gecikme telafisi ve test zorluğu
// (iki istemciyle test etmek gerekir) tüm işi yeniden şekillendirir.
export const MULTIPLAYER_MODES = [
  {
    id: 'tek',
    name: 'Sadece tek oyunculu',
    multiplier: 1,
    note: 'En hızlı yol. İlk oyunlarda güçlü tavsiye budur.',
  },
  {
    id: 'yerel',
    name: 'Yerel çok oyunculu (aynı ekran)',
    multiplier: 1.3,
    note: 'Ağ kodu yok, ama girişleri, kamerayı ve arayüzü ikiye ayırman gerekir.',
  },
  {
    id: 'internet',
    name: 'İnternet üzerinden çok oyunculu',
    multiplier: 2.2,
    note:
      'Süreyi yaklaşık iki katına çıkarır. Her sistem durumunu eşitlemek zorundadır ' +
      've hataların çoğu ancak iki istemci açıkken ortaya çıkar.',
  },
]

// Hedef platform. Cok oyunculu gibi, sonradan eklenen bir ozellik degil:
// kontrol semasini, arayuz yerlesimini ve test surecini bastan belirler.
//
// Mobil, "ayni oyunu kucuk ekrana koymak" degildir. Dokunmatik kontrol
// yeniden tasarim ister, ekran oranlari ve guvenli alanlar coktur, cihaz
// performans araligi genistir ve magaza inceleme sureci (sertifika,
// imzalama, red donguleri) ilk seferde en cok saldiran yerdir.
//
// Carpanlar diger tum carpanlar gibi buyukluk mertebesi verir, kesin
// sayi degil.
export const PLATFORM_TARGETS = [
  {
    id: 'pc',
    name: 'Bilgisayar',
    multiplier: 1,
    stores: ['steam', 'itch', 'diger'],
    note: 'Klavye ve fare, tek ekran orani, en cok belge ve ornek burada.',
  },
  {
    id: 'mobil',
    name: 'Mobil (iOS / Android)',
    multiplier: 1.3,
    stores: ['appstore', 'googleplay', 'diger'],
    note:
      'Dokunmatik kontrol bir port degil, yeniden tasarimdir. Ekran oranlari, ' +
      'cihaz performans araligi ve magaza inceleme sureci ek yuk getirir.',
  },
  {
    id: 'ikisi',
    name: 'İkisi birden',
    // 1.3 + 1.3 degil: ortak is var. Ama test matrisi ikiye katlanir ve
    // iki ayri kontrol semasi ile iki ayri magaza sureci yurur.
    multiplier: 1.6,
    stores: ['steam', 'itch', 'appstore', 'googleplay', 'diger'],
    note:
      'Iki kontrol semasi, iki arayuz yerlesimi, iki magaza sureci ve iki kat ' +
      'test. Ilk oyunda genellikle once tek platform bitirilir.',
  },
]

// Sanat yaklasimi ile gorsel uretim aracinin ortusmesi.
//
// Ikisi de ayni sorunu cozuyor: sanati kendin uretmemek. Ust uste
// carpildiklarinda kazanc iki kez sayiliyordu.
//
// Sayilar, aracin kazancinin ne kadarinin gecerli kaldigini soyluyor:
//   minimal (0.50): kutu ve basit sekil ciziyorsun, uretmek zaten hizli.
//     Bir ureteci burada kullanmanin kazanci yarisi kadar.
//   hazir (0.65): isin cogu varlik secmek, uyarlamak ve tutarli tutmak.
//     Ureteç bosluk doldurmada yardim eder, secim ve uyarlamada etmez.
//   kendi (1.00): sanati sifirdan sen uretiyorsun, kazanc tam gecerli.
export const ART_TOOL_OVERLAP = {
  minimal: 0.5,
  hazir: 0.65,
  kendi: 1,
}

// Planlanan sürenin ne kadarinin gercekten calisma olarak gectigi.
// Hastalik, is yogunlugu, motivasyon dususu, arac sorunlari.
// Bu sayiyi gizlemiyoruz, kullaniciya acikca gosteriyoruz.
export const REALISM_FACTOR = 0.8

// ---- Günlük tempo ve sürdürülebilirlik ----
//
// Sistem, gerçekçi olmayan bir tempoyu kendi ÖNERİSİ olarak sunmuyordu
// (estimate.js içindeki MAX_REALISTIC_DAILY), ama kullanıcı aynı tempoyu
// elle yazdığında sessiz kalıyordu. Aynı sayı, kim yazdığına göre bir kez
// "gerçekçi değil" bir kez "Rahat" oluyordu. Bu tutarsızlık giderildi.
//
// Sürdürülebilir üst sınırı tahmin etmek yerine kullanıcıya soruyoruz:
// günde kaç saat ayırabileceğin, günün geri kalanında ne yaptığına bağlı.
// Aşağıdaki sayılar ölçüm değil, üst sınır kabulüdür. Arayüzde de böyle
// sunuluyor, çünkü kullanıcının kendi durumu bu kabulden farklı olabilir.
export const COMMITMENT_MODES = [
  {
    id: 'yan',
    name: 'Tam zamanlı bir işim veya okulum var',
    // Mesai sonrası akşamlar. Birkaç gün 5 saat yapılabilir, aylarca değil.
    sustainableDailyMinutes: 180,
    note:
      'Proje, dolu bir günün üstüne biniyor. Sürdürülebilir tavan günde ' +
      'yaklaşık 3 saat kabul ediliyor.',
  },
  {
    id: 'yarim',
    name: 'Yarı zamanlı çalışıyorum veya okuyorum',
    sustainableDailyMinutes: 300,
    note: 'Günün bir kısmı serbest. Sürdürülebilir tavan yaklaşık 5 saat.',
  },
  {
    id: 'tam',
    name: 'Tüm zamanımı buna ayırabiliyorum',
    // Tam zamanlı geliştiriciler bile günde 8 saat odaklanmış yaratıcı iş
    // çıkarmaz. 7 saat, iyi giden bir günün üst sınırı.
    sustainableDailyMinutes: 420,
    note:
      'Başka bir işin yok. Sürdürülebilir tavan yaklaşık 7 saat: tam zamanlı ' +
      'çalışanlar bile günde 8 saat odaklanmış yaratıcı iş çıkarmaz.',
  },
]

// Sürdürülebilir sınırın ÜSTÜNDEKİ saatler için ayrı katsayı.
//
// Sebep iki tane. Birincisi verim: 8 saatlik mesai sonrası 6. saat, günün
// 1. saatiyle aynı işi çıkarmaz. İkincisi süreklilik: bu tempo haftalarca
// korunamadığı için plan sık bozulur ve telafi edilmez.
//
// 0.5, REALISM_FACTOR'ın belirgin biçimde altında olsun diye seçildi.
// Kesin bir ölçüm değil; amacı, sınırın üstündeki saatleri sınırın
// altındaki saatlerle aynı değerde saymamak.
export const OVERTIME_REALISM_FACTOR = 0.5

export const DEFAULT_COMMITMENT_ID = 'yan'

// ---- Yapay zeka asistanları ----
//
// Buradaki en önemli karar şu: hızlanma projenin tamamına değil, sadece
// ilgili işkoluna uygulanır. Bir kod asistanı kod yazmayı hızlandırır ama
// oyunun eğlenceli olup olmadığına karar vermeyi hızlandırmaz.
//
// Projelerin öldüğü yerler (tasarım kararları, oynanabilirlik testi, denge,
// cila) tam da hızlanmayan kısımlardır. Bu yüzden "karar" işkolu hiçbir
// asistandan etkilenmez.

// Toplam işin işkollarına dağılımı. Türe göre değişebilir (genres.js
// içindeki disciplineShares alanı bunu ezer).
export const DEFAULT_DISCIPLINE_SHARES = {
  kod: 0.38,
  sanat: 0.22,
  ses: 0.06,
  yazim: 0.07,
  // Tasarım, oynanabilirlik testi, denge, cila, yayın. Hızlanmaz.
  karar: 0.27,
}

// İşkollarının okunabilir adları. Paylar türe göre değiştiği için burada
// pay yok, sadece kimlik ve ad var. Sahiplik arayüzü bu listeden besleniyor.
export const DISCIPLINES = [
  { id: 'kod', name: 'Kod' },
  { id: 'sanat', name: 'Sanat' },
  { id: 'ses', name: 'Ses ve müzik' },
  { id: 'yazim', name: 'Yazım' },
  { id: 'karar', name: 'Tasarım ve karar' },
]

// Üretime girerken kabul edilen sahipsiz iş tavanı.
//
// Bu sayı ölçülmüş değil, çizilmiş bir sınırdır ve bunu gizlemek yerine
// yazıyoruz. Gerekçesi şu: küçük bir pay (ses yüzde 4 gibi) hazır paketle
// veya tek seferlik bir iş anlaşmasıyla kapatılabilir, bu yüzden üretimi
// durdurmak için sebep değildir. Sanat gibi çeyreklik bir pay kapatılamaz;
// o iş kimse yapmadan bitmez. Sınır ikisinin arasına konuldu.
export const UNOWNED_WORK_LIMIT = 0.1

// Kod asistanının kazancı deneyime bağlıdır ve bu, sisteme yazılmış en
// önemli dürüstlük maddesi. Üretilen kodu değerlendiremiyorsan, anlamadığın
// kodu ayıklamak kazandığın süreyi büyük ölçüde geri alır.
const CODE_SPEEDUP_BY_EXPERIENCE = {
  deneyimli: 0.65,
  birkac: 0.75,
  ilk: 0.9,
}

export const AI_TOOLS = [
  {
    id: 'kod',
    name: 'Kod asistanı',
    discipline: 'kod',
    defaultMonthly: 20,
    speedupByExperience: CODE_SPEEDUP_BY_EXPERIENCE,
    note:
      'Kod yazmayı hızlandırır. Kazanç deneyime bağlı: üretilen kodu ' +
      'okuyup düzeltebiliyorsan çok, okuyamıyorsan az.',
    warning:
      'İlk oyununu yapıyorsan kazanç sandığından küçüktür. Anlamadığın kodun ' +
      'hatasını ayıklamak, o kodu yazmaktan uzun sürer.',
  },
  {
    id: 'gorsel',
    name: 'Görsel üretim aracı',
    discipline: 'sanat',
    defaultMonthly: 15,
    speedup: 0.7,
    note: 'Varlık üretimini hızlandırır.',
    warning:
      'Oyun sanatında asıl zorluk tek bir görsel üretmek değil, yüzlerce ' +
      'varlığı tutarlı tutmaktır. Ayrıca bazı mağazalar yapay zeka ile ' +
      'üretilen içeriğin bildirilmesini zorunlu tutar, yayından önce kontrol et.',
  },
  {
    id: 'ses',
    name: 'Ses ve müzik aracı',
    discipline: 'ses',
    defaultMonthly: 10,
    speedup: 0.5,
    note:
      'Bağımsız oyun kalite çıtası için en çok işe yaradığı alan burasıdır, ' +
      'ses efekti ve müzik üretimi ciddi biçimde hızlanır.',
  },
  {
    id: 'yazim',
    name: 'Yazım asistanı',
    discipline: 'yazim',
    defaultMonthly: 0,
    speedup: 0.7,
    note:
      'Diyalog ve metin taslaklarını hızlandırır. Genellikle kod asistanıyla ' +
      'aynı abonelikten gelir, o yüzden varsayılan maliyeti sıfır.',
    warning:
      'Taslak hızlanır ama ses tonu tutarlılığı ve karakter sesi hâlâ senin ' +
      'işin. Anlatı oyununda metnin tamamını devretme.',
  },
]

export function findOption(list, id) {
  return list.find((item) => item.id === id) || list[0]
}
