// ─────────────────────────────────────────
// RENDER — Panel de Mejoras con subtabs
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { formatearCorto, obtenerDescuentoAgitacionMejora } from "../core/calculos.js";
import {
  MEJORAS_RESISTENCIA,
  MEJORAS_HUELGA,
  MEJORAS_AGITACION,
} from "../data/mejoras.js";

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

// ── Resistencia ─────────────────────────────
function _renderResistencia() {
  const items = MEJORAS_RESISTENCIA.map(mejora => {
    const comprada = estado.mejorasResistencia.includes(mejora.id);
    return `
      <div class="mejora-resistencia ${comprada ? "comprada" : ""}">
        <span class="mejora-nombre" title="${mejora.descripcion}">${mejora.emoji} ${mejora.nombre}</span>
        <button class="btn-mejora-resistencia"
          data-accion="comprar-mejora-resistencia" data-arg="${mejora.id}"
          ${comprada || estado.conciencia < mejora.coste ? "disabled" : ""}>
          ${comprada ? "✓ Activa" : formatearCorto(mejora.coste) + " ⚡"}
        </button>
      </div>
    `;
  }).join("");

  return `<div class="mejoras-seccion" id="mejoras-resistencia">${items}</div>`;
}

// ── Agitación ───────────────────────────────
function _renderAgitacion() {
  const nivel     = estado.nivelAgitacion;
  const siguiente = nivel < MEJORAS_AGITACION.length ? MEJORAS_AGITACION[nivel] : null;

  const botonHTML = siguiente ? (() => {
    const descuento  = obtenerDescuentoAgitacionMejora();
    const costeReal  = Math.floor(siguiente.coste * (1 - descuento));
    const hayDesc    = descuento > 0;
    const costeHTML  = hayDesc
      ? `<span class="btn-agitacion-coste"><s>${formatearCorto(siguiente.coste)}</s> ${formatearCorto(costeReal)} ⚡</span>`
      : `<span class="btn-agitacion-coste">${formatearCorto(costeReal)} ⚡</span>`;
    return `
      <button class="btn-agitacion-icono"
        data-accion="mejorar-agitacion"
        ${estado.conciencia < costeReal ? "disabled" : ""}>
        ${costeHTML}
        <img src="Imagenes/Mejoras/Fuerza_Agitacion.png" alt="Fuerza de Agitación" draggable="false">
      </button>
    `;
  })() : `
    <div class="btn-agitacion-icono btn-agitacion-maximo">
      <span class="btn-agitacion-coste">Máximo</span>
      <img src="Imagenes/Mejoras/Fuerza_Agitacion.png" alt="Fuerza de Agitación" draggable="false">
    </div>
  `;

  return `
    <div class="mejoras-seccion" id="mejoras-agitacion">
      <div class="agitacion-icono-wrapper">
        ${botonHTML}
        <div class="agitacion-nivel">Nv. ${nivel} / ${MEJORAS_AGITACION.length}</div>
      </div>
    </div>
  `;
}

// ── Huelga ──────────────────────────────────
function _renderHuelga() {
  const items = MEJORAS_HUELGA.map(mejora => {
    const comprada = (estado.mejorasHuelga || []).includes(mejora.id);
    return `
      <div class="mejora-resistencia ${comprada ? "comprada" : ""}">
        <span class="mejora-nombre" title="${mejora.descripcion}">${mejora.emoji} ${mejora.nombre}</span>
        <button class="btn-mejora-resistencia"
          data-accion="comprar-mejora-huelga" data-arg="${mejora.id}"
          ${comprada || estado.conciencia < mejora.coste ? "disabled" : ""}>
          ${comprada ? "✓ Activa" : formatearCorto(mejora.coste) + " ⚡"}
        </button>
      </div>
    `;
  }).join("");

  return `<div class="mejoras-seccion" id="mejoras-huelga">${items}</div>`;
}
