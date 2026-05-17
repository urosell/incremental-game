// ─────────────────────────────────────────
// CIUDAD ISOMÉTRICA — render + interacción
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { COLECTIVOS } from "../data/colectivos.js";
import { formatear, formatearCorto, costeMejora, obtenerDescuentoMejoras, obtenerBonusArbol, produccionBase } from "../core/calculos.js";
import { MAX_NIVEL_COLECTIVO } from "../config/balance.js";

// ── Constantes ─────────────────────────────
const TW = 100;   // ancho del diamante del tile
const TH = 50;    // alto del diamante del tile
const GD = 18;    // grosor del borde de la isla

// ── Paleta ─────────────────────────────────
const C = {
  // Terreno
  tileGround:   '#4A3020',
  tileGroundHi: '#5D3E28',
  tileLit:      '#5A3C2A',
  tileShade:    '#2D1E10',
  islandBase:   '#1A0F08',
  islandSide:   '#2E1E0E',
  emptyGround:  '#251508',
  emptyLit:     '#321C0C',
  emptyShade:   '#180D05',

  // Materiales de edificios
  cream:   { top: '#FAF3E6', left: '#D8C8A0', right: '#B0986A' },
  red:     { top: '#C02828', left: '#8B1A1A', right: '#5C0F0F' },
  gold:    { top: '#E0B840', left: '#C4962A', right: '#8A6818' },
  grey:    { top: '#504030', left: '#3A2E20', right: '#251E12' },
  dark:    { top: '#2E1E10', left: '#1A0F08', right: '#0E0805' },
  green:   { top: '#3A6028', left: '#2A4A1A', right: '#1A3010' },
  glass:   { top: '#90C8E0', left: '#60A0B8', right: '#3A7090' },

  // Acentos
  flagRed:  '#C0392B',
  gold_:    '#C4962A',
  smoke:    'rgba(180,160,140,',
  windowOn: '#F0D060',
  windowOf: '#1A1008',
};

// ── Layout de la isla (10 parcelas) ────────
//        (2,0)
//   (1,1)(2,1)(3,1)
// (0,2)(1,2)(2,2)(3,2)
//      (1,3)(2,3)
const PARCELAS = [
  { col:2, row:0, colId:0 },
  { col:1, row:1, colId:1 },
  { col:2, row:1, colId:2 },
  { col:3, row:1, colId:3 },
  { col:0, row:2, colId:4 },
  { col:1, row:2, colId:5 },
  { col:2, row:2, colId:6 },
  { col:3, row:2, colId:7 },
  { col:1, row:3, colId:8 },
  { col:2, row:3, colId:9 },
];

// Orden painter's algorithm (atrás → adelante)
const PARCELAS_SORTED = [...PARCELAS].sort((a, b) => {
  const sa = a.col + a.row, sb = b.col + b.row;
  return sa !== sb ? sa - sb : a.col - b.col;
});

let canvas, ctx, offsetX, offsetY;
let parcelaSeleccionada = null;
let animFrame  = null;
let particles  = [];
let smokeSrcs  = [];

// ── Proyección ─────────────────────────────
function toScreen(col, row) {
  return {
    x: (col - row) * TW / 2 + offsetX,
    y: (col + row) * TH / 2 + offsetY,
  };
}

// ── Test punto en diamante ──────────────────
function enDiamante(px, py, cx, cy, tw = 1, th = 1) {
  const dx = Math.abs(px - cx) / (TW / 2 * tw);
  const dy = Math.abs(py - cy) / (TH / 2 * th);
  return dx + dy <= 1;
}

// ── Parcela bajo el cursor ──────────────────
function parcelaEnPunto(px, py) {
  for (let i = PARCELAS_SORTED.length - 1; i >= 0; i--) {
    const p = PARCELAS_SORTED[i];
    const { x, y } = toScreen(p.col, p.row);
    if (enDiamante(px, py, x, y)) return p;
  }
  return null;
}

// ══════════════════════════════════════════
// FUNCIONES DE DIBUJO BASE
// ══════════════════════════════════════════

