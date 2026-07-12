# Σ Sumix

**Excel bilmeyenler için tasarlanmış, formülsüz-butonlu, Türkçe muhasebe tablosu programı.**

Kağıt-kalemle defter tutan esnafın, çiftçinin, küçük işletmecinin bilgisayara geçişini
kolaylaştırmak için yapıldı. İnternetsiz çalışır, verileri masaüstünde saklar,
her kayıtta otomatik yedek alır.

![Durum](https://img.shields.io/badge/durum-aktif-brightgreen)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Lisans](https://img.shields.io/badge/lisans-MIT-green)

---

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🧮 **İşlem Menüsü** | Topla, Çıkar, Çarp, Böl, Ortalama, En Büyük, En Küçük — sayıları seç, işlemi seç, sonucu yazacağın hücreye tıkla |
| 🖱 **Sürükle-Doldur** | Hücreye `1` yaz, yeşil tutamacı aşağı çek → 1, 2, 3... Ondalıklı da olur (12,5 → 13,5...) |
| 📐 **Gerçek Formüller** | İşlem menüsü hücreye gerçek formül yazar (`=A2*B2`). Aşağı sürüklersen her satır kendi verisiyle hesaplanır, kaynak değişince sonuç kendini günceller |
| 🎨 **Tablo Yap** | Alanı seç, renk seç → kenarlıklı, başlığı boyalı, zebra desenli hazır tablo |
| 🧾 **Hazır Şablonlar** | Tek tıkla Satış Defteri, Borç-Alacak Defteri, Gider Defteri kur |
| 🎨 **Biçimlendirme** | Yazı tipi, boyut, kalın/italik, yazı rengi, dolgu rengi, kenarlık, hücre birleştirme — tamamı Türkçe araç çubuğunda |
| 🔃 **Sırala & Filtrele** | Araç çubuğundaki huni simgesiyle A→Z / Z→A sıralama ve değere göre filtreleme |
| 🔍 **Arama** | Tüm sayfalarda arar, sonuca tıklayınca hücreye gider |
| 📑 **Çoklu Sayfa** | Alttaki sekmelerle sınırsız kategori sayfası (+ ile ekle, çift tık ile ad değiştir) |
| 📅 **Tarih Butonu** | Tek tıkla bugünün tarihini hücreye yazar |
| 📆 **Tarih Sürükleme** | `01.05.2026` yaz, aşağı sürükle → 02.05, 03.05... İki tarih yazarsan aradaki farkla (haftalık vs.) artar |
| 💼 **İş Günü Modu** | Ayarlar'dan aç → tarih sürüklerken Cumartesi-Pazar otomatik atlanır |
| 🔗 **Ctrl ile Dağınık Seçim** | Ctrl+tık ile birbirinden uzak hücreleri seç (maviye boyanır), İŞLEM menüsüyle hepsini birden hesapla |
| ₺ **Para Biçimi** | Sayıları seç → ₺ PARA → `1.500,25 ₺` görünümü; İŞLEM menüsü bunları da hesaplayabilir |
| 💾 **Üçlü Veri Güvenliği** | Masaüstüne kayıt → her kayıtta tarihli yedek (son 100) → dakikada bir otomatik kurtarma (elektrik kesintisine dayanıklı) |
| 📊 **Excel'e Aktar** | Aktif sayfayı Excel'in açtığı CSV olarak dışa aktarır |
| 🇹🇷 **Türkçe Sayılar** | `1.500,25` yaz, program formüller için otomatik çevirir |

## 🚀 Kurulum

```bash
git clone https://github.com/codxa/Sumix.git
cd sumix
pip install -r requirements.txt
python main.py
```

## 📦 .exe Yapmak (Windows)

`EXE_YAP.bat` dosyasına çift tıkla, ya da:

```bash
pip install pyinstaller
pyinstaller --onefile --noconsole --add-data "web;web" --name Sumix main.py
```

Oluşan `dist/Sumix.exe` dosyası Python kurulu olmayan bilgisayarlarda da çalışır
(Windows 10/11'de hazır gelen Edge WebView2 kullanılır).

## 📖 Hızlı Kullanım

1. **Yazmak:** Hücreye çift tıkla → yaz → Enter
2. **Toplamak:** Sayıları fareyle seç → 🧮 İŞLEM → TOPLA → sonucu yazacağın hücreye tıkla
3. **Satır satır çarpmak:** İki hücreyi seç → İŞLEM → ÇARP → hedef hücreye tıkla →
   o hücrenin köşesindeki **yeşil kareyi** aşağı sürükle → tüm satırlar kendi verisiyle çarpılır
4. **Defter kurmak:** 🧾 ŞABLON → Satış Defteri → başlıklar ve tablo hazır
5. **Kaydetmek:** `Ctrl+S` → dosya masaüstündeki `SumixDosyalari` klasörüne kaydedilir,
   yedeği `Yedekler` klasörüne düşer

## 🗂 Proje Yapısı

```
sumix/
├── main.py              # Python masaüstü kabuğu (pencere, dosya, yedek, CSV)
├── requirements.txt
├── EXE_YAP.bat          # Tek tıkla .exe üretici
├── KURULUM.txt          # Son kullanıcı için kılavuz
└── web/
    ├── index.html       # Arayüz iskeleti
    ├── app.js           # Uygulama mantığı (işlemler, şablonlar, arama, köprü)
    ├── tr.js            # x-spreadsheet Türkçe dil paketi
    ├── xspreadsheet.js  # Tablo motoru (x-spreadsheet, MIT)
    ├── xspreadsheet.css
    └── *.svg            # Araç çubuğu ikonları
```

## 🔧 Teknolojiler

- **[x-spreadsheet](https://github.com/myliang/x-spreadsheet)** — canvas tabanlı tablo motoru (MIT)
- **[pywebview](https://pywebview.flowrl.com/)** — hafif masaüstü pencere kabuğu (BSD)
- Saf JavaScript + Python — framework yok, derleme yok, tek komutla çalışır



## 🤝 Katkı

Hata bildirimi ve öneriler için Issue açabilirsiniz. Pull request'ler memnuniyetle karşılanır.
