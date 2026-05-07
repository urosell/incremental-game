// ─────────────────────────────────────────
// RENDER — Árbol Revolucionario
// ─────────────────────────────────────────
import { legado } from "../core/estado.js";
import { ARBOL_LEGADO, COLS_PROD, PROD_BONUSES, PROD_COSTES } from "../data/arbol.js";

export function renderizarArbol(consulta = false) {
  const contenedor = document.getElementById("arbol-contenedor");
  if (!contenedor) return;
  document.getElementById("arbol-llamas-display").textContent = legado.llamas + " 🔥";

  const btnCerrar   = document.getElementById("btn-cerrar-arbol");
  const btnComenzar = document.getElementById("panel-arbol-footer");
  if (btnCerrar)   btnCerrar.style.display  = consulta ? "block" : "none";
  if (btnComenzar) btnComenzar.style.display = consulta ? "none"  : "block";

  contenedor.innerHTML = `
    ${_renderProduccion(consulta)}
    ${_renderRamaLineal("agitacion",   "✊ Agitación",   consulta)}
    ${_renderRamaLineal("resiliencia", "🛡️ Resiliencia", consulta)}
  `;
}

// Rama producción — una card por colectivo con botón progresivo (estilo colectivos)
function _renderProduccion(consulta) {
  const cards = COLS_PROD.map(col => {
    // Nivel actual = cuántos nodos de este colectivo están comprados
    const nivelActual = PROD_BONUSES.reduce((total, _, i) =>
      legado.nodos.includes(`prod-${col.id}-${i + 1}`) ? total + 1 : total, 0);

    const maxNivel    = PROD_BONUSES.length;
    const siguiente   = nivelActual < maxNivel ? nivelActual : null; // índice 0-based del siguiente
    const puedePagar  = siguiente !== null && legado.llamas >= PROD_COSTES[siguiente];
    const idSiguiente = siguiente !== null ? `prod-${col.id}-${siguiente + 1}` : null;

    const bonusTotal  = PROD_BONUSES.slice(0, nivelActual).reduce((s, b) => s + b, 0);
    const bonusStr    = nivelActual > 0 ? `+${Math.round(bonusTotal * 100)}% producción` : "Sin bonificación";

    const botonHTML = nivelActual >= maxNivel
      ? `<div class="arbol-nodo-activo">✓ Máximo</div>`
      : `<button class="btn-nodo-arbol"
           data-accion="comprar-nodo-arbol" data-arg="${idSiguiente}"
           ${!puedePagar || consulta ? "disabled" : ""}>
           Nv.${nivelActual + 1} · +${PROD_BONUSES[siguiente] * 100}% · ${PROD_COSTES[siguiente]} 🔥
         </button>`;

    return `<div class="prod-card">
      <span class="prod-card-emoji">${col.emoji}</span>
      <div class="prod-card-info">
        <div class="prod-card-nombre">${col.nombre}</div>
        <div class="prod-card-nivel">Nv. ${nivelActual} / ${maxNivel} — ${bonusStr}</div>
      </div>
      <div class="prod-card-accion">${botonHTML}</div>
    </div>`;
  }).join('');

  return `<div class="arbol-rama arbol-rama-produccion">
    <div class="arbol-rama-titulo">🏭 Producción</div>
    ${cards}
  </div>`;
}

// Ramas lineales (agitación y resiliencia)
function _renderRamaLineal(ramaId, titulo, consulta) {
  const nodos = ARBOL_LEGADO.filter(n => n.rama === ramaId);
  return `
    <div class="arbol-rama">
      <div class="arbol-rama-titulo">${titulo}</div>
      ${nodos.map((nodo, i) => {
        const comprado   = legado.nodos.includes(nodo.id);
        const desbloq    = !nodo.requiere || legado.nodos.includes(nodo.requiere);
        const puedePagar = legado.llamas >= nodo.coste;
        return `
          ${i > 0 ? '<div class="arbol-conector"></div>' : ''}
          <div class="arbol-nodo ${comprado ? 'nodo-comprado' : desbloq ? 'nodo-disponible' : 'nodo-bloqueado'}">
            <div class="arbol-nodo-top">
              <span class="arbol-nodo-emoji">${nodo.emoji}</span>
              <span class="arbol-nodo-nombre">${nodo.nombre}</span>
            </div>
            <div class="arbol-nodo-desc">${nodo.descripcion}</div>
            ${comprado
              ? '<div class="arbol-nodo-activo">✓ Activo</div>'
              : desbloq
                ? `<button class="btn-nodo-arbol" data-accion="comprar-nodo-arbol" data-arg="${nodo.id}" ${!puedePagar || consulta ? 'disabled' : ''}>${nodo.coste} 🔥</button>`
                : '<div class="arbol-nodo-lock">🔒</div>'
            }
          </div>
        `;
      }).join('')}
    </div>
  `;
}
