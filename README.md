# Oyun Üretim Panosu

> **English:** A phase-gate production planner for solo game developers, adapting
> the discipline large studios use. It enforces order (no gameplay code before the
> design deliverables are done), does the scope arithmetic honestly (it will tell
> you outright that a project will not finish in the time you have), adapts its
> guidance to your game's genre, and gives you exactly one task per day. It also
> models AI assistant costs and the post-launch break-even point.
>
> **The interface and all content are in Turkish.** The codebase is React + Vite
> with no UI framework; content lives in `src/data/` separately from the code.

Oyun yapmaya başlayan birinin, büyük stüdyoların üretim disiplinini tek başına
uygulayabilmesi için yapılmış bir planlama ve takip aracı.

Temel fikir şu: bir oyun projesinin bitip bitmemesi, çoğunlukla yetenekle değil
sırayla ve kapsamla ilgilidir. Bu araç sırayı zorlar (tasarım bitmeden koda
girilmez), kapsamı hesaplar (elindeki saat yetiyor mu) ve her gün sana tek bir
iş verir.

## Ne yapar

**Kurulum sihirbazı.** Yedi adımlık bir form: fikir, tür, ölçek, zaman, koşullar,
yapay zeka asistanları ve gerçeklik kontrolü. Sonunda projenin verilen sürede
bitip bitmeyeceğini aritmetikle söyler ve bitmiyorsa hesaplanmış seçenekler sunar.

**Yapay zeka asistanları ve bütçe.** Asistanlar sadece ilgili işkolunu
hızlandırır: kod asistanı kodu, görsel araç sanatı. Tasarım kararı,
oynanabilirlik testi, denge ve cila hiçbir araçtan etkilenmez ve projelerin
öldüğü yer orasıdır. Kod asistanının kazancı deneyime bağlıdır, çünkü
anlamadığın kodun hatasını ayıklamak kazandığın süreyi geri alır. Ayrıca sistem
para da sayar: aylık abonelikler süre boyunca devam ettiği için tarihi ertelemek
maliyeti artırır, kapsamı küçültmek hem süreyi hem parayı azaltır.

**Sekiz üretim fazı.** Konsept, Ön Üretim, Prototip, Dikey Dilim, Üretim, Cila
ve Beta, Yayın, Post-mortem. Her fazın somut teslimatları, teslimatların
adımları, adımların süre tahminleri ve "bitti sayılır" tanımları var.

**Kapılar.** Bir fazdan diğerine geçmek için kapıdan geçmek gerekir. Kapı iki
tür kontrol içerir: sistemin verilerine bakarak doğruladığı maddeler (kapsam
bütçeye sığıyor mu, en az 3 risk yazılmış mı, açık çökme hatası var mı) ve
kullanıcının dürüstçe cevapladığı maddeler. Otomatik kontroller geçmeden kapı
açılmaz.

**Türe göre yönlendirme.** Bulmaca, Platform, Anlatı, Aksiyon, Roguelike,
Simülasyon, RPG, Arcade ve Deneysel türlerinin her biri farklı teslimatlar,
farklı süre tahminleri, farklı içerik hacimleri ve türe özel tuzak uyarıları
getirir. Bir platform oyununda zıplama hissi prototipte oturur, bir anlatı
oyununda kelime sayısı ön üretimde hesaplanır.

**Günlük tek iş.** Bugün ekranı her zaman tek bir sonraki adımı gösterir:
ne yapacağını, neden yapacağını, ne kadar süreceğini ve bittiğini nasıl
anlayacağını. Yanında bir sayaç ve çalışma kaydı var.

**Bütçe ve geri dönüş.** Oyun parasını çıkarır mı sorusunu hesaplar. Bir
kopyanın satışından cebe girene kadar geçen zinciri adım adım gösterir (liste
fiyatı, bölgesel fiyatlandırma, lansman indirimi, iadeler, mağaza payı,
vergiler), başabaş noktasını ve saat başına getiriyi hesaplar. Steam Direct
ücreti ve iade eşiği gibi mağazanın ilan ettiği sayılar yerleşik; stopaj ve
gelir vergisi gibi kişiye özel oranlar kasıtlı olarak boş bırakılmış ve
kullanıcıdan doğrulaması isteniyor. Döviz kuru iki ücretsiz servisten alınır,
alınamazsa elle girilebilir ve uygulama kur olmadan da tam çalışır.

**Kapsam koruması.** İçeride ve dışarıda listeleri, buzdolabı (yeni fikirler
kapsama girmez, buraya yazılır) ve üretim fazında kapsam kilidi.

**Kayıtlar.** Risk kaydı, karar günlüğü, oynanabilirlik testleri, hata listesi,
üretim görev panosu ve çalışma günlüğü.

## Çalıştırma

```
npm install
npm run dev
```

Sonra tarayıcıda `http://localhost:5173/` adresine gidilir.

```
npm run build     # üretim derlemesi
npm run lint      # oxlint
```

## Veri

Veriler tarayıcının `localStorage`'ında saklanır (`oyunUretimPanosu` anahtarı),
sunucu yoktur. Ayarlar bölümünden JSON olarak dışa ve içe aktarılabilir.

## Dosya düzeni

```
src/
  data/
    options.js     ölçek, deneyim, motor, sanat, ekip, çok oyunculu, AI araçları
    genres.js      oyun türleri, saat tabanları, tuzaklar, türe özel teslimatlar
    phases.js      sekiz faz, teslimatlar, adımlar ve kapı kontrolleri
    publishing.js  mağaza ücretleri ve gelir varsayımları
  lib/
    estimate.js    kapsam, süre ve gider hesabı, kaldıraç önerileri
    money.js       başabaş noktası ve satış senaryoları
    rates.js       döviz kuru (isteğe bağlı, çevrimdışı çalışır)
    project.js     proje modeli, ilerleme, seri, bugünün işi
    gates.js       otomatik kapı doğrulayıcıları
    storage.js     localStorage ve dışa aktarma
  components/      arayüz bileşenleri
```

İçerik (fazlar, türler, teslimatlar) `data/` altında koddan ayrı durur. Yeni bir
tür eklemek `genres.js` içine bir nesne eklemekten ibarettir.

## Teknolojiler

React, Vite, saf CSS. Harici arayüz kütüphanesi yok. İkonlar Lucide çizim
stilinde gömülü SVG. Yazı tipleri Google Fonts üzerinden Space Grotesk ve
Work Sans.

## Diğer belgeler

- `NOTES.md`: geliştirme geçmişi, tasarım kararları ve bilinen sınırlamalar
- `KURALLAR.md`: proje yazım ve kod kuralları
