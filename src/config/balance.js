// ─────────────────────────────────────────
// CONSTANTES DE BALANCEO — toca aquí para ajustar el juego
// ─────────────────────────────────────────
export const UMBRAL_REVOLUCION        = 50_000_000_000; // conciencia total necesaria para declarar revolución
export const UMBRAL_TRAMPA            = 10_000;         // umbral falso mostrado en la primera run
export const MAX_NIVEL_COLECTIVO      = 100;      // nivel máximo de cada colectivo
export const COOLDOWN_MANIFESTACION   = 60000;    // ms entre manifestaciones
export const DT                       = 0.1;      // segundos por tick del bucle principal

export const LLAMAS_DIVISOR           = 2_000_000_000; // calcularLlamas: concienciaTotal / LLAMAS_DIVISOR (lineal)
export const PRESION_TASA_BASE        = 0.02;     // presión que sube por tick cuando hay ≥1 colectivo
export const PRESION_TASA_POR_COL     = 0.015;    // presión adicional por cada colectivo activo

export const HUELGA_DURACION_BASE     = 30;       // segundos que dura la huelga activa
export const HUELGA_COOLDOWN_BASE     = 90;       // segundos de cooldown tras la huelga
export const HUELGA_REDUCCION_BASE    = 2;        // % de presión que reduce por segundo durante la huelga
export const HUELGA_UMBRAL_AUTO       = 75;       // % de presión que activa la huelga automática

// Árbol — rama resiliencia por tier
export const RESILIENCIA_TIER_COSTE_POR_NIVEL = 5;    // 🔥 por cada nivel (igual para todos los tiers, ajustar aquí)
export const RESILIENCIA_TIER_MAX_NIVEL       = 20;   // niveles máximos por elemento de tier
export const RESILIENCIA_TIER_PCT_POR_NIVEL   = 0.03; // descuento acumulado por nivel (3% → 6% → 9%...)

// Árbol — rama agitación: cadena de coste de mejoras
export const AGITACION_COSTE_POR_NIVEL  = 5;    // 🔥 por cada nivel
export const AGITACION_COSTE_MAX_NIVEL  = 10;   // niveles máximos
export const AGITACION_COSTE_PCT_NIVEL  = 0.10; // −10% coste mejoras por nivel (−10% → −20% → ... → −100%)

// Árbol — rama agitación: poder de clic (3 secciones secuenciales, 5 niveles cada una)
export const AGITACION_CLIC_COSTE_POR_NIVEL = 5;    // 🔥 por nivel (todas las secciones)
export const AGITACION_CLIC_MAX_NIVEL       = 5;    // niveles máximos por sección
export const AGITACION_CLIC_PCT_POR_NIVEL   = 0.50; // +50% poder de clic por nivel (sección mult)
export const AGITACION_CLIC_HEROES_POR_NIV  = 10;   // +10⚡ por héroe por nivel (sección héroes)

// Factor de PRODUCCIÓN por colectivo (índice 0-9).
// Fórmula: base × (1 + factor)^(nivel-1)
// Cada nivel añade al anterior su propio valor × factor.
// Ej. Asamblea nivel 1: 0.5  →  nivel 2: 0.5 + 0.5×1.1 = 1.05  →  nivel 3: 1.05 + 1.05×1.1 = 2.205
// Los colectivos tempranos tienen factor alto (impacto visible) y los tardíos bajo (base ya enorme).
export const FACTORES_EXPONENCIAL = [
  1.10,  // 0: Asamblea de Barrio       — ×2.10 por nivel
  0.90,  // 1: Cooperativa de Alimentos — ×1.90 por nivel
  0.80,  // 2: Biblioteca Popular       — ×1.80 por nivel
  0.70,  // 3: Sindicato Obrero         — ×1.70 por nivel
  0.60,  // 4: Colectivo de Vivienda    — ×1.60 por nivel
  0.50,  // 5: Radio Comunitaria        — ×1.50 por nivel
  0.40,  // 6: Cooperativa de Energía   — ×1.40 por nivel
  0.30,  // 7: Universidad Popular      — ×1.30 por nivel
  0.20,  // 8: Red de Comunas           — ×1.20 por nivel
  0.10,  // 9: La Internacional         — ×1.10 por nivel
];

// Factor de COSTE por colectivo — misma lógica que producción.
// Fórmula: datos.coste × (1 + factor)^nivel
// fc = fp + 0.02 para que cada nivel sea ligeramente más caro de recuperar.
export const FACTORES_COSTE = [
  1.12,  // 0: Asamblea
  0.92,  // 1: Coop. Alimentos
  0.82,  // 2: Biblioteca
  0.72,  // 3: Sindicato
  0.62,  // 4: Vivienda
  0.52,  // 5: Radio
  0.42,  // 6: Energía
  0.32,  // 7: Universidad
  0.22,  // 8: Comunas
  0.12,  // 9: Internacional
];
