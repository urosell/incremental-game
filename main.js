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
  renderizarMejorasResistencia,
  renderizarMejorasHuelga,
  renderizarAgitacion,
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
import {
  comprarNodoArbol,
  abrirArbolConsulta,
  cerrarArbolConsulta,
} from "./src/sistemas/arbol-legado.js";

// ─────────────────────────────────────────
// CARGAR PARTIDA
// ─────────────────────────────────────────
cargarLegado();
cargarEstado();
if (!Array.isArray(estado.mejorasResistencia)) estado.mejorasResistencia = [];
//estado.siguienteEvento = Date.now() + 120000; // primer evento tras 2 min

// ─────────────────────────────────────────
// LISTENER DELEGADO — un único click handler para todo el HTML
// Cada botón con `data-accion="..."` (y opcionalmente `data-arg="..."`)
// dispara la función correspondiente del mapa de abajo.
// ─────────────────────────────────────────
const acciones = {
  // Colectivos (arg = índice numérico)
  "comprar":                   (arg) => comprar(Number(arg)),
  "mejorar":                   (arg) => mejorar(Number(arg)),
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
  "comenzar-nueva-run":        () => comenzarNuevaRun(),
  // Auth
  "handle-login":              () => handleLogin(),
  "handle-logout":             () => handleLogout(),
};

document.body.addEventListener("click", (e) => {
  const el = e.target.closest("[data-accion]");
  if (!el || el.disabled) return;
  const fn = acciones[el.dataset.accion];
  if (fn) fn(el.dataset.arg);
});

// ─────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────
inicializarBtnAgitar();
inicializarAuth();
iniciarBucle();

// ─────────────────────────────────────────
// PRIMER PINTADO
// ─────────────────────────────────────────
calcularIngreso();
renderizar();
renderizarColectivos();
renderizarMejorasResistencia();
actualizarBotonRevolucion();
renderizarAgitacion();
renderizarMejorasHuelga();
