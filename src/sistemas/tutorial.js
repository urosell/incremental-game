// ─────────────────────────────────────────
// SISTEMA — Tutorial interactivo
// ─────────────────────────────────────────

const CLAVE_TUTORIAL = "class-rising-tutorial-completado";

// ─────────────────────────────────────────
// PASOS DEL TUTORIAL
// target   → selector CSS del elemento a destacar (null = tarjeta centrada)
// tab      → tab a activar en mobile antes de mostrar el paso
// flecha   → dónde apunta la flecha del tooltip ("arriba"|"abajo"|null)
// ─────────────────────────────────────────
const PASOS = [
  {
    id: "bienvenida",
    emoji: "★",
    titulo: "Bienvenido a Class Rising",
    texto: "Eres el organizador de un movimiento que aspira a transformar la sociedad. Empieza desde abajo y, cuando el momento llegue, declara la Revolución.",
    target: null,
    tab: "inicio",
  },
  {
    id: "conciencia",
    emoji: "⚡",
    titulo: "Conciencia de Clase",
    texto: "Este número es tu recurso principal — la energía del movimiento. Todo cuesta conciencia y todo la genera. Acumúlala.",
    target: "#conciencia-display",
    tab: "inicio",
    flecha: "abajo",
  },
  {
    id: "agitar",
    emoji: "✊",
    titulo: "¡Agitar!",
    texto: "Pulsa este botón para generar <img src='Imagenes/Conciencia_Clase.png' class='icono-cc' alt='⚡'> manualmente. Al principio es tu única fuente. Cuanto más mejores la Fuerza de Agitación, más genera cada clic.",
    target: ".inicio-agitar-bloque",
    tab: "inicio",
    flecha: "arriba",
  },
  {
    id: "colectivos",
    emoji: "🏘️",
    titulo: "Colectivos",
    texto: "Los colectivos generan <img src='Imagenes/Conciencia_Clase.png' class='icono-cc' alt='⚡'> automáticamente, segundo a segundo. Organiza el primero y el movimiento nunca para. Mejóralos para multiplicar su producción.",
    target: "#lista-colectivos-movil",
    tab: "inicio",
    flecha: "arriba",
  },
  {
    id: "progreso",
    emoji: "📈",
    titulo: "Camino a la Revolución",
    texto: "Esta barra refleja tu conciencia acumulada históricamente. Cuando llegue al máximo podrás declarar la Revolución.",
    target: "#progreso-revolucion",
    tab: "inicio",
    flecha: "abajo",
  },
  {
    id: "presion",
    emoji: "⚠️",
    titulo: "Presión Capitalista",
    texto: "El capital contraataca. Esta barra sube mientras organizas colectivos. Si llega al límite, penaliza tu producción. Mantenla bajo control.",
    target: "#presion-section",
    tab: "inicio",
    flecha: "abajo",
  },
  {
    id: "huelga",
    emoji: "🪧",
    titulo: "Huelga General",
    texto: "La huelga reduce la presión rápidamente. Tiene duración y cooldown — úsala en el momento justo, no lo malgastes.",
    target: "#huelga-section",
    tab: "inicio",
    flecha: "arriba",
  },
  {
    id: "mejoras",
    emoji: "🛡️",
    titulo: "Panel de Mejoras",
    texto: "Aquí refuerzas el movimiento: reduce la Presión Capitalista, potencia la Huelga General y aumenta tu Fuerza de Agitación.",
    target: ".nav-tab[data-arg='mejoras']",
    tab: "mejoras",
    flecha: null,
  },
  {
    id: "revolucion",
    emoji: "🔴",
    titulo: "La Revolución",
    texto: "Cuando acumules suficiente conciencia, aparece este botón. Todo se resetea — colectivos, mejoras, conciencia. Pero el movimiento no muere: progresa.",
    target: "#btn-revolucion",
    tab: "inicio",
    flecha: "abajo",
  },
  {
    id: "heroe",
    emoji: "🌟",
    titulo: "Elige un Héroe",
    texto: "Al declarar la Revolución, eliges un Héroe histórico. Cada uno tiene un bonus permanente único — Rosa Luxemburg dobla la producción, Freire dobla el clic, Allende arranca con 500 <img src='Imagenes/Conciencia_Clase.png' class='icono-cc' alt='⚡'>... Elige con estrategia.",
    target: null,
    tab: "inicio",
  },
  {
    id: "llamas",
    emoji: "🔥",
    titulo: "Llamas Revolucionarias",
    texto: "Cada revolución genera 🔥 según la conciencia acumulada. Gástalas en el Árbol Revolucionario antes de empezar el siguiente ciclo — para arrancar más fuerte cada vez.",
    target: null,
    tab: "inicio",
  },
  {
    id: "fin",
    emoji: "★",
    titulo: "¡Ya estás listo!",
    texto: "El pueblo, unido, jamás será vencido.\n\nPuedes relanzar este tutorial en cualquier momento desde ⚙ Ajustes.",
    target: null,
    tab: "inicio",
  },
];

