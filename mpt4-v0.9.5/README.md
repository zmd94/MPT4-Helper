# MPT4 Helper — Chrome Extension (Manifest V3)

Versi asas 0.1.1. Projek ini ialah permulaan kod sebenar yang boleh dimuatkan sebagai **unpacked extension** dalam Chrome. Ia belum mempunyai adapter khusus untuk laman peperiksaan kerana HTML/DOM sebenar belum diberikan. Oleh itu butang AUTOFILL sengaja dikunci; extension tidak mengubah sebarang markah sehingga pemetaan DOM disahkan.

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
6. Klik ikon MPT4 Helper, pilih subjek, pilih fail XLSX/CSV, kemudian klik **AKTIFKAN MPT4 HELPER**.
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
- Import awal menyemak kewujudan header tepat; pemetaan manual dan pengesanan subject mismatch penuh belum siap.
- Tiada auto-fill dilaksanakan lagi. DOM laman sebenar perlu diperiksa dahulu. Jangan gunakan sebarang kod yang mengisi medan berdasarkan tekaan.
- Tiada fungsi Simpan/Submit dan tiada panggilan API untuk menyimpan markah.

## Ujian unit
Dengan Node.js 18+:
```bash
node --experimental-default-type=module --test tests/validation.test.mjs
```

## Privasi dan keselamatan
Fail markah diproses di pelayar dan disimpan sementara dalam `chrome.storage.session`. Tiada analitik, server aplikasi, OAuth, API key, kata laluan, atau pembacaan cookies. Kebenaran `activeTab` dan `scripting` digunakan untuk panel pada tab yang dipilih sahaja. Kebenaran host Google Sheets dihadkan kepada `https://docs.google.com/*` untuk pembacaan yang akan diaktifkan dalam fasa seterusnya.


## Integrasi halaman SBPPA (v0.1.1)

Extension ini mengehadkan pengaktifan kepada `https://mpt4-sbppa.moe.gov.my/marks/marks-entry`. Pengguna mesti log masuk sendiri pada portal dan membuka halaman tersebut. Extension tidak meminta kata laluan atau menekan butang simpan.

**Penting:** Adapter DOM khusus dan autofill masih dikunci sehingga struktur DOM sebenar selepas log masuk disemak. URL sahaja tidak mencukupi untuk mengenal pasti input markah dengan selamat.


## Sample data / template (v0.2.0)

Popup extension menyediakan tiga pilihan muat turun:
- Template Excel (.xlsx) mengikut mata pelajaran yang dipilih.
- Template CSV mengikut mata pelajaran yang dipilih.
- Satu workbook Excel gabungan untuk keempat-empat mata pelajaran.

Setiap fail khusus Excel mengandungi helaian `DATA MARKAH` dan `PANDUAN`. Workbook gabungan mengandungi satu helaian data bagi setiap subjek dan helaian `PANDUAN`. Header dalam template dijana terus daripada profil subjek extension. Rekod contoh adalah rekaan; padam sebelum import data sebenar.

Nota: profil Matematik masih provisional dan perlu disahkan selepas semua komponen pada portal SBPPA diperiksa.

## Auto Page Scanner v0.3.0

Panel overlay kini menjalankan imbasan diagnostik DOM apabila diaktifkan dan apabila pengguna menekan **IMBAS SEMULA**. Ia memeriksa jadual, header, baris dan medan input boleh sunting; membandingkan header komponen dengan profil mata pelajaran; dan memaparkan bilangan input calon serta komponen yang belum ditemui.

Scanner ini bersifat baca-sahaja. Ia tidak mengisi sebarang medan. Butang MULA AUTOFILL kekal dikunci sehingga DOM portal SBPPA sebenar dapat disahkan dan adapter khusus dilaksanakan. Heuristik berdasarkan header bukan bukti muktamad identiti medan, khususnya jika portal menggunakan nested table, virtualized rows atau header berbilang tingkat.


## Fix activation and scan button (v0.5.3)

Membaiki penghantaran data sesi daripada popup kepada content script melalui mesej `MPT4_ACTIVATE`, supaya content script tidak bergantung pada akses `chrome.storage.session` daripada isolated content-script context. Popup tidak lagi memanggil `window.close()` secara manual selepas aktivasi. Panel overlay mempunyai butang jelas **IMBAS HALAMAN**; selepas imbasan pertama label bertukar kepada **IMBAS SEMULA**.

Nota: Chrome lazimnya menutup popup extension apabila interaksi beralih ke tab; hasil yang sepatutnya dilihat ialah panel terapung di atas halaman SBPPA, bukan popup extension.


Versi 0.5.3: Mengemas kini domain portal pengisian markah kepada `https://mpt4-sbppa.moe.gov.my/marks/marks-entry` dalam pengesahan URL dan host permissions.


