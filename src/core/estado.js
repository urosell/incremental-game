// ─────────────────────────────────────────
// ESTADO DEL JUEGO
// ─────────────────────────────────────────
import { COLECTIVOS } from "../data/colectivos.js";

export const estado = {
  conciencia: 0,
  concienciaTotal: 0,
  concienciaPorSegundo: 0,
  clicPoder: 1,

  colectivos: COLECTIVOS.map(c => ({ id: c.id, nivel: 0 })),

  legadoRevolucionario: 0,
  heroes: [],
  totalRevoluciones: 0,

  // Fase 3
  presionCapitalista: 0,
  mejorasResistencia: [],
  nivelAgitacion: 0,
  efectoTemporal: null,
  siguienteEvento: 0,

  // Huelga General
  huelgaExpira: 0,
  huelgaCooldownHasta: 0,
  mejorasHuelga: [],

  eventos: [], // reservado

  // Engels — progreso offline
  ultimoGuardado: 0,

  // Trampa primera revolución
  trampaMostrada: false,
};

// ─────────────────────────────────────────
// LEGADO — Estado permanente entre revoluciones
// ─────────────────────────────────────────
export const legado = {
  llamas: 0,
  nodos: [],
  // Niveles del árbol de resiliencia por tier (0–20 por elemento)
  nivelesResilienciaTier: { tier1: 0, tier2: 0, tier3: 0, tier4: 0, all: 0 },
  // Nivel del árbol de agitación: cadena coste de mejoras (0–10)
  nivelAgitacionCoste: 0,
  // Niveles del árbol de agitación: poder de clic (0–5 por sección)
  nivelesAgitacionClic: { mult: 0, inicio: 0, heroes: 0 },
};