// ─────────────────────────────────────────
// ESTADO INTERNO
// ─────────────────────────────────────────
let pasoActual = 0;
let cambiarTabFn = null; // inyectado desde main.js

// ─────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────
export function inicializarTutorial(fnCambiarTab) {
  cambiarTabFn = fnCambiarTab;
}

export function iniciarTutorial() {
  pasoActual = 0;
  document.getElementById("tutorial-overlay").classList.remove("oculto");
  mostrarPaso(pasoActual);
}

export function tutorialCompletado() {
  return localStorage.getItem(CLAVE_TUTORIAL) === "si";
}

// ─────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────
function siguiente() {
  pasoActual++;
  if (pasoActual >= PASOS.length) {
    cerrar(true);
  } else {
    mostrarPaso(pasoActual);
  }
}

function cerrar(completado = false) {
  document.getElementById("tutorial-overlay").classList.add("oculto");
  limpiarHighlight();
  if (completado) {
    localStorage.setItem(CLAVE_TUTORIAL, "si");
  }
}

// ─────────────────────────────────────────
// RENDERIZADO DE PASO
// ─────────────────────────────────────────
function mostrarPaso(idx) {
  const paso = PASOS[idx];

  // Cambiar tab en mobile si hace falta
  if (cambiarTabFn && paso.tab) {
    const esMobile = window.innerWidth <= 1024;
    if (esMobile) cambiarTabFn(paso.tab);
  }

  // Actualizar texto del tooltip
  document.getElementById("tut-emoji").textContent  = paso.emoji || "★";
  document.getElementById("tut-titulo").textContent = paso.titulo;
  document.getElementById("tut-texto").innerHTML    = paso.texto;
  document.getElementById("tut-contador").textContent =
    `${idx + 1} / ${PASOS.length}`;

  const btnSig = document.getElementById("tut-btn-siguiente");
  btnSig.textContent = idx === PASOS.length - 1 ? "¡Empezar!" : "Siguiente →";

  // Posicionar highlight y tooltip
  if (paso.target) {
    // Pequeño delay para que el tab cambie y el DOM se pinte
    setTimeout(() => posicionarConTarget(paso), 80);
  } else {
    limpiarHighlight();
    centrarTooltip();
  }
}

function posicionarConTarget(paso) {
  const el = document.querySelector(paso.target);
  if (!el) {
    limpiarHighlight();
    centrarTooltip();
    return;
  }

  const rect      = el.getBoundingClientRect();
  const PADDING   = 8;
  const esMobile  = window.innerWidth <= 1024;
  const highlight = document.getElementById("tut-highlight");
  const tooltip   = document.getElementById("tut-tooltip");

  // Posicionar highlight sobre el elemento
  document.getElementById("tutorial-overlay").classList.remove("sin-highlight");
  highlight.style.display = "block";
  highlight.style.top     = (rect.top    - PADDING) + "px";
  highlight.style.left    = (rect.left   - PADDING) + "px";
  highlight.style.width   = (rect.width  + PADDING * 2) + "px";
  highlight.style.height  = (rect.height + PADDING * 2) + "px";


  // Desktop: posicionar arriba o abajo según espacio, con margen seguro
  tooltip.style.position  = "fixed";
  tooltip.style.left      = "50%";
  tooltip.style.right     = "auto";
  tooltip.style.width     = "";
  tooltip.style.maxWidth  = "";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.top       = "auto";
  tooltip.style.bottom    = "auto";

  const MARGEN       = 16;
  const espacioAbajo = window.innerHeight - rect.bottom;
  const espacioArr   = rect.top;

  if (espacioAbajo >= espacioArr) {
    tooltip.style.top      = Math.min(rect.bottom + PADDING + MARGEN, window.innerHeight - 240) + "px";
    tooltip.dataset.flecha = "arriba";
  } else {
    tooltip.style.bottom   = Math.min(window.innerHeight - rect.top + PADDING + MARGEN, window.innerHeight - 240) + "px";
    tooltip.dataset.flecha = "abajo";
  }
}

function centrarTooltip() {
  const highlight = document.getElementById("tut-highlight");
  const tooltip   = document.getElementById("tut-tooltip");

  highlight.style.display = "none";
  document.getElementById("tutorial-overlay").classList.add("sin-highlight");

  tooltip.style.position  = "fixed";
  tooltip.style.top       = "50%";
  tooltip.style.left      = "50%";
  tooltip.style.right     = "auto";
  tooltip.style.bottom    = "auto";
  tooltip.style.transform = "translate(-50%, -50%)";
  tooltip.style.width     = "";
  tooltip.style.maxWidth  = "";
  tooltip.dataset.flecha  = "";
}

function limpiarHighlight() {
  const h = document.getElementById("tut-highlight");
  if (h) h.style.display = "none";
}

// ─────────────────────────────────────────
// EVENTOS DE BOTONES (delegados desde main)
// ─────────────────────────────────────────
export function handleTutorialAccion(accion) {
  if (accion === "tut-siguiente") siguiente();
  if (accion === "tut-saltar")    cerrar(false);
}
