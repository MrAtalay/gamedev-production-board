# Proje Panosu: Durum Notu

## Ne yapıldı (v2.3: sihirbaz taslağı, gerçek bir veri kaybından sonra)

Kullanıcı sihirbazı doldurdu ama "Projeyi başlat" demeden önce girdiği her şey
kayboldu. Sebep: sihirbaz formu yalnızca React'in bellek içi durumunda
tutuluyordu ve localStorage'a ancak proje oluşturulduğunda yazılıyordu. Geliştirme
sırasında `Wizard.jsx` düzenlendikçe Vite'ın sıcak yeniden yüklemesi bileşen
durumunu sıfırladı ve girilen veri gitti.

Bu bir kullanım hatası değil, tasarım kusuruydu: yedi adımlık bir formda sayfayı
yenilemek her şeyi silmemeli.

- `storage.js` içine `loadDraft`, `saveDraft`, `clearDraft` eklendi
  (`oyunUretimPanosuTaslak` anahtarı).
- `Wizard.jsx` her değişiklikte formu ve bulunulan adımı taslak olarak yazıyor,
  açılışta varsa geri yüklüyor.
- Geri yükleme olduğunda üstte bir bildirim ve "Baştan başla" düğmesi çıkıyor,
  böylece eski bir taslakta sıkışıp kalmak mümkün değil.
- Proje oluşturulunca taslak siliniyor (`App.jsx` içindeki `startProject`).

Tarayıcıda doğrulandı: 4. adıma kadar veri girildi, sayfa yenilendi, form ve
adım numarası aynen geri geldi; proje başlatılınca taslak silindi.

Kaybolan veri için `KARARLAR.md` içine ayrı bir "Sisteme giriş föyü" bölümü
yazıldı, sihirbazın yedi adımı sırayla doldurulabilecek şekilde.

## Ne yapıldı (v2.2: bütçe ve geri dönüş ekseni)

Kullanıcının isteği: yayın sonrası gerçek gelirin giderleri amorte edip
etmeyeceği, Steam'in 100 dolarlık ücreti ve vergiler dahil teknik detaylar,
ve kur değişimleri için API bağlantısı.

### Yeni ekran: Bütçe ve Geri Dönüş

Sistemin üçüncü ekseni. Birincisi saat, ikincisi gider, bu da paranın geri
gelip gelmeyeceği.

**Gelir zinciri adım adım gösteriliyor.** Tek bir sonuç sayısı yerine kaybın
nerede olduğu görünür: liste fiyatı, bölgesel fiyatlandırma, lansman indirimi,
iadeler, mağaza payı, stopaj, gelir vergisi. 10 dolarlık bir oyunda varsayılan
ayarlarla cebe giren 4.02 dolar.

**Başabaş noktası** toplam maliyeti kopya başına net gelire bölerek hesaplanıyor.
Toplam maliyet, projenin gerçekten süreceği zamana göre alınıyor (hedef tarihe
göre değil), çünkü asıl ödenen budur.

**Saat başına getiri.** Çoğu bağımsız geliştiricinin bakmadığı sayı: beklenen
gelir bölü harcanan saat. Genellikle asgari ücretin altında çıkar. Sistem bunu
saklamıyor ama yapıcı çerçeveliyor: ilk oyunun yatırımı paraya değil, bitirmeyi
öğrenmeye yapılır.

### Bilgi türlerinin ayrımı (önemli tasarım kararı)

`src/data/publishing.js` içinde iki tür bilgi var ve ayrımları korunuyor:

1. **Mağazanın ilan ettiği sayılar**: Steam Direct ücreti 100 dolar (1000 dolar
   brüt gelirden sonra iade edilir), Valve payı yüzde 30. Bunlar yazılabilir.
2. **Kişiye ve ülkeye göre değişen sayılar**: stopaj, gelir vergisi. Bunlar
   YAZILMADI. Varsayılanları sıfır ve kullanıcıdan kendi durumunu girmesi
   isteniyor, arayüzde "doğrula" etiketiyle işaretli.

İkinci gruba uydurma bir oran yazmak bu aracın var oluş sebebine aykırı olurdu.
Yanlış bir sayı, hiç sayı olmamasından kötüdür. Ekranın sonunda "Bu hesabın
sınırları" başlığı altında bu açıkça yazılı.

### Kur API'si

