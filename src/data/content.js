// İçerik veri tabanı şeması.
//
// Amaç, oyunun içine ne gireceğini koddan önce yazılı hale getirmek.
// İki sebebi var ve ikincisi daha önemli:
//
//   1. Tasarımı bir yerde toplamak.
//   2. `plannedUnits` sayısını TAHMİN olmaktan çıkarıp SAYIM yapmak.
//      Üretim kapısındaki birim matematiği şu an kullanıcının verdiği bir
//      sayıya güveniyor. Kullanıcı 3 boss, 8 düşman ve 12 kaynak
//      girdiyse, o sayı artık bir tahmin değil.
//
// TASARIM KARARI: bu dosya bir içerik ÜRETECİ değil, içerik LİSTESİ.
// Bölge üreteci yazmak, tek bölgelik bir ilk sürümde saf zarardır
// (araç yapım saati, birim başına kazançtan büyüktür). Veri katmanını
// kurmak ise neredeyse bedava ve üreteci sonradan yazmak isteyene
// işin yarısını hazır verir.
//
// ALAN SAYILARI UYDURULMAZ. Can, kuvvet ve benzeri değerler için
// varsayılan verilmiyor: bunlar oyunun dengesine ait kararlardır ve
// sistemin bilebileceği şeyler değildir. Sistem sadece hangi alanların
// doldurulması gerektiğini söyler.

// Bir bileşen türünün alan tipleri:
//   text   serbest metin
//   number sayı
//   ref    başka bir bileşene işaret eder (hangi bölgede yaşar gibi)
//   list   virgülle ayrılmış kısa liste

// Her türün yanındaki `testChecklist`, söz verdiğimiz "sabit test föyü".
// Zeki değil, alan bilgisi: bir kez yazılır, her seferinde aynıdır.
// Sistemin oyunun eğlenceli olup olmadığına dair söyleyeceği bir şey yok,
// ama "yeni düşman eklediğinde şuna bak" diyebilir.

