# Proje Panosu: Durum Notu

## Ne yapıldı (v3.7: profil eskimesi)

7 Eylül 2026. Listedeki 6. madde kapatıldı. Kural zaten yazılıydı, sadece
profilin kendisine uygulanmamıştı: bir sayının ne zaman doğru olduğu da
yazılır ve arayüz bunu söyler. Mağaza ücretlerine uygulanmıştı (v2.6),
yedeklere uygulanmıştı (v3.4), profile uygulanmamıştı.

### Yedek göstergesinden farkı: takvim eşiği

v3.4'ün dersi şuydu: gün saymak yetmez, risk geçen zaman değil o zamanda
biriken iştir. Bu göstergede o ders yarısıyla geçerli.

Yedekte "hiç çalışılmadıysa risk yok" doğru bir varsayım, çünkü yedeklenecek
yeni veri yoktur. Burada aynı varsayım **yanlış** olurdu: panoya hiç oturum
girilmemiş olması işin durduğu anlamına gelmez, iş panonun göremediği yerde
sürüyor olabilir. Denetim tam olarak böyle bir durumdu; motorda aylarca
commit atılmıştı ve panonun bundan haberi yoktu.

Bu yüzden burada üç tetik var, üçü de tek başına yeterli:

| Tetik | Neye dayanıyor |
| --- | --- |
| Faz kapısı geçildi | Panonun kendi kaydı. Tahmin değil, olay. |
| Dört haftalık tempo kadar iş birikti | Kullanıcının kendi planı, sabit saat değil. |
| 90 gün geçti | İşin panonun dışında sürme ihtimali. |

Üçüncüsündeki 90 sayısı ölçülmüş değil, çizilmiş bir sınır ve bu `profile.js`
içinde yazılı. Gerekçe: ekip, sanat yaklaşımı ve ölçek panoya hiç dokunulmadan
da değişebilen alanlar; doksan gün, hiçbirinin değişmediğini varsaymanın makul
kaldığı en uzun süre olarak seçildi.

### Dürüst olmak gereken bir nokta

**Bu gösterge, kendisini doğuran olayı yakalayamazdı.** Denetimdeki profil
27 Ağustos'ta doldurulmuştu ve 4 Eylül'de yanlış olduğu görüldü: sekiz günlük
bir profildi, eski değildi. Yazıldığı gün yanlıştı.

Bu yüzden gösterge "profilin eski" demiyor, **"bunlar hâlâ doğru mu" diye
soruyor.** Aradaki fark önemli: birincisi bir iddia, ikincisi bir soru ve
sistem sadece doğrulayabildiğini söyler. Panonun bilebileceği tek şey en son
ne zaman bakıldığı ve o günden beri ne olduğudur.

### Nasıl çalışıyor

`project.profileCheck` damgası: ne zaman doğrulandığı, o andaki toplam çalışma
dakikası ve geçilmiş kapı sayısı. Sihirbazdan yeni çıkmış bir profil o an
doğrudur, sayaç orada başlıyor.

Profili elle değiştirmek de bir doğrulamadır ve damgayı yeniliyor: alanlar
gözden geçirilmeden değiştirilmiyor, ayrıca onay istemek gereksiz tekrar
olurdu. Hiçbir şey değiştirmeden onaylamak için Ayarlar'da "Hâlâ doğru"
düğmesi var.

Damgası olmayan kayıtlar (bu gösterge eklenmeden önce kurulanlar) tarih
uydurmuyor, "ne zaman doğrulandığı bilinmiyor" diyor.

Uyarı iki ekranda: Bugün ekranında yedek hatırlatmasının yanında, Ayarlar'da
profil alanlarının hemen üstünde. İkisi de aynı cümleyi kullanıyor, çünkü iki
ayrı yerde iki ayrı sayı görmek göstergeyi güvenilmez yapar.

Ton kuralı gereği suçlamıyor: ne yapılmadığı değil, o günden beri ne olduğu
yazılıyor ve karar kullanıcıda.

### Test

`scripts/profil-testi.mjs`, 22 kontrol. Üç tetik ayrı ayrı sınanıyor, çünkü
biri bozulduğunda kalan ikisi göstergeyi çalışıyor gibi gösterir. Eşiklerin
bir birim altında uyarmadığı da kontrol ediliyor.

Kusur iki kez enjekte edildi: kapı tetiği kapatıldı (2 kontrol kırıldı),
takvim tetiği kapatıldı (3 kontrol kırıldı), ikisi de geri alındı.

Bir kontrol de ton için: metinde suçlayan ifade bulunmadığı ve ne yapılacağının
yazılı olduğu. Ton kuralları genel olarak makineyle ölçülemez, ama bu göstergenin
tek cümlesi için kelime taraması yapılabiliyor.

---

## Ne yapıldı (v3.6: ekip kaç kişi)

7 Eylül 2026. Kullanıcı istedi: ekip üç kişiden fazla da olabilmeli, kişi
sayısını kullanıcı seçsin.

### Eski hâli neden yetmiyordu

Ekip üç kademeli bir listeydi: yalnızım (1,00), iki kişiyiz (0,65), üç veya
dört kişiyiz (0,45). Beş kişilik bir ekip hiç sorulamıyordu ve üç ile dört
kişi aynı kefeye giriyordu.

Bu, panonun kendi kuralına aykırıydı: sistem doğruyu söyler. Dört kişilik bir
ekibe üç kişinin sayısını göstermek, doğru olmayan bir sayıyı güvenle
göstermektir.

### Çarpan artık formülden geliyor

`multiplier = kisi ^ -0,62`

**Üs uydurulmadı, eski tablonun kesin iki noktasına oturtuldu:** bir kişi 1,00
ve iki kişi 0,65. İkisini birden veren üs 0,62. Yani eğri yeni bir varsayım
getirmiyor, zaten kabul edilmiş olanı sürdürüyor.

| Kişi | Çarpan | Kişi | Çarpan |
| --- | --- | --- | --- |
| 1 | 1,00 | 5 | 0,37 |
| 2 | 0,65 | 6 | 0,33 |
| 3 | 0,51 | 8 | 0,28 |
| 4 | 0,42 | 10 | 0,24 |

Eski tablonun "üç veya dört" kademesi 0,45'ti ve eğrinin üç (0,51) ile dört
(0,42) değerlerinin tam ortasına düşüyor. Kademe bir ortalamaymış, eğri onu
ikiye ayırıyor.

Eğri düz oransal değil, çünkü kişi eklemek işi düz bölmez. İki kişi işi
yarıya değil 0,65'e indiriyor; aradaki fark koordinasyon maliyeti.

### Sınırlar yazılı

`TEAM_SIZE_MAX` 20: bu araç solo ve küçük ekipler için yazıldı.

`TEAM_SIZE_TRUSTED` 6: tablo dört kişiye kadar gözlemden geliyor, ötesi aynı
eğrinin uzatılması. Uzatma bir ölçüm değildir ve arayüz bunu söylüyor:
altı kişiden sonra "bu sayı ölçümün dışında, hesap koordinasyonun bedava
olduğunu varsayar" uyarısı çıkıyor. Ton kuralı gereği gerçekçi olmayan sayı,
gerçekçi olanla aynı görünmüyor.

### Eski kayıtlar sessizce değişmiyor

`teamId` alanı silinmedi. Kişi sayısı olmayan bir kayıt okunduğunda kademe
kişi sayısına çevriliyor (tek 1, iki 2, üç veya dört 3) ve **Ayarlar ekranı bu
durumu yazıyor**: eski tabloda üç ve dört kişi ikisi de 0,45 alıyordu, artık
üç kişi 0,51.

Bu, üç kişilik bir kayıtta tahmini yüzde 13 artırır. Sayı kötüleşmedi, eski
kademe iyimser uçtaydı. Değişikliği gizlemek, panonun "sessizce eski bir sayı
göstermek, sayıyı hiç göstermemekten kötüdür" kuralına aykırı olurdu.

### Test

`scripts/ekip-testi.mjs`, 18 kontrol. En önemlisi ilk ikisi: eğrinin eski
tablonun kesin noktalarını yeniden ürettiği. O uyum bozulursa eğri artık eski
tablonun devamı değil, bağımsız bir varsayımdır ve bunu sessizce yapabilir.

Kusur kasten enjekte edildi: üs 0,62 yerine 0,50 yapıldı, test 4 kontrolde
kırıldı, geri alındı.

Yuvarlama notu: çarpan iki basamağa yuvarlanıyor, bu yüzden üst sınıra doğru
düzlükler çıkıyor (17 ve 18 kişi ikisi de 0,17). Test bunu kabul ediyor ama
1 ile 6 arasında her adımın gerçekten azalmasını ayrıca kontrol ediyor.

---

## Ne yapıldı (v3.5: sahipsiz işkolu)

7 Eylül 2026. Listedeki 7. madde kapatıldı. Bu madde diğerlerinden farklıydı:
ötekiler panoyu daha iyi yapıyor, bu madde panonun verdiği yanlış bir cevabı
düzeltiyor.

### Hata neydi

Ekip çarpanı tek bir sayıydı ve `requiredHours` içinde tahminin tamamına düz
uygulanıyordu. Üç kişi için 0,45, bütün işkollarına aynı şekilde. Ama bir
işkolunda kimse yoksa o iş ekip büyüdüğü için kısalmaz. Pano, Mytherra'da
işin yüzde 25'ini tutan sanat işini de üçe bölüp yüzde 55 ucuzlatıyordu ve o
işi yapacak sıfır kişi vardı.

Kural zaten kodda yazılıydı, sadece ekip çarpanına uygulanmamıştı:
`aiEffect` yorumunda "hızlanma sadece ilgili işkoluna uygulanır" diyor. Ekip
çarpanı da bir hızlanma ve aynı kurala tabi.

### Yeni hesap: `teamEffect`

`estimate.js` içine `aiEffect`'in yanına kondu, aynı biçimde çalışıyor:
sahipsiz işaretlenen payların çarpanı 1 kalır, kalan paylar ekip çarpanını
alır. Payların toplamı 1 olduğu için hiçbir işkolu sahipsiz değilken sonuç
eski davranışın birebir aynısı.

Denetim profiline yakın bir kurulumda (rol yapma, orta ölçek, ilk oyun, üç
kişi) ölçülen fark:

| | Çarpan | Gereken saat |
| --- | --- | --- |
| Sanat sahipli | 0,4500 | 1701 |
| Sanat sahipsiz | 0,5875 | 2221 |

520 saat, yani yüzde 31. Panonun bu proje için verdiği cevap bu kadar
iyimserdi.

**Düzeltme, 7 Eylül 2026.** Yukarıdaki iki saat, yazıldığında "elle çizilen
sanat" diye etiketlenmişti ve bu yanlıştı. Test profilinde `artId: 'elle'`
yazıyordu; panoda öyle bir seçenek yok (`minimal`, `hazir`, `kendi`) ve
`findOption` bilinmeyen kimliği sessizce listenin ilkine düşürüyor. Yani
hesap Minimal sanatla (0,70) yapılmış. Sayılar kendi içinde tutarlı, sadece
etiketi yanlıştı; etiket kaldırıldı ve test dosyaları `kendi` (1,35) ile
düzeltildi.

Gerçek sanat yaklaşımıyla (Kendi sanatımı üreteceğim) aynı karşılaştırma:
3718 saatten 4611 saate. Yüzde farkı da v3.6'dan sonra 31 değil 24, çünkü
üç kişinin çarpanı 0,45 iken 0,51 oldu.

**Bu, bugünün ikinci sessiz yanlış cevabı ve ilkiyle aynı aileden:**
`findOption` bilinmeyen bir kimlik için hata vermiyor, ilk seçeneği
döndürüyor. Kaydedilmiş bir profilde yazım hatası olsa, pano sessizce
"Minimal" varsayıp güvenle yanlış sayı gösterir. Karar verilmedi, aşağıdaki
listeye 8. madde olarak eklendi.

### Kapı: `disciplinesOwned`

Kalite kapısına (Dikey Dilim, üretime giriş) üçüncü otomatik kontrol olarak
eklendi. Sahipsiz pay `UNOWNED_WORK_LIMIT` değerini aşarsa kapı açılmaz.

Sınır yüzde 10 ve **bu sayı ölçülmüş değil, çizilmiş bir sınır.** Gerekçesi
`options.js` içinde yazılı: ses gibi yüzde 4'lük bir pay hazır paketle veya
tek seferlik bir anlaşmayla kapatılabilir, sanat gibi çeyreklik bir pay
kapatılamaz. Sınırın altındaki sahipsiz iş engellenmiyor ama gizlenmiyor da,
kapı gerekçesinde yazılı kalıyor.

Kontrol neden otomatik: pano bunu kendi verisinden hesaplayabiliyor.
`disciplineShares` her işkolunun payını zaten biliyordu, eksik olan tek şey
bir işkolunun sahipsiz olduğunu söyleyebilmekti. Denetimin en önemli
bulgusunu pano kendi kendine yakalayabilirdi, artık yakalıyor.

### Arayüz

`DisciplineOwnership` bileşeni hem sihirbazda (ekip adımı) hem ayarlarda
duruyor, ikisinin aynı sayıyı göstermesi gerektiği için tek bileşen. Beş
işkolu, her birinin yanında türe göre payı. İşaretlenince ne olduğunu
söylüyor: kapsam ekranında da gereken saatin bu düzeltmeyi içerdiği yazılı.

Tek kişilik ekipte çarpan zaten 1 olduğu için saat değişmiyor. Bu durum
gizlenmiyor, arayüz "yalnız çalıştığın için saat değişmiyor ama Kalite
kapısı bu işkolunu yine de soruyor" diyor.

### Test

`scripts/sahiplik-testi.mjs`, `npm test` zincirine eklendi. 14 kontrol:
sahipsizlik yokken sonucun değişmediği, sahipsiz payın çarpandan muaf
kaldığı, tahminin kısalmayıp uzadığı, tek kişilik ekipte sayının sabit
kaldığı, alanı olmayan eski kayıtların çökmediği ve kapının hem eşiğin
üstünde hem altında doğru davrandığı.

KURALLAR.md'deki kurala uyularak kusur kasten enjekte edildi: `teamEffect`
içindeki koşul kaldırılıp eski düz çarpan geri kondu, testin 3 kontrolde
kırıldığı ve çıkış kodunun 1 olduğu doğrulandı, sonra geri alındı.

### Sırada

Profil güncellenip pano gerçek Mytherra sayısıyla yeniden çalıştırılmadı.
Yukarıdaki 1701 ve 2221 sayıları test profiline aittir, Mytherra'nın kendi
sayısı değildir. Doğru yol hâlâ aynı: profili Ayarlar ekranından girmek.

---

## Mytherra denetimi: panonun profili gerçeği tutmuyor (4 Eylül 2026, karar verilmedi)

Kullanıcı ev bilgisayarındaki Mytherra deposunu ve Figma lore dosyasını
denetletti, sonucu buraya getirdi. Denetim oyunun kendi deposuna ait, ama
panoyu doğrudan ilgilendiren bir tarafı var: `KARARLAR.md` içindeki profil
gerçeği tutmuyor.

