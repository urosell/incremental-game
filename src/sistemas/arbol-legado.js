// ─────────────────────────────────────────
// SISTEMA — Árbol Revolucionario (compra de nodos + apertura del panel)
// ─────────────────────────────────────────
import { legado } from "../core/estado.js";
import { guardarLegado } from "../core/persistencia.js";
import { ARBOL_LEGADO } from "../data/arbol.js";
import { mostrarNotificacion } from "../ui/notificacion.js";
import { renderizarArbol } from "../ui/render-arbol.js";

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
  renderizarArbol(true);
  document.getElementById("panel-arbol").classList.remove("oculto-panel");
  document.getElementById("panel-arbol-fondo").classList.remove("oculto");
}

export function cerrarArbolConsulta() {
  document.getElementById("panel-arbol").classList.add("oculto-panel");
  document.getElementById("panel-arbol-fondo").classList.add("oculto");
}