// Diamante (cara superior plana)
function diamond(cx, cy, tw, th, col) {
  const hw = TW / 2 * tw, hh = TH / 2 * th;
  ctx.beginPath();
  ctx.moveTo(cx,      cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx,      cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

// Caja isométrica: cara derecha, izquierda, techo
function box(cx, cy, tw, th, bh, mat, outline) {
  const hw = TW / 2 * tw, hh = TH / 2 * th;

  // Cara derecha (más oscura)
  ctx.beginPath();
  ctx.moveTo(cx,      cy + hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx + hw, cy - bh);
  ctx.lineTo(cx,      cy + hh - bh);
  ctx.closePath();
  ctx.fillStyle = mat.right;
  ctx.fill();
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 0.5; ctx.stroke(); }

  // Cara izquierda
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx,      cy + hh);
  ctx.lineTo(cx,      cy + hh - bh);
  ctx.lineTo(cx - hw, cy - bh);
  ctx.closePath();
  ctx.fillStyle = mat.left;
  ctx.fill();
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 0.5; ctx.stroke(); }

  // Techo
  diamond(cx, cy - bh, tw, th, mat.top);
  if (outline) {
    const hw2 = hw, hh2 = hh;
    ctx.beginPath();
    ctx.moveTo(cx,       cy - bh - hh2);
    ctx.lineTo(cx + hw2, cy - bh);
    ctx.lineTo(cx,       cy - bh + hh2);
    ctx.lineTo(cx - hw2, cy - bh);
    ctx.closePath();
    ctx.strokeStyle = outline; ctx.lineWidth = 0.5; ctx.stroke();
  }
}

// Bandera en un palo
function flag(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 20);
  ctx.strokeStyle = C.gold_;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = C.flagRed;
  ctx.fillRect(x, y - 20, 13, 8);
}

// Estrella
function star(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a  = (i * 4 * Math.PI / 5) - Math.PI / 2;
    const ai = a + 2 * Math.PI / 5;
    const px = x + r * Math.cos(a),  py = y + r * Math.sin(a);
    const qx = x + (r/2.2) * Math.cos(ai), qy = y + (r/2.2) * Math.sin(ai);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    ctx.lineTo(qx, qy);
  }
  ctx.closePath();
  ctx.fillStyle = C.gold_;
  ctx.fill();
}

// ── Estado visual por nivel ─────────────────
function estado_(nivel) {
  if (nivel === 0)  return 0;
  if (nivel <= 2)   return 1;
  if (nivel <= 5)   return 2;
  if (nivel <= 8)   return 3;
  return 4;
}

// ══════════════════════════════════════════
// EDIFICIOS — uno por colectivo
// ══════════════════════════════════════════

// 0: Asamblea de Barrio — sala de reuniones
function drawAsamblea(x, y, s) {
  const bh = [0,22,38,52,68][s];
  box(x, y, 0.56, 0.56, bh, C.cream, '#1A0F08');
  if (s >= 2) box(x, y - bh, 0.56, 0.56, 7,  C.red, null);
  if (s >= 3) {
    box(x - 14, y, 0.18, 0.18, bh - 4, C.cream, null);
    box(x + 14, y, 0.18, 0.18, bh - 4, C.cream, null);
  }
  if (s >= 4) flag(x, y - bh - 7);
}

// 1: Cooperativa de Alimentos — granero + invernadero
function drawCoop(x, y, s) {
  const bh = [0,16,26,38,50][s];
  box(x - 5, y + 2, 0.65, 0.5, bh, C.cream, '#1A0F08');
  if (s >= 2) {
    box(x + 22, y - 2, 0.3, 0.3, bh * 0.7, C.gold, null);
    box(x + 22, y - 2 - bh * 0.7, 0.3, 0.3, 6, C.green, null);
  }
  if (s >= 3) {
    diamond(x - 12, y - bh - 4, 0.35, 0.35, C.green.top);
    diamond(x + 8,  y - bh - 4, 0.35, 0.35, C.green.top);
  }
  if (s >= 4) flag(x, y - bh);
}