### Üç girdi eskimiş

`KARARLAR.md` 27 Ağustos 2026'da dolduruldu ve sıfırdan başlayan tek
kişilik bir proje tarif ediyor. Denetim ise Nisan 2026'da Godot'dan
Unity'ye geçmiş, Temmuz boyunca commit almış, üç kişilik bir proje
gösteriyor.

| Panodaki girdi | Denetimin gösterdiği | Doğru çarpan |
| --- | --- | --- |
| Ekip: Yalnızım (1,00) | 3 kişi ve 1 boş rol | 0,45 |
| Sanat: hazır varlık (0,85) | Hedef 32px elle çizilen pixel art, rol sahipsiz | 1,00 |
| Durum: "Projeyi başlat henüz denmedi" | 42 script, combat yüzde 70, aylardır çalışıyor | yok |

"İlk oyunum" girdisi yerinde kalmalı. Gerekçesi script sayısı değildi,
yayınlanmış oyun olmamasıydı ve o gerekçe duruyor.

### Elle hesap: iki değişiklik ters yönde çalışıyor

Sanat kaldıracını kaybetmek yükü artırıyor, ekip çarpanı yarıdan
fazlasını düşürüyor. Net sonuç lehte: tam kapsam 61,4 kattan 28 kat
bandına iniyor, mikro ilk sürüm ise 209 saatlik bütçenin içine giriyor ve
"Riskli" kararı değişebilir.

**Bu sayılar elle çarpımdır, panonun çıktısı değildir.** `aiEffect`
dağılımını birebir taklit etmiyorlar ve birkaç yüzde şaşıyorlar. Doğru
yol, profili Ayarlar ekranından girip panoyu yeniden çalıştırmak.

### Panoyu ilgilendiren asıl bulgu

Pano kendi profilinin eskidiğini fark edemiyor.

`KURALLAR.md` içinde zaten yazılı olan kural şu: "Yazılı sayılar da eskir.
Bilinen bir sayıyı koda yazmak yetmez, ne zaman doğru olduğu da yazılır ve
arayüz bunu söyler." Bu kural mağaza ücretlerine uygulandı (v2.6),
yedeklere uygulandı (v3.4), ama profilin kendisine uygulanmadı.

Profil bir kez doldurulup aylarca dokunulmadan durabiliyor ve sistem o
süre boyunca artık doğru olmayan bir tahmini güvenle gösteriyor. Yanlış
bir sayıyı güvenle göstermek, panonun kendi ton kuralına aykırı. Aşağıdaki
"Sırada ne var" listesine 6. madde olarak eklendi.

### Üreteç sorusu yeniden geldi, dosya zaten cevaplamıştı

Kullanıcı pixel art üreteci fikrini ayrıntılandırdı: elle çizilen beş
kılıcı ebeveyn alıp çocuk üreten, beğenilenleri havuza katan bir döngü,
üstüne tile ve dünya üretimi.

`src/data/content.js` bu soruyu zaten cevaplamıştı: "Bölge üreteci yazmak,
tek bölgelik bir ilk sürümde saf zarardır. Veri katmanını kurmak ise
neredeyse bedava ve üreteci sonradan yazmak isteyene işin yarısını hazır
verir." Yapılmayacaklar listesinde de aynı madde duruyor.

Cevap değişmedi ama gerekçesi güçlendi. Denetim, Mytherra'nın tasarımda 13
bölge, 24 krallık ve 8 boss içerdiğini gösteriyor, yani hacim sorusu
ileride farklı cevaplanabilir. Değişmeyen şey sıralama: önce sayım, sonra
ölçüm, sonra üreteç kararı. Hacim ölçülmeden yapılan bir üreteç, kârlı
olup olmadığı ölçülemeyen bir yatırımdır.

Teknik tarafta iki şey netleşti, ileride lazım olursa burada duruyor.
Üretecin genomu raster olamaz, parça tabanlı olmalı: kılıcı namlu,
siperlik, kabza ve topuz yuvalarına ayırmak beş kılıçtan 625 birleşim
veriyor ve her parça elle çizildiği için hiçbir çocuk el çizimi
kalitesinin altına düşmüyor. Tile tarafında ise Wave Function Collapse
hazır ve olgun bir cevap.

### Üç sayfa yayınlandı

