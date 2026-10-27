# Kasir Restoran — Rasa Jawa

Pembaruan: fitur pesanan takeaway, login admin berbasis sesi PHP, landing page animasi bertema Jawa modern, dan pencatatan transaksi/pendapatan ke database MySQL.

## Cara menjalankan di XAMPP
1. Ekstrak folder `kasir-restoran` ke `C:\xampp\htdocs\kasir-restoran`.
2. Jalankan Apache dan MySQL melalui XAMPP Control Panel.
3. Buka `http://localhost/phpmyadmin`, lalu impor file `database.sql`.
4. Periksa `config.php`; konfigurasi default memakai MySQL `root` tanpa password. Sesuaikan jika server Anda berbeda.
5. Buka `http://localhost/kasir-restoran/setup-admin.php` untuk membuat admin awal.
6. Login melalui `http://localhost/kasir-restoran/login.php`. Akun awal: username `admin`, password `Admin123!`.
7. Segera ganti password awal melalui pengelolaan admin di database, lalu hapus `setup-admin.php` sebelum dipublikasikan.

## Fitur
- Landing page responsif dengan animasi scroll dan ilustrasi wayang.
- Login/logout admin menggunakan PHP session dan password hash.
- Pesanan meja dan pesanan takeaway.
- Kelola menu, diskon, pembayaran, struk cetak/PDF.
- Pendapatan dan transaksi disimpan ke MySQL; data menu/pesanan aktif masih disimpan di localStorage browser.

## Catatan penting
- Jalankan melalui Apache/PHP, bukan membuka file langsung dengan `file://`.
- Database menyimpan transaksi yang diselesaikan setelah login. Data penjualan lama yang hanya ada di localStorage tidak otomatis dipindahkan ke database.
- Untuk produksi, gunakan password admin kuat, kredensial database khusus (bukan root), HTTPS, dan hapus `setup-admin.php`.
