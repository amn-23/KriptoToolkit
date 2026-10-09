// =========================================================================
// crypto.js
// Versi JavaScript murni (tanpa backend) agar bisa jalan di GitHub Pages.
// Berisi 4 operasi: modulo, huruf<->angka, Caesar Cipher, XOR biner,
// plus logika tampilan (tab dan segmented control).
// =========================================================================

// -------------------------------------------------------------------------
// 01. OPERASI MODULO
// Hasil selalu non-negatif (0 .. m-1), termasuk untuk a negatif.
// -------------------------------------------------------------------------
function modulo(a, m) {
  if (m === 0) throw new Error("Modulus (m) tidak boleh 0.");
  return ((a % m) + m) % m;
}

// -------------------------------------------------------------------------
// 02. HURUF <-> ANGKA (A=0 ... Z=25)
// -------------------------------------------------------------------------
function charToNum(ch) {
  if (ch.length !== 1 || !/[a-z]/i.test(ch))
    throw new Error(`Input '${ch}' harus berupa satu huruf A-Z.`);
  return ch.toUpperCase().charCodeAt(0) - 65; // 'A' = 65
}

function numToChar(n) {
  return String.fromCharCode(modulo(n, 26) + 65);
}

// -------------------------------------------------------------------------
// 03. CAESAR CIPHER  (C = (P + shift) mod 26)
// Hanya huruf yang digeser; non-huruf dibiarkan; kapital/kecil dipertahankan.
// -------------------------------------------------------------------------
function caesarEncrypt(plaintext, shift) {
  let out = "";
  for (const ch of plaintext) {
    if (/[a-z]/i.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const p = ch.charCodeAt(0) - base;
      out += String.fromCharCode(modulo(p + shift, 26) + base);
    } else {
      out += ch;
    }
  }
  return out;
}

function caesarDecrypt(ciphertext, shift) {
  return caesarEncrypt(ciphertext, -shift);
}

// -------------------------------------------------------------------------
// 04. XOR BINER (repeating-key)
// -------------------------------------------------------------------------
function xorBytes(data, key) {
  if (key.length === 0) throw new Error("Key tidak boleh kosong.");
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i % key.length];
  return out;
}

function textToBytes(text) {
  return new TextEncoder().encode(text); // UTF-8
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesToBits(bytes) {
  return Array.from(bytes, (b) => b.toString(2).padStart(8, "0")).join(" ");
}

function hexToBytes(hex) {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0) throw new Error("Panjang hex harus genap.");
  if (!/^[0-9a-f]*$/i.test(clean)) throw new Error("Hex hanya boleh 0-9 dan a-f.");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

// =========================================================================
// LOGIKA TAMPILAN
// =========================================================================

// Navigasi tab
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Segmented control
const modeState = { conv: "char2num", caesar: "encrypt", xor: "encrypt" };
document.querySelectorAll(".seg").forEach((seg) => {
  seg.addEventListener("click", () => {
    const group = seg.dataset.group;
    document
      .querySelectorAll(`.seg[data-group="${group}"]`)
      .forEach((s) => s.classList.remove("active"));
    seg.classList.add("active");
    modeState[group] = seg.dataset.mode;

    if (group === "xor") {
      document.getElementById("xor-label").textContent =
        seg.dataset.mode === "decrypt" ? "Hex (hasil enkripsi)" : "Teks";
    }
  });
});

function showError(elId, msg) {
  document.getElementById(elId).innerHTML =
    `<div class="inner"><span class="error">⚠ ${msg}</span></div>`;
}

function row(label, value, cls = "mono") {
  return `<div class="result-row"><div class="result-label">${label}</div><div class="${cls}">${value}</div></div>`;
}

// -------- 01 Modulo --------
function runModulo() {
  try {
    const a = parseInt(document.getElementById("mod-a").value, 10);
    const m = parseInt(document.getElementById("mod-m").value, 10);
    if (Number.isNaN(a) || Number.isNaN(m)) throw new Error("a dan m harus angka.");
    const res = modulo(a, m);
    document.getElementById("mod-out").innerHTML =
      `<div class="inner">${row(`${a} mod ${m} =`, res, "result-big")}</div>`;
  } catch (e) {
    showError("mod-out", e.message);
  }
}

// -------- 02 Convert --------
function runConvert() {
  try {
    const text = document.getElementById("conv-text").value;
    const mode = modeState.conv;
    let chips = "";
    let extra = "";

    if (mode === "char2num") {
      const letters = [...text].filter((c) => /[a-z]/i.test(c));
      chips = letters
        .map((c) => `<span class="chip">${c.toUpperCase()} = <b>${charToNum(c)}</b></span>`)
        .join("");
    } else {
      const nums = text
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter((x) => x.length)
        .map((x) => {
          const n = parseInt(x, 10);
          if (Number.isNaN(n)) throw new Error(`'${x}' bukan angka.`);
          return n;
        });
      chips = nums.map((n) => `<span class="chip">${n} = <b>${numToChar(n)}</b></span>`).join("");
      const joined = nums.map((n) => numToChar(n)).join("");
      extra = row("Gabungan huruf", joined, "result-big");
    }

    document.getElementById("conv-out").innerHTML =
      `<div class="inner"><div class="chips">${chips}</div>${extra}</div>`;
  } catch (e) {
    showError("conv-out", e.message);
  }
}

// -------- 03 Caesar --------
function runCaesar() {
  try {
    const text = document.getElementById("cae-text").value;
    const shift = parseInt(document.getElementById("cae-shift").value, 10);
    if (Number.isNaN(shift)) throw new Error("Shift harus angka.");
    const mode = modeState.caesar;
    const res = mode === "encrypt" ? caesarEncrypt(text, shift) : caesarDecrypt(text, shift);
    document.getElementById("cae-out").innerHTML =
      `<div class="inner">${row(mode === "encrypt" ? "Ciphertext" : "Plaintext", res, "result-big")}</div>`;
  } catch (e) {
    showError("cae-out", e.message);
  }
}

// -------- 04 XOR --------
function runXor() {
  try {
    const text = document.getElementById("xor-text").value;
    const key = document.getElementById("xor-key").value;
    const mode = modeState.xor;
    if (key.length === 0) throw new Error("Key tidak boleh kosong.");
    const keyBytes = textToBytes(key);

    let html = `<div class="inner">`;
    if (mode === "encrypt") {
      const res = xorBytes(textToBytes(text), keyBytes);
      html += row("Hex", bytesToHex(res));
      html += row("Biner", bytesToBits(res));
    } else {
      const res = xorBytes(hexToBytes(text), keyBytes);
      const decoded = new TextDecoder("utf-8").decode(res);
      html += row("Teks hasil", decoded, "result-big");
      html += row("Hex", bytesToHex(res));
      html += row("Biner", bytesToBits(res));
    }
    html += `</div>`;
    document.getElementById("xor-out").innerHTML = html;
  } catch (e) {
    showError("xor-out", e.message);
  }
}