## v0.5.3 — pengimbas berasaskan rekod TR
- Menggunakan satu elemen `TR` sebagai satu rekod murid.
- Membaca No. IC daripada `TD` identiti (`span`) dan menggunakannya sebagai kunci padanan.
- Mengira `input[type="text"]` dalam sel markah bagi setiap rekod.
- Mengesahkan bilangan input berdasarkan profil subjek: BM 4, BI 6, Matematik 5, Sains 3.
- Profil Matematik kini ditandakan disahkan berdasarkan pengesahan pengguna.
- Versi ini masih diagnostik sahaja; butang autofill kekal dikunci sehingga pengesahan akhir event input dan susunan komponen.


## v0.5.3
- Memperkemas pengiraan kotak markah: semua input boleh edit dalam satu rekod `TR` dikira, bukan hanya input daripada `TD` pertama.
- Menyimpan nilai semasa setiap kotak dalam data diagnostik untuk membolehkan langkah seterusnya mengelakkan overwrite.
- Susunan input dianggap mengikut susunan komponen yang dipaparkan, berdasarkan pengesahan pengguna.
- Autofill masih dikunci. Adapter React/MUI belum diuji secara langsung pada portal SBPPA sebenar; tiada markah diubah dalam versi ini.

\n## v0.5.3
- Membetulkan imbasan input: semua input boleh edit dalam rekod murid dikumpulkan merentasi semua TD selain TD identiti.
- Membaca label komponen daripada wrapper input sebenar dan had daripada `MuiInputAdornment`.
- Membandingkan label serta had yang dikesan dengan profil subjek sebelum rekod dianggap disahkan.
- Memaparkan nilai semasa setiap input untuk semakan dan perlindungan overwrite pada peringkat seterusnya.
- Autofill masih dikunci sementara adapter React/MUI diuji secara terkawal.

\n## v0.5.3
- Membetulkan imbasan komponen yang belum dimasukkan ke dalam kod v0.5.1.
- Mengumpulkan semua input boleh edit merentasi rekod `TR` selain TD identiti.
- Membaca label komponen daripada wrapper MUI dan had markah daripada adornment.
- Melaporkan bilangan rekod yang label dan had komponen sepadan dengan profil subjek.
- Autofill masih dikunci; adapter React/MUI belum diuji untuk mengubah nilai.


## v0.5.3
- Imbas semua input markah merentasi TD dalam TR murid.
- Baca label komponen dan had markah setiap input; laporkan LABEL + HAD OK.
- ZIP mempunyai folder akar `mpt4-v0.5.3`.
- Autofill masih dikunci sehingga adapter React/MUI diuji pada portal sebenar.


## v0.5.4 — ringkaskan popup dan pemilihan worksheet
- Bahagian MUAT TURUN SAMPLE DATA hanya memaparkan butang TEMPLATE EXCEL mengikut subjek yang dipilih.
- Pilihan template CSV dan workbook gabungan dibuang, termasuk fail sample berkaitan. Import fail CSV masih disokong.
- Worksheet pertama dalam fail Excel dipilih secara automatik; kawalan pilihan worksheet dibuang.
- Untuk Google Sheets, extension membaca worksheet pertama secara automatik dan mengabaikan parameter `gid` dalam URL.


## Versi 0.5.5 — ujian adapter React/MUI
- Menambah ujian adapter diagnostik untuk satu textbox sahaja pada rekod yang mempunyai padanan No. IC, label dan had markah yang disahkan.
- Ujian menggunakan native input value setter serta event `input` dan `change`, kemudian memulihkan dan mengesahkan nilai asal selepas React/MUI mengemas kini paparan.
- Ujian memerlukan pengesahan pengguna, tidak menekan SIMPAN dan tidak membuka fungsi autofill. Jika pemulihan tidak dapat disahkan, extension memberi amaran supaya pengguna tidak menyimpan.


## Versi 0.6.0 — Autofill terkawal seorang murid

- Mengaktifkan ujian Autofill untuk seorang murid pertama daripada fail sumber (versi ujian ini mensyaratkan tepat 3 rekod sumber).
- Memerlukan padanan No. IC unik, nama yang sepadan, struktur 32 rekod portal, label dan had markah komponen yang disahkan.
- Hanya medan kosong diisi. Medan yang sudah mempunyai nilai tidak ditimpa.
- Nilai markah disahkan mengikut profil subjek; integer dalam julat komponen atau huruf besar `T`. Nilai kosong tidak diisi.
- Setiap perubahan disahkan selepas event React/MUI. Jika proses gagal atau dibatalkan, medan yang telah diubah dalam sesi itu cuba dipulihkan kepada nilai asal.
- Hanya seorang murid pertama diuji; extension tidak mengisi murid seterusnya secara automatik.
- Tiada klik SIMPAN atau penghantaran markah. Guru mesti menyemak portal dan menyimpan secara manual.