- [Mytherra Karar Panosu](https://claude.ai/code/artifact/ee6fd8d9-40fd-44db-a8b1-32c0bf22a393):
  `KARARLAR.md` ve `NOTES.md` sayılarının grafik dökümü.
- [Mytherra Karar Föyü](https://claude.ai/code/artifact/b60f1ea8-a57d-4d23-9da7-1036fd3c8463):
  denetimin bulduğu sekiz çelişkinin karar verilebilir hali.
- [Mytherra Üretim Sırası](https://claude.ai/code/artifact/b4e80fbe-21d1-416d-a5ea-4f6f20637f64):
  çelişki temizliğinden Unity'de sistem kurmaya kadar yedi bloklu iş akışı.

### Karar durumu

- Profil güncellenmedi, pano yeniden çalıştırılmadı.
- Sekiz çelişkinin hiçbiri kapatılmadı, kararlar kullanıcıda.
- Sanat rolü boş. İş akışının D blokundan sonrası bu role bağlı ve bu bir
  iş kalemi değil, bir kişi kararı.

---

## Panonun kapsamı: derinleşme mi genişleme mi (4 Eylül 2026, karar verilmedi)

Kullanıcı panonun yetersiz işlev gördüğünü söyledi ve kapsamının oyunun
şekline göre büyümesi gerektiğini düşünüyor. His doğru, ve altında his
olmayan bir sebep var.

### Önce gösterilebilir hata

Pano ekip büyüklüğünü tek bir çarpanla modelliyor ve `requiredHours`
içinde tahminin tamamına düz uyguluyor. Üç kişi için çarpan 0,45 ve
bütün işkollarına aynı şekilde iniyor.

Ama RPG'de işin yüzde 25'i sanat ve denetime göre o işkolunda kimse yok.
Yani pano bugün, sanat işinin de üç kişiye bölündüğünü varsayıp yüzde 55
ucuzlatıyor. O işi yapacak sıfır kişi var.

Bu eksik özellik değil, **yanlış cevap**. Üstelik panonun bunu bilmesi
için gereken veri elinde: `disciplineShares` sanatın yüzde 25 olduğunu
zaten hesaplıyor. Eksik olan tek şey bir işkolunun sahipsiz olduğunu
söyleyebilmek. Denetimin en önemli bulgusunu pano kendi kendine
yakalayabilirdi.

### İki ayrı büyüme yönü var, ikisi aynı şey değil

**Derinleşme:** panonun kendi sorusunu daha iyi cevaplaması. Sığar mı,
nerede duruyoruz, ne sahipsiz. Yukarıdaki hata bu yöne ait ve bu yönde
büyümesi doğru.

**Genişleme:** panonun tasarımı barındırması, üretim takibi yapması,
görev panosu olması. Buna karşı bir gerekçe var: Mytherra deposunda
zaten `docs/`, `lore/`, git geçmişi ve bir yol haritası duruyor. Pano
onların kopyası olursa iki kanon kaynak olur. Bu konuşmanın tamamı,
Mytherra'daki sekiz çelişkinin iki kanon kaynaktan doğduğu üzerineydi.

Önerilen sınır tek cümle: **pano tasarımı saklamaz, tasarımın sığıp
sığmadığını söyler.** `content.js` bunu zaten söylüyor, kendisinin içerik
listesi olduğunu ve üreteç olmadığını yazıyor.

### Kalan boşluklar tahmin edilmedi, ölçülecek

Girilen ilk incelemede üç boşluk göze çarptı: krallık, görev ve
oynanabilir karakter için içerik türü yok. Mytherra'da 24 krallık ve 9
Stage'lik bir görev hattı var, yani içeriğin büyük kısmı sayılamıyor ve
bu doğrudan `content.js`'nin amacını baltalıyor.

**Ama bunlar buraya yapılacak iş olarak yazılmadı, bilerek.** İş
akışındaki B bloku bu listeyi kendisi yazacak: gerçek Mytherra içeriği
panoya girilmeye başlandığı anda neyin temsil edilemediği bir öğleden
sonrada ortaya çıkar. Üç tahmin etmek yerine gerçek listeyi beklemek,
panonun kendi kuralı: sistem sadece doğrulayabildiğini söyler.

Sahiplik maddesi bunun istisnası ve 7. madde olarak listeye eklendi,
çünkü o bir boşluk değil hata.

### Karar durumu

- Sınır cümlesi önerildi, kabul edilmedi.
- 7. madde listeye girdi, yapılmadı.
- İçerik türü boşlukları B blokundan sonra yazılacak.

---

## Piyasa vaka çalışması (31 Ağustos 2026, araştırma, karar verilmedi)

Kullanıcı son dönemde tutan oyunları örnek verdi ve araştırılmasını istedi.
Beş oyun incelendi. Amaç bir başarı formülü çıkarmak değil, **ölçek
kalibrasyonu**: bin yorum bandına ulaşan bir oyunun gerçekte ne kadar büyük
olduğunu görmek.

### İncelenen beş oyun

| Oyun | Ekip | Fiyat | Süre veya döngü | Yorum | Gizli kaldıraç |
|---|---|---|---|---|---|
| Meccha Chameleon | 2 kişi | 6 dolar | 2 ay geliştirme | 42.293, %90 | görünmüyor |
| Megabonk | 1 kişi | 8-10 dolar | belirsiz | 14.900, %94 | görünmüyor |
| How to Fish | 2 kişi | 5 dolar | belirsiz | ~13.000, %94 | **Landfall desteği** |
| Servant of the Lake | stüdyo | orta | 4-6 saat | 1.274, %98 | **var olan seri kitlesi** |
| Sort Them Ducks | küçük | düşük | 4-8 saat | 1.123, %91 | görünmüyor |

Rakamlar Ağustos 2026 sonu itibarıyla. Son üçü o ay çıktığı için yorum
sayıları hâlâ artıyor, bunlar son hali değil.

### İki ayrı band olduğu ortaya çıktı

İlk üçü (13 bin ile 42 bin yorum) ile son ikisi (1.100 ile 1.300 yorum)
aynı olay değil.

2025'te yayınlanan 20.282 oyunun 608'i bin yoruma ulaşabilmişti. Son iki
oyun o eşiği yeni geçmiş durumda, ilk üçü ise eşiğin 10 ila 40 katı
üstünde.

**İlk oyun için hedeflenmesi mantıklı olan band ikincisi.** Megabonk'u
hedef almak, bu dosyada zaten yazılı olan hayatta kalan yanılgısının
aynısı olur.

### Beş vakanın ikisinde gizli kaldıraç var

- How to Fish'in arkasında Evil Landfall desteği var. Landfall, Content
  Warning ve PEAK'in arkasındaki şirket, yani viral olmayı bilen bir yapı.
- Servant of the Lake, on yılı aşkın süredir devam eden Rusty Lake
  serisinin yeni oyunu. Yüzde 98 ve 1.274 yorum sıfırdan gelen görünürlük
  değil, var olan kitlenin gelmesi.

Bu oran tek başına, "başarı formülü" listelerine neden güvenilmemesi
gerektiğini gösteriyor: beş vakanın ikisinde asıl sebep listede yazmayan
şey.

**Sort Them Ducks en temiz vaka:** bilinmeyen geliştirici, tek oyun, seri
yok, yayıncı desteği görünmüyor.

### Kapsam açısından okunuşu

**Sort Them Ducks: içerik hacmi ucuz çoğaltılmış.** 4.000 ördek devasa
görünüyor ama 4.000 birimlik iş değil. Tek sıralama sistemi artı varyasyon.
Panonun `unitHours` ve `plannedUnits` mekanizmasının yakaladığı şey tam
olarak bu: birim süresi düşükse birim sayısı yüksek olabilir.

**Servant of the Lake: birim maliyeti yüksek, toplam süre kısa.** Elle
çizim, seslendirme, anlatı. O yüzden 4 ile 6 saat.

İkisi de aynı yere varmış, farklı yoldan: kısa oyun, bitirilebilir kapsam.

### Beklenmedik bulgu

Sort Them Ducks'ın bilinen teknik sorunları var (yoğun sahnede kare
düşmesi, kare hızına bağlı fare hassasiyeti, bazı oyuncularda mide
bulantısı) ve yine de yüzde 91 almış. Oyuncuların en çok istediği şey
daha fazla içerik, daha az hata değil.

Çıkarılacak sonuç "teknik kalite önemsiz" değil. Çıkarılacak sonuç:
çekirdek döngü tatmin ediciyse kenar sorunlar affediliyor. Panonun faz
sıralaması zaten bunu söylüyor, prototipte hissin oturmasını istiyor.
Bu vaka o sıralamayı destekliyor.

### Son dönem hitleri panonun tezini destekliyor

Bu dosyada kayıtlı "başarı formülü" listesi co-op, sandbox ve ömür boyu
destek diyordu, panonun çarpanlarıyla ilk oyunu bitirilemez hale
getiriyordu.

İncelenen beş oyun ise küçük, ucuz, kısa ve tek fikirli. Yani son dönemin
tutan oyunları, panonun zaten savunduğu şeyi savunuyor: kapsamı küçült.

---

## Tartışılan fikir: referans oyun kütüphanesi (karar verilmedi)

Kullanıcının önerisi: piyasa araştırması panoya girsin, kullanıcı ölçeğine
benzeyen bir oyunu referans alsın. "Sort Them Ducks ama yengeçlerle",
"Megabonk ama şöyle" gibi.

Ayrıca daha önce düşünülmüş bir fikir: piyasadan veri çeken, oyunları belli
standartlara göre yorumlayıp rapor üreten dahili bir araç.

### İki ayrı fikir olduğu ve birinin tehlikeli olduğu

**Tehlikeli olan: tasarım referansı.** "Şu oyun şöyle başarmış, sen de
benzerini yap" diyen bir kütüphane, bu dosyada zaten reddedilmiş olan
hayatta kalan yanılgısını araca kodlar. Üstelik "X ama Y ile" kalıbı
doğrudan türev oyun üretmeye teşvik eder.

**Değerli olan: ölçek kalibrasyonu.** Aynı veriden çıkan ama farklı soru
soran hali: "bin yorum bandına ulaşan bir oyun tek mekanik ve 4-8 saatti,
senin planın altı mekanik ve 20 saat, yani dört katı."

Fark şu: birincisi neyin başarı getireceğini iddia eder ve edemez.
İkincisi sadece iki kapsamı karşılaştırır, iddiası yoktur ve
yanlışlanabilir.

Ölçek kalibrasyonu için oyunun **tutmuş olması bile gerekmiyor.** Bilinen
büyüklükte oyun yeter. Bu, hayatta kalan yanılgısını neredeyse tamamen
ortadan kaldırır.

### Otomatik veri çekme neden çalışmaz

Bu dosyada Steam fiyat API'si için yazılmış olan şey satış ve gelir verisi
için de geçerli, hatta daha güçlü:

- Steam satış ve gelir rakamları için açık API yok.
- Yorum sayısı ve fiyat mağaza sayfasından okunabilir ama satış adedi
  okunamaz, tahmin edilir.
- Bu vaka çalışmasındaki rakamların kaynağı Video Game Insights ve ikincil
  haber kaynakları. VGI ticari bir ürün.

Yani "piyasadan veri çeken dahili araç" fikri, ücretli bir veri kaynağına
bağlanmadan dürüst çalışamaz. Bağlanırsa da aracın "dış servisler isteğe
bağlıdır" kuralına aykırı bir bağımlılık doğar.

### Eğer yapılacaksa önerilen şekli

Elle bakılan, tarihli, küçük bir kütüphane. Mağaza ücretlerindeki desenin
aynısı: sayı yazılır, ne zaman doğru olduğu yazılır, arayüz eskidiğini
söyler.

Kaydedilecek alanlar ölçek odaklı olmalı: mekanik sayısı, oynanış süresi
veya içerik birimi, ekip büyüklüğü, fiyat, geliştirme süresi, yorum sayısı,
ve **gizli kaldıraç alanı** (yayıncı desteği, var olan seri, mevcut kitle).

O son alan kritik. Onsuz kütüphane yalan söyler: How to Fish'i "iki kişi
yaptı ve patladı" diye kaydetmek, Landfall desteğini saklamak olur.

Karar verilmedi.

## Veri çekme: neyin mümkün olduğu (31 Ağustos 2026, araştırıldı)

Kullanıcı sordu: asistan oyunları nasıl araştırıyorsa, uygulama da Steam API
olmadan aynısını yapamaz mı.

### Asistan nasıl araştırıyor

API kullanmıyor. Arama motoruna soruyor, çıkan yazıları okuyor, kaynakları
tartıyor. Yani otomatik veri çekme değil, okuma ve yorumlama.

Bu ayrım önemli: bugünkü araştırmanın en değerli çıktısı bir sayı değildi,
How to Fish'in arkasında Landfall olduğunu ve Servant of the Lake'in on
yıllık bir serinin devamı olduğunu fark etmekti. Hiçbir kazıyıcı bunu
üretmez, o bilgi haber metninin içinde, tabloda değil.

### Steam tarafındaki teknik durum

Belgelenmemiş ama açık iki uç var, kimlik doğrulama istemiyorlar:

    store.steampowered.com/appreviews/<appid>?json=1
    store.steampowered.com/api/appdetails?appids=<appid>

Birincisi yorum sayısı ve olumluluk oranı, ikincisi ad, fiyat ve çıkış
tarihi döndürüyor.

**Asıl engel API'nin olmaması değil, CORS.** Panonun sunucusu yok. Tarayıcı,
izin vermeyen bir siteden gelen cevabı okumaya izin vermiyor. Kur servisleri
çalışıyor çünkü açıkça izin veriyorlar (`rates.js`). Steam'in izin verip
vermediği **doğrulanmadı**: asistanın çalıştığı ortam dış ağa çıkamadığı
için test edilemedi.

Kontrol etmenin yolu, uygulama açıkken tarayıcı konsoluna şunu yapıştırmak:

    fetch('https://store.steampowered.com/appreviews/1794680?json=1&num_per_page=0')
      .then(r => r.json()).then(d => console.log(d.query_summary))
      .catch(e => console.log('engellendi:', e.message))

### Asıl bulgu: otomatikleştirilebilenler eskiyenler

CORS açık çıksa bile çekilebilecek veriler, ölçek karşılaştırması için en az
işe yarayanlar.

| Veri | Çekilebilir mi | Eskir mi |
|---|---|---|
| Yorum sayısı, fiyat, çıkış tarihi | muhtemelen | hızla |
| Satış adedi ve gelir | hayır, sadece tahmin edilir | hızla |
| Ekip büyüklüğü | hayır | asla |
| Geliştirme süresi | hayır | asla |
| Mekanik sayısı, oynanış süresi | hayır | asla |
| Gizli kaldıraç | hayır | asla |

Simetri şu: otomatikleştirilebilenler eskiyenler, eskimeyenler ise
otomatikleştirilemeyenler.

Yani elle girilen kütüphane bir taviz değil, doğru çözüm. Ekip büyüklüğü ve
yayıncı desteği bir kez yazılır, hiç güncellenmez.

Öneri: yorum sayısı kütüphaneye hiç konmasın. Ölçek karşılaştırması için
gereken "kaç yorum aldı" değil, "ne kadar büyüktü".

---

## İlk oyun fikri: sorting oyunu (konuşuldu, karar kullanıcıda)

Kullanıcı sorting oyunu yapmayı düşünüyor, kapsam bakımından zorlanmayacağını
ve özgünlük artı içerikle ilk oyun için iyi aday olabileceğini söyledi.

### Neden sağlam bir aday

Yapısal sebepler, moda değil. Tek mekanik. Ağ kodu yok, yapay zeka yok,
prosedürel üretim yok, fizik ayarı yok; yani oyunları öldüren pahalı
sistemlerin hepsi kapsam dışı. Döngünün iyi hissettirip hissettirmediği
günler içinde öğrenilir. Panonun `unitHours` ve `plannedUnits` mekanizması
bu tür oyun için biçilmiş kaftan.

Sort Them Ducks'ın bilinmeyen bir geliştiriciden çıkıp bin yorum bandını
geçmesi, fikrin ulaşılabilir olduğunu gösteriyor.

### Üç risk

**1. İçerik hacmi ucuz hissediyor.** "4.000 ördek" kulağa bedava geliyor.
Varlık başına 2 dakika 133 saat eder, 10 dakika 667 saat. Bu türde birim
süresini ölçmek isteğe bağlı bir adım değil, projenin kendisi.

**2. Görsel bağımlılık.** Sort Them Ducks'ın çekiciliği büyük ölçüde ördek
tasarımlarında; teknik sorunlarına rağmen yüzde 91 almasının sebebi bu.
Ucuza sevimli varyasyon üretilemiyorsa değer önerisi çöker. Dikey dilimde
sınanmalı: yirmi tane yap, birine göster, sevimli buluyor mu.

**3. Kalabalık.** Sort Them Ducks'tan sonra tür hızla doldu. Bir trende on
iki ay geç kalmak gerçek bir görünürlük sorunu.

### Sıralamaya itiraz

Kullanıcının ifadesi "özgünlük eklendi ve içerik arttı mı iyi olur" idi.
Kapsam tam olarak buradan ölür.

Doğru sıra tersi: önce döngüyü en az içerikle kanıtla, sonra **ölçülmüş bir
tavana kadar** içerik ekle. Panonun dikey dilim fazı zaten bunun için var.

Özgünlük de sonradan eklenen bir katman değil, çekirdek döngünün içinde
olmalı. Meccha Chameleon'un özgünlüğü "prop hunt artı şu" değil, saklanmak
için kendini boyaman; mekaniğin kendisi.

### Sıradaki adım

Fikri tartışmak yerine panoya sormak. Sihirbaz sorting oyunu fikriyle
doldurulacak, tür Bulmaca veya Simülasyon seçilecek, gerçek süre girilecek.
Bu aynı zamanda aracın ilk gerçek sınavı olacak: v3.3'te eklenen ölçülen
tempo ve piyasa çıpası kendi projesinde işe yarıyor mu.

---

## Ne yapıldı (v3.4: yedek hatırlatması)

3 Eylül 2026. Geliştirme planındaki 3. madde. Bütün proje verisi tek
tarayıcının `localStorage`'ında duruyor, dışa aktarma var ama alınıp
alınmadığını söyleyen hiçbir şey yoktu. Bu bilgisayardaki geliştirme
araçları 30 gün sonunda kaldırılacak, o yüzden madde ertelenmedi.

Yapılan: hatırlatma. Otomatik indirme değil, çünkü tarayıcı izinsiz
dosya indiremez ve indirebilseydi bile kullanıcının bilmediği bir
dizine biriken dosyalar yedek sayılmaz.

### Gün saymak yetmiyor

İlk akla gelen "son yedek N gün önce alındı" göstergesi. Tek başına
yanlış: iki hafta çalışılmadıysa iki haftalık bir yedek eksiksizdir ve
uyarmak yalan olur. Panonun kendi kuralı burada da geçerli, sistem
sadece doğrulayabildiğini söyler.

Bu yüzden dışa aktarma anında `storeSummary` çıktısı da damgayla
birlikte saklanıyor. Risk, geçen zaman değil o zamanda **biriken iş**:
kaç oturum, kaç dakika, kaç adım, kaç içerik bileşeni. Gösterge de
bunu yazıyor, yani kullanıcı ne kaybedeceğini görüyor.

### Damga neden store'un dışında

`oyunUretimPanosuYedek` ayrı bir localStorage anahtarı. Store'un içinde
olsaydı dışa aktarılan dosyaya da girerdi ve o dosyayı başka bir
bilgisayarda içe aktarmak, orada hiç alınmamış bir yedeği alınmış gibi
gösterirdi. Yedek verinin değil, o tarayıcının özelliği.

### İki eşik, ikisi de türetilmiş

Uyarı iki koşuldan biri sağlanınca çıkıyor:

1. **Yedekten beri bir hafta geçmiş ve iş birikmiş.** Elle alınan bir
   yedeğin tutturulabilir en sık ritmi haftalık. Pano zaten haftalık
   özet çıkarıyor (`tempo.js`). Daha sık hatırlatmak gürültü olur.
2. **Kullanıcının kendi bir haftalık tempo karşılığı kadar iş
   birikmiş.** `dailyMinutes * daysPerWeek`. Aynı işi üç günde yapan
   biri için risk aynı; takvimin dolmasını beklemek riski olduğundan
   küçük gösterir.

İkisi de kullanıcının kendi girdisinden veya panonun var olan
ritminden çıkıyor, uydurulmuş sabit yok.

### Proje değişince çıkarma yapılmıyor

Yeni proje başlatıldıysa veya arşivden dönüldüyse sayıları çıkarmak
anlamsız. Çıkarma yapılsaydı fark negatif çıkar, sıfıra kırpılır ve
sistem "değişiklik yok" derdi. Oysa elindeki dosya o projeyi hiç
içermiyor. `farkliProje` bayrağı bunu ayırıyor ve metin bunu söylüyor.

### Nerede görünüyor

- **Ayarlar, Veri kartı**: her zaman. Uyarı yokken de durum yazıyor,
  çünkü durumu ancak uyarı çıkınca görebilmek arada ne olduğunu
  bilinmez yapar.
- **Bugün ekranı**: sadece eşik aşılınca, sessiz bir kart olarak.
  Uyarı rengi kullanılmadı: her gün görünen veya bağıran bir uyarı
  okunmaz hale gelir ve gerçekten gerektiğinde de okunmaz. Kartın
  içinde "Yedek al" düğmesi var, aynı `exportData` eylemini çağırıyor.

Ton kuralı gereği yedek almamış olmak suçlanmıyor. Sayı söyleniyor,
dışa aktarmanın veriye dokunmadığı yazılıyor, gerisi kullanıcının.

### Doğrulama

`scripts/yedek-testi.mjs`, 22 kontrol, `npm test` içinde. `backupStatus`
saf yazıldı (damgayı kendisi okumuyor, dışarıdan alıyor), o yüzden
localStorage olmadan sınanabiliyor.

Kusur kasten enjekte edilip testin kırıldığı doğrulandı: haftalık eşik
70 güne çıkarıldığında 1 kontrol, `farkliProje` bayrağı kaldırıldığında
4 kontrol kaldı. Ayrıca `npm run lint` ve `npm run build` temiz.

Arayüz tarafı elle görülmedi, bu projede arayüz testi zaten yok.

---

## Ne yapıldı (v3.3: zaman gerçekliği ve piyasa çıpası)

31 Ağustos 2026. "Sırada ne var" listesindeki dört madde de kapatıldı, üstüne
bütçe ekranına bir gerçeklik çıpası eklendi.

### Yeni hesap katmanı: `src/lib/tempo.js`

Dört maddenin hepsi aynı soruya bakıyordu: zaman nereye gitti. Hesapları tek
dosyada topladım, görünümler oradan besleniyor.

Önemli olan şu: **veri modeli değişmedi.** Çalışma oturumu zaten `stepId`
tutuyordu, adım da teslimata, teslimat da faza bağlı. Yani faz bilgisi
türetilebiliyordu, kaydedilmesine gerek yoktu. Türe özel teslimatların
adımları da eşlemeye dahil.

94 adımın kimliğinin fazlar arasında benzersiz olduğu kontrol edildi, eşleme
bu yüzden güvenli.

### 1. Haftalık özet

Günlük ekranının başına eklendi. Bu haftanın toplamı, haftalık plan
(günlük dakika kere haftalık gün), günlere dağılım ve son dört haftanın
karşılaştırması.

Gerçeklik katsayısı burada uygulanmıyor. Katsayı kapasite planlaması içindir;
"bu hafta ne kadar çalıştım" sorusunun cevabı ham sayıdır. İkisini karıştırmak
kullanıcıya yanlış sayı göstermek olurdu.

Ton kuralı gereği eksik hafta suçlanmıyor: sayı gösteriliyor ve kalan farkın
ne kadar olduğu yazılıyor.

### 2. Faz bazlı tahmin ve gerçek

Aynı ekranda, haftalık özetin altında.

En önemli karar: **sapma yalnızca kapısı geçilmiş fazda gösteriliyor.** Devam
eden bir fazda tahminin altında kalmak iyi haber değildir, sadece işin
bitmemiş olmasıdır. Bunu "iyi gidiyorsun" diye göstermek sistemin kendi
kuralını çiğnemesi olurdu.

Adıma bağlanmamış kayıtlar gizlenmiyor, ayrı kalem olarak yazılıyor. Nereye
gittiği bilinmeyen süreyi dağıtıma karıştırmak sayıyı yanlış yapardı.

Sapma katsayısı için **en az iki bitmiş faz** şartı var. Tek fazdan çıkarılan
katsayı, olmayan bir katsayıdan daha yanıltıcıdır.

### 3. Post-mortem otomatik karşılaştırması

Post-mortem fazına girildiğinde, teslimatların üstünde hesaplanmış
karşılaştırma görünüyor. Aritmetiği sistem yapıyor, yorumu kullanıcı:
"bir sonraki projede ne değişecek" sorusu teslimatın asıl işi ve orada
kalıyor.

**Yol boyunca çıkan sorun:** teslimat "ilk tahminle karşılaştır" diyor ama
ilk tahmin hiçbir yerde saklanmıyordu. Profil sonradan değişiyor (kaldıraç
kapsamı küçültür, tarih ertelenir), yani `computeEstimate` şu anki tahmini
verir, ilk tahmini değil.

İki parçalı çözüldü:
- Yeni projelerde `project.baseline` alanına ilk tahmin ve tarihi yazılıyor.
- Eski projelerde bu alan yok ve arayüz bunu gizlemiyor: "bu proje ilk tahmin
  kaydedilmeden önce açılmış, aşağıdaki şu anki tahmindir" diyor.

`createProject` içindeki profil nesnesi `buildProfile` fonksiyonuna çıkarıldı,
çünkü ilk tahmini hesaplamak için profile projeden önce ihtiyaç var.

### 4. Arşiv ayrıntısı

Arşivdeki her proje artık açılabiliyor: kayıtlı saat, çalışılan gün, geçilen
kapı, sapma katsayısı, profil özeti, oyun tanımı, faz karşılaştırması, kayıt
sayıları, post-mortem metni ve ilk sekiz karar.

Aynı anda tek proje açık kalıyor, liste uzayınca hepsi birden açık olması
okunmaz hale getiriyordu.

### Üstüne: piyasa çıpası (bütçe ekranı)

Beklenen satış adedi kullanıcının kendi tahmini ve sistem bu sayıya bugüne
kadar hiç itiraz etmiyordu. 50.000 satış yazılsa sessizce hesaplıyordu.

Bu, aracın kendi kuralına aykırıydı: kapsam sığmadığında söylüyorsak, satış
beklentisi piyasanın çok üstünde olduğunda da söylenmeli.

`publishing.js` içine `MARKET_REALITY` eklendi: 2025 Steam yılında yayınlanan
oyunların ortanca brüt geliri 249 dolar, o yıl 20.282 oyun yayınlandı ve
bunların 608 tanesi bin yoruma ulaştı. Kaynak Video Game Insights.

Ücretlerdeki desen aynen izlendi: sayının bilindiği tarih yazılı ve arayüz
doğrulanmasını istiyor. Bunun bir hedef değil bir dağılımın ortancası olduğu
açıkça yazıyor, çünkü ortalamanın üstünde olmak imkansız değil, varsayılan
değil.

### Ölçülen tempo, kapsam ekranına da taşındı

Kapsam ekranındaki "gereken saat, elindeki saat" karşılaştırması tahmine
dayanıyor. Yeterli veri varsa (en az iki bitmiş faz) hemen altına ölçülen
gerçeğe dayanan ikinci bir karşılaştırma geliyor: kendi sapma katsayınla
düzeltilmiş kalan süre.

Bu, aracın `unitMath` yorumundaki ilkeyle aynı: ölçülen gerçek, tahminden
daha güvenilirdir.

### Test

`scripts/tempo-testi.mjs` ve `npm test`. Arayüz testi hala yok ama hesap
katmanının 18 kontrolü var: hafta başının pazartesi olması, faz dağılımı,
adıma bağlanmamış sürenin ayrı tutulması, faz bitmeden sapma verilmemesi,
tek fazda katsayı verilmemesi.

Test yazarken bir şey yakalandı ve bu not edilmeye değer: ilk çalıştırmada
dört kontrol kaldı, sebebi kütüphane değil testin kendisiydi. Test
`toISOString` kullanıyordu, o da UTC'ye çeviriyor ve UTC+3'te yerel gece
yarısı bir önceki güne düşüyordu. Kütüphane baştan yerel tarih kullanıyordu.
Tarih karşılaştıran her yerde bu tuzak var.

### Düzeltilen kural ihlali

`src/lib/rapor.js` içinde rapor çıktısı üretilirken em dash kullanılıyordu.
Kurallar em dash yasaklıyor ve bu metin dışa aktarılan rapora gidiyor.
Alanlar zaten iki nokta kullandığı için parantez tercih edildi.

---

## Büyük konu: görünürlük ekseni (konuşuldu, karar verilmedi)

28 Ağustos 2026'da konuşulmaya başlandı. **Hızlı geçilmeyecek konu**,
kullanıcının açık isteği bu. İçinde karara bağlanacak çok parametre var
ve yarım yapılırsa aracın kendi ilkesine aykırı bir şey üretir.

### Konu neden açıldı

Kullanıcı şunu sordu: tutan projeler mi yapıyoruz, tutmayan mı, bunu
bilmemiz lazım. Somut bir örnek de var: tanıdığı bir geliştirici bir
oyun yayınladı, çok az inceleme aldı ve tutmadı. Kullanıcı aynı sona
varmak istemiyor ve sistematik, ders çıkaran bir yol istiyor.

(Örnek olayın ayrıntıları `KARARLAR.md` tarafında. Bu repo public,
başka birinin oyununun adı ve ticari sonucu buraya yazılmıyor.)

### Ölçülen boşluk

Panonun bu konuda şu an yaptığı: **hiçbir şey.**

- "İstek listesi" ifadesi tüm bilgi tabanında SIFIR kez geçiyor.
- "Mağaza sayfası" ve "Duyuru planı" var, ama sadece Yayın fazının
  içinde. Yayın fazı toplam işin %5'i ve en sonda.

Yani pano, pazarlamayı bir son adım olarak kodluyor. Oysa istek listesi
biriktirmek birinci günün işi. Bu, korkulan başarısızlık biçiminin
araca kodlanmış hali.

### Tartışmanın çıktısı

Kullanıcı yaygın bir "başarı formülü" listesi getirdi (erişilebilirlik,
bağımlılık yapan döngü, co-op, yayıncı odaklı tasarım, erken pazarlama,
ömür boyu destek, zamanlama, sandbox). Liste üstünde iki itiraz kaydedildi:

**1. Hayatta kalan yanılgısı.** Liste, çok satan birkaç oyundan geriye
doğru çıkarılmış. Binlerce oyun bu maddelerin hepsini yaptı ve satmadı.
Liste "başarılı oyunlar neye sahipti" sorusunu cevaplıyor, "ne başarı
getirir" sorusunu değil. Bundan kontrol listesi yapmak, batacak bir
projeye "her şeyi doğru yapıyorsun" diyen bir pano üretirdi. Aracın var
oluş sebebinin tersi.

**2. Liste olduğu gibi uygulanırsa ilk oyun bitmez.** Panonun kendi
çarpanlarıyla: co-op 2.2x, sandbox kapsam patlaması, ömür boyu destek
çıkıştan sonra yıllarca iş. Bunlar oyunların başardıktan sonra, ekiple
veya parayla yaptığı şeyler.

**Listede bir madde diğerlerinden farklı: istek listesi.** Tek
ölçülebilir ve önceden davranılabilir olan o. Diğerleri ancak iş
bittikten sonra değerlendirilebilir.

### Önerilen yapı (karar verilmedi)

Faz değil, fazlara PARALEL bir eksen. Panonun kapsam ve tempo için
yaptığı şeyin aynısı, üçüncü bir eksene uygulanmış hali:

1. Bütçe ekranındaki "beklenen satış" sayısından geriye çalış: bu satış
   için çıkışta kaç istek listesi gerekiyor?
2. Kullanıcı periyodik olarak gerçek sayıyı girer.
3. Sistem eğilimi hesaplar ve söyler: hedef N, şu an M, bu tempoyla
   çıkışta P olur.
4. Tempo hedefe varmıyorsa bunu ÇIKIŞ GÜNÜ DEĞİL BUGÜN söyler.

Yanında: mağaza sayfası, ilk duyuru ve demo, Yayın fazından çıkıp erken
kontrol noktalarına taşınır.

### Somut vaka: oyunun tanıtım sitesi (28 Ağustos 2026'da incelendi)

Kullanıcının Claude Design üstünde duran, oyuna ait bir tanıtım sitesi
var. Yaklaşık dört buçuk aydır duruyor. İncelendi ve görünürlük ekseninin
neye benzemesi gerektiğini gösteren gerçek veri çıktı.

**Sitenin kalitesi sorun değil.** Elle yazılmış, şablon değil, tutarlı
sanat yönü ve gerçek etkileşimler var. Dünya kurgusu derin.

**Sorun şu: site hiçbir şey toplamıyor.** Koda bakılarak doğrulandı:

- Menüdeki "Wishlist" bağlantısı sayfa içi bir çapaya gidiyor, Steam'e
  değil. Steam sayfası yok.
- E-posta formu `preventDefault()` yapıp kullanıcıya "kaydedildi"
  diyor ve **adresi siliyor.** Dosyada `fetch(`, `action=`, Formspree,
  Netlify, Supabase, Firebase: hepsi sıfır kez geçiyor.
- Bütün dış bağlantılar `href="#"`: Steam, Discord, X, YouTube, Press
  Kit, About, Contact.

Yani pazarlamanın GÖRÜNTÜSÜ var, İŞLEVİ yok. Siteyi beğenip adresini
yazan herkes kayboldu, kaç kişi olduğu da bilinmiyor çünkü sayan bir şey
yok.

Üç bulgu daha:

- Devlog dört buçuk aydır durmuş ve girdiler kurgu içinden yazılmış
  (kurgusal yama notları), ortada derleme yokken.
- Görseller yapay zeka üretimi (C2PA verisinde `GPT-4o` ve
  `trainedAlgorithmicMedia`). Engel değil ama Steam bildirilmesini
  istiyor.
- **Site, yapılmayacak sürümü pazarlıyor.** Sitedeki kapsam tam
  kapsamlı sürüm, `KARARLAR.md` ise ilk sürüm için çok daha küçük bir
  ölçeğe karar vermişti. Bu siteye bakıp istek listesine ekleyen biri
  çok daha küçük bir oyun alırsa iade ve olumsuz inceleme riski doğar.

**Panoya çıkarılacak ders:** görünürlük ekseni "pazarlama yaptın mı"
diye sormamalı. Ölçülebilir olanı sormalı: kaç kişi topladın, nereye
kaydediliyor, sayabiliyor musun. Güzel bir site yapmak pazarlama
değildir; toplayan bir site yapmak pazarlamadır.

### Dağıtım: kendi kurulucumuz mu, Steam mi

Kullanıcının fikri: League of Legends'ın resmi sitesindeki gibi kendi
kurulucumuz olabilir. Kendisi güvenlik kontrolleri yüzünden zaten
Steam'in gerektiğini düşünüyor ve **sonuç doğru.** Sebepleri kayda
geçiriliyor, konuşulurken lazım olacak:

- **İmzasız çalıştırılabilir dosya**: Windows SmartScreen uyarı verir,
  tarayıcı indirmede uyarır, virüs programı karantinaya alabilir. Kod
  imzalama sertifikası yıllık ücretli ve doğrulama istiyor.
- **Asıl mesele barındırma değil keşfedilme.** Steam'in değeri dosyayı
  tutması değil: istek listesi sistemi, algoritma, "benzer oyunlar"
  yüzeyi, inceleme altyapısı, iade sistemi ve ülkelere göre ödeme ile
  vergi işlemleri. Kendi sitenden dağıtmak bunların hiçbirini vermez.
- **Riot bunu yapabiliyor çünkü Riot.** Kurumsal marka, sertifika,
  destek ekibi ve zaten var olan kitle. Kıyas noktası olarak yanıltıcı.

Yine de kendi barındırdığın bir yapı için meşru bir yer var: Steam
öncesi küçük bir gruba kapalı test yapısı dağıtmak. Bunun için kurulucu
da gerekmez, itch.io gibi bir yer kurulum gerektirmeden iş görür.

### Karara bağlanacak parametreler

Kullanıcının saydıkları ve konuşurken çıkanlar. Liste eksik, konuşma
sürecek:

- **Video yayınlama**: hangi platformlar, hangi sıklık, geliştirme
  günlüğü mü yoksa oynanış mı, kaç saat tutar.
- **Hesap açma**: hangi platformlarda hesap gerekiyor, ne zaman
  açılmalı, her birinin bakım maliyeti ne.
- **İletişime geçme**: yayıncılar, içerik üreticileri, basın. Kime,
  ne zaman, kaç kişiye, hangi mesajla.
- **Demo ve festivaller**: demo ne zaman hazır olmalı, hangi etkinliğe
  yetişecek, demo yapmak kaç saat.
- **Mağaza sayfası ne zaman açılır**: istek listesi ancak sayfa
  yayındayken birikiyor, bu yüzden sayfanın açılma tarihi kritik.
- **Bu işlerin saat maliyeti**: hepsi zaman yiyor ve şu an tahmine hiç
  dahil değil. Görünürlük işi bir işkolu mu olmalı, yoksa mevcut
  "karar" işkoluna mı girer?
- **Ölçüm sıklığı**: haftalık mı aylık mı, kullanıcıyı yormadan.

### Dürüstlük kısıtı (bu eksende en kritik nokta)

**İstek listesi > satış dönüşüm oranı koda YAZILMAYACAK.** Bu oran
oyuna, türe, zamanlamaya, fiyata ve indirime göre kat kat değişiyor.
Tek bir sayı vermek `KURALLAR.md` içindeki "bilinmeyen sayı
uydurulmaz" maddesinin ihlali olur.

Vergi oranlarında yapılanın aynısı yapılacak: varsayılan gelir,
"doğrula" etiketiyle işaretli, kullanıcı kendi araştırmasıyla girer.

Aynı şekilde bu eksen bir "başarı skoru" ÜRETMEYECEK. Sistem oyunun
tutup tutmayacağını bilemez ve bilemeyeceğini söylemek zorundadır.
Söyleyebileceği tek şey ölçülebilir olan: kaç kişi bu oyunun
varlığından haberdar.

---

## Yapılacak: kendi açılır listemiz (henüz yapılmadı)

28 Ağustos 2026'da konuşuldu, **bilinçli olarak ertelendi.** Yapılabilir
bir iş, imkansız değil. Ertelenme sebebi bedeli.

### Şu anki durum

`color-scheme` sayesinde açılan liste ve takvim artık karanlık temada
koyu zeminde açılıyor. Renk sorunu çözüldü. Kalan şikayet **biçim**:
köşeler kare, seçili satırın vurgusu işletim sisteminin mavisi, bizim
mor vurgu rengimiz değil. Yazı tipi de sayfanın değil.

### "Tarayıcı çiziyor" ne demek

`<select>` tıklanınca açılan liste **sayfanın parçası değil.** Sağ tık
menüsü gibi, sayfanın üstünde ayrı bir katman olarak çiziliyor. Nitekim
tarayıcı penceresinin kenarından taşabiliyor; sayfanın içindeki hiçbir
şey bunu yapamaz.

CSS sayfanın içindekileri biçimlendirir. O liste sayfanın içinde
olmadığı için CSS ona ulaşmıyor. `color-scheme` bir istisna değil, bir
İSTEK: tarayıcıya "bu sayfa karanlık, kendi çizdiklerini de karanlık
çiz" diyoruz. Rengi söyleyebiliyoruz, köşe yarıçapını söyleyemiyoruz.

### Kendi listemizi yazmak

Mümkün ve zor değil. Yerel `<select>` yerine bir düğme ve altında liste
gibi görünen bir `div` konur. O zaman köşe, renk, yazı tipi, animasyon,
hepsi bizim olur.

Bedeli, yerel elemanın bedavaya verdiği davranışları elle yazmak:

- **Klavye**: yukarı/aşağı, Home/End, harfe basınca o harfle başlayana
  atlama, Escape ile kapatma, Enter ile seçme, Tab ile çıkma.
- **Ekran okuyucu**: `role="listbox"`, `role="option"`,
  `aria-activedescendant`, `aria-expanded`, seçili durumun duyurulması.
- **Konumlandırma**: ekranın altına yakınsa yukarı açılma, sayfa
  kaydırılınca listenin takip etmesi veya kapanması, dışarı tıklayınca
  kapanma.
- **Mobil**: yerel `<select>` telefonda işletim sisteminin kendi
  tekerlek seçicisini açar, bu kaybedilir.

Kabaca 150-200 satır ve asıl iş görünüş değil, yukarıdaki listenin
doğru çalışması. Yanlış yazılmış bir açılır liste, klavye kullanan
birinin sayfada tıkanmasına sebep olur.

### Karar

Erteledik. Şu an renk doğru, biçim değil. Yapılacaksa tek seferde ve
yukarıdaki dört maddenin hepsi yazılarak yapılmalı; yarısı yazılmış
hali yerel `<select>`ten kötüdür.

Aynı şey tarih seçici için de geçerli ve orada iş daha büyük.

---

## Ne yapıldı (v3.2: temaya uyan form bileşenleri)

Yapılacak listesindeki iş bitti. Yaklaşım baştan belliydi ve korundu:
**yerel elemanlar değiştirilmiyor, biçimlendiriliyor.** Kendi açılır
listeni yazmak görsel tutarlılık kazandırır ama klavyeyle gezinmeyi,
ekran okuyucu desteğini ve mobilde işletim sisteminin kendi seçicisini
kaybettirir. Kötü bir takas.

### Biçimlendirmenin yettiği yerler

- **Açılır liste**: `appearance: none` ve gömülü SVG ok. Ok bir arka plan
  görseli olduğu için `currentColor` kullanamıyor, her tema için ayrı
  değişken tanımlandı (`--select-arrow`).
- **Tarih alanları**: takvim ikonu karanlık temada `filter: invert(1)`
  ile çevriliyor, üstüne gelince zemin alıyor.
- **Onay kutusu**: zaten temalıydı, üstüne odak halkası, fareyle üstüne
  gelme ve devre dışı hali eklendi.
- **Odak halkası**: önceden sadece kenarlık rengi değişiyordu, klavyeyle
  gezen biri için yeterince görünür değildi. Artık `focus-visible` ile
  belirgin bir halka var.

### Sayı kutusu: CSS yetmedi, bileşen yazıldı

Önce CSS ile denendi: yerel yukarı/aşağı düğmesini gizleyip yerine kendi
okumuzu koymak. **Çalışmadı.** Tarayıcıda gerçek fare tıklamasıyla
ölçüldü: Chrome'un iki bölgeli tıklama davranışı bozuluyor, alt yarı
çalışırken üst yarı çalışmıyordu. Bu, CSS'i geri alıp `NumberField`
bileşenini yazmayı gerektirdi.

Bileşen okları kendisi çiziyor ama yazı alanı hâlâ yerel
`input type="number"`: klavye okları, tekerlek, sayı klavyesi,
yapıştırma ve ekran okuyucu davranışı olduğu gibi duruyor.

İki tasarım kararı:

- **Yerel `stepUp()` kullanılmadı.** React kontrollü bir alanda DOM'u
  doğrudan değiştirmek durumu bozar, çünkü React o değişikliği görmez.
  Hesap bileşende yapılıp yukarı bildiriliyor. Kayan nokta artıkları
  (0.1 + 0.2) da burada temizleniyor.
- **Oklar klavyeyle gezilmiyor** (`tabIndex -1`). Yazı alanı zaten
  odakta ve yukarı/aşağı tuşları aynı işi yapıyor; iki fazladan durak
  eklemek klavyeyle gezinmeyi yavaşlatırdı.

16 çağrı yeri dönüştürüldü. `onChange` artık olay değil doğrudan değer
alıyor: `onChange={(v) => set({ dailyMinutes: Number(v) })}`.

### Doğrulama

Gerçek fare tıklamalarıyla: yukarı ok 180 > 195 > 210, aşağı ok
210 > 195 > 180. Klavye oku çalışıyor, elle yazılan değer kaydediliyor,
`min`/`max`/`step` geçiyor. Sınıra gelince ilgili ok devre dışı oluyor
(7 iken yukarı pasif, 1 iken aşağı pasif). İki tema, sıfır JavaScript
hatası.

### Düzeltildi: açılan pencere de temaya uyduruldu

Bu bölümde önce şu yazıyordu ve **yanlıştı**: "Açılan listenin kendisi ve
takvim penceresi işletim sistemi tarafından çiziliyor, CSS oraya
ulaşmıyor."

Kullanıcı ekranda gördü ve sordu. Doğrusu: `color-scheme` tam bunun için
var. Tarayıcıya "bu sayfa karanlık" dendiğinde kendi çizdiği yüzeyleri de
karanlık çiziyor: açılır liste penceresi, tarih seçicinin takvimi,
otomatik tamamlama listesi ve varsayılan form renkleri.

`:root { color-scheme: light }` ve `:root[data-theme='dark'] {
color-scheme: dark }` eklendi. Ayrıca `option` renkleri de temaya
bağlandı: Chrome bu pencereyi Windows'ta kendisi çiziyor ve `option`
renklerini uyguluyor.

Bunun bir yan etkisi vardı ve düzeltildi: takvim ikonundaki
`filter: invert(1)` artık gereksiz ve yanlış, çünkü `color-scheme` ikonu
zaten doğru renkte çiziyor. Üstüne binince ters çevirirdi. Kaldırıldı.

Böylece kendi takvimimizi yazmadan sorun çözüldü: klavye, ekran okuyucu
ve mobil davranışı kaybedilmedi.

**Ders:** "tarayıcı çiziyor, yapılamaz" demeden önce o alan için bir
standart olup olmadığına bakılmalı. Bu durumda vardı.

### Gerçekten yapılamayan

Tarih alanı `08/27/2027` biçiminde görünüyor. Bu tarayıcının dil
ayarından geliyor, CSS veya kodla değiştirilemiyor. Tarayıcı dili Türkçe
olan bir makinede `27.08.2027` görünür. Kendi tarih alanımızı yazmak
dışında bir yolu yok, o da klavye ve mobil davranışını kaybettirir.

---

## Ne yapıldı (v3.1: panel düğmesi ve kaydırma çubukları)

### Daralt düğmesi marka satırına taşındı, markanın kendisi olmadı

Kullanıcı sordu: düğmeyi ayrı tutmak yerine sol üstteki oyun ikonuna
basınca açılıp kapanması daha mı iyi olur?

**Olmaz, ve sebebi dar modda ortaya çıkıyor.** Bir logoya basmanın
gezinme panelini kapatması beklenen bir davranış değildir ve hiçbir şey
o ikonun tıklanabilir olduğunu göstermez. Panel darken, açma yolu
görünmezse kullanıcı okunmayan bir panelle baş başa kalır ve geri dönüş
yolu yoktur. `KURALLAR.md`: kullanıcıya soru işareti bırakılmaz.

Ama kullanıcının asıl derdi haklıydı: ayrı bir satır dikey yer yiyordu.
Orta yol uygulandı: düğme marka satırının sağ ucuna alındı, ayrı satır
kalktı. İkon da düzeltildi; önceki `layers`/`list` ikonları "daralt"
anlamı taşımıyordu, yerine `chevronLeft`/`chevronRight` kondu. Dar modda
marka ikonunun altına iniyor, 28x28 piksel, her zaman görünür.
`aria-expanded` durumu da yansıtıyor.

### Kaydırma çubukları temaya bağlandı

Yerel kaydırma çubuğu işletim sisteminin renklerinde geliyordu ve
karanlık temada sayfanın kenarında açık gri bir şerit olarak duruyordu.
Renkler artık CSS değişkenlerinden alınıyor (`--border-strong`), tema
anahtarıyla birlikte değişiyor. Doğrulandı: karanlık temada
`rgb(77, 73, 68)`, aydınlıkta `rgb(206, 200, 186)`.

Genişlik inceltildi ama **yok edilmedi**: görünmeyen bir kaydırma
çubuğu, sayfanın devamı olduğunu gizler. Tutamak saydam çerçeveyle
inceltildi, böylece görsel olarak ince ama tıklama alanı geniş kaldı.

Doğrulandı: geniş modda düğme marka satırında ve sağa yaslı (sağ kenar
225 piksel, panel 250 piksel, ikonla aynı satırda), dar modda ikonun
altında ve ekran içinde. Sıfır JavaScript hatası.

## Ne yapıldı (v3.0: içerik zinciri ve arayüz düzeni)

Kullanıcının ekrandan bildirdiği ve istediği üç iş.

### Bütçe ekranındaki hizalama hatası

Mağaza kayıt ücreti satırındaki iki alan hizasızdı: ilkinin etiketi yoktu,
bu yüzden ikinci alan aşağı kayıyordu. v2.6'da eklerken atlanmış. İlk alana
"Tutar (USD)" etiketi verildi, iki input artık aynı hizada.

### Ganimet zinciri: düşman > eşya > üretim

Kullanıcının tarifi: bir düşmandan düşen ganimet kaynak/eşya tarafına
gelmeli, "nereden elde edilir" o düşman olmalı, "ne işe yarar" da
üretilebilir eşyaların malzemesi olabilmeli (örümcek ağı gibi zincirler).

**Bağlar türetiliyor, saklanmıyor.** Aynı bilgiyi iki yerde tutmak, iki
yerin ayrışması demek: düşmanın "ne düşürür" alanı ile eşyanın "nereden
düşer" alanı ayrı ayrı tutulsaydı biri değişince diğeri yanlış kalırdı.
Tek kaynak düşmanın alanı; eşyanın tarafı `itemRelations` ile hesaplanıyor.

Her bileşenin altında artık dört bağ görünüyor:

- Şunlardan düşüyor (hangi düşmanlar bu eşyayı düşürüyor)
- Şunların üretiminde kullanılıyor (bu eşya neyin malzemesi)
- Malzemeleri (bu eşya neyden üretiliyor)
- Düşürdükleri (bu düşman ne düşürüyor)

Tanımsız olanlar uyarı renginde ve "(tanımsız)" etiketiyle gösteriliyor.

`kaynak` türüne **"Neyden üretilir"** alanı eklendi. "Nereden elde edilir"
alanı ise **"Düşman dışı elde etme yolu"** olarak yeniden adlandırıldı,
çünkü düşman tarafı zaten türetiliyor; burası sandık, dükkan ve görev
ödülü için.

### Tek tıkla eksik eşya ekleme

Gerçek bir veri setinde "4 ganimet listede tanımlı değil" uyarısı
çıkıyordu ama uyarıyı görüp elle eklemek gerekiyordu. Artık hem İçerik
listesinin başında hem tutarlılık bulgusunun içinde "hepsini ekle" düğmesi
var. Doğrulandı: dört ganimet tek tıkla eklendi, bileşen sayısı 7'den
11'e çıktı, uyarı kalktı.

(Oyun içeriğinin kendisi bu dosyaya yazılmıyor. Repo public ve tasarım
ayrıntıları `KARARLAR.md` içinde, repo dışında tutuluyor.)

"Hiçbir şeyden düşmüyor" kontrolü de düzeltildi: artık üç elde etme yolunu
birden sayıyor (düşmandan düşmek, üretilmek, düşman dışı yol). Önceden
sadece düşme yoluna bakıyordu ve üretilen bir eşyayı ulaşılamaz sanıyordu.

### Sol panel daraltılabilir

Panel 250 pikselden 68 piksele iniyor. Metinler **gizleniyor, kırpılmıyor**:
kırpılmış bir yazı ("Bütçe ve Geri D...") okunmaz bir yazıdır ve taşan
yazıdan daha iyi değildir. İkonlar kalıyor, tam ad `title` olarak veriliyor.
Grup başlıkları gizlenince yerine ayırıcı çizgi geliyor. Tercih
`localStorage`'da saklanıyor.

### Doğrulama ve bir ders

Tarayıcıda gerçek Mytherra verisiyle: panel 749 pikselden 68 piksele
iniyor, dar modda 0 yazı görünüyor ve 11 ikon duruyor, tercih yenilemeden
sonra kalıyor, dar modda hiçbir ekranda yatay taşma yok. Ganimet zincirinin
dört bağı da doğru hesaplanıyor. Bütçe ekranındaki iki input aynı hizada
(ikisi de 1188 piksel). Temiz yüklemede sıfır JavaScript hatası.

**Ders:** İçerik ekranı bir ara tamamen patladı (`eksikOgeler is not
defined`, eksik import) ve bunu ne `lint` ne de `build` yakaladı. İkisi de
temiz geçti. Sadece tarayıcı testi yakaladı. Bu projede arayüz testi yok;
tarayıcıdan geçirmeden "çalışıyor" denmemeli.

## İleride: ekip modu ve sunucu tarafı (henüz yapılmadı)

Kullanıcının 28 Ağustos 2026'da not edilmesini istediği yön. **Şimdi
yapılmayacak**, ama yapılırsa aracın türünü değiştirir: kişisel bir
planlama aracından çok kişili bir üretim aracına geçer.

### İstenen

- **Davet kodu ve oda.** Ekibi olan biri davet kodu üretir, ekip üyeleri
  kodla odaya girer. Bir host var ve ayarları o belirler.
- **Kronometre zorunluluğu.** Günlük girdi kronometreyle yapılır, böylece
  gün içinde kimin ne kadar çalıştığı ölçülür.
- **Emeğin ölçülmesi ve pay adaleti.** Kim işine ne kadar değer veriyor
  görünür olur; iş bitince pay bölüşümü ölçülen emeğe dayanır. Tek kişilik
  projede zaten sorun yok, bu tamamen ekipli durum için.
- **Ortak alanlar.** Üretim panosu, giriş çıkış kayıtları ve host ile
  etkileşilen diğer alanlar paylaşılır.
- **Domain ve web sürümü.** Araç bir alan adı üstünden yayına alınır.
- **Kimlik doğrulama.** Google ile giriş veya siteye ait kayıt/giriş.
  Kullanıcı üyelik akışından henüz emin değil.
- **Veri tabanı.** NeonDB düşünülüyor, kullanıcının daha önce deneyimi var.

### Bunun ne anlama geldiği (karar verilmeden önce okunmalı)

Bu liste tek başına bir özellik seti değil, **mimari değişikliği**. Bugünkü
pano arka ucu olmayan tek bir sayfa: veri tarayıcıda, hesap yok, sunucu
yok, çalışması için internet gerekmiyor. Yukarıdaki maddelerin her biri bu
üç şeyi de bozuyor.

Yani karar "bu özellikleri ekleyelim mi" değil, **"bu araç kişisel bir
araç mı kalacak, yoksa çok kişili bir servise mi dönüşecek"**. İkisi de
meşru ama aynı anda ikisi olmaz.

Bir orta yol var: bugünkü tek dosya panosu tek kişilik sürüm olarak kalır,
ekip sürümü ayrı bir kurulum olur. Ortak olan şey `src/data/` altındaki
bilgi tabanı ve `src/lib/` altındaki hesap motoru; bunlar zaten arayüzden
ve depolamadan ayrı yazıldı, o yüzden taşınabilirler.

### Dikkat edilecek üç şey

- **Ölçülen emek hassas bir konu.** Kronometre verisi pay bölüşümüne
  girdiği anda, sayı sadece bilgi olmaktan çıkıp para olur. İnsanlar
  ölçülen şeyi optimize eder: kronometreyi açık bırakmak, düşünme süresini
  kaydetmemek, gece çalışmasını yazmamak. Sistem bu sayıyı tek gerçek
  olarak sunarsa haksızlık üretir. Aracın kendi ton kuralı burada da
  geçerli: sayıyı göster, ama ne olduğunu ve neyi ölçmediğini de yaz.
- **Hesap ve veri tabanı, "dış servisler isteğe bağlıdır" kuralını
  doğrudan çiğniyor.** Ekip sürümünde bu kaçınılmaz, ama tek kişilik
  sürümün ondan etkilenmemesi gerekir.
- **Kimlik doğrulama ve veri tabanı, bu serinin diğer projelerinden çok
  daha büyük bir iş.** Kendi kendine bir 30 günlük proje olabilir.

### Bu araca sorulacak soru

Bu panonun kendi mantığıyla değerlendirilmeli: ekip modu bir kapsam
kalemidir. Sihirbaza "ekip" girildiğinde saat çarpanı zaten düşüyor
(iki kişi 0.65), ama panonun KENDİSİNİ çok kişili yapmak ayrı bir proje.
Kapsam ekranındaki buzdolabına yazılacak fikir tam olarak budur.

## Ne yapıldı (v2.9: dışarıdaki asistanla dosya üstünden çalışma)

Kullanıcının fikri: oyun geliştirme kişisel bilgisayarda Claude Code ile
yapılacak, pano iş bilgisayarında duracak. İki seçenek düşünüldü: panoya
Claude API bağlamak, veya dosya üstünden gidip gelmek.

**Dosya seçildi. API dört sebeple reddedildi:**

1. `KURALLAR.md`: kişisel bir planlama aracı bir API'ye bağımlı olamaz.
   API giriş yolu olursa internet yokken sisteme giriş yapılamaz.
2. Pano arka ucu olmayan tek bir dosya. API anahtarı `localStorage`'da
   iş bilgisayarında durur ve `pano.html` içinde seyahat eder. Dosyayı
   alan anahtarı da alır.
3. **API asıl sorunu zaten çözmüyor.** İki makine birbirine bağlı değil;
   bir API çağrısı iki ayrı `localStorage` arasında veri taşımıyor. Her
   hâlükârda bir dosya gerekiyor.
4. Dosya yolu zaten büyük ölçüde kuruluydu: dışa/içe aktarma, içerik
   föyü ve güvenli karşılaştırmalı içe aktarma vardı.

### İki yönlü protokol (`src/lib/rapor.js`)

**Pano -> asistan: durum föyü.** Hangi fazdasın, o fazın SERT KURALLARI,
sıradaki tek iş (adım kimliğiyle), teslimat durumu, kapsam listeleri,
riskler, içerik veri tabanı ve tutarlılık notları. Sonunda geri
yazılacak rapor biçiminin tarifi ve kuralları.

**Asistan -> pano: iş raporu.** JSON. Oturumlar ve dakikalar, tamamlanan
adımlar ve teslimatlar, eklenen/güncellenen içerik, günlük notları,
bulunan hatalar.

Günlük ekranından kullanılıyor: föyü indir veya kopyala, iş raporunu al.

### Sınır: rapor kapıya dokunamaz

Kullanıcıya soruldu, kararı bu oldu. Rapor kapı kontrollerine, kapsama ve
tahmin eksenlerine dokunamaz.

Sebebi: kapı kontrollerinin bir kısmı kullanıcının kendi beyanı ("10
dakika oynadın ve durmak istemedin"). Bir asistanın bunları
işaretleyebilmesi aracın var oluş sebebini bitirirdi. Otomatik kontroller
zaten veriden hesaplanıyor, onlara zaten dokunmaya gerek yok.

Rapor bu alanlara dokunmaya çalışırsa sessizce yok sayılmıyor: arayüzde
"Rapor şu alanlara dokunmaya çalışmış" diye açıkça yazılıyor.

### Rapor doğrudan uygulanmıyor

Önce fark gösteriliyor, kullanıcı onaylıyor. Uygulanamayan her madde
sebebiyle birlikte listeleniyor: olmayan adım kimliği, bilinmeyen içerik
türü, zaten var olan ad, o türde olmayan alan, dakikası sıfır oturum.
Sessizce atmak, asistanın yaptığını sandığı bir işin kaydedilmemesi
demek olurdu.

Doğrulandı (tarayıcı, uçtan uca): 90 dakikalık bir oturum, 2 adım, 1
içerik bileşeni, 1 not ve 1 hata uygulandı; geçersiz adım kimliği
sebebiyle atlandı; `gateChecks` alanı reddedildi ve kullanıcıya bildirildi;
uygulama sonrası `gateChecks` boş kaldı. Sıfır JavaScript hatası.

## Ne yapıldı (v2.8: iki bilgisayar gerçeği)

Kullanıcı Unity'yi iş bilgisayarına kuramıyor. Planlama burada, oyun
geliştirme kişisel bilgisayarda olacak. Bu, önceki plandaki öncelikleri
değiştirdi ve iki iş çıkardı.

### Tek dosyaya gömülen pano

`dist` klasörünü taşıyıp `index.html` açmak çalışmıyor: tarayıcılar
`file://` üstünden ES modülü yüklemeyi CORS gereği engelliyor. Sayfa
bomboş açılıyor ve hata bile vermiyor. Test edildi, doğrulandı.

Ama SATIR İÇİ modül betikleri `file://` üstünde çalışıyor. `scripts/tek-dosya.mjs`
CSS ve JS'i index.html içine gömüp tek bir `pano.html` üretiyor
(`npm run tek-dosya`). 412 KB, tek dosya, çift tıklanarak açılıyor,
Node veya sunucu gerektirmiyor.

Tarayıcıda doğrulandı: on bir ekranın hepsi açılıyor, localStorage
çalışıyor, yazı tipleri yükleniyor, sihirbaz taslağı yazılıyor, sıfır
JavaScript hatası. `vite.config.js` içine `base: './'` eklendi.

İkinci faydası: bu bilgisayardaki araçlar 30 gün sonunda kaldırılacak.
Derlenmiş pano o zaman da çalışmaya devam eder.

Sınır: `file://` kaynağı ile `localhost` kaynağı ayrıdır, localStorage
paylaşılmaz. Dosya taşımak veriyi taşımaz; veri için JSON dışa/içe
aktarma kullanılır.

### İçe aktarma artık üstüne yazmadan önce soruyor

Bu, iki bilgisayar durumunun ortaya çıkardığı asıl risk ve gerçek bir
hataydı. `importData` hiçbir şey sormadan tüm verinin üstüne yazıyor ve
yeşil bir "Veriler içe aktarıldı" bildirimi gösteriyordu. Dosya taşıyan
biri için bu, eski bir dosyayla yeni işini silmek demekti. Bu projede bir
kez gerçek veri kaybı yaşandı (sihirbaz taslağı); aynı hatanın ikinci
biçimi burasıydı ve henüz kimseyi vurmadan bulundu.

Artık iki adımlı: dosya seçilince önce karşılaştırma tablosu çıkıyor.
Proje adı, faz, tamamlanan adım, kayıtlı oturum, kaydedilen dakika,
içerik bileşeni, arşiv ve son değişiklik tarihi yan yana gösteriliyor.

Gelen dosya geride kalıyorsa (tarih daha eski VEYA herhangi bir sayaç
geriliyorsa) uyarı çıkıyor ve düğme "Yine de üstüne yaz" olarak, tehlike
renginde görünüyor. Yanında "Önce mevcudu yedekle" düğmesi var.

`saveStore` artık her kayıtta `sonDegisiklik` damgası atıyor; tarih
damgası olmayan eski dosyalar için sayaç karşılaştırması yedek kontrol.

Doğrulandı: 8 oturum / 12 adım / 6 bileşen olan bir veri üstüne 2/3/1
olan eski bir dosya aktarılmaya çalışıldı, uyarı çıktı, onaylanmadan
hiçbir şey değişmedi, vazgeçince veri aynı kaldı.

## Geliştirme planı (28 Ağustos 2026)

Sistemin bugünkü hali: faz-kapı disiplini, dokuz eksenli saat tahmini,
tempo gerçekliği, para ve geri dönüş, kapsam koruması, içerik veri tabanı
ve dışa aktarma. Planlama tarafı büyük ölçüde tamam.

**Yapısal boşluk şu: sistem planlarken gerçeği söylüyor, çalışırken
susuyor.** Kullanıcı çalışmaya başladıktan sonra sistem hiçbir şey
ölçmüyor ve kendi tahminini hiç sınamıyor. Aşağıdaki sıralama buna göre
kuruldu.

### 1. Kalibrasyon: sistem kendi tahminini sınasın

`project.sessions` zaten kaydediliyor ama hiçbir yerde tahminle
karşılaştırılmıyor. Faz başına "tahmin edilen saat" ile "gerçekten
harcanan saat" yan yana konursa, kullanıcının kendi sapma katsayısı
çıkar. Bu katsayı sonraki tahminlere uygulanabilir.

Bunun neden en önemli madde olduğu: bu dosyadaki bütün çarpanlar bir
kabul. `estimate.js` içinde zaten yazıyor: "ölçülen gerçek, tahminden
daha güvenilirdir." `unitMath` bunu birim düzeyinde yapıyor, faz ve proje
düzeyinde yapmıyor. Kalibrasyon, aracı "varsayımlar kitabı" olmaktan
çıkarıp "senin hızını öğrenen araç" haline getirir.

Orta büyüklükte iş. Post-mortem fazındaki elle karşılaştırma teslimatı
da bununla otomatikleşir.

### 2. Yanma grafiği ve haftalık özet: geç kalmayı erken söyle

Elimizde tarih, gereken saat ve kaydedilmiş oturumlar var. Eksik olan,
bunları birleştirip "bu tempoyla bitiş tarihin şu kadar kayıyor" demek.

Sistem şu an sadece kurulum anında sert. Bir ay sonra iki hafta ara
verilmişse hiçbir şey söylemiyor. Oysa aracın var oluş sebebi tam olarak
bunu altı ay sonra değil bugün söylemek.

Küçük ile orta arası iş. "Bu hafta 5 saat gerekiyordu, 2 saat çalıştın,
bu gidişle hedef tarih 3 ay kayar" cümlesi kurulabilir.

### 3. Veri güvenliği: yedek hatırlatması

Bütün veri tek tarayıcının `localStorage`'ında. Dışa aktarma var ama
otomatik yedekleme ve hatırlatma yok. Bu projede bir kez gerçek veri
kaybı yaşandı (sihirbaz taslağı) ve düzeltildi, ama asıl proje verisi
hâlâ aynı kırılganlıkta duruyor.

Ek bir sebep: bu bilgisayardaki geliştirme araçları 30 gün sonunda
kaldırılacak. Yüzlerce saatlik planlama tek bir tarayıcı profilinde
durmamalı.

Küçük iş: "son yedek N gün önce alındı" göstergesi ve belli bir süre
geçince uyarı. Otomatik indirme değil, hatırlatma.

**Yapıldı, 3 Eylül 2026 (v3.4).** Gün sayısı tek başına yetmediği için
gösterge biriken işi ölçüyor. Ayrıntısı yukarıdaki v3.4 bölümünde.

### 4. İçerik listesi ile üretim panosu arasında köprü

İçerik bileşenleri asıl işin kendisi. Üretim panosundaki kartlar elle
giriliyor. Bileşenleri karta çevirmek panoyu gerçek yapar ve iki listeyi
elle eşlemek zorunluluğunu kaldırır.

Orta büyüklükte iş, 1 ve 2'ye bağımlı değil.

### 5. Tür başına ölçülen saat

Kullanıcı bir boss yaptıktan sonra "bu türden biri kaç saat sürdü"
girerse, birim matematiği düz sayım olmaktan çıkıp tür ağırlıklı hale
gelir. Bir boss ile bir kaynak aynı birim değil.

1. maddeyle aynı felsefe, ona bağlanabilir. Küçük iş.

### 6. Profilin eskidiğini fark etmek

Profil bir kez doldurulup aylarca dokunulmadan durabiliyor. Bu gerçekten
yaşandı: `KARARLAR.md` 27 Ağustos'ta tek kişilik ve henüz başlamamış bir
proje tarif ederken, gerçek proje aylardır üç kişiyle sürüyordu. Sistem o
süre boyunca artık doğru olmayan bir tahmini güvenle gösterdi.

Kural zaten yazılı, sadece profile uygulanmamış: bir sayının ne zaman
doğru olduğu yazılır ve arayüz bunu söyler. Mağaza ücretlerinde ve
yedeklerde uygulandı, burada uygulanmadı.

Yapılacak şey uyarı değil, hatırlatma: profilin en son ne zaman
doğrulandığını sakla ve üstünden belli bir süre geçince "bunlar hâlâ
doğru mu" diye sor. v3.4'teki yedek göstergesinin aynısı, sadece konusu
farklı. Ekip, sanat ve tür alanları en çok değişenler.

Küçük iş. 3. maddeyle aynı aileden, mekanizması da aynı.

**Yapıldı, 7 Eylül 2026 (v3.7).** Ayrıntısı yukarıdaki v3.7 bölümünde.
Mekanizma tam olarak aynı çıkmadı: yedekte "hiç çalışılmadıysa risk yok"
doğruydu, profilde değil.

### 7. Sahipsiz işkolu

**Bu bir eksik değil, hata.** Listedeki diğer maddeler panoyu daha iyi
yapar, bu madde panonun bugün verdiği yanlış bir cevabı düzeltir.

Ekip büyüklüğü tek bir çarpan ve `requiredHours` içinde tahminin
tamamına düz uygulanıyor. Üç kişi için 0,45, bütün işkollarına aynı
şekilde. Mytherra'da işin yüzde 25'i sanat ve o işkolunda kimse yok, ama
pano sanat işini de üçe bölüp ucuzlatıyor.

Gereken veri zaten elde: `disciplineShares` her işkolunun payını
hesaplıyor. Eksik olan, bir işkolunun sahipsiz işaretlenebilmesi ve
sahipsiz payın ekip çarpanından muaf tutulması. Üstüne bir kapı koşulu:
işin belli bir yüzdesi sahipsizse kapı açılmaz.

**Yapıldı, 7 Eylül 2026 (v3.5).** Ayrıntısı yukarıdaki v3.5 bölümünde.

### 8. Bilinmeyen seçenek kimliği sessizce ilk seçeneğe düşüyor

`findOption` bir kimliği bulamazsa listenin ilk maddesini döndürüyor
(`list.find(...) || list[0]`). `findGenre` de aynı. Bu, eski kayıtları
çalıştırmak için konulmuş makul bir savunma, ama yanlış tarafa savunuyor:
kaydedilmiş bir profilde yazım hatası veya kaldırılmış bir seçenek olsa,
pano sessizce ilk seçeneği varsayıp güvenle yanlış bir sayı gösterir.

Bu gerçekten yaşandı ve bizzat panonun kendi test dosyasında yaşandı:
`artId: 'elle'` yazıldı, öyle bir seçenek yoktu, hesap Minimal (0,70) ile
yapıldı ve sonuç "elle çizilen sanat" diye etiketlendi. Hiçbir yerde uyarı
çıkmadı.

7. maddeyle aynı aileden: sessizce verilen yanlış cevap. Farkı, o maddenin
tek bir çarpanı ilgilendirmesi, bunun her seçenek okumasını ilgilendirmesi.

Yapılacak şey hata fırlatmak değil (eski kayıtlar açılamaz hale gelir),
bilinmeyen kimliği görünür kılmak: seçilen değerin kaydedilenden farklı
olduğunu arayüzde söylemek. Küçük iş, ama nereye yazılacağı düşünülmeli.

### 9. Ölçek çarpanı faz ayrımı yapmıyor

Kullanıcı sordu: bir bölge yapmak diğer bölgeleri hızlandırmaz mı? Sistemler
bir kez yazılıyor, sonraki bölgeler büyük ölçüde istatistik değişikliği.
Sorunun peşine düşünce panonun **kendi içinde iki farklı cevabı olduğu**
ortaya çıktı.

**Faz paylarına göre:** Üretim fazı toplamın yüzde 35'i. Tam kapsamda 1910
saat, 13 bölgeye bölününce bölge başına 147 saat. Kalan yüzde 65 sistemler,
tasarım, prototip ve cila; büyük ölçüde bir kez yapılıyor. Bu okuma
kullanıcıyı doğruluyor.

**Ölçek çarpanına göre:** aynı girdilerle mikro 171 saat, büyük 5458 saat.
Aradaki 5287 saat 12 bölgeye bölününce bölge başına 441 saat, yani ilkinin
2,6 katı. Bu okuma kullanıcıyı çürütüyor.

Üç kat fark, aynı panonun içinde.

**Sebep:** ölçek çarpanı (mikro 0,25 / küçük 1 / orta 3 / büyük 8) tahminin
tamamına uygulanıyor, faz ayrımı yapmadan. Konsept fazı mikroda 5 saat,
büyükte 164 saat. Tasarım dokümanı 32 kez yazılmıyor. Prototip çekirdek
döngüyü ölçekten bağımsız olarak bir kez kanıtlıyor.

Bir kısmı gerçekten ölçekle büyüyor (13 bölgenin tasarımı, 24 krallığın
lore'u), ama sistem prototipi ve dikey dilim büyümüyor. Pano hepsini birden
büyütüyor ve büyük kapsamları olduğundan pahalı gösteriyor.

**Bugünün üçüncü sessiz yanlış cevabı ve üçü de aynı kalıptan:** bir çarpan,
gerekçesinin kapsadığından daha geniş bir alana uygulanıyor. 7. maddede ekip
çarpanı sahipsiz işkoluna, 8. maddede varsayılan seçenek bilinmeyen kimliğe,
burada ölçek çarpanı bir kez yapılan fazlara.

### Ton tarafı: abartılmış sertlik dürüstlük değildir

Bu maddenin ton kurallarını ilgilendiren bir yanı var ve ayrıca yazılması
gerekiyor.

Panonun kimliği "sistem doğruyu söyler, motive etmez" üstüne kurulu ve bu
doğru. Ama iki şey birbirinden ayrılmalı:

- Gerçek bir kısıtı sert söylemek, aracın işi.
- **Şişmiş bir sayıyı sert söylemek dürüstlük değil, hata.**

Tam kapsam için çıkan "28 yıl" ifadesi ikincisi. Hem caydırıcı hem de bir
modelleme hatasıyla şişkin, ve bu en kötü bileşim: kullanıcı doğru olmayan
bir sebeple vazgeçer. "Cezalandırılmaz" kuralı bunu da kapsıyor.

### Ne zaman yapılacak

Bulgu ikiye ayrılıyor ve ikisinin zamanlaması farklı.

**Yapısal kısım ölçüm gerektirmiyor.** Tasarım dokümanının 32 kez
yazılmadığı bugün de doğru. Bu kısım bilinerek bekletiliyor, bilinmediği
için değil.

**Doğru oranlar ölçüm gerektiriyor.** "Ön Üretim ölçekle ne kadar büyür"
sorusuna bugün verilecek her cevap uydurma olur. Bekleneceği için değil,
panonun kendi kuralı olduğu için: sistem sadece doğrulayabildiğini söyler.

Ama beklenen şey oyunun bitmesi değil. Oturumlar zaten faza bağlı
kaydediliyor ve v3.3'te faz karşılaştırması var. Veri, demo üzerinde
çalışılmaya başlandığı anda birikmeye başlar. Bu madde 1. maddeye
(kalibrasyon) bağlıdır, yayına değil.

Bu, panonun kaçırdığı gerçek bir durumu otomatik yakalar. Denetimin en
önemli bulgusu ("sanat rolünün sahibi belirlenmemiş") tam olarak buydu ve
pano onu göremedi.

Küçük iş, ama önceliği yüksek: yanlış bir sayı, eksik bir özellikten
kötüdür.

### Yapılmayacaklar

- **Yapay zeka ile hissiyat testi.** Sistemin kendi mantığına aykırı.
- **İçerik üreteci.** Tek bölgelik bir ilk sürümde saf zarar. Veri
  katmanı kuruldu, üreteç isteyene işin yarısı hazır.
- **Mağaza ücretleri için API.** Yayınlayan yok. Kur için API zaten bağlı.

### Sıralama önerisi

Önce 7, çünkü diğerleri panoyu iyileştirir, o bir hatayı düzeltir.
Sonra 3 (küçük, veri güvenliği), sonra 2 (erken uyarı), sonra 1
(kalibrasyon). 4 ve 5 sonraya. 6 küçük ve 3 ile aynı mekanizmayı
kullanıyor, onun arkasına eklenebilir. Ama bundan önce gelen bir şey
var, aşağıya bakın.

### Panonun kendisi hakkında dürüst not

Bu araç bir buçuk günde v1'den v2.7'ye geldi ve artık on binlerce satırlık
bir yazılım. Aynı sürede Mytherra hâlâ Faz 0: Konsept'te ve tek bir
teslimat tamamlanmadı.

Bu, aracın önlemek için yazıldığı kalıbın ta kendisi: oyunu yapmak yerine
oyunu yapmaya yarayan şeyi yapmak. İç araç tartışmasında aynı uyarı
oyunun kendisi için yapılmıştı, panonun kendisi için de geçerli.

**Düzeltme, 4 Eylül 2026.** Yukarıdaki karşılaştırmanın yarısı yanlıştı.
"Mytherra hâlâ Faz 0: Konsept'te" cümlesi panonun kaydına bakarak
yazılmıştı, ama o kayıt gerçek projeyi tarif etmiyordu. Denetim, oyunun
Nisan'da Godot'dan Unity'ye geçtiğini, 42 script ve çalışan bir çatışma
sistemi (yaklaşık yüzde 70) olduğunu gösteriyor. Yani oyun ilerlemiş,
ilerlemediğini sanan pano olmuş.

Bu, üstteki profil bulgusuyla aynı sınıftan üçüncü bir örnek: sistem
kendi kaydının eskidiğini fark edemiyor ve eski kayda dayanarak bir yargı
üretiyor. Burada ürettiği yargı da kullanıcı hakkındaydı, yani ton
kuralına iki kez aykırı.

Uyarının kendisi ayakta kalıyor: araç hızlı büyüdü ve büyümeye devam
ederse oyunun yerini alabilir. Ama gerekçesi artık "oyun duruyor" değil,
sadece "araç hızlı büyüyor".

Öneri: yukarıdaki maddelere geçmeden önce panoyu bir hafta boyunca
gerçekten kullan. Faz 0 teslimatlarını doldur, oturum kaydet, kapıyı
zorla. Eksikler o zaman kendiliğinden görünür ve tahmin edilerek değil
kullanılarak bulunur. Bu maddelerin hangisinin gerçekten gerektiğini de
o hafta söyler.

## Ne yapıldı (v2.7: kendi kodumun gözden geçirilmesi)

v2.4-v2.6 arasında yaklaşık bin satır hızlı yazıldı. Bütün türleri,
ölçekleri, platformları ve kullanıcı durumlarını dolaşan bir duman testi
yazılıp çalıştırıldı. Yapısal hata çıkmadı ama üç gerçek hata bulundu ve
üçü de düzeltildi.

### 1. Mağaza ücreti mağazadan bağımsız saklanıyordu

`profile.storeFee` tek bir alandı. App Store için ücret girip mağazayı
Steam'e çevirince, Steam de o tutarı kullanıyordu: yanlış mağazanın
sayısıyla hesap yapmak. Artık `storeFees` ve `storeFeeCheckedAt` mağaza
başına anahtarlanıyor.

### 2. Tür değişince içerik bileşenleri sessizce kayboluyordu

Ayarlar'dan tür değiştirilince eski türün bileşenleri kayıtta kalıyor ama
hiçbir bölümde görünmüyordu. Üstelik toplam sayıma dahil oluyorlardı, yani
"14 bileşen" yazıyor ama ekranda 12 tane görünüyordu. Birim sayımını
tekrar tahmine çeviren bir durum.

Düzeltme: `orphanItems` ve `validItems` ayrıldı. Sayım, ilerleme ve dışa
aktarma sadece geçerli bileşenleri kullanıyor. Eşleşmeyenler İçerik
ekranının altında ayrı bir kartta, eski tür koduyla birlikte listeleniyor
ve tutarlılık kontrollerinde en üstte uyarı olarak çıkıyor. Silinmiyorlar:
tür geri değiştirilirse olduğu gibi geri geliyorlar. Veriyi göstermeden
saymak da, sormadan silmek de yanlış olurdu.

### 3. Hazır varlık ile görsel araç kazancı çift sayılıyordu

`aiEffect` içindeki örtüşme kırpması sadece `minimal` sanat yaklaşımında
uygulanıyordu. "Hazır varlık kullanacağım" diyen biri görsel üretim
aracının kazancının tamamını alıyordu, oysa ikisi aynı sorunu çözüyor:
sanatı kendin üretmemek. Hazır varlıkla çalışırken işin çoğu üretmek değil
seçmek, uyarlamak ve tutarlı tutmaktır; bir üreteç bunların sadece birine
yardım eder.

Düzeltme: `ART_TOOL_OVERLAP` tablosu (`options.js`). Minimal 0.50, hazır
0.65, kendi 1.00. Sanat yaklaşımı arttıkça aracın kazancı da artıyor,
sıralama artık doğru: minimal %4, hazır %5, kendi %7.

### Doğrulama

Duman testi: dokuz tür x dört ölçek x üç platform x üç kullanıcı durumu
(324 birleşim) için hesap patlamıyor, `required` pozitif ve sonlu, karar
ve kaldıraçlar eksiksiz. Dokuz türün içerik şeması tutarlı: tekrarlı tür
veya alan yok, her türün test föyü var, bütün `ref` alanları var olan bir
türe işaret ediyor. Boş projede kontroller ve dışa aktarma patlamıyor.

Tarayıcıda: eşleşmeyen bileşen kartı çıkıyor ve eski tür kodlarını
gösteriyor, toplam sayım 4 değil 2, tutarlılık listesinde en üstte uyarı
var, mobil platformda App Store varsayılan geliyor ve ücret alanı "sisteme
yazılmadı" açıklamasıyla çıkıyor, Steam'de "sistemin son bildiği tutar 100
USD ve bu bilgi 2026-05 tarihine ait" yazıyor. Sıfır JavaScript hatası,
`lint` ve `build` temiz.

## Ne yapıldı (v2.6: içerik veri tabanı, mağaza ücretlerinde tarih)

İki iş: kullanıcının önerdiği içerik veri tabanı (2, 3, 4 ve 5. maddeler
birlikte) ve yazılı mağaza ücretlerinin eskiyebileceğinin kabul edilmesi.

### Mağaza ücretleri artık tarihli

`publishing.js` başındaki iki gruplu ayrıma bir üçüncü durum eklendi:
**birinci gruptaki sayılar da eskir.** Steam'in kayıt ücreti bugün doğru
olabilir, iki yıl sonra olmayabilir. Yazılı her tutarın yanına artık
bilindiği tarih konuyor (`FEE_KNOWN_AS_OF`, `feeKnownAsOf`) ve arayüz
"sistemin son bildiği tutar bu, doğrula" diyor.

`money.js` içindeki `storeFeeInfo` üç durumu ayırt ediyor: kullanıcı
girmiş (en güvenilir, kontrol tarihiyle), sisteme yazılı (tarihiyle
birlikte gösterilir), hiçbiri (sıfır kabul edilir ve maliyetin eksik
olduğu söylenir). 12 aydan eski tutarlar için ayrıca uyarı çıkıyor.

Kullanıcının sorduğu API konusu: bu tutarlar için bağlanabilecek bir uç
yok. Ne Valve, ne Apple, ne Google kayıt ücretlerini programatik olarak
yayınlıyor. Döviz kuru için API var ve zaten bağlı (`rates.js`).
Ücretler için tek dürüst yol kullanıcının kontrol edip girmesi, o yüzden
kontrol tarihi de saklanıyor.

### İçerik veri tabanı

`src/data/content.js`, `src/lib/content.js`, `src/components/ContentView.jsx`.

Dokuz türün hepsi için bileşen şeması yazıldı (5. madde de bu sürümde
bitti). Kalıp her türde aynı: bir **kapsayıcı** (RPG'de bölge, platformda
bölüm, anlatıda sahne, roguelike'ta oda) ve içine bağlanan bileşenler.
RPG'de bölge, boss, küçük düşman, dost, kaynak ve yetenek var; her birinin
alanları (can, kuvvet, ne düşürür, hangi bölgede) ve sabit test föyü var.

**Alan değerleri için varsayılan verilmiyor.** Can ve kuvvet oyunun
dengesine ait kararlardır, sistemin bilebileceği şeyler değil. Sistem
sadece hangi alanların doldurulması gerektiğini söyler.

**Bu bir üreteç değil, liste.** Bölge üreteci yazmak tek bölgelik bir ilk
sürümde saf zarardır: araç yapım saati, birim başına kazançtan büyüktür.
Veri katmanını kurmak ise neredeyse bedava ve üreteci sonradan yazmak
isteyene işin yarısını hazır verir.

### Asıl kazanç: plannedUnits artık sayım

Üretim kapısındaki birim matematiği (`unitMath`) şu ana kadar kullanıcının
verdiği bir tahmine güveniyordu. Artık içerik listesi doluysa Bu Faz
ekranında "İçerik ekranında 14 bileşen girilmiş, bu sayı tahmin değil"
notu ve tek tıkla alanı doldurma düğmesi çıkıyor.

### Test tavsiyesi konusu: iki tür, ikisi de zekâ gerektirmiyor

Kullanıcı testi geliştiricinin yapacağını netleştirdi ve sistemin ne
kadar akıllı tavsiye verebileceğini sordu. Cevap: "akıllı" olmaya
çalışırsa genel geçer laf üretip vakit harcatır. Güvenilir biçimde
verebileceği iki şey var:

1. **Veri tutarlılığı kontrolleri** (`contentChecks`). Hepsi hesaplanır.
   Aynı sayısal değeri paylaşan bileşenler, kapsayıcıya bağlanmamış
   içerik, boş kapsayıcılar, dağılım dengesizliği, tanımsız ganimet,
   hiçbir yerden düşmeyen eşya, isim tekrarı, boş tür. `gates.js`
   içindeki otomatik kontrollerle aynı kalıp: sistem doğrulayabildiğini
   doğrular. Hiçbiri "şunu yap" demiyor, "şu durum var, kasıtlı mı" diyor.
2. **Bileşen türüne göre sabit test föyü.** Zeki değil, alan bilgisi.
   Bir kez yazılır, her seferinde aynıdır: "boss öldüğünde ganimet
   gerçekten düşüyor mu", "iki düşman aynı anda saldırınca ne oluyor".
   `genres.js` içindeki tuzaklarla aynı kalıp.

Kapsam dışı: yapay zeka ile hissiyat testi. Sistemin kendi mantığına
aykırı, `karar` işkolu hiçbir asistandan etkilenmiyor.

### Dışa aktarma

İki biçim. **JSON** makine için: türler, alanlar, bileşenler ve
referansların okunabilir adları. **Föy** (markdown) insan ve asistan için:
içeriğin tamamı, tür başına test föyleri ve tutarlılık notları. Föyün
başında ne İSTENDİĞİ de yazıyor: iskelet kod, tanım dosyaları, yükleme
kodu; sayılar tasarım kararıdır ve asistanın onları "dengelemesi"
istenmez. Kopyala ve indir düğmeleri var.

### Türkçe ekler veriye yazıldı

"hiçbir bölgee bağlı değil" hatası çıktı. Ünlüyle biten kelimeler
kaynaştırma harfi ister ("bölge" > "bölgeye"), bazıları ünsüz
yumuşamasına uğrar ("kaynak" > "kaynağa"). Morfoloji kodu yazmak yerine
her kapsayıcı türe `lower` ve `dative` alanları eklendi. Bu bir algoritma
değil, alan bilgisi ve `src/data/` altında durması doğru.

### Doğrulama

Tarayıcıda (Chrome, DevTools Protocol), kasıtlı olarak bozuk bir Mytherra
veri seti kurularak: 13 bileşen, 11 tutarlılık bulgusunun hepsi doğru
tetiklendi (aynı canlı iki boss, bölgesiz düşman, boş bölge, tanımsız
ganimet, ulaşılamaz eşya, isim tekrarı, boş tür). Arayüzden bileşen
ekleme çalışıyor ve localStorage'a yazılıyor (13 > 14). Detay alanları,
bölge seçme listesi ve test föyleri açılıyor. Föy dışa aktarması doğru
metni üretiyor. Aydınlık ve karanlık tema, 390px mobil (yatay taşma yok),
sıfır JavaScript hatası, `lint` ve `build` temiz.

Geriye dönük uyum: `content` alanı olmayan eski kayıtlar boş liste olarak
okunuyor.

### Kalan

Kullanıcının listesindeki beş maddenin hepsi bitti. İleride konuşulabilecek
şeyler: bileşen türüne göre ölçülen saat (kullanıcı bir boss yaptıktan
sonra "bu türden biri kaç saat sürdü" girer, birim matematiği tür ağırlıklı
hale gelir) ve içerik listesinin üretim panosuna kart olarak aktarılması.

## Ne yapıldı (v2.5: hedef platform ekseni)

Kullanıcının isteği: sistem oyunun mobile mi bilgisayara mı çıkacağını
sormalı ve sunumu ona göre yapmalı. Kendisi bunu "aciliyeti en düşük" diye
işaretlemişti, ama en ucuz ve tahmini gerçekten etkileyen madde olduğu için
öne alındı.

Platform, çok oyunculu ile aynı türden bir karar: sonradan eklenen bir
özellik değil, kontrol şemasını, arayüz yerleşimini ve test sürecini baştan
belirler. Mobil, "aynı oyunu küçük ekrana koymak" değildir.

### Eklenenler

- `PLATFORM_TARGETS` (`options.js`): bilgisayar 1.0, mobil 1.3, ikisi birden
  1.6. Mobilin çarpanı dokunmatik kontrolün bir port değil yeniden tasarım
  olmasından, ekran oranı ve cihaz performans aralığından, ve mağaza
  inceleme sürecinden geliyor. "İkisi birden" 1.3 + 1.3 değil çünkü ortak
  iş var, ama test matrisi ikiye katlanıyor.
- Sihirbazın 5. adımında (koşullar) platform sorusu, çok oyunculunun hemen
  ardında. Ayarlar ekranından sonradan değiştirilebiliyor.
- Yeni kaldıraç: "Tek platformda çık: önce bilgisayar". Sadece iki platform
  seçiliyken görünüyor, çok oyunculu kaldıracıyla aynı mantıkta.
- `publishing.js` içine App Store ve Google Play eklendi. Bütçe ekranındaki
  mağaza listesi artık platforma göre daralıyor: mobil bir projede Steam
  seçenek olarak görünmüyor.

### Mağaza ücretlerinde dosyanın kendi kuralı uygulandı

Apple'ın geliştirici programı ücreti ve Google Play kayıt ücreti **koda
yazılmadı**. Tutarlar zamanla ve ülkeye göre değiştiği için `publishing.js`
başındaki ayrım gereği ikinci gruba giriyorlar: varsayılan sıfır, `verifyFee`
işaretli, arayüzde "doğrula" etiketiyle kullanıcıdan isteniyor. Girilen değer
`money.js` içindeki `storeFeeFor` ile mağazanın kendi değerini eziyor.

Apple ücretinin YILLIK olduğu ayrıca yazıldı, çünkü proje uzadıkça tekrar
eder ve bu, sistemin "maliyet süreye bağlıdır" ekseniyle doğrudan ilgili.

### Yol boyunca bulunan tutarsızlık

Platform mobil seçilse bile `createProject` mağazayı Steam olarak
varsayıyordu. Sonuç: mobil bir proje, Steam'in yüzde 30 payı ve 100 dolarlık
iade edilebilir ücretiyle hesaplanıyordu. Mağaza varsayılanı artık
platformdan türetiliyor.

Ayrıca proje kurulduktan sonra Ayarlar'dan platform değiştirilirse seçili
mağaza geçersiz kalabiliyor. Bu durumda Bütçe ekranı sessizce eski oranlarla
hesap yapmak yerine uyarı gösteriyor: "Seçili mağaza bu platformda yok,
aşağıdaki hesap hâlâ Steam oranlarıyla yapılıyor ve bu platform için yanlış."

### Doğrulama

Tarayıcıda (Chrome, DevTools Protocol): sihirbazın 5. adımında üç seçenek
görünüyor ve seçim taslağa yazılıyor; Bütçe ekranındaki mağaza listesi
platforma göre daralıyor; mobilde "doğrula" etiketli ücret alanı çıkıyor;
platform ile mağaza uyuşmadığında uyarı çıkıyor. Sıfır JavaScript hatası,
`lint` ve `build` temiz.

Geriye dönük uyum: `platformId` alanı olmayan eski kayıtlar `pc` varsayılanına
düşüyor ve saat tahmini değişmiyor (çarpan 1.0).

### Sırada ne var (içerik veri tabanı, konuşuldu)

Kullanıcı bir oyun içeriği veri tabanı önerdi: bosslar, küçük düşmanlar,
dostlar, kaynaklar, üs; can, kuvvet, düşen ganimet; bölge ilişkisi ve alt
dallar. Parçalara bölündü ve 1. parça (platform) bu sürümde yapıldı.
Kalanlar:

2. Düz içerik listesi. Türe göre varsayılan bileşen türleri, kullanıcı sayı
   ve isim girer. Asıl değeri: `unitMath` kapısındaki `plannedUnits` artık
   tahmin değil sayım olur.
3. Alan şeması (can, kuvvet, ganimet, bölge) ve alt dallar. Panonun üretim
   disiplini aracından tasarım aracına kaymaya başladığı yer, bilinçli
   karar gerektiriyor.
4. Dışa aktarma: JSON ve asistana verilecek föy. İskelet kod üretimi için.
5. Diğer türler için şemalar. Buzdolabı.

Kapsam dışı bırakıldı: **yapay zeka ile hissiyat testi.** Sistemin kendi
mantığına aykırı, `karar` işkolu hiçbir asistandan etkilenmiyor. Testi
geliştirici yapar. Sistemin test konusunda verebileceği iki şey var ve ikisi
de zekâ gerektirmiyor: veri tutarlılığı kontrolleri (`gates.js` kalıbında,
hesaplanır) ve bileşen türüne göre sabit test föyü (`genres.js` içindeki
tuzaklar kalıbında, bir kez yazılır).

## Ne yapıldı (v2.4: tempo gerçeklik kontrolü)

Kullanıcı sihirbazı yeniden doldururken günlük süreye 360 dakika yazdı ve
sistem "Rahat" dedi. Karar aritmetik olarak doğruydu ama plan gerçek değildi:
kullanıcı tam zamanlı çalışıyor ve haftada 30 saati bir yıl boyunca
sürdüremez.

Ortaya çıkan üç kusur:

### 1. Sistem kendi kuralını kendi girdisine uygulamıyordu

`estimate.js` içinde `MAX_REALISTIC_DAILY = 240` sabiti vardı ve sistem
*kendi önerdiği* kaldıraç bu sınırın üstündeyse onu "gerçekçi değil" diye
işaretleyip tıklanamaz yapıyordu. Ama kullanıcı aynı sayıyı 4. adımda elle
yazdığında hiçbir şey demiyordu. Aynı sayı, kim yazdığına göre bir kez
reddediliyor bir kez kabul ediliyordu.

`KURALLAR.md` içindeki "gerçekçi olmayan öneri, gerçekçi öneriyle aynı
görünmez" maddesinin doğrudan ihlaliydi.

### 2. Üst sınır tahmin ediliyordu, sorulmuyordu

Sabit 240 dakika, kimin için sürdürülebilir olduğu belirsiz bir sayıydı. Tam
zamanlı çalışan biri ile tüm gününü projeye ayırabilen biri aynı tavana
sahip olamaz.

Eklendi: `COMMITMENT_MODES` (`options.js`) ve sihirbazın 4. adımında
"Günün geri kalanında ne yapıyorsun?" sorusu. Tavan artık bu cevaptan
türetiliyor: tam zamanlı iş/okul 180 dakika, yarı zamanlı 300, tam zaman
ayırabilen 420. Bu sayılar ölçüm değil üst sınır kabulü ve arayüzde de
böyle sunuluyor. Ayarlar ekranından sonradan değiştirilebiliyor.

### 3. Gerçeklik katsayısı her tempoda sabitti

`REALISM_FACTOR = 0.8` günde 1 saat için makul, ama 8 saatlik mesai sonrası
6. saat günün 1. saatiyle aynı işi çıkarmaz. Sabit katsayı, yüksek tempo
girildiğinde elindeki saati **olduğundan fazla** gösteriyordu.

Katsayı ikiye bölündü: tavanın altındaki saatler `REALISM_FACTOR` (0.8),
üstündekiler `OVERTIME_REALISM_FACTOR` (0.5) ile sayılıyor. Kullanıcının
Mytherra senaryosunda 360 dakika/gün için elindeki saat 1248'den 1014'e,
etkin katsayı %80'den %65'e indi.

Bu değişiklik `buildLevers` içindeki iki hesabı da etkiledi ve ikisi de
düzeltildi: "günlük süreyi artır" kaldıracı artık iki parçalı katsayının
tersini alıyor (`dailyMinutesForWeeklyHours`), "tarihi ertele" kaldıracı ve
gerçek maliyet hesabı mevcut temponun kendi etkin katsayısını kullanıyor.
Düz bölme, tavanın üstünde çalışan biri için gereken süreyi az gösteriyordu.

### En önemli kısım: sistem tempoyu suçlamıyor

Uyarı sadece "bu tempo fazla" demiyor, sürdürülebilir tavanın altında kalan
en düşük yeterli tempoyu hesaplayıp gösteriyor ve tek tıkla uyguluyor.
Mytherra'nın ilk sürümünde bu 105 dakika: kapsam zaten sığıyordu, 360
dakikaya hiç gerek yoktu.

Kapsam, tavanın altındaki hiçbir tempoyla sığmıyorsa (`scopeNeedsChange`)
sistem tempo önerisi vermiyor ve bunu açıkça söylüyor: sorun tempoda değil
kapsamda. Böylece günlük süreyi şişirmek bir kaçış kapısı olmaktan çıkıyor.

Tarayıcıda doğrulandı (Chrome, DevTools Protocol): 120 dakikada uyarı yok ve
katsayı %80; 360 dakikada uyarı çıkıyor, katsayı %65, öneri 105 dakika;
düğmeye basınca alan 105 oluyor ve uyarı kayboluyor; "tüm zamanımı
ayırabiliyorum" seçilince 360 dakika uyarı vermiyor; tam kapsamda uyarı
çıkıyor ama düğme çıkmıyor. Aydınlık ve karanlık tema, 390px mobil yerleşim
(yatay taşma yok), sıfır JavaScript hatası, `lint` ve `build` temiz.

Geriye dönük uyum: `commitmentId` alanı olmayan eski kayıtlar varsayılan
tavana (`yan`, 180 dakika) düşüyor. Tavanın altındaki tempolarda hesap
eskisiyle birebir aynı kalıyor, `KARARLAR.md` içindeki sayılar (10547 saat,
27308 USD, 607 ay) değişmedi.

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

- Veriler tek tarayıcıda saklanıyor. Dışa aktarma ve yedek hatırlatması var,
  otomatik yedekleme yok. Tarayıcı izinsiz dosya indiremez; indirebilseydi bile
  kullanıcının bilmediği bir dizine biriken dosyalar yedek sayılmaz.
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

Bu bölümdeki dört madde 31 Ağustos 2026'da yapıldı, ayrıntısı en üstteki
v3.3 bölümünde. Yeni maddeler buraya yazılacak.

Yapılırken ortaya çıkan ve karara bağlanmayan konular:

- Adıma bağlanmamış süre kayıtları faz dağılımına giremiyor. Sayaç her zaman
  bir adıma bağlı çalıştığı için bu sürenin kaynağı çoğunlukla elle girilen
  kayıtlar ve rapor içe aktarımı. Elle kayıt girerken faz seçtirmek bir
  seçenek, ama sürtünme ekler.
- Faz tahmini `sharePercent` ile toplam saatten dağıtılıyor. Bu yüzdeler
  sabit ve türe göre değişmiyor. Bir anlatı oyununda ön üretimin payı
  gerçekte daha büyük olabilir. Ölçülen veri biriktikçe bu yüzdelerin
  doğruluğu sınanabilir hale gelecek.

## Devam ederken hatırlanacaklar

- Proje kuralları için `KURALLAR.md` dosyasına bakılmalı.
- Bilgi tabanını genişletmek (yeni tür, yeni teslimat) `src/data/` altında
  yapılır, arayüze dokunmaya gerek yoktur.
- Node bu bilgisayarda kurulu (Vite + React için). 30 gün sonunda kaldırılacak
  araçlar listesine dahil.
- Kullanıcı stajyer, programlamaya yeni başlıyor. Kod basit ve okunabilir
  tutulmalı, aşırı soyutlamadan kaçınılmalı.
