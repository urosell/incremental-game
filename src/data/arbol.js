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

// ─────────────────────────────────────────
// TIERS DE RESILIENCIA — clasificación de colectivos por tier
// Usados en el árbol de resiliencia y en calculos.js para los descuentos
// ─────────────────────────────────────────
export const TIERS_RESILIENCIA = [
  { id: "tier1", label: "Barrio",        emoji: "🏘️", indices: [0, 1, 2],             descripcion: "Asamblea, Coop. Alimentos, Biblioteca" },
  { id: "tier2", label: "Movimiento",    emoji: "✊",  indices: [3, 4, 5],             descripcion: "Sindicato, Vivienda, Radio" },
  { id: "tier3", label: "Poder Popular", emoji: "⚡",  indices: [6, 7],                descripcion: "Energía, Universidad" },
  { id: "tier4", label: "Revolución",    emoji: "🌐",  indices: [8, 9],                descripcion: "Comunas, Internacional" },
  { id: "all",   label: "Unidad Total",  emoji: "🌍",  indices: [0,1,2,3,4,5,6,7,8,9], descripcion: "Todos los colectivos" },
];

export const ARBOL_LEGADO = [
  ...nodosProduccion,
  // Agitación — secciones de poder de clic gestionadas por nivelesAgitacionClic en legado
  // Resiliencia — 5 elementos de tier, 20 niveles cada uno (gestionados por nivelesResilienciaTier en legado)
  // (sin nodos individuales aquí — ver TIERS_RESILIENCIA y subirNivelResilienciaTier)
  // Llamas — multiplicador
  { id: "llamas-mult-1", rama: "llamas", emoji: "🔥", nombre: "Memoria del Pueblo",       descripcion: "Las llamas revolucionarias que recibes ×1.5.",             coste: 3,  requiere: null              },
  { id: "llamas-mult-2", rama: "llamas", emoji: "🔥", nombre: "Cultura de Lucha",         descripcion: "Las llamas revolucionarias que recibes ×2.",               coste: 12, requiere: "llamas-mult-1"   },
  { id: "llamas-mult-3", rama: "llamas", emoji: "🔥", nombre: "Fuego Eterno",             descripcion: "Las llamas revolucionarias que recibes ×2.",               coste: 35, requiere: "llamas-mult-2"   },
  { id: "llamas-mult-4", rama: "llamas", emoji: "🔥", nombre: "Revolución Permanente",    descripcion: "Las llamas revolucionarias que recibes ×2.",               coste: 90, requiere: "llamas-mult-3"   },
  // Llamas — eficiencia (reduce conciencia necesaria por llama)
  { id: "llamas-eff-1",  rama: "llamas", emoji: "⚡", nombre: "Organización Popular",     descripcion: "Necesitas un 25% menos de conciencia por llama.",          coste: 5,  requiere: null              },
  { id: "llamas-eff-2",  rama: "llamas", emoji: "⚡", nombre: "Red Territorial",          descripcion: "Necesitas un 25% menos de conciencia por llama.",          coste: 18, requiere: "llamas-eff-1"    },
  { id: "llamas-eff-3",  rama: "llamas", emoji: "⚡", nombre: "Poder Constituyente",      descripcion: "Necesitas un 25% menos de conciencia por llama.",          coste: 50, requiere: "llamas-eff-2"    },
];
