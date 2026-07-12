/* ============================================================
   KOLAYCELL PRO - Ana uygulama mantığı
   ============================================================ */

/* ---------- Türkçe sayı yardımcıları ---------- */
function sayiOku(metin) {
  var m = String(metin == null ? "" : metin).trim()
          .replace(/\s/g, "").replace("₺", "").replace("TL", "");
  if (!m || m.charAt(0) === "=") return null;      // formül hücrelerini atla
  if (m.indexOf(",") !== -1) m = m.replace(/\./g, "").replace(",", ".");
  var v = parseFloat(m);
  return isNaN(v) ? null : v;
}
function trSayi(v) {
  var neg = v < 0 ? "-" : "";
  v = Math.abs(v);
  var tam = Math.floor(v);
  var ondalik = Math.round((v - tam) * 100);
  if (ondalik === 100) { tam += 1; ondalik = 0; }
  var s = String(tam).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return neg + (ondalik ? s + "," + String(ondalik).padStart(2, "0") : s);
}
function hucreAdi(ri, ci) {
  var s = "";
  ci += 1;
  while (ci > 0) { var k = (ci - 1) % 26; s = String.fromCharCode(65 + k) + s; ci = Math.floor((ci - 1) / 26); }
  return s + (ri + 1);
}

/* ---------- Tarih yardımcıları ---------- */
function tarihMi(t) {
  var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(t || "").trim());
  if (!m) return null;
  var g = +m[1], a = +m[2], y = +m[3];
  if (g < 1 || g > 31 || a < 1 || a > 12) return null;
  var d = new Date(y, a - 1, g);
  return (d.getDate() === g && d.getMonth() === a - 1) ? d : null;
}
function tarihYaz(d) {
  return ("0" + d.getDate()).slice(-2) + "." +
         ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear();
}
/* n gün ekle; isGunu=true ise Cumartesi/Pazar atlanır (ileri veya geri) */
function tarihArti(d, n, isGunu) {
  var yeni = new Date(d.getTime());
  var adim = n >= 0 ? 1 : -1;
  var kalan = Math.abs(n);
  while (kalan > 0) {
    yeni.setDate(yeni.getDate() + adim);
    if (isGunu) {
      while (yeni.getDay() === 0 || yeni.getDay() === 6)
        yeni.setDate(yeni.getDate() + adim);
    }
    kalan--;
  }
  return yeni;
}

/* ---------- Sürükle-doldur TARİH yaması ----------
   Motorun autofill'i sayı serilerini bilir ama tarihleri bilmez.
   Bu yama: 01.05.2026 sürüklenince 02.05, 03.05... diye devam ettirir.
   İki tarih seçiliyse aradaki gün farkını adım alır. İş günü modunda
   Cumartesi/Pazar atlanır. */
