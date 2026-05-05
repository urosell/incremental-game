// ─────────────────────────────────────────
// RENDER — Paneles de Mejoras (Resistencia, Huelga, Agitación)
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { formatear } from "../core/calculos.js";
import {
  MEJORAS_RESISTENCIA,
  MEJORAS_HUELGA,
  MEJORAS_AGITACION,
} from "../data/mejoras.js";

export function renderizarMejorasResistencia() {
  const contenedor = document.getElementById("mejoras-resistencia");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  MEJORAS_RESISTENCIA.forEach(mejora => {
    const comprada = estado.mejorasResistencia.includes(mejora.id);
    const div = document.createElement("div");
    div.className = "mejora-resistencia" + (comprada ? " comprada" : "");
    div.innerHTML = `
      <span class="mejora-nombre" title="${mejora.descripcion}">${mejora.emoji} ${mejora.nombre}</span>
      <button class="btn-mejora-resistencia"
        data-mejora="${mejora.id}"
        data-accion="comprar-mejora-resistencia" data-arg="${mejora.id}"
        ${comprada || estado.conciencia < mejora.coste ? "disabled" : ""}>
        ${comprada ? "✓ Activa" : formatear(mejora.coste) + " ⚡"}
      </button>
    `;
    contenedor.appendChild(div);
  });
}

export function renderizarMejorasHuelga() {
  const contenedor = document.getElementById("mejoras-huelga");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  MEJORAS_HUELGA.forEach(mejora => {
    const comprada = (estado.mejorasHuelga || []).includes(mejora.id);
    const div = document.createElement("div");
    div.className = "mejora-resistencia" + (comprada ? " comprada" : "");
    div.innerHTML = `
      <span class="mejora-nombre" title="${mejora.descripcion}">${mejora.emoji} ${mejora.nombre}</span>
      <button class="btn-mejora-resistencia"
        data-huelga="${mejora.id}"
        data-accion="comprar-mejora-huelga" data-arg="${mejora.id}"
        ${comprada || estado.conciencia < mejora.coste ? "disabled" : ""}>
        ${comprada ? "✓ Activa" : formatear(mejora.coste) + " ⚡"}
      </button>
    `;
    contenedor.appendChild(div);
  });
}

export function renderizarAgitacion() {
  const contenedor = document.getElementById("mejoras-agitacion");
  if (!contenedor) return;
  const nivel = estado.nivelAgitacion;
  const siguiente = nivel < MEJORAS_AGITACION.length ? MEJORAS_AGITACION[nivel] : null;

  contenedor.innerHTML = `
    <div class="agitacion-icono-wrapper">
      ${siguiente ? `
        <button class="btn-agitacion-icono"
          data-accion="mejorar-agitacion"
          ${estado.conciencia < siguiente.coste ? "disabled" : ""}>
          <span class="btn-agitacion-coste">${formatear(siguiente.coste)} ⚡</span>
          <img src="Imagenes/Mejoras/Fuerza_Agitacion.png" alt="Fuerza de Agitación" draggable="false">
        </button>
      ` : `
        <div class="btn-agitacion-icono btn-agitacion-maximo">
          <span class="btn-agitacion-coste">Máximo</span>
          <img src="Imagenes/Mejoras/Fuerza_Agitacion.png" alt="Fuerza de Agitación" draggable="false">
        </div>
      `}
      <div class="agitacion-nivel">Nv. ${nivel} / ${MEJORAS_AGITACION.length}</div>
    </div>
  `;
}