`src/lib/rates.js`. İki ücretsiz kaynak deneniyor: önce frankfurter.app
(ECB verisi), olmazsa open.er-api.com. Anahtar gerekmiyor.

Tasarım kararı: **kur bilgisi uygulamanın çalışması için gerekli değil.**
İnternet yoksa, servis kapalıysa veya tarayıcı isteği engellerse uygulama aynen
çalışır, sadece dönüştürme yapmaz. Kullanıcı kuru elle de girebilir ve elle
girilen değer her zaman öncelikli. Alınan kur localStorage'a tarihiyle yazılıyor,
12 saatten eskiyse "bu kur eski" uyarısı çıkıyor.

Tarayıcı testinde frankfurter yanıt vermedi (muhtemelen CORS), yedek kaynak
çalıştı ve 1 USD = 48.15 TRY alındı. Yedekli kurgunun sebebi tam olarak buydu.

### Steam fiyat API'si neden yok

Steam'in bölgesel fiyat önerileri için genel bir API'si yok; Steamworks partner
API'si kimlik doğrulama istiyor. Bölgesel fiyatlar zaten geliştirici tarafından
bir kez ayarlanıp nadiren değiştiği için, bunu elle girmek daha sağlam. Kırılgan
bir bağımlılık eklemektense alan düzenlenebilir bırakıldı.


## Ne yapıldı (v2.1: kullanıcının ilk gerçek denemesinden çıkan düzeltmeler)

Kullanıcı sistemi kendi oyun fikriyle (Mytherra: Veil of The Ancient) denedi ve
üç gerçek kusur ortaya çıktı. Denemenin ayrıntılı kaydı yerel `KARARLAR.md`
dosyasında tutuluyor, kişisel içerik barındırdığı için repoya dahil değil.

### 1. Belirsiz etiket, yanlış anlaşılmaya yol açıyordu

Kullanıcının bildirdiği: "günlük dakikayı az yazınca iş için gereken saat
azalıyor, çok yazınca artıyor, tam çözemedim."

Matematikte hata yoktu. Sorun etiketteydi: sihirbazın dördüncü adımındaki
"gerçekçi toplam saat" kutusu, işin gerektirdiği saat sanılıyordu. Aslında
kullanıcının elindeki saatti ve tempoyla artması doğruydu.

Düzeltme: dördüncü adım iki başlığa ayrıldı. "Bu ayarlarla elinde olacak süre"
ve "Projenin ihtiyacı" artık yan yana duruyor, aralarındaki ilişki açıkça
yazıyor. Doğrulandı: günlük süre 60'tan 180'e çıkınca kullanıcının saati
105'ten 315'e çıkıyor, projenin ihtiyacı 3780'de sabit kalıyor.

Ders: "kafada soru işareti bırakmama" hedefi sadece içerikle değil,
etiketlerle de sağlanır. Bir sayının ne olduğu belirsizse, doğru olması yetmez.

### 2. Çok oyunculu hiç hesaba katılmıyordu

Kullanıcının oyununun en ayırt edici özelliği arkadaşlarla birlikte
oynanabilmesiydi, ama sistemde bunu soran hiçbir alan yoktu. Solo geliştiricide
en pahalı kalemlerden biri tamamen görünmezdi.

Eklendi: `MULTIPLAYER_MODES` (`options.js`), sihirbazda ve ayarlarda soru,
tahmin formülüne çarpan. Tek oyunculu 1.0, yerel 1.3, internet 2.2. Ayrıca
"çok oyunculuyu şimdilik bırak" kaldıracı eklendi ve genellikle en büyük tek
kazanç olduğu için listede öne alınıyor.

### 3. "Deneysel / Diğer" bir kaçış kapısı gibi duruyordu

Bu seçenek listedeki en düşük saat tabanına sahip (280). Kullanıcı, aslında bir
RPG olan oyunu için bu seçeneği seçti ve sistem 1361 saat dedi. Doğru tür
seçilseydi 4374 saat diyecekti, çok oyunculuyla birlikte 9623.

Yani sistem, kendi amacının tersini yapıp yanlış bir güven vermişti.

Düzeltme: türe `fallbackWarning` alanı eklendi. Bu seçenek seçilince sihirbazda
uyarı kutusu çıkıyor: karakter gelişimi, envanter, birden fazla bölge veya yan
görev varsa bu bir RPG'dir, melez oyunlarda en ağır tür seçilmelidir.

