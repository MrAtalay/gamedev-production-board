// Üretim fazları, teslimatlar ve geçiş kapıları.
//
// Sistemin omurgası bu dosya. Büyük stüdyoların faz-kapı (phase gate)
// modelinin solo geliştiriciye uyarlanmış hali: her fazın somut
// teslimatları vardır, teslimatlar bitmeden kapı açılmaz.
//
// Kapı kontrolleri iki türlü:
//   type: 'auto' -> sistem hesaplar, kullanıcı yalan söyleyemez
//   type: 'self' -> kullanıcı dürüstçe kendi cevaplar
//
// Otomatik kontroller lib/gates.js içinde hesaplanır.

export const PHASES = [
  {
    id: 'konsept',
    no: 0,
    name: 'Konsept',
    subtitle: 'Fikir ve karar',
    icon: 'lightbulb',
    sharePercent: 3,
    goal: 'Bu oyunun ne olduğuna ve yapmaya değer olup olmadığına karar ver.',
    why:
      'Fikri tek cümleye indiremiyorsan henüz bir oyunun yok, bir hissin var. ' +
      'Bu faz, altı ay sonra pişman olmamak için var.',
    hardRules: [
      'Bu fazda kod yazılmaz.',
      'Bu fazda sanat üretilmez.',
    ],
    deliverables: [
      {
        id: 'pitch',
        name: 'Tek cümlelik oyun tanımı',
        why:
          'Tek cümleye sığmayan bir oyun, altı ay boyunca odakta tutulamaz. ' +
          'Bu cümle, sonraki her kararın turnusol kağıdı olacak.',
        doneWhen:
          'Cümle yazılı, tek cümle, ve oyunu bilmeyen birine okuduğunda ne olduğunu anlıyor.',
        minutes: 45,
        field: 'pitch',
        steps: [
          {
            id: 'p-1',
            text: 'Şu kalıbı doldur: "[Oyuncu] [ne yapar] [nerede], [neden ilginç]".',
            minutes: 20,
            hint: 'Örnek: "Oyuncu batmakta olan bir gemide eşya taşır, çünkü su her saniye yükseliyor."',
          },
          {
            id: 'p-2',
            text: 'Cümleyi kısalt. Sıfatları at, fiili güçlendir.',
            minutes: 15,
          },
          {
            id: 'p-3',
            text: 'Birine yüksek sesle oku ve "bu ne oyunu" diye sor.',
            minutes: 10,
            hint: 'Açıklama yapmak zorunda kalıyorsan cümle henüz hazır değil.',
          },
        ],
      },
      {
        id: 'referanslar',
        name: 'Üç referans oyun analizi',
        why:
          'Hiçbir fikir sıfırdan doğmaz. Neyi aldığını bilerek almak, farkında olmadan kopyalamaktan iyidir.',
        doneWhen:
          'Üç oyun için "neyi alıyorum" ve "neyi almıyorum" ayrı ayrı yazılı.',
        minutes: 90,
        field: 'references',
        steps: [
          {
            id: 'r-1',
            text: 'Fikrine en yakın üç oyunu seç.',
            minutes: 20,
          },
          {
            id: 'r-2',
            text: 'Her biri için "neyi alıyorum" yaz.',
            minutes: 30,
            hint: 'Somut ol. "Atmosferi" değil, "sessizlik ve tek renk paleti kullanımı".',
          },
          {
            id: 'r-3',
            text: 'Her biri için "neyi almıyorum ve neden" yaz.',
            minutes: 25,
            hint: 'Bu, kapsamı küçültmenin en kolay yollarından biridir.',
          },
          {
            id: 'r-4',
            text: 'Senin oyununu bu üçünden ayıran tek şeyi yaz.',
            minutes: 15,
            hint: 'Ayıran bir şey yoksa neden bu oyunu yapıyorsun sorusunu cevaplaman gerekir.',
          },
        ],
      },
      {
        id: 'hedef-oyuncu',
        name: 'Hedef oyuncu ve deneyim hedefi',
        why:
          'Kime yaptığını bilmiyorsan her karar zorlaşır. "Herkes için" demek "kimse için" demektir.',
        doneWhen: 'Hedef oyuncu ve oyuncunun yaşamasını istediğin duygu yazılı.',
        minutes: 45,
        field: 'audience',
        steps: [
          {
            id: 'h-1',
            text: 'Bu oyunu kim oynar? Somut bir kişi tarif et.',
            minutes: 20,
            hint: 'Örnek: "Kısa oturumlarda zorlayıcı platform oyunu arayan, Celeste bitirmiş biri."',
          },
          {
            id: 'h-2',
            text: 'Oyuncunun oynarken hissetmesini istediğin tek duyguyu yaz.',
            minutes: 15,
            hint: 'Gerilim, huzur, merak, başarı gururu, yalnızlık.',
          },
          {
            id: 'h-3',
            text: 'Oyun bittiğinde aklında ne kalsın? Tek cümle.',
            minutes: 10,
          },
        ],
      },
      {
        id: 'bitis-tanimi',
        name: 'Bitiş tanımı',
        why:
          'Projelerin çoğu bitmediği için değil, ne zaman bittiğini kimse bilmediği için ölür.',
        doneWhen: '"Şunlar varsa bu oyun bitmiştir" listesi yazılı ve en fazla 8 madde.',
        minutes: 45,
        field: 'definitionOfDone',
        steps: [
          {
            id: 'b-1',
            text: 'Oyunun bitmiş sayılması için gereken en küçük listeyi yaz.',
            minutes: 25,
            hint: 'Örnek: "15 bölüm, bir son ekranı, menü, ses, Windows derlemesi."',
          },
          {
            id: 'b-2',
            text: 'Listeyi 8 maddenin altına indir.',
            minutes: 10,
          },
          {
            id: 'b-3',
            text: 'Bu listeye sonradan madde eklemenin kapsam kaydırmak olduğunu kabul et.',
            minutes: 10,
            hint: 'Yeni fikirler buzdolabına gider, bitiş tanımına değil.',
          },
        ],
      },
    ],
    gate: {
      title: 'Konsept kapısı',
      intro:
        'Ön üretime geçmeden önce fikrin gerçekten bir oyun fikri olduğundan emin olmalıyız.',
      checks: [
        { id: 'k-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'k-auto-2', type: 'auto', verify: 'scopeFits' },
        {
          id: 'k-self-1',
          type: 'self',
          text: 'Pitch cümleni birine okudun ve o kişi ne oyunu olduğunu anladı.',
          hint: 'Anlamadıysa cümleyi düzelt, kendini kandırma.',
        },
        {
          id: 'k-self-2',
          type: 'self',
          text: 'Altı ay sonra bu oyun üzerinde hâlâ çalışmak isteyeceğine inanıyorsun.',
          hint: 'Bu soruya hayır demek utanç değil, zaman kazanmaktır.',
        },
        {
          id: 'k-self-3',
          type: 'self',
          text: 'Bu oyunu referans oyunlarından ayıran şeyi tek cümlede söyleyebiliyorsun.',
        },
      ],
      failAdvice:
        'Kapı açılmıyorsa acele etme. Eksik teslimatı bitir veya fikri değiştir. ' +
        'Bu noktada fikir değiştirmek bedavadır, altı ay sonra değildir.',
    },
  },

  {
    id: 'on-uretim',
    no: 1,
    name: 'Ön Üretim',
    subtitle: 'Tasarım',
    icon: 'pen',
    sharePercent: 15,
    goal: 'Kod yazmadan önce ne yapacağını tam olarak bil.',
    why:
      'Bu, sistemin en sert kuralının olduğu faz: tasarım bitmeden oynanış kodu yazılmaz. ' +
      'Tasarımsız yazılan kod, tasarım belli olunca çöpe gider. Bir saatlik tasarım, ' +
      'on saatlik yeniden yazmayı önler.',
    hardRules: [
      'Oynanış kodu yazılmaz. Sadece tasarım ve karar.',
      'Nihai sanat varlığı üretilmez.',
      'Motor kurulumu ve boş proje açmak serbesttir, oynanış yazmak değil.',
    ],
    deliverables: [
      {
        id: 'tod',
        name: 'Tek sayfalık tasarım dokümanı',
        why:
          'Kırk sayfalık tasarım dokümanı kimse okumaz, sen de okumazsın. ' +
          'Tek sayfa, seni gerçekten önemli olanı seçmeye zorlar.',
        doneWhen:
          'Doküman tek sayfaya sığıyor ve şu başlıkları içeriyor: pitch, sütunlar, çekirdek döngü, ana fiil, kapsam.',
        minutes: 150,
        field: 'onePager',
        steps: [
          {
            id: 't-1',
            text: 'Konsept fazındaki pitch cümleni en üste yaz.',
            minutes: 10,
          },
          {
            id: 't-2',
            text: 'Oyuncunun oturumda ne yaptığını 3-5 madde ile yaz.',
            minutes: 40,
          },
          {
            id: 't-3',
            text: 'Oyunun ne olmadığını yaz.',
            minutes: 30,
            hint: 'Bu bölüm çoğu zaman ne olduğundan daha faydalıdır.',
          },
          {
            id: 't-4',
            text: 'Tek sayfaya sığdır. Sığmıyorsa kes.',
            minutes: 40,
            hint: 'Sığmıyorsa tasarım henüz netleşmemiştir, sayfa sayısını artırmak çözüm değildir.',
          },
          {
            id: 't-5',
            text: 'Bir gün bekle, tekrar oku ve düzelt.',
            minutes: 30,
          },
        ],
      },
      {
        id: 'sutunlar',
        name: 'Üç tasarım sütunu',
        why:
          'Sütunlar, sonraki her kararı ölçeceğin cetveldir. "Bu özellik hangi sütuna hizmet ediyor?" ' +
          'sorusu, kapsam şişmesini durduran en güçlü sorudur.',
        doneWhen: 'Üç sütun yazılı, her biri kısa ve birbirinden farklı.',
        minutes: 60,
        field: 'pillars',
        steps: [
          {
            id: 's-1',
            text: 'Oyunun vazgeçilmez üç niteliğini yaz.',
            minutes: 30,
            hint: 'Örnek: "Kusursuz kontrol", "Adil ölüm", "Hızlı tekrar deneme".',
          },
          {
            id: 's-2',
            text: 'Her sütun için, o sütuna aykırı bir özellik örneği yaz.',
            minutes: 20,
            hint: 'Sütunun ne olmadığını bilmek, sütunu keskinleştirir.',
          },
          {
            id: 's-3',
            text: 'Üçten fazlaysa kes. Üç sütun, üç önceliktir.',
            minutes: 10,
          },
        ],
      },
      {
        id: 'cekirdek-dongu',
        name: 'Çekirdek döngü',
        why:
          'Oyuncu oturumun tamamında bu döngüyü tekrar eder. Döngü sıkıcıysa oyun sıkıcıdır, ' +
          'başka hiçbir şey bunu kurtaramaz.',
        doneWhen: 'Otuz saniyelik döngü tek cümlede yazılı ve fiilleri net.',
        minutes: 60,
        field: 'coreLoop',
        steps: [
          {
            id: 'c-1',
            text: 'Oyuncunun 30 saniyede yaptığı şeyi sırayla yaz.',
            minutes: 25,
            hint: 'Gör, karar ver, uygula, sonucu al. Bu dört adımın karşılıkları ne?',
          },
          {
            id: 'c-2',
            text: 'Döngüyü tek cümleye indir.',
            minutes: 20,
          },
          {
            id: 'c-3',
            text: 'Bu döngü neden tekrar edilmeye değer? Cevabı yaz.',
            minutes: 15,
            hint: 'Cevabın yoksa oyun ikinci dakikada sıkıcı olur.',
          },
        ],
      },
      {
        id: 'ana-fiil',
        name: 'Ana fiil ve kontrol şeması',
        why:
          'Oyuncunun yaptığı tek bir ana eylem vardır. Onu seçmezsen oyun dağılır.',
        doneWhen: 'Ana fiil belirlenmiş ve tüm kontroller tuşlarıyla listelenmiş.',
        minutes: 60,
        field: 'verb',
        steps: [
          {
            id: 'f-1',
            text: 'Oyuncunun en çok yaptığı tek fiili yaz.',
            minutes: 15,
            hint: 'Zıpla, vur, konuş, yerleştir, keşfet. Tek fiil.',
          },
          {
            id: 'f-2',
            text: 'Oyuncunun yapabileceği tüm eylemleri listele.',
            minutes: 25,
            hint: 'Liste uzunsa kes. Az eylem, derin kullanım.',
          },
          {
            id: 'f-3',
            text: 'Her eylemi bir tuşa ata, klavye ve oyun kolu için.',
            minutes: 20,
          },
        ],
      },
      {
        id: 'kapsam-listesi',
        name: 'Kapsam listesi: içeride ve dışarıda',
        why:
          'Neyin dışarıda olduğunu yazmadıysan hiçbir şey dışarıda değildir. ' +
          'Kapsam şişmesi, yazılmamış bir dışarıda listesiyle başlar.',
        doneWhen:
          'İçeride listesi yazılı ve dışarıda listesi en az 5 madde içeriyor.',
        minutes: 75,
        field: 'scope',
        steps: [
          {
            id: 'kl-1',
            text: 'Oyunda kesinlikle olacak şeyleri listele.',
            minutes: 30,
          },
          {
            id: 'kl-2',
            text: 'Aklına gelen ama bu oyunda olmayacak şeyleri listele.',
            minutes: 30,
            hint: 'Çok oyunculu, başarımlar, dil desteği, kaydetme, ayarlar menüsü. Karar ver.',
          },
          {
            id: 'kl-3',
            text: 'İçeride listesindeki her maddeyi bir sütunla eşleştir. Eşleşmeyeni dışarıya al.',
            minutes: 15,
            hint: 'Hiçbir sütuna hizmet etmeyen özellik, kapsam şişmesidir.',
          },
        ],
      },
      {
        id: 'risk-kaydi',
        name: 'Risk kaydı',
        why:
          'Projeyi öldüren şey bildiğin zorluklar değil, test etmediğin varsayımlardır. ' +
          'En riskli şeyi en başta test edersen, yanlışsa erken öğrenirsin.',
        doneWhen: 'En az 3 risk yazılı ve en riskli olan işaretli.',
        minutes: 60,
        field: 'risks',
        steps: [
          {
            id: 'rk-1',
            text: 'Bu projede en emin olmadığın üç şeyi yaz.',
            minutes: 25,
            hint: 'Teknik olabilir, tasarım olabilir, kendi becerin olabilir.',
          },
          {
            id: 'rk-2',
            text: 'Her risk için "yanlışsa ne olur" cevabını yaz.',
            minutes: 20,
          },
          {
            id: 'rk-3',
            text: 'En riskli olanı işaretle. Prototipte önce onu test edeceksin.',
            minutes: 15,
          },
        ],
      },
    ],
    gate: {
      title: 'Tasarım kapısı',
      intro:
        'Bu, sistemin en önemli kapısı. Buradan geçmeden oynanış kodu yazmak, ' +
        'sonradan silinecek kod yazmaktır.',
      checks: [
        { id: 'o-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'o-auto-2', type: 'auto', verify: 'outListMin5' },
        { id: 'o-auto-3', type: 'auto', verify: 'risksMin3' },
        { id: 'o-auto-4', type: 'auto', verify: 'scopeFits' },
        {
          id: 'o-self-1',
          type: 'self',
          text: 'Tasarım dokümanın gerçekten tek sayfaya sığıyor.',
        },
        {
          id: 'o-self-2',
          type: 'self',
          text: 'Çekirdek döngüyü kağıda bakmadan tek cümlede söyleyebiliyorsun.',
        },
        {
          id: 'o-self-3',
          type: 'self',
          text: 'Oyunu bir kişiye 2 dakikada anlattın ve kişi ne yapacağını anladı.',
          hint: 'Anlatırken "şey, aslında" diye başlıyorsan tasarım net değil.',
        },
      ],
      failAdvice:
        'Kod yazmak için sabırsızlanıyorsan bu normal. Ama eksik tasarımla yazılan kod, ' +
        'tasarım netleştiğinde çöpe gider. Eksik teslimatı bitir, sonra kod fazı açılacak.',
    },
  },

  {
    id: 'prototip',
    no: 2,
    name: 'Prototip',
    subtitle: 'İlk oynanabilir',
    icon: 'box',
    sharePercent: 12,
    goal: 'Çekirdek döngünün gerçekten eğlenceli olup olmadığını öğren.',
    why:
      'Prototipin amacı güzel görünmek değil, bir soruyu cevaplamak: bu eğlenceli mi? ' +
      'Bu soruya dürüst cevap vermek, projenin geri kalanını kurtarır.',
    hardRules: [
      'Sadece gri kutu. Nihai sanat, müzik ve menü yok.',
      'Bu faz geçmeden hiçbir nihai sanat varlığı üretilmez.',
      'Kod kalitesi önemli değil. Bu kod muhtemelen atılacak.',
    ],
    deliverables: [
      {
        id: 'oynanabilir-dongu',
        name: 'Oynanabilir çekirdek döngü',
        why: 'Tasarım dokümanındaki döngü, elde tutulunca bambaşka hissettirebilir.',
        doneWhen: 'Çekirdek döngü baştan sona oynanabiliyor, gri kutularla.',
        minutes: 420,
        steps: [
          {
            id: 'od-1',
            text: 'Boş proje aç ve oyuncuyu hareket ettir.',
            minutes: 60,
          },
          {
            id: 'od-2',
            text: 'Ana fiili çalışır hale getir.',
            minutes: 120,
            hint: 'Görsel önemli değil. Kutu, daire, renk yeter.',
          },
          {
            id: 'od-3',
            text: 'Döngünün geri kalanını bağla: sonuç, geri bildirim, tekrar.',
            minutes: 150,
          },
          {
            id: 'od-4',
            text: 'Döngüyü kesintisiz tekrar edilebilir yap.',
            minutes: 90,
            hint: 'Ölüm veya bitiş sonrası yeniden başlayabilmeli.',
          },
        ],
      },
      {
        id: 'risk-testi',
        name: 'En riskli varsayımın testi',
        why:
          'Ön üretimde işaretlediğin en riskli varsayım burada test edilir. ' +
          'Yanlışsa şimdi öğrenmek, altı ay sonra öğrenmekten iyidir.',
        doneWhen: 'Risk test edilmiş ve sonucu karar günlüğüne yazılmış.',
        minutes: 180,
        steps: [
          {
            id: 'rt-1',
            text: 'Risk kaydındaki en riskli maddeyi aç ve tekrar oku.',
            minutes: 10,
          },
          {
            id: 'rt-2',
            text: 'O varsayımı test edecek en küçük denemeyi yap.',
            minutes: 140,
            hint: 'Tam çözüm değil, sadece "olur mu olmaz mı" sorusunun cevabı.',
          },
          {
            id: 'rt-3',
            text: 'Sonucu karar günlüğüne yaz.',
            minutes: 30,
            hint: 'Yanlış çıktıysa tasarımı değiştir. Bu bir başarısızlık değil, prototipin işi.',
          },
        ],
      },
      {
        id: 'on-dakika',
        name: 'On dakika testi',
        why:
          'Kendi oyununu 10 dakika oynayıp sıkılıyorsan, oyuncu 2 dakikada sıkılır.',
        doneWhen: 'Prototipi kesintisiz 10 dakika oynadın ve gözlemini yazdın.',
        minutes: 60,
        steps: [
          {
            id: 'on-1',
            text: 'Zamanlayıcı kur ve 10 dakika oyna. Kod düzeltme yok, sadece oyna.',
            minutes: 15,
          },
          {
            id: 'on-2',
            text: 'Kaçıncı dakikada sıkıldığını yaz.',
            minutes: 15,
            hint: 'Dürüst ol. Bu sayı, projenin en değerli verisi.',
          },
          {
            id: 'on-3',
            text: 'Sıkılma sebebini yaz: tekrar mı, kolaylık mı, geri bildirim eksikliği mi?',
            minutes: 30,
          },
        ],
      },
      {
        id: 'dis-test',
        name: 'Dışarıdan iki kişiye oynatma',
        why:
          'Sen oyunu bilerek oynuyorsun. Bilmeyen biri, senin göremediğin her şeyi gösterir.',
        doneWhen: 'En az 2 kişi oynadı ve gözlemler yazıldı.',
        minutes: 120,
        field: 'playtests',
        steps: [
          {
            id: 'dt-1',
            text: 'Bir kişiye oynat. Hiçbir şey açıklama, sadece izle.',
            minutes: 40,
            hint: 'Açıklamak zorunda kaldığın her an, oyunun anlatamadığı bir şeydir.',
          },
          {
            id: 'dt-2',
            text: 'İkinci kişiye oynat.',
            minutes: 40,
          },
          {
            id: 'dt-3',
            text: 'İki testten çıkan ortak sorunu yaz.',
            minutes: 40,
            hint: 'İki kişide de olan sorun, kesin sorundur.',
          },
        ],
      },
    ],
    gate: {
      title: 'Eğlence kapısı',
      intro:
        'Bu kapı, projenin devam edip etmeyeceğine karar verilen yerdir. ' +
        'Burada kendini kandırmak, aylarını harcamak demektir.',
      checks: [
        { id: 'pr-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'pr-auto-2', type: 'auto', verify: 'playtestMin2' },
        {
          id: 'pr-self-1',
          type: 'self',
          text: 'On dakika oynadın ve durmak istemedin.',
          hint: 'Durmak istediysen bu kutuyu işaretleme. Mekaniği değiştir veya projeyi durdur.',
        },
        {
          id: 'pr-self-2',
          type: 'self',
          text: 'Test eden kişilerden en az biri kendiliğinden tekrar oynamak istedi.',
        },
        {
          id: 'pr-self-3',
          type: 'self',
          text: 'Eğlence, mekaniğin kendisinden geliyor; yenilik hissinden değil.',
          hint: 'Yenilik hissi ikinci oynayışta biter, mekanik kalır.',
        },
      ],
      failAdvice:
        'Bu kapı açılmıyorsa iki seçeneğin var ve ikisi de meşru: ' +
        'çekirdek mekaniği değiştirip prototipi tekrarlamak, veya projeyi durdurup ' +
        'öğrendiklerinle yeni bir fikre geçmek. Stüdyolar projeleri tam bu noktada iptal eder. ' +
        'Eğlenceli olmayan bir çekirdeğin üstüne altı ay içerik üretmek, en pahalı hatadır.',
      allowsKill: true,
    },
  },

  {
    id: 'dikey-dilim',
    no: 3,
    name: 'Dikey Dilim',
    subtitle: 'Kalite çıtası',
    icon: 'layers',
    sharePercent: 15,
    goal: 'Oyunun küçük bir parçasını, nihai kalitede bitir.',
    why:
      'Dikey dilim, oyunun geri kalanının şablonudur. Burada bir bölümü ne kadar sürede ' +
      've ne kadar kalitede yapabildiğini ölçersin. Bu ölçüm, kalan sürenin gerçek tahminidir.',
    hardRules: [
      'Bu dilim nihai kalitede olmalı. "Sonra düzeltirim" burada geçersiz.',
      'Dilimde yapamadığın kaliteyi, oyunun geri kalanında da yapamazsın.',
    ],
    deliverables: [
      {
        id: 'sanat-yonu',
        name: 'Sanat yönü kararı',
        why:
          'Sanat yönü belirsizse her varlık farklı görünür ve oyun dağınık hisseder. ' +
          'Bu karar prototipten sonra, üretimden önce verilir.',
        doneWhen: 'Renk paleti, çizim veya modelleme yaklaşımı ve bir örnek varlık hazır.',
        minutes: 240,
        field: 'artDirection',
        steps: [
          {
            id: 'sy-1',
            text: 'Referans görsellerden bir pano oluştur.',
            minutes: 60,
            hint: 'Oyun ekran görüntüsü, fotoğraf, illüstrasyon. Ne olursa.',
          },
          {
            id: 'sy-2',
            text: 'Renk paletini belirle, en fazla 6 renk.',
            minutes: 45,
            hint: 'Az renk, tutarlılığı bedava getirir.',
          },
          {
            id: 'sy-3',
            text: 'Tek bir varlığı nihai kalitede üret.',
            minutes: 90,
            hint: 'Bu varlık, kalan her şeyin ölçüsü olacak.',
          },
          {
            id: 'sy-4',
            text: 'O varlığı üretmenin kaç dakika sürdüğünü kaydet.',
            minutes: 15,
            hint: 'Bu sayı, sanat bütçeni hesaplamanı sağlar.',
          },
          {
            id: 'sy-5',
            text: 'Bu kaliteyi tekrarlayabilecek misin, dürüstçe karar ver.',
            minutes: 30,
          },
        ],
      },
      {
        id: 'dilim-icerik',
        name: 'Nihai kalitede tek parça',
        why: 'Bu parça, oyunun tamamının nasıl görüneceğini ve hissettireceğini gösterir.',
        doneWhen:
          'Beş ile on dakikalık bir parça, sanatı ve sesiyle birlikte baştan sona oynanabiliyor.',
        minutes: 480,
        steps: [
          {
            id: 'di-1',
            text: 'Hangi parçanın dilim olacağına karar ver.',
            minutes: 30,
            hint: 'Oyunun en tipik parçası olsun, en kolay veya en gösterişli değil.',
          },
          {
            id: 'di-2',
            text: 'Parçayı gri kutuyla kur ve akışını oturt.',
            minutes: 120,
          },
          {
            id: 'di-3',
            text: 'Sanat varlıklarını yerleştir.',
            minutes: 180,
          },
          {
            id: 'di-4',
            text: 'Ses ve geri bildirimleri ekle.',
            minutes: 90,
          },
          {
            id: 'di-5',
            text: 'Baştan sona oyna ve pürüzleri gider.',
            minutes: 60,
          },
        ],
      },
      {
        id: 'ui-akisi',
        name: 'Temel arayüz akışı',
        why:
          'Menü, oyuncunun gördüğü ilk şeydir ve sona bırakılırsa hep eksik kalır.',
        doneWhen: 'Menü, oyun, bitiş ve menüye dönüş akışı çalışıyor.',
        minutes: 180,
        steps: [
          { id: 'ui-1', text: 'Basit bir başlangıç menüsü yap.', minutes: 60 },
          { id: 'ui-2', text: 'Oyundan bitiş ekranına geçişi bağla.', minutes: 60 },
          { id: 'ui-3', text: 'Bitişten menüye dönüşü bağla.', minutes: 30 },
          {
            id: 'ui-4',
            text: 'Döngüyü baştan sona üç kez test et.',
            minutes: 30,
            hint: 'Bu akış kırılırsa oyun oynanamaz hale gelir.',
          },
        ],
      },
      {
        id: 'birim-sure',
        name: 'Birim üretim süresi ölçümü',
        why:
          'Bu, projenin en değerli sayısıdır. Bir birim içeriği kaç saatte ürettiğini bilirsen, ' +
          'kalan içeriğin gerçek süresini hesaplayabilirsin.',
        doneWhen:
          'Bir birim içeriğin (bölüm, sahne, oda) kaç saat sürdüğü ölçülmüş ve yazılmış.',
        minutes: 45,
        field: 'unitHours',
        steps: [
          {
            id: 'bs-1',
            text: 'Dilimi üretirken geçen saatleri topla.',
            minutes: 20,
            hint: 'Günlük kayıtlarına bak. Tahmin etme, ölç.',
          },
          {
            id: 'bs-2',
            text: 'Bir birim içeriğin saatini yaz.',
            minutes: 10,
          },
          {
            id: 'bs-3',
            text: 'Bu sayıyı kalan birim sayısıyla çarp ve bütçenle karşılaştır.',
            minutes: 15,
            hint: 'Sığmıyorsa üretime başlamadan önce içerik sayısını azalt.',
          },
        ],
      },
    ],
    gate: {
      title: 'Kalite kapısı',
      intro:
        'Bu kapı, kalan üretimin gerçekçi olup olmadığını ölçer. ' +
        'Buradaki matematik, projenin bitip bitmeyeceğini söyler.',
      checks: [
        { id: 'dd-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'dd-auto-2', type: 'auto', verify: 'unitMathOk' },
        { id: 'dd-auto-3', type: 'auto', verify: 'disciplinesOwned' },
        {
          id: 'dd-self-1',
          type: 'self',
          text: 'Dilim baştan sona, çökmeden oynanıyor.',
        },
        {
          id: 'dd-self-2',
          type: 'self',
          text: 'Bu kaliteyi kalan tüm içerik için tekrarlayabileceğine inanıyorsun.',
          hint: 'İnanmıyorsan kaliteyi düşür veya içerik sayısını azalt. İkisinden biri şart.',
        },
        {
          id: 'dd-self-3',
          type: 'self',
          text: 'Dilimi gören biri "bunu oynamak isterim" dedi.',
        },
      ],
      failAdvice:
        'Birim süresi bütçene sığmıyorsa üretime başlama. İçerik sayısını azaltmak ' +
        'burada ucuzdur, üretimin ortasında pahalıdır. Aynı şey sahiplik için de ' +
        'geçerli: işin bir bölümünü kimin yapacağı belli değilse, o bölüm üretim ' +
        'boyunca beklemez, üretimi bekletir.',
    },
  },

  {
    id: 'uretim',
    no: 4,
    name: 'Üretim',
    subtitle: 'İçerik',
    icon: 'hammer',
    sharePercent: 35,
    goal: 'Kalan içeriği, dilimde belirlediğin kalitede üret.',
    why:
      'Üretim, projenin en uzun ve en tekdüze fazıdır. Burada işi bitiren şey ilham değil, ' +
      'düzendir. Kapsam kilitlidir: yeni fikir gelirse buzdolabına gider.',
    hardRules: [
      'Kapsam kilitli. Yeni özellik eklenmez.',
      'Yeni fikirler buzdolabına yazılır, kapsama girmez.',
      'Kalite çıtası dilimde belirlendi, düşürülmez.',
    ],
    deliverables: [
      {
        id: 'icerik-listesi',
        name: 'İçerik listesi',
        why: 'Ne kadar iş kaldığını görmeden ilerlemeni ölçemezsin.',
        doneWhen: 'Üretilecek tüm birimler tek tek listelenmiş ve panoya girilmiş.',
        minutes: 90,
        field: 'contentUnits',
        steps: [
          {
            id: 'il-1',
            text: 'Üretilecek tüm birimleri listele.',
            minutes: 45,
            hint: 'Bölüm, sahne, oda, düşman, bulmaca. Türüne göre değişir.',
          },
          {
            id: 'il-2',
            text: 'Her birimi üretim panosuna kart olarak ekle.',
            minutes: 30,
          },
          {
            id: 'il-3',
            text: 'Toplam birim sayısını birim süresiyle çarp ve takvimini kontrol et.',
            minutes: 15,
          },
        ],
      },
      {
        id: 'uretim-akisi',
        name: 'İçerik üretimi',
        why: 'Bu, fazın kendisi. Her gün bir parça, düzenli olarak.',
        doneWhen: 'İçerik listesindeki tüm birimler üretilmiş ve panoda tamamlandı sütununda.',
        minutes: 0,
        tracksBoard: true,
        steps: [
          {
            id: 'ua-1',
            text: 'Panodan bir birim seç ve devam ediyor sütununa taşı.',
            minutes: 5,
          },
          {
            id: 'ua-2',
            text: 'Birimi üret ve oyna.',
            minutes: 0,
            hint: 'Her birimi ürettikten sonra mutlaka oyna. Biriken hata pahalıdır.',
          },
          {
            id: 'ua-3',
            text: 'Tamamlandı sütununa taşı ve bir sonrakine geç.',
            minutes: 5,
          },
        ],
      },
      {
        id: 'alpha',
        name: 'Alpha: baştan sona oynanabilir',
        why:
          'Alpha, tüm özelliklerin var olduğu andır. İçerik eksik olabilir ama sistem tamdır.',
        doneWhen: 'Oyun baştan sona, tüm özellikleriyle oynanabiliyor.',
        minutes: 240,
        steps: [
          {
            id: 'al-1',
            text: 'Tüm özelliklerin listesini çıkar ve eksik olanları işaretle.',
            minutes: 45,
          },
          { id: 'al-2', text: 'Eksik özellikleri tamamla.', minutes: 150 },
          {
            id: 'al-3',
            text: 'Oyunu baştan sona bir oturuşta oyna.',
            minutes: 45,
            hint: 'Not al ama düzeltme, sadece oyna ve gör.',
          },
        ],
      },
    ],
    gate: {
      title: 'Alpha kapısı',
      intro: 'Tüm özellikler var mı ve oyun baştan sona oynanıyor mu?',
      checks: [
        { id: 'ur-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'ur-auto-2', type: 'auto', verify: 'boardComplete' },
        {
          id: 'ur-self-1',
          type: 'self',
          text: 'Oyun baştan sona, tüm özellikleriyle oynanıyor.',
        },
        {
          id: 'ur-self-2',
          type: 'self',
          text: 'Buzdolabındaki hiçbir fikir gizlice kapsama sızmadı.',
          hint: 'Sızdıysa dürüst ol ve süre tahminini güncelle.',
        },
      ],
      failAdvice:
        'Üretim uzun sürer ve bıkkınlık normaldir. Kapsamı büyütmek bu bıkkınlığın ' +
        'en sık görülen belirtisidir. Yeni fikir geldiyse buzdolabına yaz ve devam et.',
    },
  },

  {
    id: 'cila',
    no: 5,
    name: 'Cila ve Beta',
    subtitle: 'His ve kararlılık',
    icon: 'sparkle',
    sharePercent: 15,
    goal: 'Tüm içeriği yerine koy, hataları temizle ve oyunun hissini iyileştir.',
    why:
      'Cila, oyunu iyi bir oyundan keyifli bir oyuna çeviren farktır. ' +
      'Ama cila, eksik içeriğin üstünü örtmez: önce içerik tamamlanır, sonra cilalanır.',
    hardRules: [
      'Yeni özellik eklenmez, sadece var olan iyileştirilir.',
      'Çökme hatası kalmadan bu faz bitmez.',
    ],
    deliverables: [
      {
        id: 'icerik-tam',
        name: 'Beta: içerik tamamlandı',
        why: 'Beta, tüm içeriğin yerinde olduğu andır. Bundan sonrası sadece düzeltmedir.',
        doneWhen: 'Tüm içerik oyunda, hiçbir yer tutucu kalmadı.',
        minutes: 240,
        steps: [
          {
            id: 'ic-1',
            text: 'Oyunu baştan sona gez ve yer tutucu kalan her şeyi listele.',
            minutes: 60,
          },
          { id: 'ic-2', text: 'Yer tutucuları tek tek değiştir.', minutes: 150 },
          { id: 'ic-3', text: 'Tekrar baştan sona gez ve doğrula.', minutes: 30 },
        ],
      },
      {
        id: 'hata-listesi',
        name: 'Hata listesi ve önceliklendirme',
        why: 'Hataları önceliklendirmezsen küçük hatalarla uğraşırken çökmeler kalır.',
        doneWhen: 'Tüm bilinen hatalar listelenmiş ve çökme hataları en üstte.',
        minutes: 120,
        field: 'bugs',
        steps: [
          {
            id: 'hl-1',
            text: 'Bilinen tüm hataları listeye gir.',
            minutes: 45,
          },
          {
            id: 'hl-2',
            text: 'Her hataya önem derecesi ver: çökme, bozuk, rahatsız edici, kozmetik.',
            minutes: 30,
          },
          {
            id: 'hl-3',
            text: 'Çökme hatalarını sırayla düzelt.',
            minutes: 45,
            hint: 'Çökme hatası kalmadan yayına gidilmez.',
          },
        ],
      },
      {
        id: 'oyun-hissi',
        name: 'Oyun hissi cilası',
        why:
          'Aynı mekanik, geri bildirimle bambaşka hissettirir. Bu, en düşük maliyetli en yüksek etkili iştir.',
        doneWhen: 'Ana eylemlerin hepsinde görsel, işitsel ve dokunsal geri bildirim var.',
        minutes: 300,
        steps: [
          {
            id: 'oh-1',
            text: 'Ana fiile geri bildirim ekle: ses, parçacık, kısa duraklama.',
            minutes: 90,
          },
          {
            id: 'oh-2',
            text: 'Geçişleri yumuşat: ekran geçişleri, menü animasyonları.',
            minutes: 60,
          },
          {
            id: 'oh-3',
            text: 'Başarı ve başarısızlık anlarını vurgula.',
            minutes: 90,
          },
          {
            id: 'oh-4',
            text: 'Abartıyı geri al. Cila fazlaysa yorucu olur.',
            minutes: 60,
            hint: 'Ekran sarsıntısı en kolay abartılan şeydir.',
          },
        ],
      },
      {
        id: 'denge-test',
        name: 'Denge ve oynanabilirlik testi',
        why:
          'Sen oyunu yüzlerce kez oynadın, zorluk algın bozuldu. Dışarıdan göz şart.',
        doneWhen: 'En az 3 kişi baştan sona oynadı ve gözlemler kaydedildi.',
        minutes: 300,
        field: 'playtests',
        steps: [
          {
            id: 'dg-1',
            text: 'Üç kişiye ayrı ayrı oynat, izle ve müdahale etme.',
            minutes: 180,
            hint: 'En zor kısım susmaktır. Müdahale ettiğin her an bir tasarım hatasıdır.',
          },
          {
            id: 'dg-2',
            text: 'Herkesin takıldığı ortak noktaları listele.',
            minutes: 60,
          },
          {
            id: 'dg-3',
            text: 'Ortak sorunları düzelt.',
            minutes: 60,
            hint: 'Tek kişide olan sorun kişisel olabilir, üç kişide olan kesin sorundur.',
          },
        ],
      },
      {
        id: 'erisilebilirlik',
        name: 'Erişilebilirlik kontrolü',
        why:
          'Küçük eklemeler, oyununu oynayabilecek kişi sayısını ciddi biçimde artırır.',
        doneWhen: 'Tuş değiştirme, metin okunabilirliği ve renk kontrastı kontrol edilmiş.',
        minutes: 180,
        steps: [
          { id: 'er-1', text: 'Tuşların değiştirilebilir olmasını sağla.', minutes: 60 },
          {
            id: 'er-2',
            text: 'Metin boyutunu ve kontrastını kontrol et.',
            minutes: 45,
            hint: 'Küçük ekranda oku, okunmuyorsa büyüt.',
          },
          {
            id: 'er-3',
            text: 'Renk körlüğü kontrolü yap.',
            minutes: 45,
            hint: 'Bilgiyi sadece renkle veriyorsan şekil veya simge de ekle.',
          },
          {
            id: 'er-4',
            text: 'Ses seviyesi ayarlarını ekle.',
            minutes: 30,
          },
        ],
      },
      {
        id: 'performans',
        name: 'Performans ve farklı makine testi',
        why: 'Senin makinende çalışması, herkeste çalışacağı anlamına gelmez.',
        doneWhen: 'Oyun, senin makinen dışında en az bir makinede test edilmiş.',
        minutes: 120,
        steps: [
          { id: 'pf-1', text: 'Derleme al ve başka bir makinede çalıştır.', minutes: 60 },
          { id: 'pf-2', text: 'Kare hızını en yoğun sahnede ölç.', minutes: 30 },
          { id: 'pf-3', text: 'Açılış süresini ölç ve gerekiyorsa kısalt.', minutes: 30 },
        ],
      },
    ],
    gate: {
      title: 'Yayın hazırlığı kapısı',
      intro: 'Oyun yayınlanabilir durumda mı?',
      checks: [
        { id: 'ci-auto-1', type: 'auto', verify: 'deliverablesDone' },
        { id: 'ci-auto-2', type: 'auto', verify: 'noCrashBugs' },
        { id: 'ci-auto-3', type: 'auto', verify: 'playtestMin3' },
        {
          id: 'ci-self-1',
          type: 'self',
          text: 'Üç kişi oyunu baştan sona, senin yardımın olmadan bitirdi.',
        },
        {
          id: 'ci-self-2',
          type: 'self',
          text: 'Oyunu başka bir makinede çalıştırdın ve sorunsuz açıldı.',
        },
      ],
      failAdvice:
        'Çökme hatası varken yayınlamak, ilk yorumları kaybetmektir. Önce onları temizle.',
    },
  },

  {
    id: 'yayin',
    no: 6,
    name: 'Yayın',
    subtitle: 'Çıkış',
    icon: 'rocket',
    sharePercent: 5,
    goal: 'Oyunu insanların bulabileceği ve oynayabileceği bir yere koy.',
    why:
      'Yayınlanmamış oyun, bitmemiş oyundur. Bu faz genellikle küçümsenir ama ' +
      'mağaza sayfası, oyunun kendisi kadar oynanma sayısını belirler.',
    hardRules: ['Yeni özellik eklenmez.'],
    deliverables: [
      {
        id: 'magaza',
        name: 'Mağaza sayfası',
        why: 'İnsanlar önce sayfayı görür, oyunu sonra. Sayfa kötüyse oyun oynanmaz.',
        doneWhen: 'Başlık, kısa açıklama ve uzun açıklama yazılı.',
        minutes: 180,
        steps: [
          {
            id: 'mg-1',
            text: 'Oyun adını kesinleştir ve arama sonuçlarında benzersiz olduğunu kontrol et.',
            minutes: 30,
          },
          {
            id: 'mg-2',
            text: 'Tek cümlelik açıklamayı yaz.',
            minutes: 30,
            hint: 'Pitch cümlen buraya çok yakın olmalı.',
          },
          {
            id: 'mg-3',
            text: 'Uzun açıklamayı yaz: ne yapıyorsun, neden ilginç.',
            minutes: 60,
          },
          {
            id: 'mg-4',
            text: 'Etiketleri ve türü seç.',
            minutes: 30,
          },
          {
            id: 'mg-5',
            text: 'Fiyat veya ücretsiz kararını ver.',
            minutes: 30,
          },
        ],
      },
      {
        id: 'gorseller',
        name: 'Görseller ve fragman',
        why: 'Hareketli görüntü, açıklamadan çok daha ikna edicidir.',
        doneWhen: 'En az 5 ekran görüntüsü, 1 hareketli görüntü ve kapak görseli hazır.',
        minutes: 240,
        steps: [
          {
            id: 'gr-1',
            text: 'Oyunun en iyi göründüğü 5 anı yakala.',
            minutes: 60,
          },
          {
            id: 'gr-2',
            text: 'Çekirdek döngüyü gösteren kısa bir hareketli görüntü çıkar.',
            minutes: 90,
            hint: 'İlk 3 saniyede ne oynadığın anlaşılmalı.',
          },
          { id: 'gr-3', text: 'Kapak görselini hazırla.', minutes: 60 },
          {
            id: 'gr-4',
            text: 'Görselleri küçük boyutta kontrol et.',
            minutes: 30,
            hint: 'Mağazada küçük görünürler, o boyutta okunaklı olmalılar.',
          },
        ],
      },
      {
        id: 'paket',
        name: 'Derleme ve son kontrol',
        why: 'Yayın günü çıkan derleme hatası, en pahalı hatadır.',
        doneWhen: 'Derleme alındı, temiz bir makinede kuruldu ve baştan sona oynandı.',
        minutes: 180,
        steps: [
          { id: 'pk-1', text: 'Yayın derlemesini al.', minutes: 45 },
          {
            id: 'pk-2',
            text: 'Temiz bir makinede kur ve aç.',
            minutes: 45,
            hint: 'Geliştirme araçları kurulu olmayan bir makine bul.',
          },
          { id: 'pk-3', text: 'Baştan sona oyna.', minutes: 60 },
          { id: 'pk-4', text: 'Yedek al ve sürüm numarası ver.', minutes: 30 },
        ],
      },
      {
        id: 'duyuru',
        name: 'Duyuru planı',
        why: 'Kimsenin haberi olmayan yayın, yayın değildir.',
        doneWhen: 'Nerede, ne zaman ve ne yazacağın planlanmış.',
        minutes: 120,
        steps: [
          { id: 'du-1', text: 'Duyuru yapacağın yerleri listele.', minutes: 30 },
          { id: 'du-2', text: 'Duyuru metnini yaz.', minutes: 45 },
          {
            id: 'du-3',
            text: 'Hareketli görüntüyü duyuruya ekle.',
            minutes: 15,
            hint: 'Görüntüsüz duyuru neredeyse görünmez.',
          },
          { id: 'du-4', text: 'Yayın gününü ve saatini belirle.', minutes: 30 },
        ],
      },
      {
        id: 'yayinla',
        name: 'Yayınla',
        why: 'Bu düğmeye basmak, projenin bittiği andır.',
        doneWhen: 'Oyun yayında ve bağlantısı çalışıyor.',
        minutes: 60,
        steps: [
          { id: 'yy-1', text: 'Sayfayı son kez kontrol et.', minutes: 20 },
          { id: 'yy-2', text: 'Yayınla.', minutes: 10 },
          { id: 'yy-3', text: 'Bağlantıyı başka bir cihazdan aç ve doğrula.', minutes: 15 },
          { id: 'yy-4', text: 'Duyuruları yap.', minutes: 15 },
        ],
      },
    ],
    gate: {
      title: 'Yayın kapısı',
      intro: 'Oyun yayında mı?',
      checks: [
        { id: 'ya-auto-1', type: 'auto', verify: 'deliverablesDone' },
        {
          id: 'ya-self-1',
          type: 'self',
          text: 'Oyun yayında ve bağlantısını başka bir cihazdan açtın.',
        },
      ],
      failAdvice: 'Yayın kontrol listesindeki her madde bitmeden yayına gitme.',
    },
  },

  {
    id: 'postmortem',
    no: 7,
    name: 'Post-mortem',
    subtitle: 'Öğrenme',
    icon: 'book',
    sharePercent: 0,
    goal: 'Bu projeden öğrendiklerini yaz ki sonraki proje daha iyi olsun.',
    why:
      'Post-mortem, bir sonraki projenin en değerli girdisidir. ' +
      'Özellikle tahmin ettiğin ve gerçekleşen saatleri karşılaştırmak, ' +
      'gelecekteki tüm tahminlerini düzeltir.',
    hardRules: [],
    deliverables: [
      {
        id: 'postmortem-yazi',
        name: 'Post-mortem yazısı',
        why: 'Yazmadığın ders, öğrenilmiş sayılmaz.',
        doneWhen: 'Ne iyi gitti, ne kötü gitti ve ne değişecek yazılı.',
        minutes: 120,
        field: 'postmortem',
        steps: [
          { id: 'pm-1', text: 'İyi giden beş şeyi yaz.', minutes: 30 },
          { id: 'pm-2', text: 'Kötü giden beş şeyi yaz.', minutes: 30 },
          {
            id: 'pm-3',
            text: 'Sonraki projede değiştireceğin üç şeyi yaz.',
            minutes: 40,
            hint: 'Üçten fazla yazma, hiçbirini uygulayamazsın.',
          },
          { id: 'pm-4', text: 'Projeyi arşive al.', minutes: 20 },
        ],
      },
      {
        id: 'tahmin-gercek',
        name: 'Tahmin ve gerçek karşılaştırması',
        why:
          'Kaç saat tahmin ettiğini ve kaç saat sürdüğünü bilmek, sonraki projede ' +
          'çok daha isabetli tahmin yapmanı sağlar.',
        doneWhen: 'Tahmin edilen ve gerçekleşen saatler karşılaştırılmış, oran yazılmış.',
        minutes: 45,
        steps: [
          { id: 'tg-1', text: 'Toplam kayıtlı saatine bak.', minutes: 15 },
          { id: 'tg-2', text: 'İlk tahminle karşılaştır ve oranı hesapla.', minutes: 15 },
          {
            id: 'tg-3',
            text: 'Bu oranı sonraki proje için not et.',
            minutes: 15,
            hint: 'Çoğu kişi 1.5 ile 2.5 kat arasında sapar. Kendi katsayını öğren.',
          },
        ],
      },
    ],
    gate: null,
  },
]

export function findPhase(id) {
  return PHASES.find((phase) => phase.id === id) || PHASES[0]
}

export function phaseIndex(id) {
  const index = PHASES.findIndex((phase) => phase.id === id)
  return index === -1 ? 0 : index
}
