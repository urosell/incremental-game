// ─────────────────────────────────────────
// SISTEMA — Huelga General
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { obtenerStatsHuelga } from "../core/calculos.js";
import { guardarEstado } from "../core/persistencia.js";
import { MEJORAS_HUELGA } from "../data/mejoras.js";
import { mostrarNotificacion } from "../ui/notificacion.js";
import { renderizarBtnHuelga } from "../ui/render-presion.js";
import { renderizarMejorasHuelga } from "../ui/render-mejoras.js";
import { renderizar } from "../ui/render.js";

export function activarHuelga() {
  const ahora = Date.now();
  if (ahora < (estado.huelgaCooldownHasta || 0)) return; // en cooldown
  if (ahora < (estado.huelgaExpira || 0)) return;        // ya activa

  const stats = obtenerStatsHuelga();
  estado.huelgaExpira        = ahora + stats.duracion * 1000;
  estado.huelgaCooldownHasta = estado.huelgaExpira + stats.cooldown * 1000;

  guardarEstado();
  mostrarNotificacion("¡La clase obrera para! La presión capitalista retrocede.");
}

export function comprarMejoraHuelga(id) {
  const mejora = MEJORAS_HUELGA.find(m => m.id === id);
  if (!mejora) return;
  if (!Array.isArray(estado.mejorasHuelga)) estado.mejorasHuelga = [];
  if (estado.mejorasHuelga.includes(id)) return;
  if (estado.conciencia < mejora.coste) return;

  estado.conciencia -= mejora.coste;
  estado.mejorasHuelga.push(id);
  renderizarMejorasHuelga();
  renderizarBtnHuelga();
  renderizar();
  mostrarNotificacion(`${mejora.emoji} ${mejora.nombre} activada.`);
  guardarEstado();
}
