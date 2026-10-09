Kripto Toolkit - Tugas 2

Program ini berisi empat operasi dasar kriptografi dengan backend Python (Flask)
dan tampilan web.

Isi program:
- Operasi modulo
- Konversi huruf ke angka dan sebaliknya (A=0 sampai Z=25)
- Caesar Cipher dengan modulo
- XOR sederhana pada data biner

Struktur file:
- crypto_core.py   : logika inti keempat operasi, bisa dijalankan sendiri
- app.py           : backend Flask yang menyediakan API dan halaman web
- templates/       : halaman HTML
- static/          : CSS dan JavaScript
- requirements.txt : daftar dependensi

Cara menjalankan:
1. Pasang dependensi
   pip install -r requirements.txt
2. Jalankan server
   python app.py
3. Buka browser ke http://127.0.0.1:5000

Menguji logika inti tanpa web:
   python crypto_core.py
