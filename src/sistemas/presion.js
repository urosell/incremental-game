// ─────────────────────────────────────────
// SISTEMA — Presión Capitalista
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { obtenerStatsHuelga, obtenerTasaPresion } from "../core/calculos.js";

export function tickPresion(dt) {
  const ahora = Date.now();
  if (ahora < (estado.huelgaExpira || 0)) {
    // Huelga activa: reducir presión
    const stats = obtenerStatsHuelga();
    estado.presionCapitalista = Math.max(0, estado.presionCapitalista - stats.reduccionPorSeg * dt);
  } else {
    const tasa = obtenerTasaPresion();
    if (tasa > 0) {
      estado.presionCapitalista = Math.min(100, estado.presionCapitalista + tasa * dt);
    }
  }
}
