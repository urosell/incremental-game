// ─────────────────────────────────────────
// RENDER — Orquestador del refresh general del UI
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { MEJORAS_RESISTENCIA, MEJORAS_HUELGA, MEJORAS_AGITACION } from "../data/mejoras.js";
import { UMBRAL_REVOLUCION, MAX_NIVEL_COLECTIVO } from "../config/balance.js";
import { formatear, costeMejora, obtenerPoderClic } from "../core/calculos.js";
import { renderizarPresion, renderizarBtnHuelga } from "./render-presion.js";

// Refresco "ligero": ajusta números y disabled de los botones que ya están en el DOM.
// Para reconstruir el DOM (tras una compra que cambia nivel) se llaman los renderizar*
// específicos desde quien hizo la acción.
export function renderizar() {
  document.getElementById("conciencia-display").textContent =
    formatear(estado.conciencia) + " ⚡";
  const ingresoDisplay = document.getElementById("ingreso-display");
  if (ingresoDisplay) ingresoDisplay.textContent =
    formatear(estado.concienciaPorSegundo) + " ⚡ / seg";

  // Botones colectivos
  estado.colectivos.forEach(col => {
    const datos = COLECTIVOS[col.id];
    if (col.nivel === 0) {
      const btn = document.querySelector(`button[data-accion="comprar"][data-arg="${col.id}"]`);
      if (btn) btn.disabled = estado.conciencia < datos.coste;
    } else {
      const btn = document.querySelector(`button[data-accion="mejorar"][data-arg="${col.id}"]`);
      if (btn) {
        const coste = costeMejora(col);
        btn.disabled = estado.conciencia < coste || col.nivel >= MAX_NIVEL_COLECTIVO;
      }
    }
  });

  // Barra de progreso revolución
  const porcentaje = Math.min(100, (estado.concienciaTotal / UMBRAL_REVOLUCION) * 100);
  const barra      = document.getElementById("progreso-barra");
  const texto      = document.getElementById("progreso-texto");
  if (barra) barra.style.width = porcentaje + "%";
  if (texto) texto.textContent = formatear(estado.concienciaTotal) + " / " + formatear(UMBRAL_REVOLUCION) + " ⚡";

  // Info de agitación — poder real con todos los multiplicadores aplicados
  const agitarInfo = document.getElementById("agitar-info");
  if (agitarInfo) agitarInfo.textContent = `+${formatear(obtenerPoderClic())} ⚡ por clic`;

  // Fase 3
  renderizarPresion();
  actualizarEfectoDisplay();

  // Botón huelga
  renderizarBtnHuelga();

  // Botones mejoras huelga (solo actualizar disabled)
  MEJORAS_HUELGA.forEach(mejora => {
    if ((estado.mejorasHuelga || []).includes(mejora.id)) return;
    const btn = document.querySelector(`button[data-huelga="${mejora.id}"]`);
    if (btn) btn.disabled = estado.conciencia < mejora.coste;
  });

  // Botones mejoras resistencia
  MEJORAS_RESISTENCIA.forEach(mejora => {
    if (estado.mejorasResistencia.includes(mejora.id)) return;
    const btn = document.querySelector(`button[data-mejora="${mejora.id}"]`);
    if (btn) btn.disabled = estado.conciencia < mejora.coste;
  });

  // Botón mejora agitación — solo actualizar disabled, sin redibujar el DOM
  const siguiente = estado.nivelAgitacion < MEJORAS_AGITACION.length
    ? MEJORAS_AGITACION[estado.nivelAgitacion] : null;
  if (siguiente) {
    const btnAgit = document.querySelector("#mejoras-agitacion .btn-mejora-resistencia");
    if (btnAgit) btnAgit.disabled = estado.conciencia < siguiente.coste;
  }
}

export function actualizarEfectoDisplay() {
  const el = document.getElementById("efecto-activo-display");
  if (!el) return;
  if (estado.efectoTemporal && estado.efectoTemporal.expira > Date.now()) {
    const segs = Math.ceil((estado.efectoTemporal.expira - Date.now()) / 1000);
    const m    = estado.efectoTemporal.mult;
    const pct  = m >= 1 ? `+${Math.round((m - 1) * 100)}%` : `−${Math.round((1 - m) * 100)}%`;
    el.textContent = `${pct} producción (${segs}s)`;
    el.className   = m >= 1 ? "efecto-activo positivo" : "efecto-activo negativo";
  } else {
    el.textContent = "";
    el.className   = "efecto-activo";
  }
}

export function actualizarBotonRevolucion() {
  const btn = document.getElementById("btn-revolucion");
  if (!btn) return;
  if (estado.concienciaTotal >= UMBRAL_REVOLUCION) {
    btn.classList.remove("oculto");
  }
}
