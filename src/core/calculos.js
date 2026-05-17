// ─────────────────────────────────────────
// CÁLCULOS — funciones puras (o casi puras) del juego
// ─────────────────────────────────────────
import { estado, legado } from "./estado.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { COLS_PROD, PROD_BONUSES, TIERS_RESILIENCIA } from "../data/arbol.js";
import { MEJORAS_AGITACION } from "../data/mejoras.js";
import {
  LLAMAS_DIVISOR,
  PRESION_TASA_BASE,
  PRESION_TASA_POR_COL,
  HUELGA_DURACION_BASE,
  HUELGA_COOLDOWN_BASE,
  HUELGA_REDUCCION_BASE,
  FACTORES_EXPONENCIAL,
  FACTORES_COSTE,
  RESILIENCIA_TIER_PCT_POR_NIVEL,
  AGITACION_COSTE_PCT_NIVEL,
  AGITACION_CLIC_PCT_POR_NIVEL,
  AGITACION_CLIC_HEROES_POR_NIV,
} from "../config/balance.js";
import { getQteMultiplicador } from "../sistemas/qte.js";

// ─────────────────────────────────────────
// FORMATEAR NÚMEROS
// ─────────────────────────────────────────
export function formatear(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3) + " billones";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(3) + " millones";
  if (n >= 1_000)         return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (n < 10)             return n.toFixed(2);
  return n.toFixed(1);
}

export function formatearCorto(n) {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + " T";
  if (n >= 1_000_000_000)     return (n / 1_000_000_000).toFixed(2) + " B";
  if (n >= 1_000_000)         return (n / 1_000_000).toFixed(2) + " M";
  if (n >= 1_000)             return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (n < 10)                 return n.toFixed(2);
  return n.toFixed(1);
}

// ─────────────────────────────────────────
// LEGADO — llamas
// ─────────────────────────────────────────
// Multiplicador de llamas según nodos comprados en el árbol
export function calcularMultiplicadorLlamas() {
  const n = legado.nodos;
  let mult = 1;
  if (n.includes("llamas-mult-1")) mult *= 1.5;
  if (n.includes("llamas-mult-2")) mult *= 2;
  if (n.includes("llamas-mult-3")) mult *= 2;
  if (n.includes("llamas-mult-4")) mult *= 2;
  return mult;
}

// Factor de eficiencia: reduce el divisor (más llamas por conciencia)
export function calcularEficienciaLlamas() {
  const n = legado.nodos;
  let factor = 1;
  if (n.includes("llamas-eff-1")) factor *= 0.75;
  if (n.includes("llamas-eff-2")) factor *= 0.75;
  if (n.includes("llamas-eff-3")) factor *= 0.75;
  return factor;
}

export function calcularLlamas(concienciaTotal) {
  const divisor = LLAMAS_DIVISOR * calcularEficienciaLlamas();
  const base    = Math.max(1, Math.floor(concienciaTotal / divisor));
  return Math.floor(base * calcularMultiplicadorLlamas());
}

// ─────────────────────────────────────────
// ÁRBOL — bonificaciones derivadas de los nodos comprados
// ─────────────────────────────────────────
// Bonus de producción del árbol para un colectivo concreto (por índice)
export function getBonusProduccionArbol(colIdx) {
  const col = COLS_PROD.find(c => c.colIdx === colIdx);
  if (!col) return 1;
  let bonus = 1;
  PROD_BONUSES.forEach((b, i) => {
    if (legado.nodos.includes(`prod-${col.id}-${i + 1}`)) bonus += b;
  });
  return bonus;
}

export function obtenerBonusArbol() {
  // multClic: +50% por cada nivel de la sección "mult" del árbol de agitación
  const nivelMult = legado.nivelesAgitacionClic?.mult ?? 0;
  const multClic  = 1 + nivelMult * AGITACION_CLIC_PCT_POR_NIVEL;

  // res-1 a res-4 y agit-1 a agit-5 eliminados — sustituidos por sistemas de niveles
  return { multClic };
}

// ─────────────────────────────────────────
// DESCUENTO POR TIER — para compra y mejora de colectivos
// Aplica el descuento del tier específico del colectivo + el universal
// ─────────────────────────────────────────
export function obtenerDescuentoTierColectivo(colIdx) {
  const niveles = legado.nivelesResilienciaTier;
  // Descuento del tier específico al que pertenece el colectivo
  let descuentoTier = 0;
  for (const tier of TIERS_RESILIENCIA.slice(0, 4)) { // tier1 a tier4
    if (tier.indices.includes(colIdx)) {
      descuentoTier = (niveles[tier.id] ?? 0) * RESILIENCIA_TIER_PCT_POR_NIVEL;
      break;
    }
  }
  // Descuento universal (todos los colectivos)
  const descuentoAll = (niveles.all ?? 0) * RESILIENCIA_TIER_PCT_POR_NIVEL;
  return Math.min(0.90, descuentoTier + descuentoAll);
}

// ─────────────────────────────────────────
// HUELGA — stats efectivas según mejoras compradas
// ─────────────────────────────────────────
export function obtenerStatsHuelga() {
  const m = estado.mejorasHuelga || [];
  let duracion        = HUELGA_DURACION_BASE;
  let cooldown        = HUELGA_COOLDOWN_BASE;
  let reduccionPorSeg = HUELGA_REDUCCION_BASE;
  let auto            = false;

  if (m.includes("huelga-duracion"))  duracion        += 30;
  if (m.includes("huelga-reduccion")) reduccionPorSeg *= 2;
  if (m.includes("huelga-cooldown"))  cooldown        -= 30;
  if (m.includes("huelga-auto"))      auto             = true;

  return { duracion, cooldown, reduccionPorSeg, auto };
}

