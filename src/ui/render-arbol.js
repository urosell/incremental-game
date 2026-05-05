// ─────────────────────────────────────────
// RENDER — Árbol Revolucionario
// ─────────────────────────────────────────
import { legado } from "../core/estado.js";
import { ARBOL_LEGADO } from "../data/arbol.js";

export function renderizarArbol(consulta = false) {
  const contenedor = document.getElementById("arbol-contenedor");
  if (!contenedor) return;
  document.getElementById("arbol-llamas-display").textContent = legado.llamas + " 🔥";

  // Mostrar/ocultar elementos según modo
  const btnCerrar   = document.getElementById("btn-cerrar-arbol");
  const btnComenzar = document.getElementById("panel-arbol-footer");
  if (btnCerrar)   btnCerrar.style.display   = consulta ? "block" : "none";
  if (btnComenzar) btnComenzar.style.display  = consulta ? "none"  : "block";

  const ramas = [
    { id: "produccion",  titulo: "🏭 Producción" },
    { id: "agitacion",   titulo: "✊ Agitación" },
    { id: "resiliencia", titulo: "🛡️ Resiliencia" },
  ];

  contenedor.innerHTML = ramas.map(rama => {
    const nodos = ARBOL_LEGADO.filter(n => n.rama === rama.id);
    return `
      <div class="arbol-rama">
        <div class="arbol-rama-titulo">${rama.titulo}</div>
        ${nodos.map((nodo, i) => {
          const comprado     = legado.nodos.includes(nodo.id);
          const desbloqueado = !nodo.requiere || legado.nodos.includes(nodo.requiere);
          const puedePagar   = legado.llamas >= nodo.coste;
          return `
            ${i > 0 ? '<div class="arbol-conector"></div>' : ''}
            <div class="arbol-nodo ${comprado ? 'nodo-comprado' : desbloqueado ? 'nodo-disponible' : 'nodo-bloqueado'}">
              <div class="arbol-nodo-top">
                <span class="arbol-nodo-emoji">${nodo.emoji}</span>
                <span class="arbol-nodo-nombre">${nodo.nombre}</span>
              </div>
              <div class="arbol-nodo-desc">${nodo.descripcion}</div>
              ${comprado
                ? '<div class="arbol-nodo-activo">✓ Activo</div>'
                : desbloqueado
                  ? `<button class="btn-nodo-arbol" data-accion="comprar-nodo-arbol" data-arg="${nodo.id}" ${!puedePagar || consulta ? 'disabled' : ''}>${nodo.coste} 🔥</button>`
                  : '<div class="arbol-nodo-lock">🔒</div>'
              }
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}
