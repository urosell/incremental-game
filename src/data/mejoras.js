// ─────────────────────────────────────────
// DATOS — Mejoras de Resistencia (Fase 3)
// ─────────────────────────────────────────
export const MEJORAS_RESISTENCIA = [
  {
    id: "fondo-solidaridad",
    nombre: "Fondo de Solidaridad",
    emoji: "🛡️",
    descripcion: "Ralentiza la Presión Capitalista un 30%.",
    coste: 500,
  },
  {
    id: "red-autodefensa",
    nombre: "Red de Autodefensa",
    emoji: "✊",
    descripcion: "Ralentiza la Presión un 30% más.",
    coste: 5000,
  },
  {
    id: "contrainformacion",
    nombre: "Contrainformación",
    emoji: "📡",
    descripcion: "Ralentiza la Presión un 40% más y reduce su penalización.",
    coste: 50000,
  },
];

// ─────────────────────────────────────────
// DATOS — Mejoras de Huelga General
// ─────────────────────────────────────────
export const MEJORAS_HUELGA = [
  { id: "huelga-duracion",  nombre: "Huelga Prolongada",   emoji: "⏱️", descripcion: "+30s de duración activa.",                    coste: 3000   },
  { id: "huelga-reduccion", nombre: "Huelga Salvaje",      emoji: "💥", descripcion: "Doble velocidad de reducción de presión.",    coste: 15000  },
  { id: "huelga-cooldown",  nombre: "Movilización Rápida", emoji: "⚡", descripcion: "−30s de cooldown entre huelgas.",             coste: 50000  },
  { id: "huelga-auto",      nombre: "Red Sindical Activa", emoji: "🤝", descripcion: "Se activa sola cuando la Presión supera 75%.", coste: 200000 },
];

// ─────────────────────────────────────────
// DATOS — Mejoras de Agitación
// ─────────────────────────────────────────
// Poder ×2 por nivel, coste ×2.5 por nivel
export const MEJORAS_AGITACION = (() => {
  const niveles = [];
  for (let n = 1; n <= 100; n++) {
    niveles.push({
      nivel:     n,
      coste:     Math.floor(100 * Math.pow(2.5, n - 1)),
      poderClic: Math.pow(2, n),
    });
  }
  return niveles;
})();
