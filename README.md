# Yarışma Sayaç Panosu

Sade, emojisiz bir geri sayım panosu. Ana sayfa en yakın yarışmayı büyük gösterir,
diğer yaklaşan yarışmaları liste halinde sıralar, tarihi geçenleri ise altta
"Bitenler" başlığı altında soluk renkte listeler.

## Dosyalar

- `index.html` — herkesin gördüğü ana pano
- `admin.html` — yarışma ekleme/silme paneli (yalnızca sen kullanacaksın)
- `styles.css`, `storage.js`, `main.js`, `admin.js` — ortak stil ve mantık

## Netlify'a yükleme

1. https://app.netlify.com/drop adresine git
2. Bu klasördeki tüm dosyaları (index.html, admin.html, styles.css, storage.js,
   main.js, admin.js) sürükle bırak
3. Netlify sana otomatik bir adres verir, örn. `rastgele-isim.netlify.app`
4. Site ayarlarından (Site configuration → Change site name) adresi
   istediğin gibi değiştirebilirsin, örn. `tpc-panel.netlify.app`

İstersen GitHub'a bir repo açıp Netlify'ı o repoya bağlayarak da
otomatik deploy kurabilirsin — ama tek seferlik sürükle-bırak da yeterli.

## Yarışma ekleme

`siteadresin.netlify.app/admin.html` adresine git, yarışma adını ve
tarih/saatini gir, "Ekle"ye bas. Ana sayfaya (`index.html`) dönünce
otomatik olarak görünür.

Önemli: Veriler tarayıcının **localStorage**'ında, yani bu cihaz/tarayıcı
üzerinde saklanır. Farklı bir cihazdan admin paneline girersen orada veri
boş görünür — bunu zaten "hep aynı cihaz yeterli" diye seçtin, o yüzden
sorun olmamalı. Sadece tarayıcı geçmişini/verilerini temizlersen liste
silinir; bu yüzden admin sayfasındaki "Yedek İndir" ile ara sıra bir
JSON yedek almanı, gerektiğinde "Yedek Yükle" ile geri getirmeni öneririm.

## Tasarım notları

- Renk paleti: soğuk gri-mavi zemin (#EDEFF0), mürekkep siyahı (#1B1F24),
  tek vurgu rengi olarak soluk tuğla kırmızısı (#B5482B) — sadece "Sıradaki"
  etiketinde ve hero kartının üst çizgisinde kullanılıyor.
- Tipografi: IBM Plex Sans (başlık/metin) + IBM Plex Mono (sayılar/tarihler).
- En yakın yarışma "split-flap" (havaalanı tarifesi) tarzı kutu sayılarla
  öne çıkarılıyor; diğer yarışmalar sade satırlar halinde listeleniyor.
- Animasyon/emoji yok; `prefers-reduced-motion` desteklenir.
