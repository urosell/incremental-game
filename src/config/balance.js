// ─────────────────────────────────────────
// CONSTANTES DE BALANCEO — toca aquí para ajustar el juego
// ─────────────────────────────────────────
export const UMBRAL_REVOLUCION        = 500;      // conciencia total necesaria para declarar revolución
export const MAX_NIVEL_COLECTIVO      = 100;      // nivel máximo de cada colectivo
export const COOLDOWN_MANIFESTACION   = 60000;    // ms entre manifestaciones
export const DT                       = 0.1;      // segundos por tick del bucle principal

export const LLAMAS_DIVISOR           = 100;      // calcularLlamas: √(concienciaTotal / LLAMAS_DIVISOR)
export const PRESION_TASA_BASE        = 0.02;     // presión que sube por tick cuando hay ≥1 colectivo
export const PRESION_TASA_POR_COL     = 0.015;    // presión adicional por cada colectivo activo

export const HUELGA_DURACION_BASE     = 30;       // segundos que dura la huelga activa
export const HUELGA_COOLDOWN_BASE     = 90;       // segundos de cooldown tras la huelga
export const HUELGA_REDUCCION_BASE    = 2;        // % de presión que reduce por segundo durante la huelga
export const HUELGA_UMBRAL_AUTO       = 75;       // % de presión que activa la huelga automática
