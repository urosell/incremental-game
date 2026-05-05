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
export const MEJORAS_AGITACION = (() => {
  const niveles = [
    { nivel: 1,  coste: 100,       poderClic: 2   },
    { nivel: 2,  coste: 500,       poderClic: 4   },
    { nivel: 3,  coste: 2000,      poderClic: 8   },
    { nivel: 4,  coste: 8000,      poderClic: 15  },
    { nivel: 5,  coste: 30000,     poderClic: 25  },
    { nivel: 6,  coste: 100000,    poderClic: 40  },
    { nivel: 7,  coste: 350000,    poderClic: 60  },
    { nivel: 8,  coste: 1200000,   poderClic: 90  },
    { nivel: 9,  coste: 4000000,   poderClic: 130 },
    { nivel: 10, coste: 12000000,  poderClic: 180 },
  ];
  for (let n = 11; n <= 100; n++) {
    const prev = niveles[niveles.length - 1];
    niveles.push({
      nivel:    n,
      coste:    Math.floor(prev.coste    * 3.2),
      poderClic: Math.floor(prev.poderClic * 1.4),
    });
  }
  return niveles;
})();