// 2: Biblioteca Popular — edificio alto con frontón
function drawBiblioteca(x, y, s) {
  const bh = [0,28,48,65,82][s];
  box(x, y, 0.52, 0.48, bh, C.cream, '#1A0F08');
  if (s >= 2) {
    // Columnas
    box(x - 16, y + 2, 0.1, 0.1, bh - 6, C.cream, null);
    box(x + 16, y + 2, 0.1, 0.1, bh - 6, C.cream, null);
  }
  if (s >= 3) {
    // Frontón triangular
    ctx.beginPath();
    ctx.moveTo(x, y - bh - 16);
    ctx.lineTo(x - TW * 0.28, y - bh + 2);
    ctx.lineTo(x + TW * 0.28, y - bh + 2);
    ctx.closePath();
    ctx.fillStyle = C.red.left;
    ctx.fill();
  }
  if (s >= 4) { flag(x - 20, y - bh + 2); flag(x + 20, y - bh + 2); }
}

// 3: Sindicato Obrero — fábrica con chimenea
function drawSindicato(x, y, s) {
  const bh = [0,24,40,56,70][s];
  box(x - 5, y + 2, 0.62, 0.52, bh, C.grey, '#1A0F08');
  if (s >= 2) {
    // Chimenea
    const chX = x + 18, chY = y - 4;
    box(chX, chY, 0.1, 0.1, bh + 28, C.red, null);
    // Registro fuentes de humo
    smokeSrcs.push({ x: chX, y: chY - bh - 28 - 4 });
    // Franja roja
    box(x - 5, y + 2, 0.62, 0.52, 8, C.red, null);
  }
  if (s >= 3) box(x - 28, y + 4, 0.2, 0.2, bh - 10, C.grey, null);
  if (s >= 4) flag(x - 5, y + 2 - bh);
}

// 4: Colectivo de Vivienda — bloque de pisos
function drawVivienda(x, y, s) {
  const bh = [0,30,52,72,92][s];
  box(x - 4, y, 0.52, 0.44, bh, C.cream, '#1A0F08');
  if (s >= 3) box(x + 20, y - 8, 0.32, 0.32, bh - 18, C.cream, '#1A0F08');
  if (s >= 4) {
    flag(x - 4, y - bh);
    flag(x + 20, y - 8 - (bh - 18));
  }
}

// 5: Radio Comunitaria — edificio con antena
function drawRadio(x, y, s) {
  const bh = [0,20,32,44,56][s];
  box(x, y, 0.5, 0.5, bh, C.cream, '#1A0F08');
  box(x, y, 0.5, 0.5, 8, C.red, null);
  if (s >= 2) {
    const tH = [0,0,28,48,68][s];
    box(x, y - bh, 0.05, 0.05, tH, C.grey, null);
    if (s >= 3) box(x, y - bh - tH * 0.5, 0.22, 0.04, 3, C.grey, null);
    if (s >= 4) {
      box(x, y - bh - tH * 0.72, 0.15, 0.03, 3, C.grey, null);
      box(x, y - bh - tH * 0.9,  0.08, 0.02, 3, C.grey, null);
    }
  }
}

// 6: Cooperativa de Energía — paneles solares + central
function drawEnergia(x, y, s) {
  const bh = [0,14,24,34,44][s];
  box(x, y, 0.6, 0.5, bh, C.grey, '#1A0F08');
  if (s >= 2) {
    diamond(x - 16, y - bh - 5, 0.28, 0.28, C.gold.top);
    diamond(x + 16, y - bh - 5, 0.28, 0.28, C.gold.top);
  }
  if (s >= 3) {
    diamond(x, y - bh - 5, 0.28, 0.28, C.gold.top);
    box(x + 32, y + 4, 0.05, 0.05, bh + 38, C.grey, null);
    // Brazos torre
    box(x + 32, y + 4 - (bh + 38) * 0.5, 0.2, 0.04, 3, C.grey, null);
  }
  if (s >= 4) {
    smokeSrcs.push({ x, y: y - bh - 8 });
    flag(x - 22, y - bh);
  }
}

