@echo off
echo Sumix .exe olusturuluyor...
pip install pywebview pyinstaller
pyinstaller --onefile --noconsole --add-data "web;web" --name Sumix main.py
echo.
echo BITTI! dist klasorundeki Sumix.exe hazir.
pause
