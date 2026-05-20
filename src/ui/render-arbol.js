// ─────────────────────────────────────────
// RENDER — Árbol Revolucionario
// ─────────────────────────────────────────
import { legado } from "../core/estado.js";
import { CC } from "./iconos.js";
import { ARBOL_LEGADO, COLS_PROD, PROD_BONUSES, PROD_COSTES, TIERS_RESILIENCIA } from "../data/arbol.js";
import {
  RESILIENCIA_TIER_COSTE_POR_NIVEL, RESILIENCIA_TIER_MAX_NIVEL,
  AGITACION_COSTE_POR_NIVEL, AGITACION_COSTE_MAX_NIVEL,
  AGITACION_CLIC_COSTE_POR_NIVEL, AGITACION_CLIC_MAX_NIVEL,
  AGITACION_CLIC_PCT_POR_NIVEL, AGITACION_CLIC_HEROES_POR_NIV,
} from "../config/balance.js";

let _subtabActual = "produccion";

export function cambiarSubtabArbol(seccion) {
  _subtabActual = seccion;
}

export function renderizarArbol(consulta = false) {
  const contenedor = document.getElementById("arbol-contenedor");
  if (!contenedor) return;
  document.getElementById("arbol-llamas-display").textContent = legado.llamas + " 🔥";

  const btnCerrar   = document.getElementById("btn-cerrar-arbol");
  const btnComenzar = document.getElementById("panel-arbol-footer");
  if (btnCerrar)   btnCerrar.style.display  = consulta ? "block" : "none";
  if (btnComenzar) btnComenzar.style.display = consulta ? "none"  : "block";

  const tabs = [
    { id: "produccion",  label: "🏭 Producción" },
    { id: "agitacion",   label: "✊ Agitación"  },
    { id: "resiliencia", label: "🛡️ Resiliencia" },
    { id: "llamas",      label: "🔥 Llamas"     },
  ];

  const tabsHTML = `
    <div class="arbol-subtabs">
      ${tabs.map(t => `
        <button class="arbol-subtab ${_subtabActual === t.id ? "arbol-subtab-activo" : ""}"
          data-accion="cambiar-subtab-arbol" data-arg="${t.id}">
          ${t.label}
        </button>
      `).join("")}
    </div>
  `;

  let contenidoHTML = "";
  if (_subtabActual === "produccion") {
    contenidoHTML = _renderProduccion(consulta);
  } else if (_subtabActual === "agitacion") {
    contenidoHTML = _renderArbolAgitacion(consulta);
  } else if (_subtabActual === "resiliencia") {
    contenidoHTML = _renderArbolResiliencia(consulta);
  } else if (_subtabActual === "llamas") {
    contenidoHTML = _renderArbolLlamas(consulta);
  }

  contenedor.innerHTML = tabsHTML + contenidoHTML;
}

// ─────────────────────────────────────────
// HELPER — un nodo del árbol
// ─────────────────────────────────────────
function _nodoHTML(nodo, consulta) {
  const comprado   = legado.nodos.includes(nodo.id);
  const desbloq    = !nodo.requiere || legado.nodos.includes(nodo.requiere);
  const puedePagar = legado.llamas >= nodo.coste;
  const clase      = comprado ? "nodo-comprado" : desbloq ? "nodo-disponible" : "nodo-bloqueado";

  return `
    <div class="arbol-nodo ${clase}">
      <div class="arbol-nodo-top">
        <span class="arbol-nodo-emoji">${nodo.emoji}</span>
        <span class="arbol-nodo-nombre">${nodo.nombre}</span>
      </div>
      <div class="arbol-nodo-desc">${nodo.descripcion}</div>
      ${comprado
        ? '<div class="arbol-nodo-activo">✓ Activo</div>'
        : desbloq
          ? `<button class="btn-nodo-arbol" data-accion="comprar-nodo-arbol" data-arg="${nodo.id}"
               ${!puedePagar || consulta ? "disabled" : ""}>${nodo.coste} 🔥</button>`
          : '<div class="arbol-nodo-lock">🔒</div>'
      }
    </div>
  `;
}

// ─────────────────────────────────────────
// HELPER — línea conectora vertical
// ─────────────────────────────────────────
const LINK = `<div class="arbol-link"></div>`;

// Devuelve el tier al que pertenece un colectivo por su índice
function _getTierDeColectivo(colIdx) {
  return TIERS_RESILIENCIA.find(t => t.id !== "all" && t.indices.includes(colIdx));
}

