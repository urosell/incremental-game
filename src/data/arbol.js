// ─────────────────────────────────────────
// DATOS — Árbol Revolucionario (Legado)
// ─────────────────────────────────────────
export const ARBOL_LEGADO = [
  // Producción
  { id: "prod-1", rama: "produccion",  emoji: "📋", nombre: "Organización Básica",       descripcion: "+5% producción de todos los colectivos.",              coste: 2,  requiere: null      },
  { id: "prod-2", rama: "produccion",  emoji: "🤝", nombre: "Solidaridad Obrera",        descripcion: "+10% producción de todos los colectivos.",             coste: 5,  requiere: "prod-1"  },
  { id: "prod-3", rama: "produccion",  emoji: "🌾", nombre: "Economía Comunitaria",      descripcion: "+20% producción de todos los colectivos.",             coste: 10, requiere: "prod-2"  },
  { id: "prod-4", rama: "produccion",  emoji: "🏗️", nombre: "Planificación Colectiva",  descripcion: "Empiezas cada partida con la Asamblea de Barrio activa.", coste: 18, requiere: "prod-3" },
  // Agitación
  { id: "agit-1", rama: "agitacion",   emoji: "📣", nombre: "Conciencia Popular",        descripcion: "+50% poder de clic.",                                  coste: 2,  requiere: null      },
  { id: "agit-2", rama: "agitacion",   emoji: "✊", nombre: "Movilización Masiva",       descripcion: "Poder de clic x2.",                                    coste: 5,  requiere: "agit-1"  },
  { id: "agit-3", rama: "agitacion",   emoji: "🔥", nombre: "Huelga General",            descripcion: "Poder de clic x3.",                                    coste: 10, requiere: "agit-2"  },
  { id: "agit-4", rama: "agitacion",   emoji: "⚡", nombre: "Vanguardia Revolucionaria", descripcion: "Empiezas con Fuerza de Agitación nivel 1 ya activo.",   coste: 18, requiere: "agit-3"  },
  // Resiliencia
  { id: "res-1",  rama: "resiliencia", emoji: "🛡️", nombre: "Redes de Apoyo",           descripcion: "Coste de colectivos −10%.",                            coste: 2,  requiere: null      },
  { id: "res-2",  rama: "resiliencia", emoji: "⚙️", nombre: "Autogestión",              descripcion: "Coste de mejorar colectivos −15%.",                    coste: 5,  requiere: "res-1"   },
  { id: "res-3",  rama: "resiliencia", emoji: "🏛️", nombre: "Fortaleza Popular",        descripcion: "Presión capitalista sube un 25% más lento.",           coste: 10, requiere: "res-2"   },
  { id: "res-4",  rama: "resiliencia", emoji: "🌟", nombre: "Territorio Liberado",      descripcion: "Empiezas con las 3 mejoras de Resistencia activas.",   coste: 18, requiere: "res-3"   },
];