function autofillTarihYamasi(DP, tarihModu) {
  if (DP.__sumixTarih) return;
  var eskiAutofill = DP.autofill;
  DP.autofill = function (cellRange, what, error) {
    var src = { sri: this.selector.range.sri, sci: this.selector.range.sci,
                eri: this.selector.range.eri, eci: this.selector.range.eci };
    var sonuc = eskiAutofill.call(this, cellRange, what, error);
    if (sonuc === false) return sonuc;
    try {
      var d = this, isG = tarihModu() === "is";
      var dst = cellRange;
      var oku = function (r, c) { var h = d.getCell(r, c); return h && h.text; };
      var yazToplu = [];

      var dikey = dst.sri > src.eri || dst.eri < src.sri;   // aşağı/yukarı
      if (dikey) {
        for (var c = src.sci; c <= src.eci; c++) {
          var kaynak = [];
          for (var r = src.sri; r <= src.eri; r++) {
            var t = tarihMi(oku(r, c));
            if (!t) { kaynak = null; break; }
            kaynak.push(t);
          }
          if (!kaynak || !kaynak.length) continue;
          var adimGun = kaynak.length >= 2
            ? Math.round((kaynak[kaynak.length - 1] - kaynak[kaynak.length - 2]) / 86400000)
            : 1;
          if (!adimGun) adimGun = 1;
          if (dst.sri > src.eri) {                            // aşağı
            var son = kaynak[kaynak.length - 1];
            for (var r2 = dst.sri; r2 <= dst.eri; r2++) {
              son = tarihArti(son, adimGun, isG);
              yazToplu.push([r2, c, tarihYaz(son)]);
            }
          } else {                                            // yukarı
            var ilk = kaynak[0];
            for (var r3 = dst.eri; r3 >= dst.sri; r3--) {
              ilk = tarihArti(ilk, -adimGun, isG);
              yazToplu.push([r3, c, tarihYaz(ilk)]);
            }
          }
        }
      } else {                                                // sağa/sola
        for (var r4 = src.sri; r4 <= src.eri; r4++) {
          var kaynakY = [];
          for (var c2 = src.sci; c2 <= src.eci; c2++) {
            var t2 = tarihMi(oku(r4, c2));
            if (!t2) { kaynakY = null; break; }
            kaynakY.push(t2);
          }
          if (!kaynakY || !kaynakY.length) continue;
          var adimY = kaynakY.length >= 2
            ? Math.round((kaynakY[kaynakY.length - 1] - kaynakY[kaynakY.length - 2]) / 86400000)
            : 1;
          if (!adimY) adimY = 1;
          if (dst.sci > src.eci) {
            var sonY = kaynakY[kaynakY.length - 1];
            for (var c3 = dst.sci; c3 <= dst.eci; c3++) {
              sonY = tarihArti(sonY, adimY, isG);
              yazToplu.push([r4, c3, tarihYaz(sonY)]);
            }
          } else {
            var ilkY = kaynakY[0];
            for (var c4 = dst.eci; c4 >= dst.sci; c4--) {
              ilkY = tarihArti(ilkY, -adimY, isG);
              yazToplu.push([r4, c4, tarihYaz(ilkY)]);
            }
          }
        }
      }
      yazToplu.forEach(function (y) { d.setCellText(y[0], y[1], y[2], "finished"); });
    } catch (e) {}
    return sonuc;
  };
  DP.__sumixTarih = true;
}

