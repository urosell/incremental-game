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
};

// ─────────────────────────────────────────
// LEGADO — Estado permanente entre revoluciones
// ─────────────────────────────────────────
export const legado = { llamas: 0, nodos: [] };