### 4. Yapay zeka asistanları ve para ekseni yoktu

Kullanıcının isteği: "işin içine AI asistanları katmak, ilgili kollar için ilgili
asistanlar ve bu asistanların süreç boyunca mal olacağı miktar."

İki ayrı eksik vardı. Birincisi asistanların sağladığı hızlanma, ikincisi ve daha
önemlisi sistemde **hiç para kavramı olmaması**. Bir planlama aracı sadece saat
sayıyorsa eksik sayar.

**İşkolu bazlı hızlanma.** Toplam iş beş işkoluna bölündü: kod, sanat, ses,
yazım ve karar. Her asistan sadece kendi işkolunu hızlandırır. "Karar" işkolu
(tasarım, oynanabilirlik testi, denge, cila, yayın) hiçbir araçtan etkilenmez ve
projelerin öldüğü yer tam olarak orasıdır. İşkolu dağılımı türe göre değişir:
bulmaca oyununda işin yarısı karar işiyken, simülasyonda kod ağırlıklıdır.

**Kod asistanının kazancı deneyime bağlı yapıldı** (deneyimli 0.65, birkaç oyun
0.75, ilk oyun 0.90). Sisteme yazılmış en önemli dürüstlük maddelerinden biri:
üretilen kodu değerlendiremiyorsan, anlamadığın kodun hatasını ayıklamak
kazandığın süreyi geri alır.

**Para ekseni eklendi.** Her aracın aylık maliyeti (düzenlenebilir), diğer aylık
giderler ve tek seferlik giderler. Toplam maliyet süreye bağlı olduğu için yeni
bir gerilim doğuyor ve sistem bunu gizlemiyor: tarihi ertelemek haftalık yükü
azaltır ama toplam parayı artırır; kapsamı küçültmek ikisini birden azaltır.

**Gerçek maliyet uyarısı.** Planlanan maliyet hedef tarihe göre hesaplanır, ama
proje o tarihte bitmeyecekse ödemeler devam eder. Sistem artık "bu kapsam bu
tempoyla gerçekten şu kadar sürer ve o zaman şu kadar tutar" diyor. Kullanıcının
projesinde bu fark 540 ile 27308 arasında.

### 5. Profil kararları değiştirilemiyordu

Kullanıcı sordu: ekip sayısını sonradan değiştirebilir miyim? Değiştiremiyordu.
Ayarlar ekranı sadece isim, tempo ve tarihi değiştirebiliyordu.

Düzeltme: tür, ölçek, deneyim, motor aşinalığı, sanat yaklaşımı, çok oyunculu
ve ekip artık Ayarlar ekranından değiştirilebiliyor. Değişiklik saat tahminini
ve dolayısıyla kapı kontrollerini anında etkiliyor.


## Ne yapıldı (v1: tamamlandı)

Vite + React iskeleti üstüne sürükle bırak destekli basit bir Kanban panosu.
Üç sütun (Yapılacak, Devam Ediyor, Tamamlandı), kart ekleme, silme ve sütunlar
arası taşıma. Veriler `localStorage`'da (`projePanosuVerisi`).

Bu sürüm silinmedi: v2'de üretim fazının içerik takibi olarak
`src/components/BoardView.jsx` içinde yaşamaya devam ediyor. Sürükle bırak
mantığı olduğu gibi korundu, sadece proje verisine bağlandı.

## Ne yapıldı (v2: tamamlandı, Oyun Üretim Panosu)

Kullanıcının isteği: oyun yapmaya başlayan birinin, büyük stüdyoların üretim
disiplinini (faz-kapı modeli) tek başına uygulayabileceği bir sistem. Bir form
ile kişinin ne yapmak istediğini anlayacak, türe göre yönlendirecek, günde bir
saatlik tempoya uyacak ve en önemlisi gerçeği söyleyecek: tasarım yoksa koda
girilmeyecek.

### Bilgi tabanı

- `src/data/options.js`: ölçek (mikro/küçük/orta/büyük), deneyim, motor
  aşinalığı, sanat yaklaşımı, ekip büyüklüğü ve bunların saat çarpanları.
  Ayrıca gerçeklik katsayısı (0.8): planlanan sürenin tamamı çalışmaya
  dönüşmez, bu pay baştan ayrılır ve kullanıcıya açıkça gösterilir.
