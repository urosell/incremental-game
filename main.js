// ─────────────────────────────────────────
// MAIN — punto de entrada
//   1. Carga la partida guardada
//   2. Engancha el listener delegado de clics (data-accion)
//   3. Inicializa auth, btn-agitar y arranca el bucle
//   4. Hace el primer pintado
// ─────────────────────────────────────────
import { estado } from "./src/core/estado.js";
import { calcularIngreso } from "./src/core/calculos.js";
import { cargarEstado, cargarLegado } from "./src/core/persistencia.js";

import { renderizar, actualizarBotonRevolucion } from "./src/ui/render.js";
import { abrirModal, cerrarModal, abrirLegado, cerrarLegado } from "./src/ui/modales.js";
import { renderizarColectivos } from "./src/ui/render-colectivos.js";
import {
  renderizarMejoras,
  renderizarMejorasResistencia,
  renderizarMejorasHuelga,
  renderizarAgitacion,
  cambiarSubtabMejoras,
} from "./src/ui/render-mejoras.js";

import {
  comprar,
  mejorar,
  mejorarAgitacion,
  comprarMejoraResistencia,
  inicializarBtnAgitar,
} from "./src/acciones.js";
import { handleLogin, handleLogout, inicializarAuth } from "./src/auth.js";
import { iniciarBucle } from "./src/bucle.js";

import { activarHuelga, comprarMejoraHuelga } from "./src/sistemas/huelga.js";
import { comenzarNuevaRun, mostrarHeroes } from "./src/sistemas/revolucion.js";
import { inicializarTutorial, iniciarTutorial, handleTutorialAccion } from "./src/sistemas/tutorial.js";
import { formatear } from "./src/core/calculos.js";
import { mostrarNotificacion } from "./src/ui/notificacion.js";
import {
  comprarNodoArbol,
  abrirArbolConsulta,
  cerrarArbolConsulta,
} from "./src/sistemas/arbol-legado.js";
import { cambiarSubtabArbol, renderizarArbol } from "./src/ui/render-arbol.js";
import { inicializarCiudad, detenerCiudad, ocultarInfoPanel, refrescarInfoPanel } from "./src/ui/ciudad.js";

// ─────────────────────────────────────────
// CARGAR PARTIDA
// ─────────────────────────────────────────
cargarLegado();
cargarEstado();
if (!Array.isArray(estado.mejorasResistencia)) estado.mejorasResistencia = [];
// Programar primer evento si no hay uno pendiente (15 min tras arrancar)
if (!estado.siguienteEvento || estado.siguienteEvento === 0) {
  estado.siguienteEvento = Date.now() + 15 * 60000;
}

