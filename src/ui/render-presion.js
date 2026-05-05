// ─────────────────────────────────────────
// RENDER — Presión Capitalista y botón de Huelga
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { obtenerPenalizacionPresion, obtenerStatsHuelga } from "../core/calculos.js";

export function renderizarPresion() {
  const barra = document.getElementById("presion-barra");
  const texto = document.getElementById("presion-texto");
  const penEl = document.getElementById("presion-penalizacion");
  if (!barra) return;

  const p = estado.presionCapitalista;
  barra.style.width = p + "%";

  if      (p >= 80) barra.className = "presion-barra-fill presion-alta";
  else if (p >= 50) barra.className = "presion-barra-fill presion-media";
  else              barra.className = "presion-barra-fill presion-baja";

  if (texto) texto.textContent = Math.round(p) + "%";

  if (penEl) {
    const pen = obtenerPenalizacionPresion();
    if (pen < 1) {
      penEl.textContent = `−${Math.round((1 - pen) * 100)}% prod.`;
      penEl.className = "presion-penalizacion activa";
    } else {
      penEl.textContent = "";
      penEl.className = "presion-penalizacion";
    }
  }
}

export function renderizarBtnHuelga() {
  const btn = document.getElementById("btn-huelga");
  if (!btn) return;
  const ahora      = Date.now();
  const estaActiva = ahora < (estado.huelgaExpira || 0);
  const enCooldown = !estaActiva && ahora < (estado.huelgaCooldownHasta || 0);
  const stats      = obtenerStatsHuelga();

  if (estaActiva) {
    const segs = Math.ceil((estado.huelgaExpira - ahora) / 1000);
    btn.textContent = `🪧 Huelga Activa — ${segs}s`;
    btn.disabled    = true;
    btn.dataset.estado = "activa";
  } else if (enCooldown) {
    const segs = Math.ceil((estado.huelgaCooldownHasta - ahora) / 1000);
    btn.textContent = `🪧 Cooldown — ${segs}s`;
    btn.disabled    = true;
    btn.dataset.estado = "cooldown";
  } else {
    btn.textContent = `🪧 Convocar Huelga`;
    btn.disabled    = false;
    btn.dataset.estado = "listo";
  }

  // Actualizar info
  const info = document.getElementById("huelga-info");
  if (info) info.textContent = `${stats.duracion}s activa · ${stats.reduccionPorSeg}%/s · CD ${stats.cooldown}s${stats.auto ? " · AUTO" : ""}`;
}
