// KolayCell - Türkçe dil paketi (x-spreadsheet için)
(function () {
  var tr = {
    toolbar: {
      undo: "Geri Al", redo: "İleri Al", print: "Yazdır",
      paintformat: "Biçim Kopyala", clearformat: "Biçimi Temizle",
      format: "Sayı Biçimi", fontName: "Yazı Tipi", fontSize: "Yazı Boyutu",
      fontBold: "Kalın", fontItalic: "İtalik", underline: "Altı Çizili",
      strike: "Üstü Çizili", color: "Yazı Rengi", bgcolor: "Dolgu Rengi (Tablo Rengi)",
      border: "Kenarlıklar", merge: "Hücreleri Birleştir",
      align: "Yatay Hizala", valign: "Dikey Hizala", textwrap: "Metni Kaydır",
      freeze: "Satırı Dondur", autofilter: "Sırala / Filtrele",
      formula: "Hazır Formüller", more: "Daha Fazla"
    },
    contextmenu: {
      copy: "Kopyala", cut: "Kes", paste: "Yapıştır",
      pasteValue: "Sadece Değeri Yapıştır", pasteFormat: "Sadece Biçimi Yapıştır",
      hide: "Gizle", insertRow: "Satır Ekle", insertColumn: "Sütun Ekle",
      deleteSheet: "Sil", deleteRow: "Satırı Sil", deleteColumn: "Sütunu Sil",
      deleteCell: "Hücreyi Sil", deleteCellText: "Hücre İçeriğini Sil",
      validation: "Veri Doğrulama", cellprintable: "Dışa Aktarmayı Aç",
      cellnonprintable: "Dışa Aktarmayı Kapat",
      celleditable: "Düzenlemeyi Aç", cellnoneditable: "Düzenlemeyi Kilitle"
    },
    print: {
      size: "Kağıt Boyutu", orientation: "Sayfa Yönü",
      orientations: ["Yatay", "Dikey"]
    },
    format: {
      normal: "Normal", text: "Düz Metin", number: "Sayı", percent: "Yüzde",
      rmb: "RMB", usd: "Dolar ($)", eur: "Euro (€)", date: "Tarih",
      time: "Saat", datetime: "Tarih-Saat", duration: "Süre"
    },
    formula: {
      sum: "Toplam (SUM)", average: "Ortalama (AVERAGE)", max: "En Büyük (MAX)",
      min: "En Küçük (MIN)", _if: "EĞER (IF)", and: "VE (AND)",
      or: "VEYA (OR)", concat: "Birleştir (CONCAT)"
    },
    validation: {
      required: "bu alan zorunlu",
      notMatch: "doğrulama kuralına uymuyor",
      between: "{} ile {} arasında olmalı",
      notBetween: "{} ile {} arasında olmamalı",
      notIn: "listede yok",
      equal: "{} değerine eşit olmalı",
      notEqual: "{} değerine eşit olmamalı",
      lessThan: "{} değerinden küçük olmalı",
      lessThanEqual: "{} değerinden küçük veya eşit olmalı",
      greaterThan: "{} değerinden büyük olmalı",
      greaterThanEqual: "{} değerinden büyük veya eşit olmalı"
    },
    error: { pasteForMergedCell: "Birleştirilmiş hücrelerde bu işlem yapılamaz" },
    calendar: {
      weeks: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
      months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
               "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    },
    button: { next: "İleri", cancel: "Vazgeç", remove: "Kaldır", save: "Kaydet", ok: "Tamam" },
    sort: { desc: "Sırala: Z → A (Büyükten Küçüğe)", asc: "Sırala: A → Z (Küçükten Büyüğe)" },
    filter: { empty: "boş" },
    dataValidation: {
      mode: "Mod", range: "Hücre Aralığı", criteria: "Koşul",
      modeType: { cell: "Hücre", column: "Sütun", row: "Satır" },
      type: { list: "Liste", number: "Sayı", date: "Tarih", phone: "Telefon", email: "E-posta" },
      operator: {
        be: "arasında", nbe: "arasında değil", lt: "küçüktür",
        lte: "küçük eşittir", gt: "büyüktür", gte: "büyük eşittir",
        eq: "eşittir", neq: "eşit değildir"
      }
    }
  };
  if (window.x_spreadsheet) {
    window.x_spreadsheet.$messages = window.x_spreadsheet.$messages || {};
    window.x_spreadsheet.$messages.tr = tr;
  }
  window.KOLAYCELL_TR = tr;
})();