// ─────────────────────────────────────────
// MULTIPLICADORES Y DESCUENTOS
// ─────────────────────────────────────────
export function obtenerMultiplicador() {
  let multiplicador = 1;
  if (estado.heroes.includes("kropotkin")) multiplicador += 0.10;
  const colectivosActivos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (estado.heroes.includes("rosa") && colectivosActivos > 3) multiplicador *= 2;
  return multiplicador;
}

export function obtenerPoderClic() {
  let poder = 1;
  if (estado.nivelAgitacion > 0) {
    poder = MEJORAS_AGITACION[estado.nivelAgitacion - 1].poderClic;
  }
  if (estado.heroes.includes("freire")) poder *= 2;
  poder *= obtenerBonusArbol().multClic;
  // Sección "héroes" del árbol de agitación: +10⚡ por héroe por nivel
  const nivelHeroes = legado.nivelesAgitacionClic?.heroes ?? 0;
  if (nivelHeroes > 0) poder += estado.heroes.length * AGITACION_CLIC_HEROES_POR_NIV * nivelHeroes;
  poder *= getQteMultiplicador();
  return poder;
}

export function obtenerDescuentoMejoras() {
  const mejoras = estado.colectivos.reduce((total, col) => total + Math.max(0, col.nivel - 1), 0);
  if (estado.heroes.includes("zapata")) return Math.min(0.5, mejoras * 0.02);
  return 0;
}

// ─────────────────────────────────────────
// PRESIÓN CAPITALISTA — tasas y penalización
// ─────────────────────────────────────────
export function obtenerTasaPresion() {
  const activos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (activos === 0) return 0;
  let tasa = PRESION_TASA_BASE + activos * PRESION_TASA_POR_COL;
  if (estado.mejorasResistencia.includes("fondo-solidaridad")) tasa *= 0.70;
  if (estado.mejorasResistencia.includes("red-autodefensa"))   tasa *= 0.70;
  if (estado.mejorasResistencia.includes("contrainformacion")) tasa *= 0.60;
  return tasa;
}

export function obtenerPenalizacionPresion() {
  const p = estado.presionCapitalista;
  if (p < 50) return 1;
  let penBase;
  if (p < 80) penBase = (p - 50) / 30 * 0.10;
  else        penBase = 0.10 + (p - 80) / 20 * 0.15;
  const reduccion = estado.mejorasResistencia.includes("contrainformacion") ? 0.12 : 0;
  return 1 - Math.max(0, penBase - reduccion);
}

// ─────────────────────────────────────────
// COSTE DE MEJORA (exponencial)
// datos.coste × (1 + factor)^nivel
//   Misma lógica que producción: cada nivel cuesta (1+factor) veces el anterior.
// ─────────────────────────────────────────
export function costeMejora(colectivo) {
  const datos     = COLECTIVOS[colectivo.id];
  const factor    = FACTORES_COSTE[colectivo.id] ?? 0.12;
  const descuento = obtenerDescuentoTierColectivo(colectivo.id);
  return Math.floor(datos.coste * Math.pow(1 + factor, colectivo.nivel) * (1 - descuento));
}

// Descuento sobre el coste de subir nivel de Agitación (tab Mejoras)
export function obtenerDescuentoAgitacionMejora() {
  return Math.min(0.90, (legado.nivelAgitacionCoste ?? 0) * AGITACION_COSTE_PCT_NIVEL);
}

// ─────────────────────────────────────────
// PRODUCCIÓN EXPONENCIAL POR COLECTIVO
// base × (1 + factor)^(nivel-1)
//   Cada nivel añade al anterior su propio valor × factor.
//   nivel=1 → base · nivel=2 → base×(1+factor) · nivel=3 → base×(1+factor)² · etc.
// ─────────────────────────────────────────
export function produccionBase(colId, nivel) {
  if (nivel <= 0) return 0;
  const base   = COLECTIVOS[colId].ingresoPorSegundo;
  const factor = FACTORES_EXPONENCIAL[colId] ?? 0.10;
  return base * Math.pow(1 + factor, nivel - 1);
}

// ─────────────────────────────────────────
// CALCULAR INGRESO POR SEGUNDO
// (escribe en estado.concienciaPorSegundo)
// ─────────────────────────────────────────
export function calcularIngreso() {
  const multiplicador = obtenerMultiplicador();
  const penPresion    = obtenerPenalizacionPresion();
  const multEvento    = (estado.efectoTemporal &&
                         estado.efectoTemporal.tipo === "produccion" &&
                         estado.efectoTemporal.expira > Date.now())
                        ? estado.efectoTemporal.mult : 1;

  estado.concienciaPorSegundo = estado.colectivos.reduce((total, col) => {
    if (col.nivel === 0) return total;
    let produccion = produccionBase(col.id, col.nivel);
    if (estado.heroes.includes("dolores") && col.id === 3) produccion *= 1.5;
    if (estado.heroes.includes("tesla")   && col.id === 6) produccion *= 2;
    produccion *= getBonusProduccionArbol(col.id);
    return total + produccion;
  }, 0) * multiplicador * penPresion * multEvento;
}