const RPG_TYPES = [
  {
    id: 'bolge',
    lower: 'bölge',
    dative: 'bölgeye',
    name: 'Bölge',
    summary: 'Oyuncunun içinde dolaştığı alan. Diğer her şey bir bölgeye bağlanır.',
    isContainer: true,
    fields: [
      { key: 'tema', label: 'Tema', type: 'text', help: 'Volkan, orman, harabe...' },
      { key: 'sure', label: 'Kaç dakikalık oynanış', type: 'number' },
      { key: 'giris', label: 'Nereden girilir', type: 'text' },
      { key: 'cikis', label: 'Nereye çıkar', type: 'text' },
    ],
    testChecklist: [
      'Bölgeye girip çıkmak çalışıyor mu, geri dönünce durum korunuyor mu?',
      'Bölgenin sınırlarından dışarı çıkılabiliyor mu?',
      'Bölgeyi baştan sona hiç savaşmadan geçmek mümkün mü? Öyleyse kasıtlı mı?',
      'Bölgede kaybolunuyor mu? Nereye gideceğin belli mi?',
    ],
  },
  {
    id: 'boss',
    name: 'Büyük düşman (boss)',
    summary: 'Bölge sonunda karşılaşılan, tek seferlik özel düşman.',
    fields: [
      { key: 'can', label: 'Can', type: 'number' },
      { key: 'kuvvet', label: 'Kuvvet', type: 'number' },
      { key: 'bolge', label: 'Hangi bölgede', type: 'ref', refType: 'bolge' },
      { key: 'dusurur', label: 'Ne düşürür', type: 'list' },
      { key: 'mekanik', label: 'Ayırt edici mekaniği', type: 'text',
        help: 'Bu boss neyi farklı yapıyor? Sadece canı çok olan bir düşman değilse.' },
      { key: 'evre', label: 'Kaç evresi var', type: 'number' },
    ],
    testChecklist: [
      'Boss öldüğünde ganimet gerçekten düşüyor mu?',
      'Savaştan kaçıp geri dönünce boss canını yeniliyor mu? Hangisi doğru?',
      'Oyuncu ölürse nereden devam ediyor, boss odasının hemen dışından mı?',
      'Evreler arası geçiş görünüyor mu, oyuncu ne olduğunu anlıyor mu?',
      'Bossu yenmek kaç dakika sürüyor? Üç dakikadan uzunsa sıkıcı olabilir.',
    ],
  },
  {
    id: 'dusman',
    name: 'Küçük düşman',
    summary: 'Bölgede tekrar tekrar karşılaşılan sıradan düşman.',
    fields: [
      { key: 'can', label: 'Can', type: 'number' },
      { key: 'kuvvet', label: 'Kuvvet', type: 'number' },
      { key: 'bolge', label: 'Hangi bölgede', type: 'ref', refType: 'bolge' },
      { key: 'dusurur', label: 'Ne düşürür', type: 'list' },
      { key: 'davranis', label: 'Davranışı', type: 'text',
        help: 'Kovalar mı, uzaktan mı vurur, sürü halinde mi gelir?' },
    ],
    testChecklist: [
      'İki tanesi aynı anda saldırınca ne oluyor?',
      'Oyuncu kaçabiliyor mu, yoksa savaşmak zorunda mı?',
      'Ölüm animasyonu bitmeden ganimet alınabiliyor mu?',
      'Bu düşmanı öldürmek kaç saniye sürüyor? Diğerlerinden farkı hissediliyor mu?',
    ],
  },
  {
    id: 'dost',
    name: 'Dost / NPC',
    summary: 'Konuşulan, görev veren veya yardım eden karakter.',
    fields: [
      { key: 'bolge', label: 'Hangi bölgede', type: 'ref', refType: 'bolge' },
      { key: 'islev', label: 'Ne işe yarar', type: 'text',
        help: 'Görev verir, eşya satar, hikaye anlatır, yol gösterir...' },
      { key: 'diyalog', label: 'Kaç satır diyalog', type: 'number' },
    ],
    testChecklist: [
      'Konuşma yarıda kesilirse ne oluyor?',
      'Aynı karakterle ikinci kez konuşunca farklı bir şey söylüyor mu?',
      'Görev verdiyse, görev kaydı bir yerde görünüyor mu?',
    ],
  },
  {
    id: 'kaynak',
    name: 'Kaynak / eşya',
    summary: 'Toplanan, harcanan, üretilen veya kullanılan nesne.',
    fields: [
      // "Nereden elde edilir" düşmanların "Ne düşürür" alanından
      // TÜRETİLİYOR, o yüzden burada elle yazılan alan sadece düşman
      // dışı yolları anlatır: sandık, satın alma, görev ödülü.
      { key: 'nereden', label: 'Düşman dışı elde etme yolu', type: 'text',
        help: 'Sandık, dükkan, görev ödülü. Bir düşmandan düşüyorsa o düşmanın "Ne düşürür" alanına yaz, burası kendiliğinden dolar.' },
      { key: 'malzeme', label: 'Neyden üretilir', type: 'list',
        help: 'Bu eşya üretiliyorsa malzemelerini virgülle yaz. Örümcek ağı -> ip -> yay gibi zincirler böyle kurulur.' },
      { key: 'nedeyarar', label: 'Ne işe yarar', type: 'text' },
      { key: 'yigin', label: 'Envanterde yığılır mı', type: 'text' },
    ],
    testChecklist: [
      'Envanter dolduğunda ne oluyor?',
      'Bu kaynağı hiç elde edemeden ilerlemek mümkün mü?',
      'Kullanıldığında geri bildirim var mı, oyuncu işe yaradığını anlıyor mu?',
    ],
  },
  {
    id: 'yetenek',
    name: 'Yetenek / güç',
    summary: 'Oyuncunun kazandığı ve kullandığı beceri.',
    fields: [
      { key: 'nasil', label: 'Nasıl kazanılır', type: 'text' },
      { key: 'etki', label: 'Ne yapar', type: 'text' },
      { key: 'bedel', label: 'Bedeli', type: 'text', help: 'Mana, bekleme süresi, kaynak...' },
    ],
    testChecklist: [
      'Yetenek olmadan oyun bitirilebiliyor mu?',
      'Arka arkaya kullanılınca bir şey bozuluyor mu?',
      'Kazanıldığı an oyuncuya bildiriliyor mu?',
    ],
  },
]

