// ─────────────────────────────────────────
// SISTEMA — Árbol Revolucionario (compra de nodos + apertura del panel)
// ─────────────────────────────────────────
import { legado } from "../core/estado.js";
import { guardarLegado } from "../core/persistencia.js";
import { ARBOL_LEGADO, TIERS_RESILIENCIA } from "../data/arbol.js";
import { mostrarNotificacion } from "../ui/notificacion.js";
import { CC } from "../ui/iconos.js";
import { renderizarArbol } from "../ui/render-arbol.js";
import {
  RESILIENCIA_TIER_COSTE_POR_NIVEL,
  RESILIENCIA_TIER_MAX_NIVEL,
  AGITACION_COSTE_POR_NIVEL,
  AGITACION_COSTE_MAX_NIVEL,
  AGITACION_CLIC_COSTE_POR_NIVEL,
  AGITACION_CLIC_MAX_NIVEL,
} from "../config/balance.js";

export function comprarNodoArbol(id) {
  const nodo = ARBOL_LEGADO.find(n => n.id === id);
  if (!nodo || legado.nodos.includes(id)) return;
  if (nodo.requiere && !legado.nodos.includes(nodo.requiere)) return;
  if (legado.llamas < nodo.coste) return;
  legado.llamas -= nodo.coste;
  legado.nodos.push(id);
  guardarLegado();
  renderizarArbol();
  mostrarNotificacion(`${nodo.emoji} ${nodo.nombre} desbloqueado. El movimiento crece.`);
}

// Se invoca desde el botón "🔥 Árbol" del panel izquierdo (modo consulta).
export function abrirArbolConsulta() {
  renderizarArbol();
  document.getElementById("panel-arbol").classList.remove("oculto-panel");
  document.getElementById("panel-arbol-fondo").classList.remove("oculto");
}

export function cerrarArbolConsulta() {
  document.getElementById("panel-arbol").classList.add("oculto-panel");
  document.getElementById("panel-arbol-fondo").classList.add("oculto");
}

// ─────────────────────────────────────────
// RESILIENCIA POR TIER — subir nivel de un elemento
// tierId: "tier1" | "tier2" | "tier3" | "tier4" | "all"
// ─────────────────────────────────────────
export function subirNivelResilienciaTier(tierId) {
  const niveles    = legado.nivelesResilienciaTier;
  const nivelActual = niveles[tierId] ?? 0;
  if (nivelActual >= RESILIENCIA_TIER_MAX_NIVEL) return;

  // Comprobar desbloqueo: necesita nivel ≥1 del tier anterior
  const orden = ["tier1", "tier2", "tier3", "tier4", "all"];
  const idx   = orden.indexOf(tierId);
  if (idx > 0) {
    const anterior = orden[idx - 1];
    if ((niveles[anterior] ?? 0) < 1) return;
  }

  // Comprobar coste
  if (legado.llamas < RESILIENCIA_TIER_COSTE_POR_NIVEL) return;

  legado.llamas -= RESILIENCIA_TIER_COSTE_POR_NIVEL;
  niveles[tierId] = nivelActual + 1;
  guardarLegado();
  renderizarArbol();

  const tier = TIERS_RESILIENCIA.find(t => t.id === tierId);
  const pct  = Math.round((nivelActual + 1) * 3);
  mostrarNotificacion(`${tier.emoji} ${tier.label} Nv.${nivelActual + 1} — ${tier.descripcion} −${pct}%`);
}

// ─────────────────────────────────────────
// AGITACIÓN — poder de clic: subir nivel de una sección
// seccion: "mult" | "inicio" | "heroes"
// Secuencial: mult → inicio → heroes
// ─────────────────────────────────────────
export function subirNivelAgitacionClic(seccion) {
  const niveles = legado.nivelesAgitacionClic;
  const nivelActual = niveles[seccion] ?? 0;
  if (nivelActual >= AGITACION_CLIC_MAX_NIVEL) return;

  // Orden secuencial: mult primero, luego inicio, luego heroes
  const orden = ["mult", "inicio", "heroes"];
  const idx   = orden.indexOf(seccion);
  if (idx > 0 && (niveles[orden[idx - 1]] ?? 0) < 1) return;

  if (legado.llamas < AGITACION_CLIC_COSTE_POR_NIVEL) return;

  legado.llamas -= AGITACION_CLIC_COSTE_POR_NIVEL;
  niveles[seccion] = nivelActual + 1;
  guardarLegado();
  renderizarArbol();

  const nombres = { mult: "Multiplicador de Clic", inicio: "Inicio con Agitación", heroes: "Héroes Agitan" };
  mostrarNotificacion(`${CC} ${nombres[seccion]} Nv.${nivelActual + 1} desbloqueado.`);
}

// ─────────────────────────────────────────
// AGITACIÓN — coste de mejoras: subir nivel
// ─────────────────────────────────────────
export function subirNivelAgitacionCoste() {
  const nivelActual = legado.nivelAgitacionCoste ?? 0;
  if (nivelActual >= AGITACION_COSTE_MAX_NIVEL) return;
  if (legado.llamas < AGITACION_COSTE_POR_NIVEL) return;

  legado.llamas -= AGITACION_COSTE_POR_NIVEL;
  legado.nivelAgitacionCoste = nivelActual + 1;
  guardarLegado();
  renderizarArbol();

  const pct = (nivelActual + 1) * 10;
  mostrarNotificacion(`⚙️ Organización Nv.${nivelActual + 1} — coste de mejoras −${pct}%`);
}