// ─────────────────────────────────────────
// LISTENER DELEGADO — un único click handler para todo el HTML
// Cada botón con `data-accion="..."` (y opcionalmente `data-arg="..."`)
// dispara la función correspondiente del mapa de abajo.
// ─────────────────────────────────────────
const acciones = {
  // Colectivos (arg = índice numérico)
  "comprar":                   (arg) => { comprar(Number(arg)); refrescarInfoPanel(); },
  "mejorar":                   (arg) => { mejorar(Number(arg)); refrescarInfoPanel(); },
  // Mejoras
  "mejorar-agitacion":         () => mejorarAgitacion(),
  "comprar-mejora-resistencia":(arg) => comprarMejoraResistencia(arg),
  "comprar-mejora-huelga":     (arg) => comprarMejoraHuelga(arg),
  "comprar-nodo-arbol":        (arg) => comprarNodoArbol(arg),
  // Huelga
  "activar-huelga":            () => activarHuelga(),
  // Modales (arg = id del modal a abrir/cerrar)
  "abrir-modal":               (arg) => abrirModal(arg),
  "cerrar-modal":              (arg) => cerrarModal(arg),
  "abrir-legado":              () => abrirLegado(),
  "cerrar-legado":             () => cerrarLegado(),
  "mostrar-heroes":            () => mostrarHeroes(),
  // Árbol
  "abrir-arbol-consulta":      () => abrirArbolConsulta(),
  "cerrar-arbol-consulta":     () => cerrarArbolConsulta(),
  "cerrar-ciudad-info":        () => ocultarInfoPanel(),
  "cambiar-subtab-arbol":      (arg) => { cambiarSubtabArbol(arg); renderizarArbol(esModoConsulta()); },
  "cambiar-subtab-mejoras":    (arg) => { cambiarSubtabMejoras(arg); renderizarMejoras(); },
  "comenzar-nueva-run":        () => comenzarNuevaRun(),
  // Reset
  "resetear-run": () => {
    if (confirm("¿Resetear la run actual?\nPerderás conciencia, colectivos y mejoras.\nEl legado y los héroes se conservan.")) {
      localStorage.removeItem("conciencia-de-clase-v1");
      location.reload();
    }
  },
  "resetear-todo": () => {
    if (confirm("¿Resetear TODO?\nSe borrarán la run actual Y el legado completo (héroes, árbol, llamas).\nEsta acción no se puede deshacer.")) {
      localStorage.removeItem("conciencia-de-clase-v1");
      localStorage.removeItem("conciencia-de-clase-legado-v1");
      location.reload();
    }
  },
  // Auth
  "handle-login":              () => handleLogin(),
  "handle-logout":             () => handleLogout(),
  // Navegación mobile
  "cambiar-tab":               (arg) => cambiarTab(arg),
  // Tutorial
  "iniciar-tutorial":          () => iniciarTutorial(),
  "tut-siguiente":             () => handleTutorialAccion("tut-siguiente"),
  "tut-saltar":                () => handleTutorialAccion("tut-saltar"),
};

document.body.addEventListener("click", (e) => {
  const el = e.target.closest("[data-accion]");
  if (!el || el.disabled) return;
  const fn = acciones[el.dataset.accion];
  if (fn) fn(el.dataset.arg);
});

// Detecta si el árbol está en modo consulta (sin botón "comenzar run")
function esModoConsulta() {
  const footer = document.getElementById("panel-arbol-footer");
  return footer && footer.style.display === "none";
}

// ─────────────────────────────────────────
// NAVEGACIÓN MOBILE — cambio de tabs
// ─────────────────────────────────────────
function cambiarTab(tab) {
  // ── 1. Marcar tab activo en la barra ──
  document.querySelectorAll(".nav-tab").forEach(btn => btn.classList.remove("tab-activo"));
  document.querySelector(`.nav-tab[data-arg="${tab}"]`)?.classList.add("tab-activo");

  // ── 2. Paneles principales (inicio / colectivos / mejoras) ──
  document.getElementById("panel-izquierdo").classList.toggle("tab-activo", tab === "inicio");
  document.getElementById("panel-derecho").classList.toggle("tab-activo",   tab === "colectivos");
  document.getElementById("panel-mejoras").classList.toggle("tab-activo",   tab === "mejoras");

  // ── 3. Árbol ──
  const panelArbol = document.getElementById("panel-arbol");
  if (tab === "arbol") {
    abrirArbolConsulta();            // renderiza contenido + quita oculto-panel
    panelArbol.classList.add("tab-activo");
  } else {
    panelArbol.classList.remove("tab-activo");
    panelArbol.classList.add("oculto-panel");
  }

  // ── 4. Legado ──
  const panelLegado = document.getElementById("panel-legado");
  if (tab === "legado") {
    abrirLegado();                   // rellena héroes + quita oculto-panel
    panelLegado.classList.add("tab-activo");
  } else {
    panelLegado.classList.remove("tab-activo");
    panelLegado.classList.add("oculto-panel");
  }

  // ── 5. Ciudad ──
  const panelCiudad = document.getElementById("panel-ciudad");
  if (panelCiudad) {
    panelCiudad.classList.toggle("tab-activo", tab === "ciudad");
    if (tab === "ciudad") {
      // Mover el header de inicio al slot de ciudad
      const header = document.querySelector(".inicio-header");
      const slot   = document.getElementById("ciudad-header-slot");
      if (header && slot && !slot.contains(header)) slot.appendChild(header);
      inicializarCiudad();
    } else {
      // Devolver el header a panel-izquierdo si estaba en ciudad
      const header   = document.querySelector(".inicio-header");
      const panelIzq = document.getElementById("panel-izquierdo");
      if (header && panelIzq && !panelIzq.contains(header)) {
        panelIzq.insertBefore(header, panelIzq.firstChild);
      }
      detenerCiudad();
    }
  }

  // ── 6. Ajustes ──
  const panelAjustes = document.getElementById("panel-ajustes");
  if (panelAjustes) {
    panelAjustes.classList.toggle("tab-activo", tab === "ajustes");
  }
}

