# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════╗
║  SUMIX - Masaüstü Kabuğu                              ║
║  Gereken: pip install pywebview                               ║
║  .exe:    pyinstaller --onefile --noconsole                   ║
║           --add-data "web;web" --name Sumix main.py    ║
╚══════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import csv
import shutil
from datetime import datetime

try:
    import webview
except ImportError:
    print("Eksik kütüphane! Şunu çalıştırın:  pip install pywebview")
    sys.exit(1)

UYGULAMA = "Sumix"
UZANTI = ".sumix"


# ---------------------------------------------------------------
# KLASÖRLER (masaüstü)
# ---------------------------------------------------------------
def masaustu_yolu():
    if sys.platform == "win32":
        try:
            import winreg
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders")
            val, _ = winreg.QueryValueEx(key, "Desktop")
            yol = os.path.expandvars(val)
            if os.path.isdir(yol):
                return yol
        except Exception:
            pass
    ev = os.path.expanduser("~")
    for isim in ("Desktop", "Masaüstü"):
        yol = os.path.join(ev, isim)
        if os.path.isdir(yol):
            return yol
    return ev


ANA_KLASOR = os.path.join(masaustu_yolu(), "SumixDosyalari")
YEDEK_KLASOR = os.path.join(ANA_KLASOR, "Yedekler")
KURTARMA = os.path.join(ANA_KLASOR, "OtomatikKurtarma" + UZANTI)
os.makedirs(YEDEK_KLASOR, exist_ok=True)


def kaynak_yolu(gorece):
    """PyInstaller .exe içinde de, normal çalıştırmada da doğru yolu bulur."""
    taban = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(taban, gorece)


# ---------------------------------------------------------------
# JS <-> PYTHON KÖPRÜSÜ
# ---------------------------------------------------------------
class Api:
    def __init__(self):
        self.dosya_yolu = None

    def _pencere(self):
        return webview.windows[0]

    # ---------- Kaydet ----------
    def kaydet(self, veri_json):
        try:
            if not self.dosya_yolu:
                secim = self._pencere().create_file_dialog(
                    webview.SAVE_DIALOG, directory=ANA_KLASOR,
                    save_filename="Defterim" + UZANTI,
                    file_types=("Sumix Dosyası (*.sumix)",))
                if not secim:
                    return {"ok": False}
                self.dosya_yolu = secim if isinstance(secim, str) else secim[0]
                if not self.dosya_yolu.endswith(UZANTI):
                    self.dosya_yolu += UZANTI

            with open(self.dosya_yolu, "w", encoding="utf-8") as f:
                f.write(veri_json)

            # tarihli yedek (son 100 tutulur)
            zaman = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            ad = os.path.splitext(os.path.basename(self.dosya_yolu))[0]
            shutil.copy2(self.dosya_yolu,
                         os.path.join(YEDEK_KLASOR, f"{ad}_{zaman}{UZANTI}"))
            for eski in sorted(os.listdir(YEDEK_KLASOR))[:-100]:
                os.remove(os.path.join(YEDEK_KLASOR, eski))

            self._kurtarma_sil_sessiz()
            return {"ok": True, "ad": os.path.basename(self.dosya_yolu)}
        except Exception as e:
            return {"ok": False, "mesaj": f"Kaydedilemedi: {e}"}

    # ---------- Aç ----------
    def ac(self):
        try:
            secim = self._pencere().create_file_dialog(
                webview.OPEN_DIALOG, directory=ANA_KLASOR,
                file_types=("Sumix Dosyası (*.sumix)",))
            if not secim:
                return {"ok": False}
            yol = secim[0] if isinstance(secim, (list, tuple)) else secim
            with open(yol, "r", encoding="utf-8") as f:
                veri = f.read()
            json.loads(veri)  # bozuk dosya kontrolü
            self.dosya_yolu = yol
            return {"ok": True, "veri": veri, "ad": os.path.basename(yol)}
        except Exception as e:
            return {"ok": False, "mesaj": f"Dosya açılamadı: {e}"}

    # ---------- Excel'e aktar (CSV) ----------
    def csv_aktar(self, sayfa_json):
        try:
            sayfa = json.loads(sayfa_json)
            ad = sayfa.get("name", "Sayfa")
            rows = sayfa.get("rows", {}) or {}

            max_r, max_c = 0, 0
            for rk, rv in rows.items():
                if rk == "len" or not isinstance(rv, dict):
                    continue
                hucreler = rv.get("cells", {}) or {}
                if hucreler:
                    max_r = max(max_r, int(rk))
                    max_c = max(max_c, max(int(c) for c in hucreler))

            tablo = [["" for _ in range(max_c + 1)] for _ in range(max_r + 1)]
            for rk, rv in rows.items():
                if rk == "len" or not isinstance(rv, dict):
                    continue
                for ck, cv in (rv.get("cells", {}) or {}).items():
                    t = cv.get("text")
                    if t is not None:
                        tablo[int(rk)][int(ck)] = t

            zaman = datetime.now().strftime("%Y-%m-%d_%H-%M")
            yol = os.path.join(ANA_KLASOR, f"{ad}_{zaman}.csv")
            with open(yol, "w", newline="", encoding="utf-8-sig") as f:
                yazici = csv.writer(f, delimiter=";")
                for satir in tablo:
                    yazici.writerow(satir)
            return {"ok": True, "ad": os.path.basename(yol)}
        except Exception as e:
            return {"ok": False, "mesaj": f"Aktarılamadı: {e}"}

    # ---------- Otomatik kurtarma ----------
    def oto_kaydet(self, veri_json):
        try:
            with open(KURTARMA, "w", encoding="utf-8") as f:
                f.write(veri_json)
            return {"ok": True}
        except Exception:
            return {"ok": False}

    def kurtarma_kontrol(self):
        try:
            if os.path.exists(KURTARMA):
                with open(KURTARMA, "r", encoding="utf-8") as f:
                    return {"var": True, "veri": f.read()}
        except Exception:
            pass
        return {"var": False}

    def kurtarma_sil(self):
        self._kurtarma_sil_sessiz()
        return {"ok": True}

    def _kurtarma_sil_sessiz(self):
        try:
            if os.path.exists(KURTARMA):
                os.remove(KURTARMA)
        except Exception:
            pass

    def baslangic_bilgi(self):
        return {"klasor": ANA_KLASOR}


# ---------------------------------------------------------------
# BAŞLAT
# ---------------------------------------------------------------
if __name__ == "__main__":
    api = Api()
    webview.create_window(
        UYGULAMA,
        kaynak_yolu(os.path.join("web", "index.html")),
        js_api=api,
        width=1280, height=760, min_size=(980, 600))
    webview.start()