// Diğer türler için şemalar. Bileşen adları değişir, kalıp aynıdır:
// bir kapsayıcı (bölge, bölüm, seviye) ve içine giren şeyler.
const CONTENT_TYPES = {
  rpg: RPG_TYPES,

  platform: [
    {
      id: 'bolum',
      lower: 'bölüm',
      dative: 'bölüme',
      name: 'Bölüm',
      summary: 'Baştan sona oynanan tek bir sahne.',
      isContainer: true,
      fields: [
        { key: 'sure', label: 'Kaç dakikalık', type: 'number' },
        { key: 'mekanik', label: 'Hangi mekaniği öğretir', type: 'text' },
        { key: 'zorluk', label: 'Zorluk (1-10)', type: 'number' },
      ],
      testChecklist: [
        'Bölüm baştan sona ölmeden geçilebiliyor mu?',
        'Oyuncu haritanın dışına düşebiliyor mu?',
        'Kontrol noktası nerede, ölünce ne kadar geri gidiyor?',
      ],
    },
    {
      id: 'engel',
      name: 'Engel / tuzak',
      summary: 'Bölümlerde tekrar kullanılan tehlike.',
      fields: [
        { key: 'bolum', label: 'Hangi bölümde', type: 'ref', refType: 'bolum' },
        { key: 'davranis', label: 'Nasıl çalışır', type: 'text' },
        { key: 'hasar', label: 'Hasar', type: 'number' },
      ],
      testChecklist: [
        'Engelin çalışma anı önceden görülebiliyor mu, yoksa haksız mı?',
        'Aynı anda iki engele değince ne oluyor?',
      ],
    },
    {
      id: 'dusman',
      name: 'Düşman',
      summary: 'Hareket eden tehlike.',
      fields: [
        { key: 'bolum', label: 'Hangi bölümde', type: 'ref', refType: 'bolum' },
        { key: 'can', label: 'Can', type: 'number' },
        { key: 'davranis', label: 'Davranışı', type: 'text' },
      ],
      testChecklist: [
        'Üstüne zıplayınca ne oluyor?',
        'Ekran dışına çıkınca durumu korunuyor mu?',
      ],
    },
  ],

  bulmaca: [
    {
      id: 'mekanik',
      lower: 'mekanik',
      dative: 'mekaniğe',
      name: 'Mekanik',
      summary: 'Bulmacaların kurulduğu temel kural.',
      isContainer: true,
      fields: [
        { key: 'kural', label: 'Kuralı tek cümlede', type: 'text' },
        { key: 'ogretim', label: 'Nasıl öğretilir', type: 'text' },
      ],
      testChecklist: [
        'Kural anlatılmadan, sadece oynayarak anlaşılıyor mu?',
        'Kuralın istisnası var mı? Varsa oyuncu bunu nereden öğreniyor?',
      ],
    },
    {
      id: 'bulmaca',
      name: 'Bulmaca',
      summary: 'Tek bir çözülecek durum.',
      fields: [
        { key: 'mekanik', label: 'Hangi mekaniği kullanır', type: 'ref', refType: 'mekanik' },
        { key: 'zorluk', label: 'Zorluk (1-10)', type: 'number' },
        { key: 'cozum', label: 'Çözümü', type: 'text' },
      ],
      testChecklist: [
        'İstenmeyen bir çözümü var mı? (Kestirme, atlatma)',
        'Çözüldüğünde oyuncu neden çözüldüğünü anlıyor mu?',
        'Takılan bir oyuncu için ipucu var mı?',
      ],
    },
  ],

  anlati: [
    {
      id: 'sahne',
      lower: 'sahne',
      dative: 'sahneye',
      name: 'Sahne',
      summary: 'Hikayenin geçtiği tek bir yer ve an.',
      isContainer: true,
      fields: [
        { key: 'yer', label: 'Nerede geçer', type: 'text' },
        { key: 'kelime', label: 'Kaç kelime', type: 'number' },
        { key: 'amac', label: 'Bu sahne ne anlatıyor', type: 'text' },
      ],
      testChecklist: [
        'Sahne atlanabiliyor mu? Atlanırsa hikaye anlaşılıyor mu?',
        'Metin ekrana sığıyor mu, uzun cümlelerde taşma var mı?',
      ],
    },
    {
      id: 'karakter',
      name: 'Karakter',
      summary: 'Hikayede konuşan veya adı geçen kişi.',
      fields: [
        { key: 'rol', label: 'Hikayedeki rolü', type: 'text' },
        { key: 'ses', label: 'Konuşma tarzı', type: 'text' },
        { key: 'sahne', label: 'İlk hangi sahnede', type: 'ref', refType: 'sahne' },
      ],
      testChecklist: [
        'Bu karakterin konuşması diğerlerinden ayırt ediliyor mu?',
        'Adı her yerde aynı yazılmış mı?',
      ],
    },
    {
      id: 'secim',
      name: 'Seçim / dallanma',
      summary: 'Oyuncunun hikayeyi değiştiren kararı.',
      fields: [
        { key: 'sahne', label: 'Hangi sahnede', type: 'ref', refType: 'sahne' },
        { key: 'secenekler', label: 'Seçenekler', type: 'list' },
        { key: 'sonuc', label: 'Neyi değiştirir', type: 'text' },
      ],
      testChecklist: [
        'Her seçenek gerçekten farklı bir sonuç veriyor mu, yoksa sahte mi?',
        'Seçim geri alınabiliyor mu? Alınmalı mı?',
      ],
    },
  ],

  aksiyon: [
    {
      id: 'arena',
      lower: 'arena',
      dative: 'arenaya',
      name: 'Arena / alan',
      summary: 'Çatışmanın geçtiği alan.',
      isContainer: true,
      fields: [
        { key: 'boyut', label: 'Boyut', type: 'text' },
        { key: 'dalga', label: 'Kaç dalga', type: 'number' },
      ],
      testChecklist: [
        'Köşeye sıkışıp kalmak mümkün mü?',
        'Kamera bütün düşmanları gösteriyor mu?',
      ],
    },
    {
      id: 'dusman',
      name: 'Düşman',
      summary: 'Savaşılan birim.',
      fields: [
        { key: 'can', label: 'Can', type: 'number' },
        { key: 'kuvvet', label: 'Kuvvet', type: 'number' },
        { key: 'arena', label: 'Hangi arenada', type: 'ref', refType: 'arena' },
        { key: 'davranis', label: 'Davranışı', type: 'text' },
      ],
      testChecklist: [
        'Saldırı öncesi uyarı var mı? Yoksa haksız hissettiriyor mu?',
        'Beş tanesi aynı anda gelince kare hızı düşüyor mu?',
      ],
    },
    {
      id: 'silah',
      name: 'Silah / hareket',
      summary: 'Oyuncunun saldırı seçeneği.',
      fields: [
        { key: 'hasar', label: 'Hasar', type: 'number' },
        { key: 'hiz', label: 'Hızı', type: 'text' },
        { key: 'zaaf', label: 'Zayıf yanı', type: 'text',
          help: 'Her seçeneğin bir bedeli olmalı, yoksa tek bir seçenek baskın çıkar.' },
      ],
      testChecklist: [
        'Sadece bunu kullanarak oyun bitirilebiliyor mu? Öyleyse denge bozuk.',
        'Vuruş hissi var mı: ses, sarsıntı, duraklama?',
      ],
    },
  ],

  roguelike: [
    {
      id: 'oda',
      lower: 'oda',
      dative: 'odaya',
      name: 'Oda / segment',
      summary: 'Rastgele dizilen yapı taşı.',
      isContainer: true,
      fields: [
        { key: 'tur', label: 'Türü', type: 'text', help: 'Savaş, ödül, dinlenme, dükkan...' },
        { key: 'cikis', label: 'Kaç çıkışı var', type: 'number' },
      ],
      testChecklist: [
        'Bu oda her dizilimde geçilebilir mi, kapalı kalabilir mi?',
        'Arka arkaya iki tane gelirse sıkıcı oluyor mu?',
      ],
    },
    {
      id: 'esya',
      name: 'Eşya / güçlendirme',
      summary: 'Koşu içinde toplanan kalıcı etki.',
      fields: [
        { key: 'etki', label: 'Ne yapar', type: 'text' },
        { key: 'nadir', label: 'Nadirlik', type: 'text' },
        { key: 'birlesim', label: 'Hangi eşyayla birleşince güçlü', type: 'text' },
      ],
      testChecklist: [
        'İki tanesi üst üste alınınca ne oluyor?',
        'Bu eşya koşuyu bozacak kadar güçlü mü?',
        'Hiç alınmazsa koşu bitirilebiliyor mu?',
      ],
    },
    {
      id: 'dusman',
      name: 'Düşman',
      summary: 'Odalarda çıkan tehdit.',
      fields: [
        { key: 'can', label: 'Can', type: 'number' },
        { key: 'kuvvet', label: 'Kuvvet', type: 'number' },
        { key: 'oda', label: 'Hangi oda türünde', type: 'ref', refType: 'oda' },
      ],
      testChecklist: [
        'Dar bir odada bu düşmandan kaçmak mümkün mü?',
        'Erken koşuda çıkarsa oyuncuyu haksız yere öldürüyor mu?',
      ],
    },
  ],

  simulasyon: [
    {
      id: 'kaynak',
      lower: 'kaynak',
      dative: 'kaynağa',
      name: 'Kaynak',
      summary: 'Üretilen, harcanan, dönüştürülen değer.',
      isContainer: true,
      fields: [
        { key: 'uretim', label: 'Nereden gelir', type: 'text' },
        { key: 'tuketim', label: 'Nereye gider', type: 'text' },
        { key: 'baslangic', label: 'Başlangıç miktarı', type: 'number' },
      ],
      testChecklist: [
        'Bu kaynak sıfırlanırsa oyun kilitleniyor mu?',
        'Sonsuz üretim döngüsü kurulabiliyor mu?',
      ],
    },
    {
      id: 'bina',
      name: 'Bina / birim',
      summary: 'Yerleştirilen ve kaynak işleyen şey.',
      fields: [
        { key: 'maliyet', label: 'Maliyeti', type: 'text' },
        { key: 'uretir', label: 'Ne üretir', type: 'ref', refType: 'kaynak' },
        { key: 'hiz', label: 'Üretim hızı', type: 'number' },
      ],
      testChecklist: [
        'Yüz tane yapılırsa performans düşüyor mu?',
        'Yıkılınca maliyeti geri geliyor mu? Gelmeli mi?',
      ],
    },
  ],

  arcade: [
    {
      id: 'dalga',
      lower: 'dalga',
      dative: 'dalgaya',
      name: 'Dalga / seviye',
      summary: 'Zorluğun arttığı aşama.',
      isContainer: true,
      fields: [
        { key: 'sure', label: 'Kaç saniye', type: 'number' },
        { key: 'zorluk', label: 'Neyi artırır', type: 'text' },
      ],
      testChecklist: [
        'Zorluk artışı hissediliyor mu, yoksa aniden mi geliyor?',
        'Bu dalgaya kadar oynamak ne kadar sürüyor?',
      ],
    },
    {
      id: 'engel',
      name: 'Engel / hedef',
      summary: 'Kaçınılan veya vurulan nesne.',
      fields: [
        { key: 'dalga', label: 'Hangi dalgada', type: 'ref', refType: 'dalga' },
        { key: 'hiz', label: 'Hızı', type: 'number' },
        { key: 'puan', label: 'Puan değeri', type: 'number' },
      ],
      testChecklist: [
        'Ekranın kenarından aniden girip haksız ölüm yaratıyor mu?',
        'Puanı, zorluğuyla orantılı mı?',
      ],
    },
  ],

  deneysel: [
    {
      id: 'parca',
      lower: 'içerik parçası',
      dative: 'içerik parçasına',
      name: 'İçerik parçası',
      summary:
        'Türü belirsiz olduğu için genel bir kalıp. Oyununun tekrar eden ' +
        'yapı taşı neyse ona göre adlandır.',
      isContainer: true,
      fields: [
        { key: 'nedir', label: 'Nedir', type: 'text' },
        { key: 'sure', label: 'Kaç dakikalık', type: 'number' },
        { key: 'amac', label: 'Ne işe yarar', type: 'text' },
      ],
      testChecklist: [
        'Bu parça tek başına anlaşılıyor mu?',
        'İkincisi eklendiğinde ilkinden farklı hissettiriyor mu?',
      ],
    },
  ],
}

export function contentTypesFor(genreId) {
  return CONTENT_TYPES[genreId] || CONTENT_TYPES.deneysel
}

export function findContentType(genreId, typeId) {
  return contentTypesFor(genreId).find((t) => t.id === typeId) || null
}

// Türün küçük harfli ve yönelme hali ("bölgeye", "bölüme") biçimleri.
// Türkçe ek kuralını kodla çözmek yerine veriye yazıyoruz: ünlüyle biten
// kelimeler kaynaştırma harfi ister ("bölge" -> "bölgeye"), bazıları da
// ünsüz yumuşamasına uğrar ("kaynak" -> "kaynağa"). Bu bir algoritma
// değil, alan bilgisi.
export function lowerName(type) {
  return type.lower || type.name.toLocaleLowerCase('tr')
}

export function dativeName(type) {
  return type.dative || lowerName(type) + 'e'
}

// Kapsayıcı tür: diğer bileşenlerin bağlandığı şey (bölge, bölüm, sahne).
export function containerTypeFor(genreId) {
  return contentTypesFor(genreId).find((t) => t.isContainer) || null
}