// ─────────────────────────────────────────
// SWIPE MOBILE — cambio de tabs con deslizamiento
// ─────────────────────────────────────────
const TABS_ORDEN = ["inicio", "mejoras", "arbol", "ciudad", "legado", "ajustes"];
const SWIPE_MIN  = 50;  // px mínimos para considerar swipe
const SWIPE_MAX_Y = 80; // px máximos en vertical (para no confundir con scroll)

function tabActual() {
  const activo = document.querySelector(".nav-tab.tab-activo");
  return activo ? activo.dataset.arg : "inicio";
}

(function inicializarSwipe() {
  let startX = 0;
  let startY = 0;

  document.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);

    if (Math.abs(dx) < SWIPE_MIN || dy > SWIPE_MAX_Y) return;

    const idx = TABS_ORDEN.indexOf(tabActual());
    if (dx < 0 && idx < TABS_ORDEN.length - 1) {
      // swipe izquierda → tab siguiente
      cambiarTab(TABS_ORDEN[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      // swipe derecha → tab anterior
      cambiarTab(TABS_ORDEN[idx - 1]);
    }
  }, { passive: true });
})();

// ─────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────
inicializarBtnAgitar();
inicializarAuth();
iniciarBucle();
inicializarTutorial(cambiarTab);

// ─────────────────────────────────────────
// PROGRESO OFFLINE — Engels
// ─────────────────────────────────────────
function aplicarProgresoOffline() {
  if (!estado.heroes.includes("engels")) return;
  if (!estado.ultimoGuardado)            return;

  const EFICIENCIA    = 0.5;
  const TOPE_SEGUNDOS = 4 * 60 * 60; // 4 horas máximo

  const tiempoFuera = Math.min(
    (Date.now() - estado.ultimoGuardado) / 1000,
    TOPE_SEGUNDOS
  );
  if (tiempoFuera < 30) return; // menos de 30s: ignorar

  const ganancia = estado.concienciaPorSegundo * tiempoFuera * EFICIENCIA;
  if (ganancia <= 0) return;

  estado.conciencia      += ganancia;
  estado.concienciaTotal += ganancia;

  const horas   = Math.floor(tiempoFuera / 3600);
  const minutos = Math.floor((tiempoFuera % 3600) / 60);
  const segundos = Math.floor(tiempoFuera % 60);
  const tiempoStr = horas > 0
    ? `${horas}h ${minutos}min`
    : minutos > 0
      ? `${minutos}min ${segundos}s`
      : `${segundos}s`;

  mostrarNotificacion(
    `🏭 Engels ha seguido organizando en tu ausencia (${tiempoStr}). +${formatear(ganancia)} ⚡`
  );
}

// ─────────────────────────────────────────
// PRIMER PINTADO
// ─────────────────────────────────────────
calcularIngreso();
aplicarProgresoOffline();
renderizar();
renderizarColectivos();
renderizarMejoras();
actualizarBotonRevolucion();