- `src/data/genres.js`: dokuz oyun türü. Her tür için taban saat, çekirdek
  döngü örneği, sütun önerileri, en riskli şey, dikey dilim tanımı, ölçek
  başına içerik hacmi (örnek: "küçük ölçekli anlatı oyunu = 15.000-25.000
  kelime") ve türe özel tuzaklar. Ayrıca türe özel teslimatlar: bulmaca
  oyununda kural tablosu, platform oyununda zıplama hissi ayarı, anlatı
  oyununda kelime sayısı hesabı gibi.
- `src/data/phases.js`: sekiz faz, teslimatlar, adımlar ve kapı kontrolleri.
  Sistemin omurgası. Her adımın süre tahmini, çoğunun ipucu, her teslimatın
  "neden var" ve "bitti sayılır" tanımı var.

### Hesap motoru

`src/lib/estimate.js`. Gereken saat = tür tabanı x ölçek x deneyim x motor x
sanat x ekip. Elindeki saat = (günlük dakika / 60) x haftalık gün x kalan hafta
x 0.8. İkisini karşılaştırıp dört karardan birini verir: Rahat, Sınırda,
Riskli, Bu haliyle bitmez.

Sığmıyorsa hesaplanmış kaldıraçlar sunar: gerçekten sığan en büyük ölçek,
minimal sanat, ikisinin birleşimi, gereken günlük süre, gereken tarih. Her
kaldıraç kendi tonuyla gelir (uygulanabilir / zorlayıcı / gerçekçi değil).

İlk sürümde bir kusur vardı ve düzeltildi: kaldıraç "ölçeği bir kademe küçült"
diyordu, ama o kademe de sığmıyorsa öneri işe yaramıyordu. Artık gerçekten sığan
kademeyi arıyor, hiçbiri sığmıyorsa bunu açıkça söylüyor. Aynı şekilde "günde
720 dakika çalış" veya "tarihi 2032'ye ertele" gibi matematiksel olarak doğru
ama pratikte anlamsız öneriler artık gerçekçi seçeneklerle aynı görünmüyor,
ayrı işaretleniyor ve tıklanamıyor.

### Kapılar

`src/lib/gates.js`. İki tür kontrol:

- **Otomatik**: sistem veriye bakar, kullanıcı işaretleyemez. `deliverablesDone`,
  `scopeFits`, `outListMin5`, `risksMin3`, `playtestMin2`, `playtestMin3`,
  `noCrashBugs`, `unitMathOk`, `boardComplete`.
- **Kendi beyanı**: kullanıcı dürüstçe cevaplar ("10 dakika oynadın ve durmak
  istemedin").

Otomatik kontrollerin varlık sebebi: bir sistem her şeyi doğrulayamaz, ama
doğrulayabildiğini doğrulamalıdır. "Kapsam bütçeye sığıyor mu" sorusunu
kullanıcının iyimserliğine bırakmak sistemi işe yaramaz hale getirirdi.

En sert kural ön üretim kapısında: tasarım teslimatları bitmeden prototip fazı
açılmaz. Kullanıcının asıl istediği buydu.

### Öldürme kriteri

Prototip kapısı (`allowsKill: true`) devam etmeme seçeneği sunar. Stüdyolar
projeleri tam bu noktada iptal eder. Durdurmak için yazılı bir gerekçe istenir
ve proje arşive gider, silinmez. Gerekçe istenmesinin sebebi: sonraki projede
aynı hataya düşmemek.

### Kapsam koruması

İçeride/dışarıda listeleri, buzdolabı ve üretim fazında kapsam kilidi. Bugün
ekranında her zaman görünen bir "yeni fikir" kutusu var: fikir buzdolabına
gider, kapsama girmez. Kapsam şişmesi bağımsız oyunları öldüren bir numaralı
sebep olduğu için buna ayrı bir ekran ayrıldı.

### Bugün ekranı

Her zaman tek bir sonraki adım gösterilir. `3. Yaşam Organizatörü` projesindeki
"şu an" odak kartından öğrenilen bir kalıp: kalabalık liste yerine tek iş.
Yanında sayaç, çalışma notu, seri sayacı ve genel ilerleme var. Seri kırıldığında
sıfır yüze vurulmaz, üç günden uzun ara verilmişse yargılamayan bir dönüş mesajı
çıkar.

### Tasarım

Sıcak nötr zeminler (aynı aileden, `3. Yaşam Organizatörü` ile akraba) üstünde
çivit mavisi vurgu. Başlıklar Space Grotesk, gövde Work Sans. Aydınlık varsayılan,
karanlık tema anahtarlı.

## Test edilenler

Headless Chrome + DevTools Protocol ile gerçek tıklamalarla doğrulandı:

- Sihirbazın altı adımı, tür seçiminde tuzakların görünmesi, ölçek seçiminde
  içerik hacminin değişmesi
- Gerçeklik kontrolü: Platform + Orta ölçek + ilk oyun senaryosunda 1260 saat
  gerekiyor, 105 saat var, karar "Bu haliyle bitmez" ve kaldıraçlar doğru
- Proje kurulumu, Bugün ekranı, sayaç, adım tamamlama ve sonraki adıma geçiş
- Kapı engellemesi: kendi beyanları işaretsizken buton devre dışı, 1/3
  işaretliyken hâlâ devre dışı, 3/3 olunca açılıyor
- Ön üretim kapısının eksikleri isim isim sayması ("Şu an 0 risk var, en az 3
  gerekiyor")
- Kapsama 5 madde ve 3 risk eklendikten sonra otomatik kontrollerin 1'den 3'e
  çıkması (kapı canlı veriye tepki veriyor)
- Türe özel teslimatların doğru faza eklenmesi (Bulmaca için kural tablosu ve
  zorluk eğrisi)
- Kapsam, Riskler, Üretim Panosu, Günlük, Ayarlar, Yol Haritası ekranları
- Karanlık tema ve 390px genişlikte mobil yerleşim (yatay taşma yok)
- Sıfır JavaScript hatası, `npm run lint` ve `npm run build` temiz

## Düzeltilen hata

Karanlık temada kilitli faz isimleri okunmuyordu. Sebep: `.phase-row` bir
`<button>` ve `color` tanımlanmamıştı, bu yüzden tarayıcının varsayılan siyah
metin rengini alıyordu. Aydınlık temada fark edilmiyordu. Aynı hata `.lever`
bileşeninde de vardı. İkisine de `color: var(--text)` eklendi ve bu durum
`KURALLAR.md` dosyasına kural olarak yazıldı.

## Bilinen sınırlamalar

- Veriler tek tarayıcıda saklanıyor. Dışa aktarma var ama otomatik yedekleme yok.
- Aynı anda tek aktif proje destekleniyor. Bu bilinçli bir kısıt: günde bir
  saatlik tempoda iki projeyi birlikte yürütmek ikisini de bitirmemek demek.
  Arşiv istendiği kadar proje tutabilir.
- Saat tahminleri buyükluk mertebesi verir, kesin süre değil. Post-mortem
  fazındaki "tahmin ve gerçek karşılaştırması" teslimatı, kullanıcının kendi
  sapma katsayısını öğrenmesi için var.
- Arayüz testi yok. Doğrulama, tarayıcı üzerinden elle yapılan senaryolarla
  yapıldı.
- Türkçe metinler doğrudan `data/` dosyalarında duruyor, ayrı bir çeviri sözlüğü
  yok. İçerik hacmi (yüzlerce cümle domain bilgisi) böyle bir katmanı okunmaz
  hale getirirdi. Yine de içerik koddan ayrı olduğu için çeviri eklemek yapısal
  olarak mümkün.

## Sırada ne var (henüz konuşulmadı)

- Post-mortem fazında, kaydedilen gerçek saatlerin ilk tahminle otomatik
  karşılaştırılması (şu an kullanıcı elle yapıyor)
- Faz bazlı harcanan saatin ölçülüp tahminle karşılaştırılması
- Arşivdeki projelerin ayrıntılı görüntülenmesi (şu an sadece listeleniyor)
- Haftalık özet: bu hafta kaç saat, hedefin neresindesin

## Devam ederken hatırlanacaklar

- Proje kuralları için `KURALLAR.md` dosyasına bakılmalı.
- Bilgi tabanını genişletmek (yeni tür, yeni teslimat) `src/data/` altında
  yapılır, arayüze dokunmaya gerek yoktur.
- Node bu bilgisayarda kurulu (Vite + React için). 30 gün sonunda kaldırılacak
  araçlar listesine dahil.
- Kullanıcı stajyer, programlamaya yeni başlıyor. Kod basit ve okunabilir
  tutulmalı, aşırı soyutlamadan kaçınılmalı.
