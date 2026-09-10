@echo off
title Aplikasi SPK SAW Platform Digital
echo Menyiapkan Aplikasi SPK Platform Digital...
echo Memperbarui konfigurasi database lokal...
call npx prisma generate

echo.
echo Mengaktifkan server lokal (Next.js)...
echo Browser akan terbuka secara otomatis dalam beberapa detik.
echo JANGAN MENUTUP JENDELA HITAM INI selama Anda masih menggunakan aplikasinya.
echo.

:: Membuka browser ke localhost:3000
start http://localhost:3000

:: Menjalankan server aplikasi
npm run dev

pause
