// ─────────────────────────────────────────
// PERSISTENCIA — guardado y carga (local + nube)
// ─────────────────────────────────────────
import { estado, legado } from "./estado.js";
import { sesion } from "./sesion.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { guardarPartidaNube } from "../../firebase.js";

const CLAVE_GUARDADO = "conciencia-de-clase-v1";
const CLAVE_LEGADO   = "conciencia-de-clase-legado-v1";

// ─────────────────────────────────────────
// ESTADO — partida actual
// ─────────────────────────────────────────
export function guardarEstado() {
  try {
    estado.ultimoGuardado = Date.now();
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado));
    if (sesion.usuario) {
      guardarPartidaNube(sesion.usuario.uid, estado);
    }
  } catch (e) {
    console.error("Error al guardar estado:", e);
  }
}

export function cargarEstado() {
  try {
    const datos = localStorage.getItem(CLAVE_GUARDADO);
    if (datos) {
      const guardado = JSON.parse(datos);
      Object.assign(estado, guardado);

      if (!Array.isArray(estado.colectivos)) {
        estado.colectivos = COLECTIVOS.map(c => ({ id: c.id, nivel: 0 }));
      }

      // Migración Fase 3
      if (!Array.isArray(estado.mejorasResistencia)) estado.mejorasResistencia = [];
      if (estado.efectoTemporal && estado.efectoTemporal.expira <= Date.now()) {
        estado.efectoTemporal = null;
      }
      // Migración Huelga
      if (!Array.isArray(estado.mejorasHuelga))   estado.mejorasHuelga = [];
      if (!estado.huelgaExpira)                    estado.huelgaExpira = 0;
      if (!estado.huelgaCooldownHasta)             estado.huelgaCooldownHasta = 0;
      // Migración Engels
      if (!estado.ultimoGuardado)                  estado.ultimoGuardado = Date.now();
      // Migración trampa revolución
      if (estado.trampaMostrada === undefined)      estado.trampaMostrada = false;

      console.log("✓ Partida cargada");
      return true;
    }
  } catch (e) {
    console.error("Error al cargar estado:", e);
  }
  return false;
}

// ─────────────────────────────────────────
// LEGADO — permanente entre revoluciones
// ─────────────────────────────────────────
export function guardarLegado() {
  try { localStorage.setItem(CLAVE_LEGADO, JSON.stringify(legado)); } catch(e) {}
}

export function cargarLegado() {
  try {
    const datos = localStorage.getItem(CLAVE_LEGADO);
    if (datos) Object.assign(legado, JSON.parse(datos));
    if (!Array.isArray(legado.nodos)) legado.nodos = [];
    // Migración: árbol de resiliencia por tier
    if (!legado.nivelesResilienciaTier) {
      legado.nivelesResilienciaTier = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, all: 0 };
    }
    // Migración: árbol de agitación — coste de mejoras
    if (!legado.nivelAgitacionCoste) legado.nivelAgitacionCoste = 0;
    // Migración: árbol de agitación — poder de clic
    if (!legado.nivelesAgitacionClic) {
      legado.nivelesAgitacionClic = { mult: 0, inicio: 0, heroes: 0 };
    }
  } catch(e) {}
}
