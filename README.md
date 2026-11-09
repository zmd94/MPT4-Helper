# MPT4 Helper — Chrome Extension (Manifest V3)

Projek ini ialah permulaan kod sebenar yang boleh dimuatkan sebagai **unpacked extension** dalam Chrome. Ia belum mempunyai adapter khusus untuk laman peperiksaan kerana HTML/DOM sebenar belum diberikan. Oleh itu butang AUTOFILL sengaja dikunci; extension tidak mengubah sebarang markah sehingga pemetaan DOM disahkan.

## Keperluan
- Windows 10/11 dan Google Chrome terkini.
- Fail `.xlsx` atau `.csv` dengan header tepat mengikut profil.
- Google Sheets: akses Anyone with the link – Viewer; masukkan URL dan klik BACA GOOGLE SHEETS.

## Pasang untuk ujian
1. Ekstrak ZIP ke folder kekal, contohnya `C:\MPT4-Helper`.
2. Buka `chrome://extensions`.
3. Hidupkan **Developer mode**.
4. Klik **Load unpacked** dan pilih folder `mpt4-helper` (folder yang mengandungi `manifest.json`).
5. Buka tab laman peperiksaan yang telah dilog masuk.
6. Klik ikon MPT4 Helper, pilih subjek, pilih fail XLSX, kemudian klik **MULA MENGISI**.
7. Panel terapung akan muncul. Semak preview dan status DOM.

## Header fail
- Semua subjek: `Student ID`, `Student Name` diikuti nama komponen yang tepat.
- 041 BM: `Bahagian A`, `Bahagian B`, `Bahagian C`, `Bahagian D`.
- 043 BI: `Part 1` hingga `Part 6`.
- 045 Matematik: `Bahagian A (Soalan 1-6)`, `Bahagian A (Soalan 7)`, `Bahagian A (Soalan 8-12)`, `Bahagian A (Soalan 13)`, `Bahagian B (Soalan 14-15)` — profil sementara menunggu pengesahan DOM penuh.
- 048 Sains: `Bahagian A`, `Bahagian B`, `Bahagian C`.

## Had versi ini
- XLSX reader tempatan menyokong format `.xlsx` ZIP/DEFLATE biasa. `.xls` lama belum disokong.
- Google Sheets import menggunakan CSV export awam; fail peribadi/terhad akan ditolak.
- Tiada fungsi Simpan/Submit dan tiada panggilan API untuk menyimpan markah.

## Ujian unit
Dengan Node.js 18+:
```bash
node --experimental-default-type=module --test tests/validation.test.mjs
```
