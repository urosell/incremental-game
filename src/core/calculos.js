// ─────────────────────────────────────────
// CÁLCULOS — funciones puras (o casi puras) del juego
// ─────────────────────────────────────────
import { estado, legado } from "./estado.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { MEJORAS_AGITACION } from "../data/mejoras.js";
import {
  LLAMAS_DIVISOR,
  PRESION_TASA_BASE,
  PRESION_TASA_POR_COL,
  HUELGA_DURACION_BASE,
  HUELGA_COOLDOWN_BASE,
  HUELGA_REDUCCION_BASE,
} from "../config/balance.js";

// ─────────────────────────────────────────
// FORMATEAR NÚMEROS
// ─────────────────────────────────────────
export function formatear(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + " millones";
  if (n >= 1_000)         return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (n < 10)             return n.toFixed(2);
  return n.toFixed(1);
}

// ─────────────────────────────────────────
// LEGADO — llamas
// ─────────────────────────────────────────
export function calcularLlamas(concienciaTotal) {
  return Math.max(1, Math.floor(Math.sqrt(concienciaTotal / LLAMAS_DIVISOR)));
}

// ─────────────────────────────────────────
// ÁRBOL — bonificaciones derivadas de los nodos comprados
// ─────────────────────────────────────────
export function obtenerBonusArbol() {
  const n = legado.nodos;
  let multProduccion = 1;
  if (n.includes("prod-1")) multProduccion *= 1.05;
  if (n.includes("prod-2")) multProduccion *= 1.10;
  if (n.includes("prod-3")) multProduccion *= 1.20;

  let multClic = 1;
  if (n.includes("agit-1")) multClic *= 1.5;
  if (n.includes("agit-2")) multClic *= 2;
  if (n.includes("agit-3")) multClic *= 3;

  const descuentoColectivos = n.includes("res-1") ? 0.10 : 0;
  const descuentoMejoras    = n.includes("res-2") ? 0.15 : 0;
  const reduccionPresion    = n.includes("res-3") ? 0.25 : 0;

  return { multProduccion, multClic, descuentoColectivos, descuentoMejoras, reduccionPresion };
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
  tasa *= (1 - obtenerBonusArbol().reduccionPresion);
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
// COSTE DE MEJORA
// ─────────────────────────────────────────
export function costeMejora(colectivo) {
  const datos = COLECTIVOS[colectivo.id];
  const descuento = obtenerBonusArbol().descuentoMejoras;
  return Math.floor(datos.coste * (colectivo.nivel + 1) * 1.5 * (1 - descuento));
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

  const bonusArbol = obtenerBonusArbol();
  estado.concienciaPorSegundo = estado.colectivos.reduce((total, col) => {
    if (col.nivel === 0) return total;
    const datos = COLECTIVOS[col.id];
    let produccion = datos.ingresoPorSegundo * col.nivel;
    if (estado.heroes.includes("dolores") && col.id === 3) produccion *= 1.5;
    if (estado.heroes.includes("tesla")   && col.id === 6) produccion *= 2;
    return total + produccion;
  }, 0) * multiplicador * penPresion * multEvento * bonusArbol.multProduccion;
}
