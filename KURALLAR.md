# Proje Panosu: Proje Kuralları

Bu dosya, bu proje için geçerli yazım ve kod kurallarını içerir. Kapsam:
uygulama arayüzü, kod içi yorumlar, belgeler ve bu proje üzerinde konuşurken
yazılan sohbet metinleri. `3. Yaşam Organizatörü` projesindeki kurallarla aynı
çizgide, üstüne bu projeye özel maddeler eklenmiştir.

## Yazım kuralları

- **Emoji kullanılmaz.** Ne arayüzde, ne kodda, ne belgelerde, ne de sohbet
  metinlerinde. İkon gerekiyorsa Lucide çizim stilinde gömülü SVG kullanılır
  (`src/components/Icon.jsx`).
- **Em dash kullanılmaz.** Gerekirse virgül, iki nokta üst üste, parantez veya
  ayrı cümleler kullanılır.

## Arayüz kuralları

- **Arayüz dili Türkçe.**
- **Varsayılan tema aydınlık.** Karanlık mod bir anahtar ile seçilebilir, tercih
  `localStorage`'da saklanır. Renkler CSS değişkenleriyle tanımlanır (`:root` ve
  `:root[data-theme="dark"]`).
- **`alert()` ve `confirm()` kullanılmaz.** Bunun yerine toast bildirimleri ve
  bileşen içinde onay adımı kullanılır.
- **Buton olarak kullanılan her öğede `color` açıkça tanımlanır.** Tarayıcı,
  `<button>` için varsayılan bir metin rengi uygular ve bu renk karanlık temada
  okunmaz hale gelir. Bu hata bir kez yaşandı (`.phase-row` ve `.lever`).

## Ton kuralları

Bu proje bir planlama aracı değil, bir disiplin aracı. Metinler buna göre yazılır:

- **Sistem doğruyu söyler.** Kapsam sığmıyorsa "biraz zorlanabilirsin" denmez,
  "bu haliyle bitmez" denir ve sayı gösterilir.
- **Sığmayan seçenek, sığıyormuş gibi sunulmaz.** Bir öneri sorunu çözmüyorsa
  bunu açıkça yazar.
- **Gerçekçi olmayan öneri, gerçekçi öneriyle aynı görünmez.** Günde 12 saat
  çalışmak matematiksel bir çözümdür ama pratik bir seçenek değildir, o şekilde
  işaretlenir.
- **Kullanıcıya soru işareti bırakılmaz.** Her adımda ne yapılacağı, neden
  yapılacağı, ne kadar süreceği ve bittiğinin nasıl anlaşılacağı yazılıdır.
  Bu, gösterilen sayıların etiketleri için de geçerlidir: bir sayının ne
  olduğu belirsizse, doğru olması yetmez.
- **Sistem kendi kuralını kullanıcının girdisine de uygular.** Bir sayıyı
  kendi önerisi olarak reddedip, kullanıcı elle yazdığında kabul etmek
  tutarsızlıktır. Bu bir kez yaşandı: sistem 360 dakikalık günlük tempoyu
  kendi kaldıracı olarak "gerçekçi değil" diye işaretliyor, ama kullanıcı
  aynı sayıyı sihirbaza yazdığında "Rahat" diyordu.
- **Sınır, tahmin edilmez, sorulur.** Sürdürülebilir günlük süre kişinin
  günün geri kalanında ne yaptığına bağlıdır. Sabit bir üst sınır yazmak
  yerine kullanıcıya durumu sorulur ve sınır oradan türetilir.
- **Yazılı sayılar da eskir.** Bilinen bir sayıyı koda yazmak yetmez,
  ne zaman doğru olduğu da yazılır ve arayüz bunu söyler. Sessizce eski
  bir sayı göstermek, sayıyı hiç göstermemekten kötüdür.
- **Sistem sadece doğrulayabildiğini söyler.** Veriye bakarak
  hesaplanabilen şey söylenir ("iki bossun canı aynı"), oynanarak
  anlaşılan şey söylenmez ("bu boss eğlenceli değil"). Hesaplanan bulgu
  da emir kipinde değil, durum bildirir: "şu durum var, kasıtlı mı".
- **Bilinmeyen sayı uydurulmaz.** Vergi oranları, ülkeye özgü kesintiler ve
  kişisel duruma bağlı değerler koda yazılmaz. Varsayılanları sıfır bırakılır,
  kullanıcıdan kendi durumunu girmesi istenir ve alan "doğrula" olarak
  işaretlenir. Yanlış bir sayı, hiç sayı olmamasından kötüdür.
- **Dış servisler isteğe bağlıdır.** Kişisel bir planlama aracı bir API'ye
  bağımlı olamaz. Servis çalışmazsa uygulama tam işlevle çalışmaya devam
  etmeli, kullanıcı değeri elle girebilmelidir.
- **Cezalandırılmaz.** Ara verilmişse suçlanmaz, seri kırıldığında sıfır yüze
  vurulmaz, projeyi durdurmak bir başarısızlık olarak sunulmaz.

## Kod kuralları

- Kod stajyer seviyesine uygun, basit ve okunabilir tutulur. Gereksiz soyutlama,
  aşırı mühendislik yapılmaz. Durum yönetimi için ek kütüphane kullanılmaz,
  `useState` ve düz nesneler yeterlidir.
- Dosya ve değişken adları İngilizce, içerik ve arayüz metinleri Türkçedir.
  Sebep: React bileşen adlandırması İngilizce olduğunda öğrenilen kalıplarla
  uyumlu olur.
- İçerik (fazlar, türler, teslimatlar) `src/data/` altında koddan ayrı durur.
  Böylece bilgi tabanını genişletmek arayüze dokunmadan mümkündür.
- Yorumlar sadece kodun "neden" öyle yazıldığını açıklamak gerektiğinde eklenir,
  "ne yaptığını" tekrar etmek için değil.
- Tahmin çarpanları uydurulmaz. Bir sayı değişecekse gerekçesi yorum olarak
  yazılır.

## Proje/klasör kuralları

- Klasör adlandırma deseni: `N. Proje Adı` (Türkçe, numaralı).
- Bu bilgisayara kurulan geliştirme araçları 30 gün sonunda kaldırılacak. Hangi
  araçların kurulduğu ilgili projenin `NOTES.md` dosyasında belirtilir.
