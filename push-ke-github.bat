@echo off
echo Mengumpulkan perubahan terbaru...
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Update dari pengguna"
echo.
echo Mengunggah kode ke GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin main --force
echo.
echo Jika berhasil, silakan tutup jendela ini.
pause
