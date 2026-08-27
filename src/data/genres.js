// Oyun türleri ve türe özel üretim bilgisi.
//
// Her türün kendi öncelik sırası vardır. Bir platform oyununda önce
// zıplama hissi oturur, bir anlatı oyununda önce hikaye iskeleti.
// Bu dosya o farkı taşır: türe göre farklı teslimatlar, farklı tuzaklar,
// farklı dikey dilim tanımı.
//
// baseHours: "küçük" ölçek, deneyimli solo geliştirici, bildiği bir motor
// varsayımıyla toplam saat. Çarpanlar options.js içinde.

export const GENRES = [
  {
    id: 'bulmaca',
    name: 'Bulmaca',
    summary: 'Tek bir mekaniğin derinlemesine keşfi. Sokoban, Baba Is You, Portal.',
    baseHours: 200,
    coreLoopExample:
      'Oyuncu odayı inceler, bir kural keşfeder, kuralı uygular, kapı açılır.',
    pillarsHint: ['Tek net kural', 'Aha anı', 'Adaletli zorluk'],
    riskiestThing: 'Çekirdek mekanik yeterince derin mi? 20 bulmaca çıkarabiliyor musun?',
    // Bulmaca oyununda işin çoğu bulmaca tasarlamak ve doğrulamaktır,
    // yani hiçbir asistanın hızlandıramadığı karar işi.
    disciplineShares: { kod: 0.32, sanat: 0.12, ses: 0.04, yazim: 0.02, karar: 0.5 },
    verticalSlice:
      'Zorluk eğrisinin üç aşamasını gösteren 5 bulmaca: öğreten, uygulatan, birleştiren.',
    contentUnits: {
      mikro: '8-12 bulmaca, tek mekanik',
      kucuk: '25-40 bulmaca, 1 çekirdek + 2 yardımcı mekanik',
      orta: '60-100 bulmaca, 1 çekirdek + 4-5 mekanik, mekanik birleşimleri',
      buyuk: '150+ bulmaca, çok katmanlı mekanik sistemi',
    },
    traps: [
      'Mekaniği test etmeden 30 bulmaca tasarlamak. Önce 5 bulmaca yap, oynat, sonra devam et.',
      'Kendi bulmacanı çözebilmen hiçbir şey ifade etmez. Çözümü bilmeyen birine oynatmadan zorluk ayarlayamazsın.',
      'Bulmaca editörü yazmaya kalkmak. 40 bulmacanın altındaysan editör yazmak zaman kaybıdır.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'bulmaca-mekanik',
          name: 'Çekirdek mekaniğin kural tablosu',
          why: 'Bulmaca oyununda kurallar belirsizse oyuncu oyunu değil senin kafanı çözmeye çalışır.',
          doneWhen:
            'Mekaniğin bütün kuralları, istisnaları ile birlikte tek sayfada yazılı ve çelişkisiz.',
          minutes: 90,
          steps: [
            {
              id: 'bm-1',
              text: 'Çekirdek mekaniği tek cümlede yaz.',
              minutes: 15,
              hint: 'Örnek: "Kutuları itebilirsin ama çekemezsin."',
            },
            {
              id: 'bm-2',
              text: 'Mekaniğin tüm kurallarını madde madde listele.',
              minutes: 30,
              hint: 'Ne olur, ne olmaz. Çarpışma, sınır durumları, geri alma.',
            },
            {
              id: 'bm-3',
              text: 'Her kural için bir istisna veya sınır durumu düşün ve yaz.',
              minutes: 30,
              hint: 'İki kutu üst üste gelirse? Duvara dayalıysa? Bu boşluklar sonra bug olur.',
            },
            {
              id: 'bm-4',
              text: 'Kuralları kağıt üzerinde 3 bulmaca ile test et.',
              minutes: 15,
              hint: 'Kareli kağıt yeter. Kod yazmadan çelişkileri yakalarsın.',
            },
          ],
        },
        {
          id: 'bulmaca-egri',
          name: 'Zorluk eğrisi planı',
          why: 'Bulmaca oyununda sıralama, bulmacaların kendisi kadar önemlidir.',
          doneWhen:
            'Hangi bulmacanın hangi kavramı öğrettiği ve sırası bir tabloda yazılı.',
          minutes: 60,
          steps: [
            {
              id: 'be-1',
              text: 'Oyuncunun öğrenmesi gereken kavramları sırala.',
              minutes: 20,
              hint: 'Her kavram bir öncekinin üstüne binmeli.',
            },
            {
              id: 'be-2',
              text: 'Her kavram için "öğreten - uygulatan - zorlaştıran" üçlüsü planla.',
              minutes: 25,
              hint: 'Klasik bulmaca dilbilgisi: tanıt, tekrar ettir, birleştir.',
            },
            {
              id: 'be-3',
              text: 'Bölüm sırasını tabloya dök.',
              minutes: 15,
            },
          ],
        },
      ],
    },
  },

  {
    id: 'platform',
    name: 'Platform',
    summary: 'Hareket ve zamanlama oyunu. Celeste, Hollow Knight, Super Meat Boy.',
    baseHours: 300,
    coreLoopExample:
      'Oyuncu engeli görür, hareketi planlar, uygular, başarır veya ölür ve hemen tekrar dener.',
    pillarsHint: ['Kusursuz kontrol hissi', 'Adil ölüm', 'Hızlı tekrar deneme'],
    riskiestThing: 'Zıplama hissi doğru mu? Bu oturmadan bölüm tasarlamak boşa emek.',
    verticalSlice:
      'Tek bir bölüm: bir mekaniği tanıtan, uygulatan ve bir mini patronla bitiren 5-8 dakika.',
    contentUnits: {
      mikro: '5-8 ekran, tek hareket mekaniği',
      kucuk: '15-25 bölüm, 3-4 hareket mekaniği, 1-2 patron',
      orta: '40-60 bölüm veya bağlı bir harita, 6-8 mekanik, 4-6 patron',
      buyuk: '100+ bölüm, geniş bağlı harita, derin yetenek ağacı',
    },
    traps: [
      'Zıplama hissini ayarlamadan bölüm yapmak. Hissi değiştirdiğinde tüm bölümleri yeniden ayarlaman gerekir.',
      'Coyote time, giriş tamponu ve zıplama kesme olmadan "kontroller kötü" denir ve sebebi bulunamaz.',
      'Bölüm sayısını hedef almak. 15 iyi bölüm, 40 vasat bölümden iyidir.',
      'Kendi bölümünü kendin oynayınca kolay gelir. Sen bölümü ezberledin, oyuncu ezberlemedi.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'platform-hareket',
          name: 'Hareket sözlüğü ve his hedefi',
          why: 'Platform oyununun tamamı hareket hissinin üstüne kurulur. Önce o tanımlanır.',
          doneWhen:
            'Oyuncunun yapabildiği her hareket, tuşu ve hissi ile birlikte listelenmiş.',
          minutes: 75,
          steps: [
            {
              id: 'ph-1',
              text: 'Oyuncunun yapabileceği tüm hareketleri listele.',
              minutes: 20,
              hint: 'Yürü, zıpla, çift zıpla, duvara tutun, atıl, eğil. Az tut.',
            },
            {
              id: 'ph-2',
              text: 'Referans aldığın oyunu aç ve zıplamasını izle: yükseliş ne kadar, düşüş ne kadar?',
              minutes: 25,
              hint: 'Çoğu iyi platform oyununda düşüş, yükselişten hızlıdır. Video kaydedip kare kare bak.',
            },
            {
              id: 'ph-3',
              text: 'Zıplama yüksekliğini karakter boyu cinsinden yaz.',
              minutes: 15,
              hint: 'Örnek: "3 karakter boyu yükseklik, 4 karakter boyu mesafe."',
            },
            {
              id: 'ph-4',
              text: 'Affedicilik listesi yaz: coyote time, giriş tamponu, zıplama kesme.',
              minutes: 15,
              hint: 'Bunlar oyunculara görünmez ama olmadıklarında oyun kötü hissettirir.',
            },
          ],
        },
      ],
      prototip: [
        {
          id: 'platform-his',
          name: 'Zıplama hissi ayarı',
          why: 'Bu, oyunun tamamının üstüne kurulacağı temel. Bölümlerden önce bitmeli.',
          doneWhen:
            'Boş bir odada 2 dakika sadece zıplayıp koşmak keyifli geliyor.',
          minutes: 180,
          steps: [
            {
              id: 'phi-1',
              text: 'Boş bir test odası yap: düz zemin, birkaç platform, duvar.',
              minutes: 30,
            },
            {
              id: 'phi-2',
              text: 'Yerçekimi, zıplama gücü ve yatay hızı sayı olarak ayarla.',
              minutes: 60,
              hint: 'Değerleri oyun içinde değiştirebileceğin şekilde dışarı çıkar, her denemede derlemek zaman kaybı.',
            },
            {
              id: 'phi-3',
              text: 'Coyote time ekle (platformdan düştükten sonra ~0.1 saniye zıplayabilme).',
              minutes: 30,
            },
            {
              id: 'phi-4',
              text: 'Giriş tamponu ekle (yere inmeden önce basılan zıplama kaydedilsin).',
              minutes: 30,
            },
            {
              id: 'phi-5',
              text: 'Sadece hareket etmenin keyifli olup olmadığını 2 dakika test et.',
              minutes: 30,
              hint: 'Keyifli değilse bölüm yapmaya başlama. Buraya dön.',
            },
          ],
        },
      ],
    },
  },

  {
    id: 'anlati',
    name: 'Anlatı / Hikaye',
    summary: 'Hikaye ve seçim odaklı. Disco Elysium, Firewatch, Oxenfree.',
    baseHours: 340,
    coreLoopExample:
      'Oyuncu bir sahneye girer, konuşur, bir seçim yapar, sonucu görür ve dünya hakkında bir şey öğrenir.',
    pillarsHint: ['İnandırıcı karakterler', 'Sonucu olan seçimler', 'Merak duygusu'],
    riskiestThing:
      'Yazma hızın. Kaç kelime yazacağını hesapla, sonra saatte kaç kelime yazdığını ölç.',
    disciplineShares: { kod: 0.26, sanat: 0.18, ses: 0.06, yazim: 0.27, karar: 0.23 },
    verticalSlice:
      'Tek bir tam sahne: giriş, diyalog, en az bir anlamlı seçim ve o seçimin görünür sonucu.',
    contentUnits: {
      mikro: '2.000-4.000 kelime, tek sahne, 2 karakter',
      kucuk: '15.000-25.000 kelime, 6-10 sahne, 4-6 karakter',
      orta: '50.000-90.000 kelime, 20-30 sahne, 10+ karakter, dallanma',
      buyuk: '150.000+ kelime, geniş dallanma, çoklu son',
    },
    traps: [
      'Kelime sayısını hesaplamamak. 20.000 kelime, ortalama bir yazarda 60-100 saattir. Sadece yazmak.',
      'Diyalog sistemini yazmadan diyalog yazmak. Formatı bilmeden yazdığın metni sonra baştan biçimlendirirsin.',
      'Dallanma patlaması. Her seçim 2 dala ayrılırsa 5 seçim sonrası 32 son yazman gerekir. Dalları birleştir.',
      'Seslendirme kararını sona bırakmak. Seslendirme varsa metin kilitlenmeden kayda giremezsin.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'anlati-iskelet',
          name: 'Hikaye iskeleti',
          why: 'Sahne sahne yazmaya başlamadan önce bütünün nereye gittiğini bilmen gerekir.',
          doneWhen: 'Başlangıç, orta ve son, sahne listesi halinde tek sayfada.',
          minutes: 120,
          steps: [
            {
              id: 'ai-1',
              text: 'Hikayeyi 3 cümlede özetle: durum, çatışma, çözüm.',
              minutes: 20,
            },
            {
              id: 'ai-2',
              text: 'Ana karakterin başta ve sonda ne istediğini yaz.',
              minutes: 20,
              hint: 'Değişmiyorsa hikaye yok demektir.',
            },
            {
              id: 'ai-3',
              text: 'Sahneleri sırayla listele, her sahne için tek satır.',
              minutes: 50,
              hint: 'Her sahnede bir şey değişmeli. Değişmiyorsa sahneyi sil.',
            },
            {
              id: 'ai-4',
              text: 'Her sahne için tahmini kelime sayısı yaz ve topla.',
              minutes: 30,
              hint: 'Bu toplam, yazma saatini hesaplamanı sağlar. Gerçekle yüzleşme anı.',
            },
          ],
        },
        {
          id: 'anlati-diyalog',
          name: 'Diyalog sistemi kararı',
          why: 'Metnin formatı, yazmaya başlamadan önce kesinleşmeli.',
          doneWhen:
            'Diyalogların hangi formatta yazılacağı ve motorun onu nasıl okuyacağı yazılı, örnek bir sahne o formatta yazılmış.',
          minutes: 90,
          steps: [
            {
              id: 'ad-1',
              text: 'Hazır bir araç mı, kendi formatın mı? Karar ver ve gerekçesini yaz.',
              minutes: 30,
              hint: 'Ink, Yarn Spinner gibi araçlar var. Kendi sistemini yazmak 20-40 saat alır.',
            },
            {
              id: 'ad-2',
              text: 'Dallanma kuralını yaz: seçimler nerede ayrılıp nerede birleşiyor?',
              minutes: 30,
              hint: 'Dalları en geç 2-3 sahne sonra birleştir, yoksa içerik katlanarak artar.',
            },
            {
              id: 'ad-3',
              text: 'Örnek bir sahneyi seçtiğin formatta baştan sona yaz.',
              minutes: 30,
            },
          ],
        },
      ],
    },
  },

  {
    id: 'aksiyon',
    name: 'Aksiyon / Dövüş',
    summary: 'Çatışma ve refleks odaklı. Hades, Devil May Cry, Enter the Gungeon.',
    baseHours: 440,
    coreLoopExample:
      'Oyuncu odaya girer, düşmanları okur, saldırı ve kaçınmayı zamanlar, odayı temizler ve güçlenir.',
    pillarsHint: ['Ağır vuruş hissi', 'Okunabilir düşmanlar', 'Sürekli hareket'],
    riskiestThing: 'Vuruş hissi. Tek bir düşmana vurmak keyifli değilse hiçbir şey kurtarmaz.',
    verticalSlice:
      'Tek bir çatışma odası: 3 düşman tipi, tam vuruş hissi, ölüm ve tekrar başlama akışı.',
    contentUnits: {
      mikro: '1 silah, 2 düşman tipi, 3-5 oda',
      kucuk: '3-4 silah, 6-8 düşman tipi, 20-30 oda, 2 patron',
      orta: '8+ silah, 15-20 düşman tipi, 60+ oda, 5-6 patron',
      buyuk: 'Geniş yetenek sistemi, 30+ düşman, çok bölgeli harita',
    },
    traps: [
      'Vuruş hissini ihmal etmek. Duraklama, ekran sarsıntısı, ses ve parçacık olmadan hiçbir saldırı iyi hissettirmez.',
      'Düşman yapay zekasını akıllı yapmaya çalışmak. Oyuncu akıllı düşman istemez, okunabilir düşman ister.',
      'Çok fazla düşman tipi. 6 iyi tasarlanmış düşman, 20 vasat düşmandan iyidir.',
      'Denge ayarını sona bırakmak. Denge, üretimin her aşamasında sürekli yapılan bir iştir.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'aksiyon-dusman',
          name: 'Düşman arketipleri',
          why: 'Her düşman farklı bir soru sormalı, yoksa çatışma tekrara düşer.',
          doneWhen: 'Her düşman tipi ve oyuncuyu zorladığı şey tabloda yazılı.',
          minutes: 75,
          steps: [
            {
              id: 'ax-1',
              text: 'Her düşman için "oyuncuyu neye zorluyor" sorusunu cevapla.',
              minutes: 35,
              hint: 'Yaklaşmaya zorlayan, uzaklaşmaya zorlayan, hareket etmeye zorlayan, beklemeye zorlayan.',
            },
            {
              id: 'ax-2',
              text: 'Her düşmanın telegrafını yaz: saldırmadan önce ne gösteriyor?',
              minutes: 25,
              hint: 'Telegraf yoksa ölüm adaletsiz hissettirir.',
            },
            {
              id: 'ax-3',
              text: 'Düşman kombinasyonlarını planla: hangi ikili birlikte ilginç?',
              minutes: 15,
            },
          ],
        },
      ],
      prototip: [
        {
          id: 'aksiyon-vurus',
          name: 'Vuruş hissi ayarı',
          why: 'Tek düşmana vurmak keyifli değilse, oyunun tamamı keyifsiz olur.',
          doneWhen: 'Tek bir düşmana arka arkaya vurmak, başka hiçbir şey olmasa bile keyifli.',
          minutes: 150,
          steps: [
            {
              id: 'av-1',
              text: 'Tek saldırı ve tek düşmanı kutu olarak yap.',
              minutes: 30,
            },
            {
              id: 'av-2',
              text: 'Vuruş anında kısa duraklama ekle (hit stop, ~0.05 saniye).',
              minutes: 30,
              hint: 'Vuruşun ağır hissettirmesinin en ucuz yolu budur.',
            },
            {
              id: 'av-3',
              text: 'Ekran sarsıntısı, geri tepme ve ses ekle.',
              minutes: 45,
            },
            {
              id: 'av-4',
              text: 'Düşmanın hasar aldığını gösteren görsel geri bildirim ekle.',
              minutes: 30,
              hint: 'Beyaz flaş en basit ve en etkili yöntem.',
            },
            {
              id: 'av-5',
              text: '2 dakika sadece vur ve keyifli olup olmadığına karar ver.',
              minutes: 15,
            },
          ],
        },
      ],
    },
  },

  {
    id: 'roguelike',
    name: 'Roguelike / Roguelite',
    summary: 'Tekrar oynanan koşular ve rastgelelik. Hades, Slay the Spire, Binding of Isaac.',
    baseHours: 400,
    coreLoopExample:
      'Oyuncu koşuya başlar, odaları temizler, güçlendirme seçer, ölür ve daha iyi hazırlıkla tekrar başlar.',
    pillarsHint: ['Her koşu farklı', 'Anlamlı seçimler', 'Ölüm bir ilerleme'],
    riskiestThing:
      'Koşu yapısı ve güçlendirme çeşitliliği. 3 koşu sonrası sıkılıyorsan sistem yetersiz.',
    verticalSlice: 'Baştan sona tek bir tam koşu: başlangıç, 5-8 oda, patron, ölüm ve meta ekran.',
    contentUnits: {
      mikro: '1 bölge, 8-10 güçlendirme, 5 dakikalık koşu',
      kucuk: '2-3 bölge, 30-50 güçlendirme, 15-25 dakikalık koşu',
      orta: '4-5 bölge, 100+ güçlendirme, birden fazla karakter',
      buyuk: 'Derin meta sistem, 200+ öğe, çoklu karakter ve mod',
    },
    traps: [
      'Prosedürel üretimi erken ve karmaşık yapmak. Önce elle tasarlanmış odaları rastgele diz, gerçek prosedürel üretim çok pahalı.',
      'Meta ilerlemeyi çekirdek döngüden önce yapmak. Koşu eğlenceli değilse meta ilerleme onu kurtarmaz.',
      'Az güçlendirme. Roguelike\'ın tamamı çeşitlilikten gelir, 10 güçlendirme ile oyun 3 koşuda biter.',
      'Denge testi için yeterli koşu oynamamak. Bu türde denge ancak yüzlerce koşuyla oturur.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'rogue-kosu',
          name: 'Koşu yapısı',
          why: 'Bir koşunun kaç dakika sürdüğü ve nasıl ilerlediği, oyunun tüm iskeletidir.',
          doneWhen: 'Tek bir koşunun akışı ve süresi dakika dakika yazılı.',
          minutes: 75,
          steps: [
            {
              id: 'rk-1',
              text: 'Hedef koşu süresini dakika olarak belirle.',
              minutes: 15,
              hint: '15-25 dakika yaygın. Uzun koşular ölümü acı verici yapar.',
            },
            {
              id: 'rk-2',
              text: 'Koşunun aşamalarını yaz: kaç oda, kaç patron, ne zaman seçim?',
              minutes: 35,
            },
            {
              id: 'rk-3',
              text: 'Meta ilerleme olacak mı? Karar ver ve gerekçesini yaz.',
              minutes: 25,
              hint: 'Meta ilerleme, zayıf bir çekirdek döngüyü gizler. Önce döngüyü sağlam yap.',
            },
          ],
        },
        {
          id: 'rogue-guc',
          name: 'Güçlendirme listesi',
          why: 'Çeşitlilik önceden planlanmazsa üretimde tıkanırsın.',
          doneWhen: 'En az 20 güçlendirme fikri, kategorilere ayrılmış halde listelenmiş.',
          minutes: 60,
          steps: [
            {
              id: 'rg-1',
              text: 'Güçlendirme kategorilerini belirle.',
              minutes: 20,
              hint: 'Sayısal artış, davranış değiştiren, yeni yetenek veren.',
            },
            {
              id: 'rg-2',
              text: 'Her kategori için en az 7 fikir yaz.',
              minutes: 40,
              hint: 'Davranış değiştirenler en ilginç olanlardır, sadece sayı artıranlar sıkıcıdır.',
            },
          ],
        },
      ],
    },
  },

  {
    id: 'simulasyon',
    name: 'Simülasyon / Yönetim',
    summary: 'Sistem ve ekonomi odaklı. Stardew Valley, Factorio, Mini Metro.',
    baseHours: 500,
    coreLoopExample:
      'Oyuncu durumu okur, kaynak yatırır, sistemin tepkisini bekler, sonucu görür ve planını günceller.',
    pillarsHint: ['Anlaşılır sistem', 'Görünür sonuç', 'Uzun vadeli plan'],
    riskiestThing: 'Ekonomi dengesi. Sistem kendini sömürüyorsa oyun ilk saatte biter.',
    // Sistem ve arayüz ağırlıklı, ama denge ayarı da uzun sürer.
    disciplineShares: { kod: 0.45, sanat: 0.14, ses: 0.04, yazim: 0.03, karar: 0.34 },
    verticalSlice:
      'Tek bir tam döngü: kaynak topla, harca, sonucu gör. Arayüz dahil bitmiş kalitede.',
    contentUnits: {
      mikro: '2 kaynak, 3 bina veya eylem, tek ekran',
      kucuk: '4-6 kaynak, 15-25 bina veya eylem, temel ekonomi',
      orta: '10+ kaynak, 50+ öğe, derin üretim zinciri',
      buyuk: 'Çok katmanlı ekonomi, otomasyon, uzun oyun sonu',
    },
    traps: [
      'Ekonomiyi kağıt üzerinde denemeden koda dökmek. Tablo ile 2 saatte anlarsın, kodla 2 haftada.',
      'Arayüzü küçümsemek. Bu türde arayüz oyunun kendisidir, kolayca sürenin yarısını alır.',
      'Sonsuz büyüme. Sistemde bir sınır yoksa oyuncu her şeyi kırar ve oyun anlamsızlaşır.',
      'Kaydetme sistemini sona bırakmak. Uzun oyunlarda kaydetme zorunludur ve sonradan eklemek acı vericidir.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'sim-ekonomi',
          name: 'Ekonomi diyagramı ve tablosu',
          why: 'Kaynakların nereden gelip nereye gittiği belli değilse sistem dengelenemez.',
          doneWhen:
            'Tüm kaynaklar, kaynakların girdiği ve çıktığı yerler bir diyagramda, oranlar bir tabloda.',
          minutes: 150,
          steps: [
            {
              id: 'se-1',
              text: 'Tüm kaynakları listele.',
              minutes: 20,
              hint: 'Az tut. Her yeni kaynak sistemi katlanarak karmaşıklaştırır.',
            },
            {
              id: 'se-2',
              text: 'Her kaynak için giriş ve çıkış yollarını çiz.',
              minutes: 45,
              hint: 'Kağıt üzerinde kutu ve ok yeter. Girişi olup çıkışı olmayan kaynak birikir ve anlamsızlaşır.',
            },
            {
              id: 'se-3',
              text: 'Hesap tablosunda 20 turluk bir simülasyon yap.',
              minutes: 60,
              hint: 'Excel veya Google Sheets. Kodlamadan önce dengesizliği burada görürsün.',
            },
            {
              id: 'se-4',
              text: 'Sömürülebilecek döngüleri ara ve sınır koy.',
              minutes: 25,
              hint: 'Sonsuz kaynak üreten bir döngü varsa oyun orada biter.',
            },
          ],
        },
      ],
    },
  },

  {
    id: 'rpg',
    name: 'RPG',
    summary: 'Karakter gelişimi ve geniş içerik. Undertale, Chained Echoes, Sea of Stars.',
    baseHours: 900,
    coreLoopExample:
      'Oyuncu keşfeder, çatışmaya girer, güçlenir, hikayede ilerler ve yeni bir bölgeye açılır.',
    pillarsHint: ['Karakter bağı', 'Anlamlı gelişim', 'Keşif ödülü'],
    riskiestThing: 'İçerik hacmi. RPG, solo geliştiricinin en sık bıraktığı türdür.',
    disciplineShares: { kod: 0.33, sanat: 0.25, ses: 0.05, yazim: 0.15, karar: 0.22 },
    verticalSlice:
      'Tek bir bölge: kasaba, bir zindan, bir çatışma sistemi, bir hikaye sahnesi. Hepsi bitmiş kalitede.',
    contentUnits: {
      mikro: '1 kasaba, 1 zindan, 3 düşman, 30 dakikalık oyun',
      kucuk: '3-4 bölge, 15-20 düşman, 8-12 saatlik oyun, 20.000+ kelime',
      orta: '8+ bölge, 40+ düşman, 20-30 saatlik oyun, 60.000+ kelime',
      buyuk: 'Geniş dünya, 100+ düşman, 50+ saatlik oyun',
    },
    traps: [
      'RPG, ilk oyun için en kötü seçimdir. Anlatı, çatışma, ekonomi, arayüz ve içerik hacmini aynı anda çözmen gerekir.',
      'Çatışma sistemini prototiplemeden hikaye yazmak. Çatışma sıkıcıysa 20 saatlik oyun 20 saatlik işkencedir.',
      'İçerik hacmini hesaplamamak. Her bölge, her düşman, her eşya ayrı ayrı üretim saatidir.',
      'Denge tablosunu sonra yaparım demek. Seviye ve hasar eğrileri baştan tabloda olmalı.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'rpg-kapsam',
          name: 'İçerik hacmi hesabı',
          why: 'RPG projelerinin çoğu kapsam yüzünden ölür. Sayıyı önceden görmen şart.',
          doneWhen:
            'Bölge, düşman, eşya, yetenek ve kelime sayıları tek tek yazılmış ve saat karşılığı hesaplanmış.',
          minutes: 90,
          steps: [
            {
              id: 'rp-1',
              text: 'Bölge sayısını yaz ve bir bölgenin kaç saat sürdüğünü tahmin et.',
              minutes: 25,
              hint: 'Bir bölge, haritası ve olayları ile 20-40 saat sürer.',
            },
            {
              id: 'rp-2',
              text: 'Düşman, eşya ve yetenek sayılarını yaz.',
              minutes: 25,
            },
            {
              id: 'rp-3',
              text: 'Toplam kelime sayısını tahmin et.',
              minutes: 20,
            },
            {
              id: 'rp-4',
              text: 'Hepsini saate çevir ve topla. Bütçene sığmıyorsa şimdi kes.',
              minutes: 20,
              hint: 'Burada kesmek, altı ay sonra projeyi bırakmaktan iyidir.',
            },
          ],
        },
        {
          id: 'rpg-catisma',
          name: 'Çatışma sistemi tasarımı',
          why: 'Oyuncu saatlerini çatışmada geçirecek. Sıkıcıysa hikaye kurtarmaz.',
          doneWhen: 'Çatışmanın tur yapısı, oyuncunun kararları ve hasar formülü yazılı.',
          minutes: 120,
          steps: [
            {
              id: 'rc-1',
              text: 'Çatışmada oyuncunun her turda verdiği kararı yaz.',
              minutes: 30,
              hint: 'Karar yoksa çatışma değil, tuşa basma töreni olur.',
            },
            {
              id: 'rc-2',
              text: 'Hasar ve savunma formülünü yaz.',
              minutes: 40,
            },
            {
              id: 'rc-3',
              text: 'Seviye eğrisini tabloda 10 seviye için hesapla.',
              minutes: 50,
            },
          ],
        },
      ],
    },
  },

  {
    id: 'arcade',
    name: 'Arcade / Beceri',
    summary: 'Kısa, tekrarlanan, skor odaklı. Tetris, Vampire Survivors, Downwell.',
    baseHours: 260,
    coreLoopExample:
      'Oyuncu başlar, hızla artan baskıyla baş eder, ölür ve daha iyi skor için hemen tekrar başlar.',
    pillarsHint: ['Anında anlaşılır', 'Hızlı tekrar', 'Yükselen baskı'],
    riskiestThing: 'Tek oturuşta tekrar tekrar oynanacak kadar keyifli mi?',
    verticalSlice: 'Baştan sona tek bir oyun oturumu: başlangıç, zorlaşma, ölüm, skor, tekrar.',
    contentUnits: {
      mikro: 'Tek mekanik, tek mod, skor tablosu',
      kucuk: '1 çekirdek mekanik, 3-5 varyasyon, ilerleme sistemi',
      orta: 'Birden fazla mod, açılabilir içerik, günlük meydan okuma',
      buyuk: 'Geniş meta sistem, çok karakterli yapı',
    },
    traps: [
      'Çekirdek döngü keyifli değilse hiçbir eklenti kurtarmaz. Bu türde her şey ilk 30 saniyede belli olur.',
      'Zorluk artışını rastgele bırakmak. Baskının nasıl arttığı tasarlanmalıdır.',
      'Menü ve skor ekranını sona bırakmak. Bu türde oyuncu menüyü çok sık görür.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'arcade-baski',
          name: 'Baskı eğrisi',
          why: 'Bu türde oyunun tamamı, zorluğun zamanla nasıl arttığıdır.',
          doneWhen: 'Zorluğun hangi dakikada nasıl arttığı bir eğri veya tablo olarak yazılı.',
          minutes: 60,
          steps: [
            {
              id: 'ab-1',
              text: 'Hedef oturum süresini belirle.',
              minutes: 10,
              hint: '2-10 dakika bu türde yaygındır.',
            },
            {
              id: 'ab-2',
              text: 'Zorluğu artıran değişkenleri listele.',
              minutes: 20,
              hint: 'Hız, sayı, çeşitlilik, alan daralması.',
            },
            {
              id: 'ab-3',
              text: 'Her dakika için bu değişkenlerin değerini tabloya yaz.',
              minutes: 30,
            },
          ],
        },
      ],
    },
  },

  {
    id: 'deneysel',
    name: 'Deneysel / Diğer',
    summary:
      'Sadece hiçbir türe girmeyen fikirler için. Melez bir oyun yapıyorsan en ağır ' +
      'türünü seç, bunu değil.',
    baseHours: 280,
    // Bu seçenek listedeki en düşük tahmini verir. Yanlış seçildiğinde sistemin
    // tamamı yanıltıcı olur, bu yüzden sihirbazda ayrıca uyarı gösteriliyor.
    fallbackWarning:
      'Bu seçenek listedeki en düşük süre tahminini verir. Oyununda karakter ' +
      'gelişimi, envanter, birden fazla bölge veya yan görev varsa bu bir RPG\'dir ' +
      've RPG tahmini bunun üç katından fazladır. Çatışma varsa Aksiyon, bölüm ' +
      'tasarımı varsa Platform daha doğru olur. Yanlış tür seçmek, sistemin sana ' +
      'yanlış bir güven vermesine yol açar. Oyunun birden çok türü kapsıyorsa ' +
      'en ağır olanı seç.',
    coreLoopExample: 'Kendi çekirdek döngünü ön üretimde tanımlayacaksın.',
    pillarsHint: ['Net bir deneyim hedefi', 'Tek güçlü fikir', 'Kısa süre'],
    riskiestThing:
      'Türü belirsiz olan projelerde en büyük risk, ne yaptığını bilmemektir. Ön üretimi atlama.',
    verticalSlice: 'Fikrini kanıtlayan en küçük tam parça, bitmiş kalitede.',
    contentUnits: {
      mikro: 'Tek fikir, tek ekran, 5-10 dakika',
      kucuk: 'Tek güçlü fikir, 30-60 dakikalık deneyim',
      orta: 'Genişletilmiş fikir, birden fazla bölüm',
      buyuk: 'Uzun soluklu deneysel proje',
    },
    traps: [
      'Türü belirsiz projeler kapsam kontrolünü en çok kaybedenlerdir. Bittiğini nereden anlayacağını baştan yaz.',
      'Referans almamak. Hiçbir fikir tamamen yeni değildir, en yakın üç oyunu bul ve incele.',
      'Deneysel olmayı bahane edip tasarımı atlamak. Deneysel oyunun da çekirdek döngüsü olmalıdır.',
    ],
    extraDeliverables: {
      'on-uretim': [
        {
          id: 'deneysel-tanim',
          name: 'Bitiş tanımı',
          why: 'Türü belirsiz bir projede "bitti" tanımını sen yazmazsan proje hiç bitmez.',
          doneWhen: 'Oyunun bittiğini nasıl anlayacağın, madde madde yazılı.',
          minutes: 60,
          steps: [
            {
              id: 'dt-1',
              text: 'Oyuncunun yaşamasını istediğin deneyimi tek cümlede yaz.',
              minutes: 20,
            },
            {
              id: 'dt-2',
              text: 'Bu deneyimin gerçekleşmesi için gereken en küçük parça listesini yaz.',
              minutes: 25,
            },
            {
              id: 'dt-3',
              text: 'Bu listeyi "bitiş tanımı" olarak kilitle.',
              minutes: 15,
              hint: 'Bu listeye sonradan madde eklemek, kapsamı kaydırmaktır.',
            },
          ],
        },
      ],
    },
  },
]

export function findGenre(id) {
  return GENRES.find((genre) => genre.id === id) || GENRES[0]
}
