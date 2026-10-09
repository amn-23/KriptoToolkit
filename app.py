"""
app.py
======
Backend Flask yang mengekspos 4 operasi dari crypto_core.py sebagai REST API,
sekaligus menyajikan halaman frontend (templates/index.html).

Jalankan:
    pip install -r requirements.txt
    python app.py
Lalu buka http://127.0.0.1:5000
"""

from __future__ import annotations

from flask import Flask, jsonify, render_template, request

import crypto_core as cc

app = Flask(__name__)


# --------------------------------------------------------------------------
# Halaman utama
# --------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# --------------------------------------------------------------------------
# Helper: ambil JSON body dengan aman
# --------------------------------------------------------------------------
def _body() -> dict:
    return request.get_json(silent=True) or {}


# --------------------------------------------------------------------------
# 01. Modulo
# --------------------------------------------------------------------------
@app.post("/api/modulo")
def api_modulo():
    data = _body()
    try:
        a = int(data.get("a"))
        m = int(data.get("m"))
        return jsonify(ok=True, result=cc.modulo(a, m))
    except (TypeError, ValueError) as e:
        return jsonify(ok=False, error=f"Input tidak valid: {e}"), 400


# --------------------------------------------------------------------------
# 02. Huruf <-> Angka
# --------------------------------------------------------------------------
@app.post("/api/convert")
def api_convert():
    data = _body()
    mode = data.get("mode", "char2num")
    try:
        if mode == "char2num":
            text = str(data.get("text", ""))
            pairs = [{"char": c.upper(), "num": cc.char_to_num(c)}
                     for c in text if c.isalpha()]
            return jsonify(ok=True, result=pairs)
        elif mode == "num2char":
            raw = str(data.get("text", ""))
            nums = [int(x) for x in raw.replace(",", " ").split()]
            pairs = [{"num": n, "char": cc.num_to_char(n)} for n in nums]
            return jsonify(ok=True, result=pairs, text=cc.nums_to_text(nums))
        else:
            return jsonify(ok=False, error="mode tidak dikenal"), 400
    except (TypeError, ValueError) as e:
        return jsonify(ok=False, error=f"Input tidak valid: {e}"), 400


# --------------------------------------------------------------------------
# 03. Caesar Cipher
# --------------------------------------------------------------------------
@app.post("/api/caesar")
def api_caesar():
    data = _body()
    try:
        text = str(data.get("text", ""))
        shift = int(data.get("shift", 0))
        mode = data.get("mode", "encrypt")
        if mode == "encrypt":
            result = cc.caesar_encrypt(text, shift)
        elif mode == "decrypt":
            result = cc.caesar_decrypt(text, shift)
        else:
            return jsonify(ok=False, error="mode tidak dikenal"), 400
        return jsonify(ok=True, result=result)
    except (TypeError, ValueError) as e:
        return jsonify(ok=False, error=f"Input tidak valid: {e}"), 400


# --------------------------------------------------------------------------
# 04. XOR Biner
# --------------------------------------------------------------------------
@app.post("/api/xor")
def api_xor():
    data = _body()
    try:
        text = str(data.get("text", ""))
        key = str(data.get("key", ""))
        mode = data.get("mode", "encrypt")

        if mode == "encrypt":
            # Teks biasa -> XOR -> tampilkan hex & bits
            result = cc.xor_text(text, key)
            return jsonify(
                ok=True,
                hex=cc.bytes_to_hex(result),
                bits=cc.bytes_to_bits(result),
            )
        elif mode == "decrypt":
            # Input berupa hex -> XOR -> teks asli
            raw = bytes.fromhex(text.replace(" ", ""))
            result = cc.xor_bytes(raw, key.encode("utf-8"))
            try:
                decoded = result.decode("utf-8")
            except UnicodeDecodeError:
                decoded = result.decode("utf-8", errors="replace")
            return jsonify(
                ok=True,
                text=decoded,
                hex=cc.bytes_to_hex(result),
                bits=cc.bytes_to_bits(result),
            )
        else:
            return jsonify(ok=False, error="mode tidak dikenal"), 400
    except (TypeError, ValueError) as e:
        return jsonify(ok=False, error=f"Input tidak valid: {e}"), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
