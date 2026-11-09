# Privasi dan keselamatan MPT4 Helper

- Semua pemprosesan fail Excel/CSV dan data markah dilakukan secara setempat dalam pelayar.
- Google Sheets dibaca melalui pautan eksport CSV dalam service worker extension. Pengguna perlu menetapkan perkongsian `Anyone with the link – Viewer`.
- Data markah tidak dihantar ke pelayan pihak ketiga atau disimpan di luar sesi extension.
- Extension hanya berfungsi pada halaman kemasukan markah SBPPA yang dinyatakan dalam manifest.
- Autofill memadankan No. IC secara unik, mengesahkan nama, bilangan input, label komponen dan had markah sebelum mengisi.
- Autofill hanya mengisi medan portal yang kosong. Markah sedia ada dikekalkan; sel sumber kosong dilangkau.
- Semua murid yang terdapat dalam fail sumber diproses satu demi satu. Jika berlaku ralat atau pembatalan, extension cuba memulihkan perubahan yang dibuat dalam sesi Autofill tersebut.
- Extension tidak menekan butang SIMPAN atau menghantar borang. Guru mesti menyemak semua markah dan menyimpan secara manual.