// 7: Universidad Popular — edificio monumental con cúpula
function drawUniversidad(x, y, s) {
  const bh = [0,28,48,68,88][s];
  box(x, y, 0.66, 0.56, bh, C.cream, '#1A0F08');
  if (s >= 2) box(x - 24, y + 6, 0.28, 0.28, bh - 22, C.cream, '#1A0F08');
  if (s >= 3) {
    box(x + 24, y + 6, 0.28, 0.28, bh - 22, C.cream, '#1A0F08');
    // Cúpula
    ctx.beginPath();
    ctx.ellipse(x, y - bh - 12, 13, 20, 0, Math.PI, 0);
    ctx.fillStyle = C.red.left;
    ctx.fill();
    box(x, y, 0.66, 0.56, 8, C.red, null);
  }
  if (s >= 4) {
    flag(x, y - bh - 32);
    flag(x - 24, y + 6 - (bh - 22));
    flag(x + 24, y + 6 - (bh - 22));
  }
}

// 8: Red de Comunas — varios edificios interconectados
function drawComunas(x, y, s) {
  const bh = [0,22,32,42,52][s];
  const poss = [
    { dx:  0, dy: -6, tw: 0.42, td: 0.42 },
    { dx:-20, dy:  6, tw: 0.34, td: 0.34 },
    { dx: 20, dy:  6, tw: 0.34, td: 0.34 },
  ];
  const num = [0,1,2,3,3][s];
  for (let i = 0; i < num; i++) {
    const p = poss[i];
    box(x + p.dx, y + p.dy, p.tw, p.td, bh, C.cream, '#1A0F08');
  }
  if (s >= 4) poss.slice(0,3).forEach(p => flag(x + p.dx, y + p.dy - bh));
}

// 9: La Internacional — edificio central máximo
function drawInternacional(x, y, s) {
  const bh = [0,38,62,88,112][s];
  box(x, y, 0.7, 0.6, bh, C.cream, '#1A0F08');
  if (s >= 2) {
    box(x - 28, y + 6, 0.26, 0.26, bh - 22, C.cream, '#1A0F08');
    box(x + 28, y + 6, 0.26, 0.26, bh - 22, C.cream, '#1A0F08');
  }
  if (s >= 3) {
    box(x, y, 0.7, 0.6, 10, C.red, null);
    box(x - 28, y + 6, 0.26, 0.26, 10, C.red, null);
    box(x + 28, y + 6, 0.26, 0.26, 10, C.red, null);
  }
  if (s >= 4) {
    flag(x, y - bh);
    flag(x - 28, y + 6 - (bh - 22));
    flag(x + 28, y + 6 - (bh - 22));
    star(x, y - bh - 18, 9);
  }
}

const DRAW_FNS = [
  drawAsamblea, drawCoop, drawBiblioteca, drawSindicato, drawVivienda,
  drawRadio, drawEnergia, drawUniversidad, drawComunas, drawInternacional,
];

// ══════════════════════════════════════════
// PERSONAS — figuritas animadas
// ══════════════════════════════════════════
const PEOPLE_POS = [
  { dx: -24, dy: 10 }, { dx: 24, dy: 10 },
  { dx: -10, dy: 16 }, { dx: 10, dy: 16 },
  { dx:   0, dy: 20 }, { dx:-30, dy:  5 },
  { dx:  30, dy:  5 },
];