// ─────────────────────────────────────────
// PRODUCCIÓN — cards por colectivo
// ─────────────────────────────────────────
function _renderProduccion(consulta) {
  const cards = COLS_PROD.map(col => {
    const nivelActual = PROD_BONUSES.reduce((total, _, i) =>
      legado.nodos.includes(`prod-${col.id}-${i + 1}`) ? total + 1 : total, 0);

    const maxNivel    = PROD_BONUSES.length;
    const siguiente   = nivelActual < maxNivel ? nivelActual : null;
    const puedePagar  = siguiente !== null && legado.llamas >= PROD_COSTES[siguiente];
    const idSiguiente = siguiente !== null ? `prod-${col.id}-${siguiente + 1}` : null;

    const bonusTotal  = PROD_BONUSES.slice(0, nivelActual).reduce((s, b) => s + b, 0);
    const bonusStr    = nivelActual > 0 ? `+${Math.round(bonusTotal * 100)}% producción` : "Sin bonificación";
    const tier        = _getTierDeColectivo(col.colIdx);
    const tierBadge   = tier ? `<span class="prod-tier-badge">${tier.emoji} ${tier.label}</span>` : "";

    const botonHTML = nivelActual >= maxNivel
      ? `<div class="arbol-nodo-activo">✓ Máximo</div>`
      : `<button class="btn-nodo-arbol"
           data-accion="comprar-nodo-arbol" data-arg="${idSiguiente}"
           ${!puedePagar || consulta ? "disabled" : ""}>
           Nv.${nivelActual + 1} · +${PROD_BONUSES[siguiente] * 100}% · ${PROD_COSTES[siguiente]} 🔥
         </button>`;

    return `<div class="prod-card${nivelActual >= maxNivel ? " prod-card-maximo" : ""}">
      <span class="prod-card-emoji">${col.emoji}</span>
      <div class="prod-card-info">
        <div class="prod-card-nombre">${col.nombre}</div>
        <div class="prod-card-nivel">Nv. ${nivelActual} / ${maxNivel} — ${bonusStr}</div>
        ${tierBadge}
      </div>
      <div class="prod-card-accion">${botonHTML}</div>
    </div>`;
  }).join('');

  return `<div class="arbol-rama arbol-rama-produccion">${cards}</div>`;
}