## v0.6.1
- Fixed case-insensitive mapping between normalized component labels and Excel column headers (e.g. `bahagian a` to `Bahagian A`).
- Added a source-value count to the one-student Autofill log and confirmation.
- Autofill still targets one student, fills only empty portal fields, and never clicks Save.


## v0.7.0 — kemas kini aliran aktivasi
- Bahagian MUAT TURUN SAMPLE DATA disembunyikan sehingga pengguna memilih mata pelajaran.
- Butang BACA GOOGLE SHEETS dibuang. Jika URL Google Sheets diisi, data worksheet pertama dibaca secara automatik apabila AKTIFKAN ditekan.
- URL Google Sheets disahkan sebelum permintaan; worksheet pertama dieksport tanpa parameter `gid`. Helaian perlu boleh dibaca melalui perkongsian Viewer yang sesuai.
- Jika URL Google Sheets tidak diisi, fail Excel/CSV yang dipilih digunakan seperti biasa.
- Header sumber dipadankan tanpa mengira huruf besar/kecil dan data dipetakan kepada nama header standard sebelum dihantar ke panel.
- Butang AKTIFKAN disembunyikan selepas panel terapung berjaya dibuka.
- Tiada perubahan kepada had Autofill seorang murid dan tiada SIMPAN automatik.


## v0.8.0
- Menutup keseluruhan tetingkap tetapan extension secara automatik selepas panel terapung berjaya dibuka pada halaman SBPPA.
- Menambah AUTOFILL SEMUA MURID: semua rekod sumber diperiksa dahulu (No. IC unik, nama, bilangan input, label, susunan dan had markah) sebelum sebarang perubahan dibuat.
- Hanya medan portal kosong diisi; markah sedia ada dikekalkan dan sel sumber kosong dilangkau.
- Pengisian berlaku satu demi satu dengan pengesahan React/MUI selepas setiap medan. Jika berlaku ralat atau pembatalan, extension cuba memulihkan semua perubahan dalam sesi tersebut.
- Tiada SIMPAN automatik. Semak semua markah dan simpan secara manual.

> **Nota keluaran terkini v0.8.0:** Nota versi terdahulu di atas menerangkan tingkah laku versi lama. Dalam v0.8.0, Autofill memproses semua rekod murid dalam fail sumber (bukan semua murid portal secara automatik), selepas semua rekod sumber lulus semakan pra-pengisian. Lihat bahagian `v0.8.0` di bawah untuk tingkah laku semasa.


## v0.9.0 — ringkaskan panel dan kosongkan sesi
- Butang **UJI ADAPTER** dikeluarkan daripada panel utama; adapter React/MUI kekal digunakan oleh Autofill.
- Panel utama diringkaskan kepada **IMBAS HALAMAN**, **AUTOFILL SEMUA MURID**, **BATAL**, dan **KOSONGKAN SESI**.
- Ringkasan selepas Autofill memaparkan bilangan murid diproses, medan diisi/disahkan, medan sedia ada dikekalkan dan sel sumber kosong dilangkau.
- **KOSONGKAN SESI** tidak dibenarkan semasa Autofill sedang berjalan. Pengguna perlu BATAL dan menunggu proses pemulihan selesai.
- Selepas sesi dikosongkan, extension cuba membuka semula popup tetapan awal melalui `chrome.action.openPopup()` (Chrome 127+). Jika Chrome tidak membenarkan pembukaan automatik, panel memaparkan arahan untuk klik ikon extension.
- Tiada tindakan SIMPAN automatik; markah yang telah diisi pada portal tidak dipadam oleh KOSONGKAN SESI.


## Versi 0.9.1 — kemas kini teks antaramuka sahaja
- Label mata pelajaran dan tajuk dikemas kini mengikut arahan.
- Bahagian Import Data memaparkan input Excel dan URL Google Sheets dalam dua kolum.
- Butang pengaktifan dilabel semula kepada MULA MENGISI.
- Tiada perubahan pada kod fungsi, logik import, imbasan, Autofill atau keselamatan.


## Versi 0.9.2 — kemas kini paparan sahaja
- Bahagian Import Data kini terus berada pada latar utama tanpa kotak berasingan.
- Input Excel dan URL Google Sheets dipaparkan pada baris berasingan.
- Label Sample Data dan butang MUAT TURUN dikemas kini.
- Teks penerangan template yang diminta telah dibuang.
- Tiada perubahan pada kod fungsi extension.


## Versi 0.9.3 — kemas kini label sahaja
- Pilihan subjek 045 dipaparkan sebagai `045 · Matematik`.
- Tajuk `Sample Data` ditukar kepada `Contoh Data`.
- Tiada perubahan pada kod fungsi.
