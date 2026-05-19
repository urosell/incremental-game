// ─────────────────────────────────────────
// ACCIONES DEL JUGADOR — clic, comprar, mejorar
// ─────────────────────────────────────────
import { estado } from "./core/estado.js";
import { MAX_NIVEL_COLECTIVO } from "./config/balance.js";
import { COLECTIVOS } from "./data/colectivos.js";
import { MEJORAS_RESISTENCIA, MEJORAS_AGITACION } from "./data/mejoras.js";
import {
  calcularIngreso,
  costeMejora,
  obtenerDescuentoMejoras,
  obtenerDescuentoTierColectivo,
  obtenerDescuentoAgitacionMejora,
  obtenerPoderClic,
} from "./core/calculos.js";
import { guardarEstado } from "./core/persistencia.js";
import { mostrarNotificacion } from "./ui/notificacion.js";
import { renderizar, actualizarBotonRevolucion } from "./ui/render.js";
import { renderizarColectivos } from "./ui/render-colectivos.js";
import {
  renderizarMejorasResistencia,
  renderizarAgitacion,
} from "./ui/render-mejoras.js";

// ─────────────────────────────────────────
// EFECTO VISUAL — icono flotante al agitar
// Para añadir imágenes: pon los archivos en Imagenes/Agitar/
// y sustituye IMAGENES_AGITAR con sus rutas.
// ─────────────────────────────────────────
const IMAGENES_AGITAR = [
  "Imagenes/Agitar/martillo.png",
  "Imagenes/Agitar/hoz.png",
];

let _agitarIdx = 0;

function spawnClickFx(x, y) {
  // Cantidad = 2^nivel, con cap en 16 para no saturar la pantalla
  const cantidad = Math.min(Math.pow(2, estado.nivelAgitacion), 16);

  for (let i = 0; i < cantidad; i++) {
    const el = document.createElement("div");
    el.className = "clic-fx";

    if (IMAGENES_AGITAR.length > 0) {
      const img = document.createElement("img");
      img.src = IMAGENES_AGITAR[_agitarIdx % IMAGENES_AGITAR.length];
      _agitarIdx++;
      el.appendChild(img);
    } else {
      el.innerHTML = `<img src="Imagenes/Conciencia_Clase.png" class="icono-cc" alt="⚡">`;
    }

    // Dispersión aleatoria proporcional a la cantidad
    const spread = Math.min(20 + cantidad * 8, 120);
    const offsetX = (Math.random() - 0.5) * spread;
    const offsetY = (Math.random() - 0.5) * spread * 0.4;
    el.style.left = (x + offsetX) + "px";
    el.style.top  = (y + offsetY) + "px";
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

// ─────────────────────────────────────────
// AGITAR — clic manual
// ─────────────────────────────────────────
function flashConciencia() {
  const el = document.getElementById("conciencia-display");
  if (!el) return;
  el.classList.remove("flash");
  void el.offsetWidth; // forzar reflow para reiniciar si se pulsa rápido
  el.classList.add("flash");
}

function agitar(e) {
  e.stopPropagation();
  const poder = obtenerPoderClic();
  estado.conciencia      += poder;
  estado.concienciaTotal += poder;
  spawnClickFx(e.clientX, e.clientY);
  flashConciencia();
  shakeAgitar();
  navigator.vibrate?.(50);
  renderizar();
  guardarEstado();
  actualizarBotonRevolucion();
}

function shakeAgitar() {
  const btn = document.getElementById("btn-agitar");
  if (!btn) return;
  btn.classList.remove("agitar-shake");
  void btn.offsetWidth;
  btn.classList.add("agitar-shake");
}

export function inicializarBtnAgitar() {
  const btn = document.getElementById("btn-agitar");
  if (btn) btn.addEventListener("click", agitar);
}

// ─────────────────────────────────────────
// COLECTIVOS — comprar y mejorar
// ─────────────────────────────────────────
export function comprar(id) {
  const col       = estado.colectivos[id];
  const datos     = COLECTIVOS[id];
  const descuento = Math.min(0.90, obtenerDescuentoMejoras() + obtenerDescuentoTierColectivo(id));
  const costeReal = Math.floor(datos.coste * (1 - descuento));
  if (estado.conciencia >= costeReal && col.nivel === 0) {
    estado.conciencia -= costeReal;
    col.nivel = 1;
    calcularIngreso();
    renderizar();
    renderizarColectivos();
    mostrarNotificacion(datos.frase);
    guardarEstado();
  }
}

export function mejorar(id) {
  const col   = estado.colectivos[id];
  const coste = costeMejora(col);
  if (estado.conciencia >= coste && col.nivel < MAX_NIVEL_COLECTIVO) {
    estado.conciencia -= coste;
    col.nivel++;
    calcularIngreso();
    renderizar();
    renderizarColectivos();
    guardarEstado();
  }
}

// ─────────────────────────────────────────
// AGITACIÓN — subir nivel
// ─────────────────────────────────────────
export function mejorarAgitacion() {
  if (estado.nivelAgitacion >= MEJORAS_AGITACION.length) return;
  const siguiente  = MEJORAS_AGITACION[estado.nivelAgitacion];
  const costeReal  = Math.floor(siguiente.coste * (1 - obtenerDescuentoAgitacionMejora()));
  if (estado.conciencia < costeReal) return;
  estado.conciencia -= costeReal;
  estado.nivelAgitacion++;
  calcularIngreso();
  renderizar();
  renderizarAgitacion();
  guardarEstado();
}

// ─────────────────────────────────────────
// RESISTENCIA — comprar mejora
// ─────────────────────────────────────────
export function comprarMejoraResistencia(id) {
  const mejora = MEJORAS_RESISTENCIA.find(m => m.id === id);
  if (!mejora || estado.mejorasResistencia.includes(id)) return;
  if (estado.conciencia < mejora.coste) return;

  estado.conciencia -= mejora.coste;
  estado.mejorasResistencia.push(id);
  calcularIngreso();
  renderizar();
  renderizarMejorasResistencia();
  mostrarNotificacion(mejora.nombre + " activada. La resistencia se fortalece.");
  guardarEstado();
}
