// ─────────────────────────────────────────
// SISTEMA — Revolución (reset + selección de héroe)
// ─────────────────────────────────────────
import { estado, legado } from "../core/estado.js";
import { calcularLlamas, calcularIngreso } from "../core/calculos.js";
import { guardarEstado, guardarLegado } from "../core/persistencia.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { HEROES } from "../data/heroes.js";
import { FRASES_REVOLUCION } from "../data/frases.js";
import { mostrarNotificacion } from "../ui/notificacion.js";
import { abrirModal, cerrarModal } from "../ui/modales.js";
import { renderizar, actualizarBotonRevolucion } from "../ui/render.js";
import { renderizarColectivos } from "../ui/render-colectivos.js";
import { renderizarMejorasResistencia, renderizarAgitacion } from "../ui/render-mejoras.js";
import { renderizarArbol } from "../ui/render-arbol.js";

// ─────────────────────────────────────────
// HÉROES — disponibles y selección aleatoria
// ─────────────────────────────────────────
export function heroesDisponibles() {
  return HEROES.filter(h => !estado.heroes.includes(h.id));
}

export function heroesAleatorios() {
  const disponibles = heroesDisponibles();
  const resultado = [];
  const copia = [...disponibles];
  const cantidad = Math.min(3, copia.length);
  for (let i = 0; i < cantidad; i++) {
    const idx = Math.floor(Math.random() * copia.length);
    resultado.push(copia.splice(idx, 1)[0]);
  }
  return resultado;
}

// ─────────────────────────────────────────
// FLUJO DE REVOLUCIÓN
// ─────────────────────────────────────────
// _llamasPendientes guarda el botín de la revolución entre `declararRevolucion`
// (cuando se resetea el estado) y `comenzarNuevaRun` (cuando se notifica al jugador).
let _llamasPendientes = 0;

export function declararRevolucion(idHeroe) {
  // Calcular y otorgar llamas antes del reset
  _llamasPendientes = calcularLlamas(estado.concienciaTotal);
  legado.llamas += _llamasPendientes;

  if (idHeroe) estado.heroes.push(idHeroe);
  estado.totalRevoluciones++;

  // Reset completo — los bonuses de inicio se aplican en comenzarNuevaRun
  estado.conciencia = 0;
  estado.concienciaTotal = 0;
  estado.concienciaPorSegundo = 0;
  estado.colectivos = COLECTIVOS.map(c => ({ id: c.id, nivel: 0 }));
  estado.presionCapitalista = 0;
  estado.nivelAgitacion = 0;
  estado.mejorasResistencia = [];
  estado.efectoTemporal = null;
  estado.huelgaExpira = 0;
  estado.huelgaCooldownHasta = 0;
  estado.mejorasHuelga = [];

  guardarLegado();
  cerrarModal("modal-heroes");

  // Abrir árbol antes de la nueva run
  renderizarArbol();
  const panelArbol = document.getElementById("panel-arbol");
  const esMobile = window.innerWidth <= 1024;

  if (esMobile) {
    // En mobile: activar el tab del árbol en la secuencia de revolución
    document.querySelectorAll(".nav-tab").forEach(btn => btn.classList.remove("tab-activo"));
    document.querySelector('.nav-tab[data-arg="arbol"]')?.classList.add("tab-activo");
    document.getElementById("panel-izquierdo")?.classList.remove("tab-activo");
    document.getElementById("panel-mejoras")?.classList.remove("tab-activo");
    document.getElementById("panel-legado")?.classList.remove("tab-activo");
    document.getElementById("panel-ajustes")?.classList.remove("tab-activo");
    panelArbol.classList.add("tab-activo");
  } else {
    panelArbol.classList.remove("oculto-panel");
  }
}

export function comenzarNuevaRun() {
  // Aplicar bonuses de inicio según nodos comprados
  if (legado.nodos.includes("prod-4")) estado.colectivos[0].nivel = 1;
  if (legado.nodos.includes("agit-4")) estado.nivelAgitacion = 1;
  if (legado.nodos.includes("res-4"))  estado.mejorasResistencia = ["fondo-solidaridad", "red-autodefensa", "contrainformacion"];
  if (estado.heroes.includes("allende")) estado.conciencia = 500;

  calcularIngreso();
  guardarEstado();

  const panelArbol = document.getElementById("panel-arbol");
  const esMobile = window.innerWidth <= 1024;

  if (esMobile) {
    // En mobile: cerrar árbol y volver a tab de inicio
    panelArbol.classList.remove("tab-activo");
    document.querySelectorAll(".nav-tab").forEach(btn => btn.classList.remove("tab-activo"));
    document.querySelector('.nav-tab[data-arg="inicio"]')?.classList.add("tab-activo");
    document.getElementById("panel-izquierdo")?.classList.add("tab-activo");
  } else {
    panelArbol.classList.add("oculto-panel");
  }

  const fraseIdx = Math.min(estado.totalRevoluciones - 1, FRASES_REVOLUCION.length - 1);
  mostrarNotificacion(FRASES_REVOLUCION[fraseIdx] + ` (+${_llamasPendientes} 🔥)`);

  renderizar();
  renderizarColectivos();
  renderizarMejorasResistencia();
  renderizarAgitacion();
  actualizarBotonRevolucion();
}

// ─────────────────────────────────────────
// MODAL — elegir héroe
// ─────────────────────────────────────────
export function mostrarHeroes() {
  cerrarModal("modal-revolucion");

  // ── TRAMPA: primera run, aún no revelada ──
  if (estado.totalRevoluciones === 0 && !estado.trampaMostrada) {
    estado.trampaMostrada = true;
    guardarEstado();
    // Ocultar el botón de revolución hasta que se alcance el umbral real
    document.getElementById("btn-revolucion")?.classList.add("oculto");
    abrirModal("modal-trampa");
    // Actualizar barra para que muestre ya el umbral real
    renderizar();
    actualizarBotonRevolucion();
    return;
  }

  const heroes = heroesAleatorios();
  const lista  = document.getElementById("lista-heroes-seleccion");
  lista.innerHTML = "";

  if (heroes.length === 0) {
    lista.innerHTML = `
      <p style="color:var(--texto-2);text-align:center;margin-bottom:16px">
        Ya tienes todos los héroes desbloqueados.
      </p>
      <button class="btn-heroe-continuar" id="btn-continuar-sin-heroe">
        Gastar llamas revolucionarias →
      </button>
    `;
    abrirModal("modal-heroes");
    document.getElementById("btn-continuar-sin-heroe")
      ?.addEventListener("click", () => declararRevolucion(null));
    return;
  }

  heroes.forEach(h => {
    const card = document.createElement("div");
    card.className = "heroe-card";
    card.innerHTML = `
      <h3>${h.emoji} ${h.nombre}</h3>
      <div class="heroe-colectivo">${h.colectivo}</div>
      <div class="heroe-descripcion">${h.descripcion}</div>
      <div class="heroe-frase">"${h.frase}"</div>
    `;
    card.addEventListener("click", () => declararRevolucion(h.id));
    lista.appendChild(card);
  });

  abrirModal("modal-heroes");
}