/* ---------- Sadece tarayıcıda çalışacak kısım ---------- */
if (typeof document !== "undefined" && typeof x_spreadsheet !== "undefined") {

  x_spreadsheet.locale("tr", window.KOLAYCELL_TR);

  var s = x_spreadsheet("#sheet", {
    mode: "edit",
    showToolbar: true,
    showGrid: true,
    showBottomBar: true,          // alttaki sayfa (kategori) sekmeleri
    view: {
      height: function () { return document.getElementById("sheet").clientHeight; },
      width: function () { return document.documentElement.clientWidth; }
    },
    row: { len: 200, height: 27 },
    col: { len: 26, width: 110, indexWidth: 52 },
    style: { font: { name: "Segoe UI", size: 11 } }
  });

  var sel = { sri: 0, sci: 0, eri: 0, eci: 0 };
  var degisti = false;
  var bekleyen = null;              // hesaplanıp hücre bekleyen sonuç
  window.sonucModu = "sec";         // 'sec': hücreye tıkla | 'alt': otomatik alta
  window.tarihModu = "her";         // 'her': her gün | 'is': iş günleri (Cmt-Paz atla)

  /* ---------- CTRL ile dağınık hücre seçimi ---------- */
  var ctrlBasili = false;
  var ctrlListe = {};               // "r,c" -> {r, c, eskiStil}
  document.addEventListener("mousedown", function (e) { ctrlBasili = e.ctrlKey || e.metaKey; }, true);

  function ctrlSayisi() { return Object.keys(ctrlListe).length; }
  function ctrlHucreEkle(r, c) {
    var k = r + "," + c;
    if (ctrlListe[k]) return;
    var h = aktifData().getCell(r, c);
    ctrlListe[k] = { r: r, c: c, eskiStil: h ? h.style : undefined };
    aralikStil(r, c, r, c, { bgcolor: "#bbdefb" });     // mavi işaret
    s.reRender();
  }
  function ctrlTemizle() {
    var vardi = ctrlSayisi() > 0;
    Object.keys(ctrlListe).forEach(function (k) {
      var o = ctrlListe[k];
      var h = aktifData().getCell(o.r, o.c);
      if (h) {
        if (o.eskiStil === undefined) delete h.style;
        else h.style = o.eskiStil;
      }
    });
    ctrlListe = {};
    if (vardi) s.reRender();
  }
  function ctrlHucreleri() {
    return Object.keys(ctrlListe).map(function (k) { return ctrlListe[k]; });
  }

  /* ---------- Aktif sayfa yardımcıları ---------- */
  function aktifData() { return s.sheet.data; }
  function hucreDeger(ri, ci) {
    var c = aktifData().getCell(ri, ci);
    return c && c.text != null ? c.text : "";
  }
  function hucreYaz(ri, ci, text) {
    try { aktifData().setCellText(ri, ci, text, "finished"); }
    catch (e) { try { aktifData().setCellText(ri, ci, text); } catch (e2) {} }
  }
  /* Bir aralığa stil uygular (seçimi geçici değiştirip geri alır) */
  function aralikStil(sri, sci, eri, eci, stiller) {
    try {
      var d = aktifData();
      var r = d.selector.range;
      var eski = { sri: r.sri, sci: r.sci, eri: r.eri, eci: r.eci };
      r.sri = sri; r.sci = sci; r.eri = eri; r.eci = eci;
      Object.keys(stiller).forEach(function (k) {
        d.setSelectedCellAttr(k, stiller[k]);
      });
      r.sri = eski.sri; r.sci = eski.sci; r.eri = eski.eri; r.eci = eski.eci;
    } catch (e) {}
  }

  /* ---------- Seçim takibi + canlı istatistik ---------- */
  function secimOldu(yeni) {
    if (bekleyen) {                     // 🎯 hedef hücre bekleniyor: formülü buraya yaz
      var b = bekleyen; bekleyen = null;
      ctrlTemizle();
      hucreYaz(yeni.sri, yeni.sci, b.formul);
      aralikStil(yeni.sri, yeni.sci, yeni.sri, yeni.sci,
                 { bgcolor: "#fff3b0", "font-bold": true });
      s.reRender();
      degistiIsaretle();
      toast("✔ " + b.ad + ": " + trSayi(b.deger) + " → " +
            hucreAdi(yeni.sri, yeni.sci) +
            "  (köşesinden aşağı sürüklersen alt satırları da hesaplar!)");
      sel = yeni;
      return;
    }
    if (ctrlBasili && yeni.sri === yeni.eri && yeni.sci === yeni.eci) {
      ctrlHucreEkle(yeni.sri, yeni.sci);          // Ctrl+tık: listeye ekle
      sel = yeni;
      istatistikGuncelle();
      return;
    }
    ctrlTemizle();                                 // normal tık: dağınık seçimi bırak
    sel = yeni;
    istatistikGuncelle();
  }
  s.on("cell-selected", function (c, ri, ci) {
    secimOldu({ sri: ri, sci: ci, eri: ri, eci: ci });
  });
  s.on("cells-selected", function (c, r) {
    secimOldu({ sri: r.sri, sci: r.sci, eri: r.eri, eci: r.eci });
  });

  function istatistikGuncelle() {
    var say = seciliSayilar();
    var el = document.getElementById("istatistik");
    if (ctrlSayisi() >= 1) {
      var adlar = ctrlHucreleri().map(function (o) { return hucreAdi(o.r, o.c); });
      var on = "🔗 Ctrl ile seçili: " + adlar.slice(0, 8).join(", ") +
               (adlar.length > 8 ? "..." : "") + "  ";
      if (say.length) {
        var tc = say.reduce(function (a, b) { return a + b; }, 0);
        el.textContent = on + "|   TOPLAM: " + trSayi(tc) +
          "   |   ORTALAMA: " + trSayi(tc / say.length);
      } else el.textContent = on;
      return;
    }
    var adet = (sel.eri - sel.sri + 1) * (sel.eci - sel.sci + 1);
    if (say.length) {
      var t = say.reduce(function (a, b) { return a + b; }, 0);
      el.textContent = "Seçili: " + adet + " hücre   |   TOPLAM: " + trSayi(t) +
        "   |   ORTALAMA: " + trSayi(t / say.length) +
        "   |   SAYI ADEDİ: " + say.length;
    } else {
      el.textContent = "Seçili: " + adet + " hücre (" +
        hucreAdi(sel.sri, sel.sci) +
        (adet > 1 ? ":" + hucreAdi(sel.eri, sel.eci) : "") + ")";
    }
  }

  /* ---------- Türkçe virgül düzeltme ----------
     Kullanıcı 12,5 yazarsa motora 12.5 olarak kaydedilir ki
     formüller (=A1*B1 gibi) sayıyı tanısın. */
  try {
    var DP = s.sheet.data.constructor.prototype;
    if (!DP.__kcYamali) {
      var eskiSet = DP.setCellText;
      DP.setCellText = function (ri, ci, text, state) {
        if (state === "finished" && typeof text === "string") {
          var m = text.trim();
          if (/^\d{1,3}(\.\d{3})+,\d+$/.test(m)) {          // 1.500,25
            text = m.replace(/\./g, "").replace(",", ".");
          } else if (/^\d+,\d+$/.test(m)) {                  // 12,5
            text = m.replace(",", ".");
          }
        }
        return eskiSet.call(this, ri, ci, text, state);
      };
      DP.__kcYamali = true;
    }
    autofillTarihYamasi(DP, function () { return window.tarihModu; });
  } catch (e) {}

  /* Ctrl listesi varsa onu, yoksa dikdörtgen seçimi kullan */
  function seciliSayilar() {
    var out = [];
    if (ctrlSayisi() >= 2) {
      ctrlHucreleri().forEach(function (o) {
        var v = sayiOku(hucreDeger(o.r, o.c));
        if (v !== null) out.push(v);
      });
      return out;
    }
    for (var r = sel.sri; r <= sel.eri; r++)
      for (var c = sel.sci; c <= sel.eci; c++) {
        var v2 = sayiOku(hucreDeger(r, c));
        if (v2 !== null) out.push(v2);
      }
    return out;
  }

  /* ---------- 🧮 İŞLEM MENÜSÜ ---------- */
  window.islemAcKapa = function () {
    var p = document.getElementById("islemmenu");
    p.style.display = p.style.display === "block" ? "none" : "block";
  };

  /* Seçimden hücre referans listesi üret (sadece sayı içerenler) */
  function seciliRefler() {
    var refler = [];
    if (ctrlSayisi() >= 2) {
      ctrlHucreleri().forEach(function (o) {
        var t = hucreDeger(o.r, o.c);
        if (sayiOku(t) !== null || String(t).charAt(0) === "=")
          refler.push(hucreAdi(o.r, o.c));
      });
      return refler;
    }
    for (var r = sel.sri; r <= sel.eri; r++)
      for (var c = sel.sci; c <= sel.eci; c++)
        if (sayiOku(hucreDeger(r, c)) !== null || String(hucreDeger(r, c)).charAt(0) === "=")
          refler.push(hucreAdi(r, c));
    return refler;
  }

  /* Seçimde ₺/TL biçimli hücre var mı? (formül yerine değer yazılır) */
  function paraliVarMi() {
    var kontrol = function (t) { return /₺|TL/.test(String(t || "")); };
    if (ctrlSayisi() >= 2)
      return ctrlHucreleri().some(function (o) { return kontrol(hucreDeger(o.r, o.c)); });
    for (var r = sel.sri; r <= sel.eri; r++)
      for (var c = sel.sci; c <= sel.eci; c++)
        if (kontrol(hucreDeger(r, c))) return true;
    return false;
  }

  window.hesapla = function (tur) {
    document.getElementById("islemmenu").style.display = "none";
    var say = seciliSayilar();
    if (!say.length) {
      toast("Önce içinde sayı olan hücreleri seçin (dağınık hücreler için Ctrl+tık) 👆");
      return;
    }
    var deger, ad, formul;
    var dagitik = ctrlSayisi() >= 2;
    var aralik = hucreAdi(sel.sri, sel.sci) + ":" + hucreAdi(sel.eri, sel.eci);
    var refler = seciliRefler();

    if (tur === "topla") {
      deger = say.reduce(function (a, b) { return a + b; }, 0);
      ad = "TOPLAM";
      formul = dagitik ? "=" + refler.join("+") : "=SUM(" + aralik + ")";
    } else if (tur === "ortalama") {
      deger = say.reduce(function (a, b) { return a + b; }, 0) / say.length;
      ad = "ORTALAMA";
      formul = dagitik ? "=(" + refler.join("+") + ")/" + refler.length
                       : "=AVERAGE(" + aralik + ")";
    } else if (tur === "cikar") {
      deger = say.slice(1).reduce(function (a, b) { return a - b; }, say[0]);
      ad = "ÇIKARMA"; formul = "=" + refler.join("-");
    } else if (tur === "carp") {
      deger = say.reduce(function (a, b) { return a * b; }, 1);
      ad = "ÇARPIM"; formul = "=" + refler.join("*");
    } else if (tur === "bol") {
      deger = say[0];
      for (var i = 1; i < say.length; i++) {
        if (say[i] === 0) { toast("Sıfıra bölme olmaz! ⚠"); return; }
        deger = deger / say[i];
      }
      ad = "BÖLME"; formul = "=" + refler.join("/");
    } else if (tur === "enbuyuk") {
      deger = Math.max.apply(null, say);
      ad = "EN BÜYÜK";
      formul = "=MAX(" + (dagitik ? refler.join(",") : aralik) + ")";
    } else if (tur === "enkucuk") {
      deger = Math.min.apply(null, say);
      ad = "EN KÜÇÜK";
      formul = "=MIN(" + (dagitik ? refler.join(",") : aralik) + ")";
    }
    deger = Math.round(deger * 10000) / 10000;
    if (refler.length > 40 || paraliVarMi()) formul = String(deger);

    if (window.sonucModu === "alt") {
      var hedefR = sel.eri + 1, hedefC = sel.sci;
      hucreYaz(hedefR, hedefC, formul);
      aralikStil(hedefR, hedefC, hedefR, hedefC,
                 { bgcolor: "#fff3b0", "font-bold": true });
      s.reRender();
      degistiIsaretle();
      toast("✔ " + ad + ": " + trSayi(deger) + " → " + hucreAdi(hedefR, hedefC) +
            "  (formül yazıldı, aşağı sürüklersen satır satır hesaplar!)");
      return;
    }
    bekleyen = { formul: formul, deger: deger, ad: ad };
    toast("🎯 " + ad + " = " + trSayi(deger) +
          "  →  Sonucu yazmak istediğin HÜCREYE TIKLA (vazgeç: Esc)");
  };

  /* ---------- 🎨 TABLO YAP ---------- */
  window.paletAcKapa = function () {
    var p = document.getElementById("palet");
    p.style.display = p.style.display === "block" ? "none" : "block";
  };
  window.tabloYap = function (renk) {
    document.getElementById("palet").style.display = "none";
    var alan = (sel.eri - sel.sri) >= 1;
    if (!alan) {
      toast("Önce tablo yapılacak alanı fareyle seç (başlık satırı dahil), sonra rengi seç 👆");
      return;
    }
    // 1) Tüm aralığa ince kenarlık
    aralikStil(sel.sri, sel.sci, sel.eri, sel.eci,
               { border: { mode: "all", style: "thin", color: "#9e9e9e" } });
    // 2) Başlık satırı: seçilen renk + beyaz kalın yazı
    aralikStil(sel.sri, sel.sci, sel.sri, sel.eci,
               { bgcolor: renk, color: "#ffffff", "font-bold": true });
    // 3) Zebra: veri satırlarının çiftlerine hafif ton
    for (var r = sel.sri + 2; r <= sel.eri; r += 2) {
      aralikStil(r, sel.sci, r, sel.eci, { bgcolor: "#f4f6f4" });
    }
    s.reRender();
    degistiIsaretle();
    toast("✔ Tablo hazır! Başlıkları ilk satıra yaz, altına verileri gir.");
  };

  /* ---------- ⚙ AYARLAR ---------- */
  window.ayarAcKapa = function () {
    var p = document.getElementById("ayarpanel");
    p.style.display = p.style.display === "block" ? "none" : "block";
  };

  /* ---------- 🧾 HAZIR ŞABLONLAR ---------- */
  window.sablonAcKapa = function () {
    var p = document.getElementById("sablonmenu");
    p.style.display = p.style.display === "block" ? "none" : "block";
  };

  var SABLONLAR = {
    satis: {
      renk: "#2e7d32",
      basliklar: ["örnek-Tarih", "örnekAd Soyad", "örnek-Mal", "örnek-Fiyat (TL)", "örnek-Tutar (TL)", "örnek-Ödeme Durumu"]
    },
    borc: {
      renk: "#c62828",
      basliklar: ["Tarih", "Ad Soyad", "Açıklama", "Borç (TL)", "Ödenen (TL)", "Kalan (TL)"]
    },
    gider: {
      renk: "#e65100",
      basliklar: ["Tarih", "Gider Kalemi", "Açıklama", "Tutar (TL)", "Ödeme Şekli"]
    }
  };

  window.sablonYaz = function (tip) {
    document.getElementById("sablonmenu").style.display = "none";
    var sb = SABLONLAR[tip];
    if (!sb) return;
    var r0 = sel.sri, c0 = sel.sci;
    // Başlıkları yaz
    for (var i = 0; i < sb.basliklar.length; i++) {
      hucreYaz(r0, c0 + i, sb.basliklar[i]);
    }
    var sonSutun = c0 + sb.basliklar.length - 1;
    var sonSatir = r0 + 15;                       // başlık + 15 boş veri satırı
    // Tüm alana kenarlık
    aralikStil(r0, c0, sonSatir, sonSutun,
               { border: { mode: "all", style: "thin", color: "#9e9e9e" } });
    // Başlık satırı: renk + beyaz kalın
    aralikStil(r0, c0, r0, sonSutun,
               { bgcolor: sb.renk, color: "#ffffff", "font-bold": true });
    // Zebra
    for (var r = r0 + 2; r <= sonSatir; r += 2) {
      aralikStil(r, c0, r, sonSutun, { bgcolor: "#f4f6f4" });
    }
    s.reRender();
    degistiIsaretle();
    toast("✔ Şablon kuruldu! Başlıkların altına verileri gir. (Tutar sütunu için: iki hücreyi seç → İŞLEM → ÇARP)");
  };

  /* ---------- 📅 BUGÜNÜN TARİHİ ---------- */
  window.tarihEkle = function () {
    var t = new Date();
    hucreYaz(sel.sri, sel.sci, tarihYaz(t));
    s.reRender();
    degistiIsaretle();
    toast("✔ Bugünün tarihi " + hucreAdi(sel.sri, sel.sci) + " hücresine yazıldı");
  };

  /* ---------- ₺ PARA BİÇİMİ ---------- */
  window.paraBicimle = function () {
    var hedefler = [];
    if (ctrlSayisi() >= 1) {
      ctrlHucreleri().forEach(function (o) { hedefler.push([o.r, o.c]); });
    } else {
      for (var r = sel.sri; r <= sel.eri; r++)
        for (var c = sel.sci; c <= sel.eci; c++) hedefler.push([r, c]);
    }
    var yapilan = 0;
    hedefler.forEach(function (h) {
      var t = hucreDeger(h[0], h[1]);
      if (/₺/.test(String(t))) return;              // zaten paralı
      var v = sayiOku(t);
      if (v === null) return;
      hucreYaz(h[0], h[1], trSayi(v) + " ₺");
      aralikStil(h[0], h[1], h[0], h[1], { "font-bold": true, color: "#1a3d2b" });
      yapilan++;
    });
    ctrlTemizle();
    s.reRender();
    if (yapilan) {
      degistiIsaretle();
      toast("✔ " + yapilan + " hücre para biçimine çevrildi (₺). İŞLEM menüsü bunları da hesaplar!");
    } else {
      toast("Para biçimi için içinde sayı olan hücreleri seçin 👆");
    }
  };

  /* ---------- ARAMA ---------- */
  window.ara = function () {
    var q = document.getElementById("arakutu").value.trim().toLowerCase();
    if (!q) return;
    var veri = s.getData();
    var sonuclar = [];
    veri.forEach(function (sayfa) {
      var rows = (sayfa.rows) || {};
      Object.keys(rows).forEach(function (rk) {
        if (rk === "len") return;
        var cells = rows[rk].cells || {};
        Object.keys(cells).forEach(function (ck) {
          var t = cells[ck].text;
          if (t != null && String(t).toLowerCase().indexOf(q) !== -1) {
            sonuclar.push({ sayfa: sayfa.name, ri: +rk, ci: +ck, metin: String(t) });
          }
        });
      });
    });
    var kutu = document.getElementById("sonuclar");
    document.getElementById("sonucbaslik").textContent =
      "Arama: \"" + q + "\" (" + sonuclar.length + " sonuç)";
    kutu.innerHTML = "";
    if (!sonuclar.length) {
      kutu.innerHTML = "<div class='sonuc'>Hiçbir şey bulunamadı.</div>";
    }
    sonuclar.slice(0, 200).forEach(function (r) {
      var d = document.createElement("div");
      d.className = "sonuc";
      d.innerHTML = "<b>" + r.sayfa + " › " + hucreAdi(r.ri, r.ci) + "</b> — " +
        r.metin.substring(0, 60);
      d.onclick = function () {
        try { s.sheet.selector.set(r.ri, r.ci); s.reRender(); } catch (e) {}
        sel = { sri: r.ri, sci: r.ci, eri: r.ri, eci: r.ci };
        istatistikGuncelle();
      };
      kutu.appendChild(d);
    });
    document.getElementById("sonucpanel").style.display = "block";
  };
  window.panelKapat = function () {
    document.getElementById("sonucpanel").style.display = "none";
  };

  /* ---------- DOSYA İŞLEMLERİ (Python köprüsü) ---------- */
  function api() { return window.pywebview ? window.pywebview.api : null; }

  function degistiIsaretle() {
    degisti = true;
    var d = document.getElementById("dosyadurum");
    if (d.textContent.slice(-1) !== "*") d.textContent += " *";
  }
  s.change(function () { degistiIsaretle(); istatistikGuncelle(); });

  window.kaydet = function () {
    if (!api()) { toast("Kaydetme yalnızca masaüstü uygulamasında çalışır"); return; }
    api().kaydet(JSON.stringify(s.getData())).then(function (r) {
      if (r && r.ok) {
        degisti = false;
        document.getElementById("dosyadurum").textContent = "💾 " + r.ad + "  (yedeklendi)";
        toast("✔ Kaydedildi ve masaüstüne yedeklendi");
      } else if (r && r.mesaj) toast(r.mesaj);
    });
  };

  window.dosyaAc = function () {
    if (!api()) return;
    if (degisti && !confirm("Kaydedilmemiş değişiklikler var. Yine de başka dosya açılsın mı?")) return;
    api().ac().then(function (r) {
      if (r && r.ok) {
        s.loadData(JSON.parse(r.veri));
        degisti = false;
        document.getElementById("dosyadurum").textContent = "💾 " + r.ad;
        toast("✔ Dosya açıldı: " + r.ad);
      }
    });
  };

  window.csvAktar = function () {
    if (!api()) return;
    var veri = s.getData();
    var aktifAd = aktifData().name;
    var aktif = veri.filter(function (x) { return x.name === aktifAd; })[0] || veri[0];
    api().csv_aktar(JSON.stringify(aktif)).then(function (r) {
      if (r && r.ok) toast("✔ Excel dosyası masaüstüne kaydedildi: " + r.ad);
    });
  };

  window.yardim = function () {
    alert(
      "Σ SUMIX - NASIL KULLANILIR?\n\n" +
      "🖱 YAZMAK: Hücreye çift tıkla, yaz, Enter.\n\n" +
      "🖱 SÜRÜKLE-DOLDUR:\n" +
      "   Hücreye 1 yaz → sağ alt köşedeki YEŞİL KAREYİ tut,\n" +
      "   aşağı sürükle → 1,2,3... dolar. (12,5 → 13,5 → 14,5 de olur)\n\n" +
      "🧮 İŞLEM MENÜSÜ: Sayıları seç → İŞLEM → Topla/Çıkar/Çarp/Böl →\n" +
      "   sonucu yazmak istediğin hücreye tıkla. Yazılan şey gerçek\n" +
      "   FORMÜLDÜR: o hücreyi köşesinden aşağı sürüklersen her satır\n" +
      "   kendi verisiyle otomatik hesaplanır (Excel gibi!).\n" +
      "   Örn: C2'de =A2*B2 varken aşağı çek → C3'te =A3*B3 olur.\n" +
      "   Kaynak sayıları değiştirirsen sonuç da kendini günceller.\n\n" +
      "🎨 TABLO YAP: Alanı seç (başlık satırı dahil) → TABLO YAP →\n" +
      "   renk seç → kenarlıklı, başlığı boyalı hazır tablo!\n\n" +
      "🎨 YAZI & RENK: Araç çubuğunda yazı tipi, boyut, kalın,\n" +
      "   yazı rengi, dolgu rengi, kenarlık hepsi var.\n\n" +
      "🔗 DAĞINIK SEÇİM: Ctrl basılı tutup hücrelere tek tek tıkla\n" +
      "   (maviye boyanırlar) → İŞLEM menüsüyle hepsini hesapla.\n\n" +
      "₺ PARA: Sayı hücrelerini seç → ₺ PARA → 1.500,25 ₺ biçimi.\n\n" +
      "📅 TARİH SÜRÜKLEME: 01.05.2026 yaz → yeşil kareden aşağı çek →\n" +
      "   02.05, 03.05... İki tarih yazarsan aradaki farkla artar.\n" +
      "   Ayarlar'dan 'iş günleri' seçersen Cmt-Paz atlanır!\n\n" +
      "🔃 SIRALA/FİLTRELE: Sütunu seç → huni simgesi → A→Z / Z→A.\n\n" +
      "📑 SAYFALAR: Alttaki sekmeler = kategoriler. + ile yeni ekle.\n\n" +
      "💾 GÜVENLİK: Ctrl+S kaydet → masaüstüne otomatik yedek.\n" +
      "   Elektrik kesilirse açılışta kurtarma sorar.\n\n" +
      "↩ HATA: Ctrl+Z geri al."
    );
  };

  /* ---------- Toast bildirimi ---------- */
  var toastZaman = null;
  function toast(m) {
    var t = document.getElementById("toast");
    t.textContent = m;
    t.style.display = "block";
    clearTimeout(toastZaman);
    toastZaman = setTimeout(function () { t.style.display = "none"; }, 3200);
  }

  /* ---------- Kısayollar ---------- */
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault(); window.kaydet();
    }
    if (e.key === "Escape") {
      if (bekleyen) { bekleyen = null; toast("Sonuç yazma iptal edildi"); }
      if (ctrlSayisi()) { ctrlTemizle(); istatistikGuncelle(); }
    }
  });

  /* ---------- Otomatik kurtarma ---------- */
  setInterval(function () {
    if (degisti && api()) {
      api().oto_kaydet(JSON.stringify(s.getData()));
    }
  }, 60000);

  window.addEventListener("pywebviewready", function () {
    api().kurtarma_kontrol().then(function (r) {
      if (r && r.var) {
        if (confirm("Önceki oturumdan KAYDEDİLMEMİŞ bir çalışma bulundu.\nGeri yüklensin mi?")) {
          s.loadData(JSON.parse(r.veri));
          toast("✔ Önceki çalışman geri yüklendi");
        }
        api().kurtarma_sil();
      }
      api().baslangic_bilgi().then(function (b) {
        if (b && b.klasor)
          document.getElementById("dosyadurum").textContent = "Yeni dosya — 📁 " + b.klasor;
      });
    });
  });

  /* Pencere boyutu değişince tabloyu yeniden çiz */
  window.addEventListener("resize", function () { s.reRender(); });

  /* Başlangıç sayfa adları (kategoriler) */
  s.loadData([{ name: "Satışlar" }, { name: "Giderler" }, { name: "Borç-Alacak" }]);
}

/* Node.js test ortamı için dışa aç */
if (typeof module !== "undefined") {
  module.exports = { sayiOku: sayiOku, trSayi: trSayi, hucreAdi: hucreAdi,
                     tarihMi: tarihMi, tarihYaz: tarihYaz, tarihArti: tarihArti,
                     autofillTarihYamasi: autofillTarihYamasi };
}
