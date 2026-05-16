// ─────────────────────────────────────────
// DATOS — Árbol Revolucionario (Legado)
// ─────────────────────────────────────────

// Colectivos de la rama Producción (mismo orden que COLECTIVOS)
export const COLS_PROD = [
  { id: "asamblea",      nombre: "Asamblea de Barrio",       emoji: "🏘️", colIdx: 0 },
  { id: "coop-alimentos",nombre: "Cooperativa de Alimentos", emoji: "🌾", colIdx: 1 },
  { id: "biblioteca",    nombre: "Biblioteca Popular",       emoji: "📚", colIdx: 2 },
  { id: "sindicato",     nombre: "Sindicato Obrero",         emoji: "✊", colIdx: 3 },
  { id: "vivienda",      nombre: "Colectivo de Vivienda",    emoji: "🏠", colIdx: 4 },
  { id: "radio",         nombre: "Radio Comunitaria",        emoji: "📻", colIdx: 5 },
  { id: "energia",       nombre: "Cooperativa de Energía",   emoji: "⚡", colIdx: 6 },
  { id: "universidad",   nombre: "Universidad Popular",      emoji: "🎓", colIdx: 7 },
  { id: "comunas",       nombre: "Red de Comunas",           emoji: "🌐", colIdx: 8 },
  { id: "internacional", nombre: "La Internacional",         emoji: "🌍", colIdx: 9 },
];

export const PROD_BONUSES = [
  0.02, 0.05, 0.10, 0.15, 0.20,  // niveles 1-5
  0.25, 0.35, 0.50, 0.65, 0.80,  // niveles 6-10
  1.00, 1.25, 1.50, 2.00, 2.50,  // niveles 11-15
  3.00, 4.00, 5.00, 6.50, 8.00,  // niveles 16-20
];
export const PROD_COSTES = [
  1,   2,   4,   7,   12,   // niveles 1-5
  18,  26,  38,  55,  80,   // niveles 6-10
  115, 165, 235, 335, 480,  // niveles 11-15
  680, 950, 1350, 1900, 2700, // niveles 16-20
];

// Generar nodos de producción: 10 colectivos × 20 niveles
const nodosProduccion = COLS_PROD.flatMap(col =>
  PROD_BONUSES.map((bonus, i) => ({
    id:       `prod-${col.id}-${i + 1}`,
    rama:     "produccion",
    emoji:    col.emoji,
    nombre:   `${col.nombre} Nv.${i + 1}`,
    descripcion: `+${bonus * 100}% producción de ${col.nombre}.`,
    coste:    PROD_COSTES[i],
    bonus,
    colIdx:   col.colIdx,
    colId:    col.id,
    requiere: i === 0 ? null : `prod-${col.id}-${i}`,
  }))
);

export const ARBOL_LEGADO = [
  ...nodosProduccion,
  // Agitación
  { id: "agit-1", rama: "agitacion",   emoji: "📣", nombre: "Conciencia Popular",        descripcion: "+50% poder de clic.",                                      coste: 2,  requiere: null      },
  { id: "agit-2", rama: "agitacion",   emoji: "✊", nombre: "Movilización Masiva",       descripcion: "Poder de clic x2.",                                        coste: 5,  requiere: "agit-1"  },
  { id: "agit-3", rama: "agitacion",   emoji: "🔥", nombre: "Huelga General",            descripcion: "Poder de clic x3.",                                        coste: 10, requiere: "agit-2"  },
  { id: "agit-4", rama: "agitacion",   emoji: "⚡", nombre: "Vanguardia Revolucionaria", descripcion: "Empiezas con Fuerza de Agitación nivel 1 ya activo.",       coste: 18, requiere: "agit-3"  },
  { id: "agit-5", rama: "agitacion",   emoji: "🦸", nombre: "Los Héroes Agitan",        descripcion: "Cada héroe del movimiento añade +10 ⚡ al poder de clic.",   coste: 25, requiere: "agit-4"  },
  // Resiliencia
  { id: "res-1",  rama: "resiliencia", emoji: "🛡️", nombre: "Redes de Apoyo",           descripcion: "Coste de colectivos −10%.",                          coste: 2,  requiere: null      },
  { id: "res-2",  rama: "resiliencia", emoji: "⚙️", nombre: "Autogestión",              descripcion: "Coste de mejorar colectivos −15%.",                  coste: 5,  requiere: "res-1"   },
  { id: "res-3",  rama: "resiliencia", emoji: "🏛️", nombre: "Fortaleza Popular",        descripcion: "Presión capitalista sube un 25% más lento.",         coste: 10, requiere: "res-2"   },
  { id: "res-4",  rama: "resiliencia", emoji: "🌟", nombre: "Territorio Liberado",      descripcion: "Empiezas con las 3 mejoras de Resistencia activas.", coste: 18, requiere: "res-3"   },
];
