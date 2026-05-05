// ─────────────────────────────────────────
// ACCIONES DEL JUGADOR — clic, comprar, mejorar
// ─────────────────────────────────────────
import { estado } from "./core/estado.js";
import { MAX_NIVEL_COLECTIVO } from "./config/balance.js";
import { COLECTIVOS } from "./data/colectivos.js";
import { MEJORAS_RESISTENCIA, MEJORAS_AGITACION } from "./data/mejoras.js";
import {
  calcularIngreso,
  costeMejora,
  obtenerBonusArbol,
  obtenerDescuentoMejoras,
  obtenerPoderClic,
} from "./core/calculos.js";
import { guardarEstado } from "./core/persistencia.js";
import { mostrarNotificacion } from "./ui/notificacion.js";
import { renderizar, actualizarBotonRevolucion } from "./ui/render.js";
import { renderizarColectivos } from "./ui/render-colectivos.js";
import {
  renderizarMejorasResistencia,
  renderizarAgitacion,
} from "./ui/render-mejoras.js";

// ─────────────────────────────────────────
// AGITAR — clic manual
// ─────────────────────────────────────────
function agitar(e) {
  e.stopPropagation();
  const poder = obtenerPoderClic();
  estado.conciencia      += poder;
  estado.concienciaTotal += poder;
  renderizar();
  guardarEstado();
  actualizarBotonRevolucion();
}

export function inicializarBtnAgitar() {
  const btn = document.getElementById("btn-agitar");
  if (btn) btn.addEventListener("click", agitar);
}

// ─────────────────────────────────────────
// COLECTIVOS — comprar y mejorar
// ─────────────────────────────────────────
export function comprar(id) {
  const col       = estado.colectivos[id];
  const datos     = COLECTIVOS[id];
  const descuento = Math.min(0.75, obtenerDescuentoMejoras() + obtenerBonusArbol().descuentoColectivos);
  const costeReal = Math.floor(datos.coste * (1 - descuento));
  if (estado.conciencia >= costeReal && col.nivel === 0) {
    estado.conciencia -= costeReal;
    col.nivel = 1;
    calcularIngreso();
    renderizar();
    renderizarColectivos();
    mostrarNotificacion(datos.frase);
    guardarEstado();
  }
}

export function mejorar(id) {
  const col   = estado.colectivos[id];
  const coste = costeMejora(col);
  if (estado.conciencia >= coste && col.nivel < MAX_NIVEL_COLECTIVO) {
    estado.conciencia -= coste;
    col.nivel++;
    calcularIngreso();
    renderizar();
    renderizarColectivos();
    guardarEstado();
  }
}

// ─────────────────────────────────────────
// AGITACIÓN — subir nivel
// ─────────────────────────────────────────
export function mejorarAgitacion() {
  if (estado.nivelAgitacion >= MEJORAS_AGITACION.length) return;
  const siguiente = MEJORAS_AGITACION[estado.nivelAgitacion];
  if (estado.conciencia < siguiente.coste) return;
  estado.conciencia -= siguiente.coste;
  estado.nivelAgitacion++;
  calcularIngreso();
  renderizar();
  renderizarAgitacion();
  guardarEstado();
}

// ─────────────────────────────────────────
// RESISTENCIA — comprar mejora
// ─────────────────────────────────────────
export function comprarMejoraResistencia(id) {
  const mejora = MEJORAS_RESISTENCIA.find(m => m.id === id);
  if (!mejora || estado.mejorasResistencia.includes(id)) return;
  if (estado.conciencia < mejora.coste) return;

  estado.conciencia -= mejora.coste;
  estado.mejorasResistencia.push(id);
  calcularIngreso();
  renderizar();
  renderizarMejorasResistencia();
  mostrarNotificacion(mejora.nombre + " activada. La resistencia se fortalece.");
  guardarEstado();
}
