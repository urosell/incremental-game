// ─────────────────────────────────────────
// RENDER — Panel de Mejoras con subtabs
// Misma lógica visual que el Árbol Revolucionario
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { CC } from "./iconos.js";
import { formatearCorto, obtenerDescuentoAgitacionMejora } from "../core/calculos.js";
import {
  MEJORAS_RESISTENCIA,
  MEJORAS_HUELGA,
  MEJORAS_AGITACION,
} from "../data/mejoras.js";

const LINK = `<div class="arbol-link"></div>`;

let _subtabActual = "resistencia";

export function cambiarSubtabMejoras(seccion) {
  _subtabActual = seccion;
}

// ── Render maestro con subtabs ──────────────
export function renderizarMejoras() {
  const contenedor = document.getElementById("mejoras-contenedor");
  if (!contenedor) return;

  const tabs = [
    { id: "resistencia", label: "🛡️ Resistencia" },
    { id: "agitacion",   label: "✊ Agitación"   },
    { id: "huelga",      label: "🪧 Huelga"       },
  ];

  const tabsHTML = `
    <div class="arbol-subtabs">
      ${tabs.map(t => `
        <button class="arbol-subtab ${_subtabActual === t.id ? "arbol-subtab-activo" : ""}"
          data-accion="cambiar-subtab-mejoras" data-arg="${t.id}">
          ${t.label}
        </button>
      `).join("")}
    </div>
  `;

  let contenidoHTML = "";
  if (_subtabActual === "resistencia") {
    contenidoHTML = _renderResistencia();
  } else if (_subtabActual === "agitacion") {
    contenidoHTML = _renderAgitacion();
  } else if (_subtabActual === "huelga") {
    contenidoHTML = _renderHuelga();
  }

  contenedor.innerHTML = tabsHTML + contenidoHTML;
}

// ── Funciones individuales (mantienen compatibilidad) ──
export function renderizarMejorasResistencia() { renderizarMejoras(); }
export function renderizarMejorasHuelga()      { renderizarMejoras(); }
export function renderizarAgitacion()          { renderizarMejoras(); }

// ─────────────────────────────────────────
// HELPER — card de mejora de compra única
// ─────────────────────────────────────────
function _cardMejora(mejora, comprada, puedePagar, accion, arg) {
  let accionHTML;
  if (comprada) {
    accionHTML = `<div class="arbol-nodo-activo">✓ Activa</div>`;
  } else {
    accionHTML = `
      <button class="btn-nodo-arbol"
        data-accion="${accion}" data-arg="${arg}"
        ${!puedePagar ? "disabled" : ""}>
        ${formatearCorto(mejora.coste)} ${CC}
      </button>
    `;
  }

  return `
    <div class="res-tier-card${comprada ? " res-tier-max" : ""}">
      <div class="res-tier-header">
        <span class="res-tier-emoji">${mejora.emoji}</span>
        <div class="res-tier-info">
          <div class="res-tier-nombre">${mejora.nombre}</div>
          <div class="res-tier-desc">${mejora.descripcion}</div>
        </div>
        ${comprada
          ? `<div class="res-tier-nivel" style="color:var(--sc-green)">✓</div>`
          : `<div class="res-tier-nivel">${formatearCorto(mejora.coste)} ${CC}</div>`}
      </div>
      <div class="res-tier-accion">${accionHTML}</div>
    </div>
  `;
}

// ── Resistencia ─────────────────────────────
function _renderResistencia() {
  const cards = MEJORAS_RESISTENCIA.map((mejora, i) => {
    const comprada   = estado.mejorasResistencia.includes(mejora.id);
    const puedePagar = estado.conciencia >= mejora.coste;
    return `
      ${i > 0 ? LINK : ""}
      ${_cardMejora(mejora, comprada, puedePagar, "comprar-mejora-resistencia", mejora.id)}
    `;
  }).join("");

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">🛡️</span>
        <span class="arbol-raiz-label">RESISTENCIA</span>
      </div>
      ${LINK}
      ${cards}
    </div>
  `;
}

// ── Agitación ───────────────────────────────
function _renderAgitacion() {
  const nivel      = estado.nivelAgitacion;
  const maxNivel   = MEJORAS_AGITACION.length;
  const siguiente  = nivel < maxNivel ? MEJORAS_AGITACION[nivel] : null;
  const actual     = nivel > 0 ? MEJORAS_AGITACION[nivel - 1] : null;
  const progresoPct = (nivel / maxNivel) * 100;

  let accionHTML;
  if (!siguiente) {
    accionHTML = `<div class="arbol-nodo-activo">✓ Máximo — ${formatearCorto(actual.poderClic)} ${CC}/clic</div>`;
  } else {
    const descuento  = obtenerDescuentoAgitacionMejora();
    const costeReal  = Math.floor(siguiente.coste * (1 - descuento));
    const hayDesc    = descuento > 0;
    const costeHTML  = hayDesc
      ? `<s>${formatearCorto(siguiente.coste)}</s> ${formatearCorto(costeReal)} ${CC}`
      : `${formatearCorto(costeReal)} ${CC}`;

    accionHTML = `
      <div class="res-tier-preview">
        Ahora: <strong>${actual ? formatearCorto(actual.poderClic) : 1} ${CC}/clic</strong>
        → Nv.${nivel + 1}: <strong>${formatearCorto(siguiente.poderClic)} ${CC}/clic</strong>
      </div>
      <button class="btn-nodo-arbol"
        data-accion="mejorar-agitacion"
        ${estado.conciencia < costeReal ? "disabled" : ""}>
        Nv.${nivel + 1} · ${costeHTML}
      </button>
    `;
  }

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">✊</span>
        <span class="arbol-raiz-label">AGITACIÓN</span>
      </div>
      ${LINK}
      <div class="res-tier-card${!siguiente ? " res-tier-max" : ""}">
        <div class="res-tier-header">
          <span class="res-tier-emoji">${CC}</span>
          <div class="res-tier-info">
            <div class="res-tier-nombre">Fuerza de Agitación</div>
            <div class="res-tier-desc">Aumenta el poder de clic manual</div>
          </div>
          <div class="res-tier-nivel">Nv. ${nivel}/${maxNivel}</div>
        </div>
        <div class="prod-barra-wrap">
          <div class="prod-barra-fill" style="width:${progresoPct}%; background: var(--sc-red);"></div>
        </div>
        <div class="res-tier-accion">${accionHTML}</div>
      </div>
    </div>
  `;
}

// ── Huelga ──────────────────────────────────
function _renderHuelga() {
  const cards = MEJORAS_HUELGA.map((mejora, i) => {
    const comprada   = (estado.mejorasHuelga || []).includes(mejora.id);
    const puedePagar = estado.conciencia >= mejora.coste;
    return `
      ${i > 0 ? LINK : ""}
      ${_cardMejora(mejora, comprada, puedePagar, "comprar-mejora-huelga", mejora.id)}
    `;
  }).join("");

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">🪧</span>
        <span class="arbol-raiz-label">HUELGA GENERAL</span>
      </div>
      ${LINK}
      ${cards}
    </div>
  `;
}