function drawPeople(parcela) {
  const { col, row, colId } = parcela;
  const { x, y } = toScreen(col, row);
  const nivel = estado.colectivos[colId]?.nivel || 0;
  if (nivel === 0) return;
  const s     = estado_(nivel);
  const num   = [0, 1, 2, 4, 7][s];
  const now   = Date.now() / 1000;

  for (let i = 0; i < Math.min(num, PEOPLE_POS.length); i++) {
    const p    = PEOPLE_POS[i];
    const bob  = Math.sin(now * 1.8 + i * 1.3) * 1.8;
    const px   = x + p.dx;
    const py   = y + p.dy + bob;

    // Cuerpo
    ctx.fillStyle = '#1A0F08';
    ctx.beginPath();
    ctx.ellipse(px, py + 3, 2, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cabeza
    ctx.fillStyle = C.cream.top;
    ctx.beginPath();
    ctx.arc(px, py - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ══════════════════════════════════════════
// PARTÍCULAS DE HUMO
// ══════════════════════════════════════════
function updateParticles() {
  smokeSrcs.forEach(src => {
    if (Math.random() < 0.12) {
      particles.push({
        x:    src.x + (Math.random() - 0.5) * 5,
        y:    src.y,
        vx:   (Math.random() - 0.5) * 0.4,
        vy:   -0.6 - Math.random() * 0.5,
        life: 1.0,
        size: 2.5 + Math.random() * 2,
      });
    }
  });
  particles = particles.filter(p => p.life > 0.02);
  particles.forEach(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.life -= 0.007;
    p.size += 0.12;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = C.smoke + (p.life * 0.45) + ')';
    ctx.fill();
  });
}

// ══════════════════════════════════════════
// TILE BASE + BORDE DE ISLA
// ══════════════════════════════════════════
function drawTile(parcela, highlight) {
  const { col, row, colId } = parcela;
  const { x, y } = toScreen(col, row);
  const nivel = estado.colectivos[colId]?.nivel || 0;

  const topCol   = nivel > 0 ? (highlight ? C.tileGroundHi : C.tileGround) : C.emptyGround;
  const litCol   = nivel > 0 ? C.tileLit    : C.emptyLit;
  const shadeCol = nivel > 0 ? C.tileShade  : C.emptyShade;

  // Borde lateral derecho (isla 3D)
  ctx.beginPath();
  ctx.moveTo(x,       y + TH / 2);
  ctx.lineTo(x + TW / 2, y);
  ctx.lineTo(x + TW / 2, y + GD);
  ctx.lineTo(x,       y + TH / 2 + GD);
  ctx.closePath();
  ctx.fillStyle = C.islandBase;
  ctx.fill();

  // Borde lateral izquierdo
  ctx.beginPath();
  ctx.moveTo(x - TW / 2, y);
  ctx.lineTo(x,       y + TH / 2);
  ctx.lineTo(x,       y + TH / 2 + GD);
  ctx.lineTo(x - TW / 2, y + GD);
  ctx.closePath();
  ctx.fillStyle = C.islandSide;
  ctx.fill();

  // Cara superior del tile
  diamond(x, y, 1, 1, topCol);

  // Highlight de selección
  if (highlight) {
    const hw = TW / 2, hh = TH / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - hh);
    ctx.lineTo(x + hw, y);
    ctx.lineTo(x, y + hh);
    ctx.lineTo(x - hw, y);
    ctx.closePath();
    ctx.strokeStyle = C.gold_;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ══════════════════════════════════════════
// PANEL DE INFORMACIÓN
// ══════════════════════════════════════════
export function mostrarInfoPanel(parcela) {
  const panel = document.getElementById('ciudad-info-panel');
  if (!panel) return;

  const colId  = parcela.colId;
  const datos  = COLECTIVOS[colId];
  const col    = estado.colectivos[colId];
  const nivel  = col.nivel;
  const esPrimero   = colId === 0;
  const anterior    = colId > 0 ? estado.colectivos[colId - 1] : null;
  const desbloqueado = esPrimero || (anterior && anterior.nivel > 0);

  let botonHTML = '';
  if (!desbloqueado) {
    botonHTML = `<button class="ciudad-btn" disabled>🔒 Bloqueado</button>`;
  } else if (nivel === 0) {
    const descuento = Math.min(0.75, obtenerDescuentoMejoras() + obtenerBonusArbol().descuentoColectivos);
    const costeReal = Math.floor(datos.coste * (1 - descuento));
    botonHTML = `<button class="ciudad-btn" data-accion="comprar" data-arg="${colId}"
      ${estado.conciencia < costeReal ? 'disabled' : ''}>
      Organizar · ${formatearCorto(costeReal)} ⚡
    </button>`;
  } else if (nivel >= MAX_NIVEL_COLECTIVO) {
    botonHTML = `<button class="ciudad-btn ciudad-btn-max" disabled>✓ Nivel Máximo</button>`;
  } else {
    const coste = costeMejora(col);
    botonHTML = `<button class="ciudad-btn" data-accion="mejorar" data-arg="${colId}"
      ${estado.conciencia < coste ? 'disabled' : ''}>
      Mejorar · ${formatearCorto(coste)} ⚡
    </button>`;
  }

  panel.innerHTML = `
    <div class="ciudad-info-header">
      <span class="ciudad-info-emoji">${datos.emoji}</span>
      <div class="ciudad-info-meta">
        <div class="ciudad-info-nombre">${datos.nombre}</div>
        <div class="ciudad-info-nivel">Nivel ${nivel} / ${MAX_NIVEL_COLECTIVO}</div>
      </div>
      <button class="ciudad-info-cerrar" data-accion="cerrar-ciudad-info">✕</button>
    </div>
    ${nivel > 0 ? `<div class="ciudad-info-prod">${formatear(produccionBase(colId, nivel))} ⚡/s</div>` : `<div class="ciudad-info-prod ciudad-info-inactivo">Sin organizar</div>`}
    ${botonHTML}
  `;

  panel.classList.remove('oculto');
  parcelaSeleccionada = parcela;
}

export function ocultarInfoPanel() {
  const panel = document.getElementById('ciudad-info-panel');
  if (panel) panel.classList.add('oculto');
  parcelaSeleccionada = null;
}

// Llamar después de comprar/mejorar para actualizar botón
export function refrescarInfoPanel() {
  if (parcelaSeleccionada) mostrarInfoPanel(parcelaSeleccionada);
}

// ══════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════
export function renderizarCiudad() {
  if (!canvas || !ctx) return;
  smokeSrcs = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Tiles
  PARCELAS_SORTED.forEach(p => drawTile(p, p === parcelaSeleccionada));
  // Edificios
  PARCELAS_SORTED.forEach(p => {
    const nivel = estado.colectivos[p.colId]?.nivel || 0;
    if (nivel === 0) return;
    const { x, y } = toScreen(p.col, p.row);
    DRAW_FNS[p.colId](x, y, estado_(nivel));
  });
  // Personas
  PARCELAS_SORTED.forEach(p => drawPeople(p));
  // Partículas
  updateParticles();
  drawParticles();
}

// ══════════════════════════════════════════
// LOOP DE ANIMACIÓN
// ══════════════════════════════════════════
function loop() {
  renderizarCiudad();
  animFrame = requestAnimationFrame(loop);
}

// ══════════════════════════════════════════
// RESIZE
// ══════════════════════════════════════════
function resize() {
  const container = document.getElementById('ciudad-canvas-container');
  if (!container || !canvas) return;
  canvas.width  = container.clientWidth;
  canvas.height = container.clientHeight;
  offsetX = canvas.width / 2;
  offsetY = canvas.height / 2 - 130;
}

// ══════════════════════════════════════════
// INICIALIZAR
// ══════════════════════════════════════════
export function inicializarCiudad() {
  canvas = document.getElementById('ciudad-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  function handlePick(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    const px = (src.clientX - rect.left) * sx;
    const py = (src.clientY - rect.top)  * sy;

    const parcela = parcelaEnPunto(px, py);
    if (parcela) {
      mostrarInfoPanel(parcela);
    } else {
      ocultarInfoPanel();
    }
  }

  canvas.addEventListener('click', handlePick);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); handlePick(e); }, { passive: false });

  if (animFrame) cancelAnimationFrame(animFrame);
  loop();
}

export function detenerCiudad() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}
