// ─────────────────────────────────────────
// RENDER — Lista de Colectivos
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { MAX_NIVEL_COLECTIVO } from "../config/balance.js";
import {
  formatear,
  costeMejora,
  obtenerMultiplicador,
  obtenerPenalizacionPresion,
  getBonusProduccionArbol,
} from "../core/calculos.js";

export function renderizarColectivos() {
  const lista    = document.getElementById("lista-colectivos");
  const listaMov = document.getElementById("lista-colectivos-movil");
  lista.innerHTML = "";
  if (listaMov) listaMov.innerHTML = "";

  estado.colectivos.forEach(col => {
    const datos       = COLECTIVOS[col.id];
    const esPrimero   = col.id === 0;
    const anterior    = col.id > 0 ? estado.colectivos[col.id - 1] : null;
    const desbloqueado = esPrimero || (anterior && anterior.nivel > 0);

    const card = document.createElement("div");
    card.className = "colectivo-card" + (desbloqueado ? "" : " bloqueado");

    const produccionActual = (() => {
      let p = datos.ingresoPorSegundo * Math.max(col.nivel, 1);
      if (estado.heroes.includes("dolores") && col.id === 3) p *= 1.5;
      if (estado.heroes.includes("tesla")   && col.id === 6) p *= 2;
      p *= obtenerMultiplicador();
      p *= obtenerPenalizacionPresion();
      p *= getBonusProduccionArbol(col.id);
      if (estado.efectoTemporal?.tipo === "produccion" && estado.efectoTemporal.expira > Date.now()) {
        p *= estado.efectoTemporal.mult;
      }
      return formatear(p) + " ⚡/seg";
    })();

    const iconoHTML = datos.imagen
      ? `<img src="${datos.imagen}" alt="${datos.nombre}" class="colectivo-icono-img">`
      : `<span class="colectivo-icono-emoji">${datos.emoji}</span>`;

    if (col.nivel === 0) {
      card.innerHTML = `
        <div class="colectivo-icono-wrap">${iconoHTML}</div>
        <div class="colectivo-texto">
          <div class="colectivo-nombre">${datos.nombre}</div>
          <div class="nivel-texto">No organizado</div>
        </div>
        <div class="colectivo-acciones">
          <div class="produccion-texto">${produccionActual}</div>
          <button class="btn-comprar"
            data-accion="comprar" data-arg="${col.id}"
            ${!desbloqueado || estado.conciencia < datos.coste ? "disabled" : ""}>
            Organizar · ${formatear(datos.coste)} ⚡
          </button>
        </div>
      `;
    } else {
      const coste    = costeMejora(col);
      const maxNivel = MAX_NIVEL_COLECTIVO;
      card.innerHTML = `
        <div class="colectivo-icono-wrap">${iconoHTML}</div>
        <div class="colectivo-texto">
          <div class="colectivo-nombre">${datos.nombre}</div>
          <div class="nivel-texto">Nivel ${col.nivel} / ${maxNivel}</div>
        </div>
        <div class="colectivo-acciones">
          <div class="produccion-texto">${produccionActual}</div>
          <button class="btn-mejorar"
            data-accion="mejorar" data-arg="${col.id}"
            ${col.nivel >= maxNivel ? "disabled" : ""}>
            ${col.nivel >= maxNivel ? "Máximo" : "Mejorar · " + formatear(coste) + " ⚡"}
          </button>
        </div>
      `;
    }
    lista.appendChild(card);
    if (listaMov) listaMov.appendChild(card.cloneNode(true));
  });
}
