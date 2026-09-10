@echo off
echo ========================================================
echo   Memulai Setup Aplikasi SPK SAW Platform Digital
echo ========================================================
echo.

REM Memeriksa apakah node_modules sudah ada, jika belum jalankan instalasi
IF NOT EXIST "node_modules\" (
    echo [1/3] Menginstal dependencies (Mohon tunggu sebentar)...
    call npm install
) ELSE (
    echo [1/3] Dependencies sudah terinstal. Melewati proses install...
)

echo.
echo [2/3] Menyiapkan Database SQLite...
call npx prisma db push

echo.
echo [3/3] Menjalankan Server Web...
echo Buka browser Anda di: http://localhost:3000
echo Tekan CTRL+C untuk menghentikan server.
echo.
call npm run dev
