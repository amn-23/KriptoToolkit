"""
crypto_core.py
==============
Modul inti berisi 4 operasi dasar kriptografi:

01. Operasi modulo
02. Konversi huruf <-> angka (A=0 ... Z=25)
03. Caesar Cipher dengan modulo
04. XOR sederhana pada data biner

Semua fungsi di sini murni Python (tanpa dependensi eksternal) sehingga
mudah dites dan dipakai ulang oleh backend web maupun skrip lain.
"""

from __future__ import annotations


# ===========================================================================
# 01. OPERASI MODULO
# ===========================================================================
def modulo(a: int, m: int) -> int:
    """
    Mengembalikan a mod m dengan hasil selalu non-negatif (0 .. m-1).

    Berbeda dengan operator % bawaan Python pada beberapa bahasa lain,
    fungsi ini menjamin hasil berada di rentang [0, m) walaupun a negatif.

    Contoh:
        modulo(10, 3)  -> 1
        modulo(-1, 26) -> 25
    """
    if m == 0:
        raise ValueError("Modulus (m) tidak boleh 0.")
    return a % m  # Python sudah mengembalikan hasil bertanda sama dengan m


# ===========================================================================
# 02. KONVERSI HURUF <-> ANGKA  (A=0 ... Z=25)
# ===========================================================================
def char_to_num(ch: str) -> int:
    """
    Mengubah satu huruf A-Z (atau a-z) menjadi angka 0-25.

    Contoh:
        char_to_num('A') -> 0
        char_to_num('z') -> 25
    """
    if len(ch) != 1 or not ch.isalpha():
        raise ValueError(f"Input '{ch}' harus berupa satu huruf A-Z.")
    return ord(ch.upper()) - ord("A")


def num_to_char(n: int) -> str:
    """
    Mengubah angka 0-25 menjadi huruf kapital A-Z.
    Angka di luar rentang akan di-modulo 26 terlebih dahulu.

    Contoh:
        num_to_char(0)  -> 'A'
        num_to_char(25) -> 'Z'
        num_to_char(26) -> 'A'
    """
    return chr(modulo(n, 26) + ord("A"))


def text_to_nums(text: str) -> list[int]:
    """Mengubah seluruh huruf pada teks menjadi daftar angka (huruf lain diabaikan)."""
    return [char_to_num(c) for c in text if c.isalpha()]


def nums_to_text(nums: list[int]) -> str:
    """Mengubah daftar angka menjadi string huruf kapital."""
    return "".join(num_to_char(n) for n in nums)


# ===========================================================================
# 03. CAESAR CIPHER DENGAN MODULO
# ===========================================================================
def caesar_encrypt(plaintext: str, shift: int) -> str:
    """
    Enkripsi Caesar Cipher: setiap huruf digeser sebanyak `shift`,
    menggunakan rumus C = (P + shift) mod 26.

    - Hanya huruf A-Z / a-z yang dienkripsi.
    - Karakter non-huruf (spasi, angka, tanda baca) dibiarkan apa adanya.
    - Huruf kapital/kecil dipertahankan (case preserved).
    """
    result = []
    for ch in plaintext:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            p = ord(ch) - base
            c = modulo(p + shift, 26)
            result.append(chr(c + base))
        else:
            result.append(ch)
    return "".join(result)


def caesar_decrypt(ciphertext: str, shift: int) -> str:
    """
    Dekripsi Caesar Cipher: P = (C - shift) mod 26.
    Cukup memanggil enkripsi dengan pergeseran negatif.
    """
    return caesar_encrypt(ciphertext, -shift)


# ===========================================================================
# 04. XOR SEDERHANA PADA DATA BINER
# ===========================================================================
def xor_bytes(data: bytes, key: bytes) -> bytes:
    """
    XOR byte-per-byte antara `data` dan `key`.
    Jika key lebih pendek dari data, key diulang (repeating-key XOR).

    XOR bersifat simetris: mengaplikasikan fungsi yang sama dua kali
    dengan key yang sama akan mengembalikan data semula.
    """
    if not key:
        raise ValueError("Key tidak boleh kosong.")
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def xor_text(text: str, key: str) -> bytes:
    """XOR pada teks (di-encode UTF-8) menggunakan key teks. Hasil berupa bytes."""
    return xor_bytes(text.encode("utf-8"), key.encode("utf-8"))


def bytes_to_bits(data: bytes) -> str:
    """Representasi string biner, mis. b'A' -> '01000001'."""
    return " ".join(format(b, "08b") for b in data)


def bytes_to_hex(data: bytes) -> str:
    """Representasi string heksadesimal, mis. b'A' -> '41'."""
    return data.hex()


# ===========================================================================
# Demo mandiri bila dijalankan langsung: python crypto_core.py
# ===========================================================================
if __name__ == "__main__":
    print("== 01 Modulo ==")
    print("10 mod 3  =", modulo(10, 3))
    print("-1 mod 26 =", modulo(-1, 26))

    print("\n== 02 Huruf <-> Angka ==")
    print("A ->", char_to_num("A"), "| Z ->", char_to_num("Z"))
    print("0 ->", num_to_char(0), "| 25 ->", num_to_char(25))

    print("\n== 03 Caesar Cipher ==")
    teks = "Hello, World!"
    enc = caesar_encrypt(teks, 3)
    print("Plaintext :", teks)
    print("Encrypt(3):", enc)
    print("Decrypt(3):", caesar_decrypt(enc, 3))

    print("\n== 04 XOR Biner ==")
    hasil = xor_text("SECRET", "key")
    print("XOR hex   :", bytes_to_hex(hasil))
    print("XOR bits  :", bytes_to_bits(hasil))
    print("Kembali   :", xor_bytes(hasil, b"key").decode("utf-8"))
