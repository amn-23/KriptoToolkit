// =========================================================================
// app.js — logika frontend: tab, segmented control, dan pemanggilan API.
// =========================================================================

// ---- Navigasi tab ----
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ---- Segmented control (mode encrypt/decrypt dll) ----
const modeState = { conv: "char2num", caesar: "encrypt", xor: "encrypt" };
document.querySelectorAll(".seg").forEach((seg) => {
  seg.addEventListener("click", () => {
    const group = seg.dataset.group;
    document
      .querySelectorAll(`.seg[data-group="${group}"]`)
      .forEach((s) => s.classList.remove("active"));
    seg.classList.add("active");
    modeState[group] = seg.dataset.mode;

    // Label dinamis untuk XOR
    if (group === "xor") {
      document.getElementById("xor-label").textContent =
        seg.dataset.mode === "decrypt" ? "Hex (hasil enkripsi)" : "Teks";
    }
  });
});

// ---- Helper POST JSON ----
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function showError(elId, msg) {
  document.getElementById(elId).innerHTML =
    `<div class="inner"><span class="error">⚠ ${msg}</span></div>`;
}

function row(label, value, cls = "mono") {
  return `<div class="result-row"><div class="result-label">${label}</div><div class="${cls}">${value}</div></div>`;
}

// ---- 01 Modulo ----
async function runModulo() {
  const a = document.getElementById("mod-a").value;
  const m = document.getElementById("mod-m").value;
  const data = await postJSON("/api/modulo", { a, m });
  if (!data.ok) return showError("mod-out", data.error);
  document.getElementById("mod-out").innerHTML =
    `<div class="inner">${row(`${a} mod ${m} =`, data.result, "result-big")}</div>`;
}

// ---- 02 Convert ----
async function runConvert() {
  const text = document.getElementById("conv-text").value;
  const mode = modeState.conv;
  const data = await postJSON("/api/convert", { text, mode });
  if (!data.ok) return showError("conv-out", data.error);

  const chips = data.result
    .map((p) =>
      mode === "char2num"
        ? `<span class="chip">${p.char} = <b>${p.num}</b></span>`
        : `<span class="chip">${p.num} = <b>${p.char}</b></span>`
    )
    .join("");

  let html = `<div class="inner"><div class="chips">${chips}</div>`;
  if (data.text) html += row("Gabungan huruf", data.text, "result-big");
  html += `</div>`;
  document.getElementById("conv-out").innerHTML = html;
}

// ---- 03 Caesar ----
async function runCaesar() {
  const text = document.getElementById("cae-text").value;
  const shift = document.getElementById("cae-shift").value;
  const mode = modeState.caesar;
  const data = await postJSON("/api/caesar", { text, shift, mode });
  if (!data.ok) return showError("cae-out", data.error);
  document.getElementById("cae-out").innerHTML =
    `<div class="inner">${row(mode === "encrypt" ? "Ciphertext" : "Plaintext", data.result, "result-big")}</div>`;
}

// ---- 04 XOR ----
async function runXor() {
  const text = document.getElementById("xor-text").value;
  const key = document.getElementById("xor-key").value;
  const mode = modeState.xor;
  const data = await postJSON("/api/xor", { text, key, mode });
  if (!data.ok) return showError("xor-out", data.error);

  let html = `<div class="inner">`;
  if (data.text !== undefined) html += row("Teks hasil", data.text, "result-big");
  if (data.hex !== undefined) html += row("Hex", data.hex);
  if (data.bits !== undefined) html += row("Biner", data.bits);
  html += `</div>`;
  document.getElementById("xor-out").innerHTML = html;
}