// ─────────────────────────────────────────
// ÁRBOL AGITACIÓN — bifurcación: poder clic (nodos) + coste mejoras (niveles)
// ─────────────────────────────────────────
function _renderArbolAgitacion(consulta) {
  // Rama izquierda: 3 secciones secuenciales con niveles
  const niveles = legado.nivelesAgitacionClic;

  const SECCIONES = [
    {
      id: "mult",
      emoji: CC,
      nombre: "Multiplicador de Clic",
      desc: "Aumenta el poder de clic",
      efectoNivel: (n) => `×${(1 + n * AGITACION_CLIC_PCT_POR_NIVEL).toFixed(1)} poder de clic`,
      efectoSig:   (n) => `×${(1 + (n + 1) * AGITACION_CLIC_PCT_POR_NIVEL).toFixed(1)}`,
      requiere: null,
    },
    {
      id: "inicio",
      emoji: "🚀",
      nombre: "Inicio con Agitación",
      desc: "Empiezas cada run con Agitación activa",
      efectoNivel: (n) => n > 0 ? `Empiezas con Agitación Nv.${n}` : "Sin efecto aún",
      efectoSig:   (n) => `Agitación Nv.${n + 1} al inicio`,
      requiere: "mult",
    },
    {
      id: "heroes",
      emoji: "🦸",
      nombre: "Héroes Agitan",
      desc: "Cada héroe añade poder de clic extra",
      efectoNivel: (n) => n > 0 ? `+${n * AGITACION_CLIC_HEROES_POR_NIV}${CC} por héroe` : "Sin efecto aún",
      efectoSig:   (n) => `+${(n + 1) * AGITACION_CLIC_HEROES_POR_NIV}${CC} por héroe`,
      requiere: "inicio",
    },
  ];

  const ramaClicHTML = SECCIONES.map((sec, i) => {
    const nivelActual = niveles[sec.id] ?? 0;
    const esMax       = nivelActual >= AGITACION_CLIC_MAX_NIVEL;
    const progresoPct = (nivelActual / AGITACION_CLIC_MAX_NIVEL) * 100;
    const desbloq     = !sec.requiere || (niveles[sec.requiere] ?? 0) >= 1;
    const puedePagar  = legado.llamas >= AGITACION_CLIC_COSTE_POR_NIVEL;

    let accionHTML;
    if (!desbloq) {
      const ant = SECCIONES[i - 1];
      accionHTML = `<div class="arbol-nodo-lock">🔒 Requiere ${ant.emoji} ${ant.nombre} Nv.1</div>`;
    } else if (esMax) {
      accionHTML = `<div class="arbol-nodo-activo">✓ Máximo — ${sec.efectoNivel(nivelActual)}</div>`;
    } else {
      accionHTML = `
        <div class="res-tier-preview">
          Ahora: <strong>${sec.efectoNivel(nivelActual)}</strong> → Nv.${nivelActual + 1}: <strong>${sec.efectoSig(nivelActual)}</strong>
        </div>
        <button class="btn-nodo-arbol" data-accion="subir-nivel-agitacion-clic" data-arg="${sec.id}"
          ${!puedePagar || consulta ? "disabled" : ""}>
          Nv.${nivelActual + 1} · ${AGITACION_CLIC_COSTE_POR_NIVEL} 🔥
        </button>
      `;
    }

    return `
      ${i > 0 ? LINK : ""}
      <div class="res-tier-card${!desbloq ? " res-tier-bloqueada" : esMax ? " res-tier-max" : ""}">
        <div class="res-tier-header">
          <span class="res-tier-emoji">${sec.emoji}</span>
          <div class="res-tier-info">
            <div class="res-tier-nombre">${sec.nombre}</div>
            <div class="res-tier-desc">${sec.desc}</div>
          </div>
          <div class="res-tier-nivel">Nv. ${nivelActual}/${AGITACION_CLIC_MAX_NIVEL}</div>
        </div>
        <div class="prod-barra-wrap">
          <div class="prod-barra-fill" style="width:${progresoPct}%; background: var(--sc-gold);"></div>
        </div>
        <div class="res-tier-accion">${accionHTML}</div>
      </div>
    `;
  }).join("");

  // Rama derecha: cadena de niveles para coste de mejoras
  const nivelActual = legado.nivelAgitacionCoste ?? 0;
  const esMax       = nivelActual >= AGITACION_COSTE_MAX_NIVEL;
  const pct         = nivelActual * 10;
  const progresoPct = (nivelActual / AGITACION_COSTE_MAX_NIVEL) * 100;
  const puedePagar  = legado.llamas >= AGITACION_COSTE_POR_NIVEL;

  let accionCosteHTML;
  if (esMax) {
    accionCosteHTML = `<div class="arbol-nodo-activo">✓ Máximo — −${pct}% coste mejoras</div>`;
  } else {
    accionCosteHTML = `
      <div class="res-tier-preview">
        Descuento actual: <strong>−${pct}%</strong> → siguiente: <strong>−${pct + 10}%</strong>
      </div>
      <button class="btn-nodo-arbol" data-accion="subir-nivel-agitacion-coste"
        ${!puedePagar || consulta ? "disabled" : ""}>
        Nv.${nivelActual + 1} · ${AGITACION_COSTE_POR_NIVEL} 🔥
      </button>
    `;
  }

  const ramaCosteHTML = `
    <div class="res-tier-card${esMax ? " res-tier-max" : ""}">
      <div class="res-tier-header">
        <span class="res-tier-emoji">⚙️</span>
        <div class="res-tier-info">
          <div class="res-tier-nombre">Organización Interna</div>
          <div class="res-tier-desc">Reduce el coste de subir Fuerza de Agitación</div>
        </div>
        <div class="res-tier-nivel">Nv. ${nivelActual}/${AGITACION_COSTE_MAX_NIVEL}</div>
      </div>
      <div class="prod-barra-wrap">
        <div class="prod-barra-fill" style="width:${progresoPct}%; background: var(--sc-red);"></div>
      </div>
      <div class="res-tier-accion">${accionCosteHTML}</div>
    </div>
  `;

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">✊</span>
        <span class="arbol-raiz-label">AGITACIÓN</span>
      </div>
      ${LINK}
      <div class="arbol-fork">
        <div class="arbol-fork-rama arbol-fork-izq"></div>
        <div class="arbol-fork-rama arbol-fork-der"></div>
      </div>
      <div class="arbol-fork-cols">
        <div class="arbol-fork-col">
          ${LINK}
          <div class="arbol-subtitulo-rama">${CC} Poder de Clic</div>
          ${LINK}
          ${ramaClicHTML}
        </div>
        <div class="arbol-fork-col">
          ${LINK}
          <div class="arbol-subtitulo-rama">⚙️ Coste de Mejoras</div>
          ${LINK}
          ${ramaCosteHTML}
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// ÁRBOL RESILIENCIA — cadena de 5 tiers, 20 niveles cada uno
// ─────────────────────────────────────────
function _renderArbolResiliencia(consulta) {
  const niveles = legado.nivelesResilienciaTier;
  const orden   = ["tier1", "tier2", "tier3", "tier4", "all"];

  const cards = TIERS_RESILIENCIA.map((tier, i) => {
    const nivelActual = niveles[tier.id] ?? 0;
    const esMax       = nivelActual >= RESILIENCIA_TIER_MAX_NIVEL;
    const pct         = Math.round(nivelActual * 3);
    const progresoPct = (nivelActual / RESILIENCIA_TIER_MAX_NIVEL) * 100;

    // Desbloqueo: necesita nivel ≥1 del tier anterior
    const desbloq = i === 0 || (niveles[orden[i - 1]] ?? 0) >= 1;
    const puedePagar = legado.llamas >= RESILIENCIA_TIER_COSTE_POR_NIVEL;

    let accionHTML;
    if (!desbloq) {
      const anterior = TIERS_RESILIENCIA[i - 1];
      accionHTML = `<div class="arbol-nodo-lock">🔒 Requiere ${anterior.emoji} ${anterior.label} Nv.1</div>`;
    } else if (esMax) {
      accionHTML = `<div class="arbol-nodo-activo">✓ Máximo — −${pct}% en todos sus colectivos</div>`;
    } else {
      accionHTML = `
        <div class="res-tier-preview">Descuento actual: <strong>−${pct}%</strong> → siguiente: <strong>−${pct + 3}%</strong></div>
        <button class="btn-nodo-arbol" data-accion="subir-nivel-resiliencia-tier" data-arg="${tier.id}"
          ${!puedePagar || consulta ? "disabled" : ""}>
          Nv.${nivelActual + 1} · ${RESILIENCIA_TIER_COSTE_POR_NIVEL} 🔥
        </button>
      `;
    }

    return `
      ${i > 0 ? LINK : ""}
      <div class="res-tier-card${!desbloq ? " res-tier-bloqueada" : esMax ? " res-tier-max" : ""}">
        <div class="res-tier-header">
          <span class="res-tier-emoji">${tier.emoji}</span>
          <div class="res-tier-info">
            <div class="res-tier-nombre">${tier.label}</div>
            <div class="res-tier-desc">${tier.descripcion}</div>
          </div>
          <div class="res-tier-nivel">Nv. ${nivelActual}/${RESILIENCIA_TIER_MAX_NIVEL}</div>
        </div>
        <div class="prod-barra-wrap">
          <div class="prod-barra-fill" style="width:${progresoPct}%; background: var(--sc-gold);"></div>
        </div>
        <div class="res-tier-accion">${accionHTML}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">🛡️</span>
        <span class="arbol-raiz-label">RESILIENCIA</span>
      </div>
      ${LINK}
      ${cards}
    </div>
  `;
}

// ─────────────────────────────────────────
// ÁRBOL LINEAL — agitación / resiliencia
// ─────────────────────────────────────────
function _renderArbolLineal(ramaId, emoji, titulo, consulta) {
  const nodos = ARBOL_LEGADO.filter(n => n.rama === ramaId);

  const nodosHTML = nodos.map((nodo, i) => `
    ${i > 0 ? LINK : ""}
    ${_nodoHTML(nodo, consulta)}
  `).join("");

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">${emoji}</span>
        <span class="arbol-raiz-label">${titulo}</span>
      </div>
      ${LINK}
      ${nodosHTML}
    </div>
  `;
}

// ─────────────────────────────────────────
// ÁRBOL LLAMAS — bifurcación en dos cadenas
// ─────────────────────────────────────────
function _renderArbolLlamas(consulta) {
  const mult = ARBOL_LEGADO.filter(n => n.rama === "llamas" && n.id.startsWith("llamas-mult"));
  const eff  = ARBOL_LEGADO.filter(n => n.rama === "llamas" && n.id.startsWith("llamas-eff"));

  function cadenaHTML(nodos) {
    return nodos.map((nodo, i) => `
      ${i > 0 ? LINK : ""}
      ${_nodoHTML(nodo, consulta)}
    `).join("");
  }

  return `
    <div class="arbol-tree">
      <div class="arbol-raiz">
        <span class="arbol-raiz-emoji">🔥</span>
        <span class="arbol-raiz-label">LLAMAS</span>
      </div>
      ${LINK}
      <!-- bifurcación -->
      <div class="arbol-fork">
        <div class="arbol-fork-rama arbol-fork-izq"></div>
        <div class="arbol-fork-rama arbol-fork-der"></div>
      </div>
      <!-- dos cadenas -->
      <div class="arbol-fork-cols">
        <div class="arbol-fork-col">
          ${LINK}
          <div class="arbol-subtitulo-rama">🔥 Multiplicador</div>
          ${LINK}
          ${cadenaHTML(mult)}
        </div>
        <div class="arbol-fork-col">
          ${LINK}
          <div class="arbol-subtitulo-rama">${CC} Eficiencia</div>
          ${LINK}
          ${cadenaHTML(eff)}
        </div>
      </div>
    </div>
  `;
}
