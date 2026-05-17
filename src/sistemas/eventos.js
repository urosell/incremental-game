// ─────────────────────────────────────────
// SISTEMA — Eventos Aleatorios
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { formatear, calcularIngreso } from "../core/calculos.js";
import { guardarEstado } from "../core/persistencia.js";
import { mostrarNotificacion } from "../ui/notificacion.js";
import { abrirModal, cerrarModal } from "../ui/modales.js";
import { CC } from "../ui/iconos.js";
import { renderizar } from "../ui/render.js";

// ─────────────────────────────────────────
// DATOS — Eventos
// ─────────────────────────────────────────
const EVENTOS_ALEATORIOS = [
  {
    id: "ataque-medios",
    titulo: "📰 Campaña Mediática",
    texto: "Los grandes medios lanzan una campaña de desprestigio. \"Extremistas radicales amenazan el orden social\", titulan en portada.",
    condicion: () => true,
    calcularResolucion() {
      const tieneFrida = estado.heroes.includes("frida");
      const tieneRadio  = estado.colectivos[5].nivel > 0;
      if (tieneFrida) {
        return { situacion: "✅ Frida Kahlo y la Radio Comunitaria neutralizan la campaña. Impacto casi nulo.", efecto: { tipo: "produccion", mult: 0.97, dur: 15000 }, boton: "Contraatacar con la Radio" };
      } else if (tieneRadio) {
        return { situacion: "🛡️ La Radio Comunitaria contrarresta la narrativa. Producción −10% durante 45 seg.", efecto: { tipo: "produccion", mult: 0.90, dur: 45000 }, boton: "Emitir comunicado" };
      } else {
        return { situacion: "❌ Sin Radio Comunitaria, los rumores se extienden. Producción −25% durante 2 min.", efecto: { tipo: "produccion", mult: 0.75, dur: 120000 }, boton: "Aguantar el golpe" };
      }
    },
  },
  {
    id: "desalojo",
    titulo: "🏠 Orden de Desalojo",
    texto: "El ayuntamiento envía policía al Colectivo de Vivienda. Tienen 24 horas para abandonar el espacio.",
    condicion: () => estado.colectivos[4].nivel > 0,
    calcularResolucion() {
      const tieneSindicato = estado.colectivos[3].nivel > 0;
      if (tieneSindicato) {
        return { situacion: "✅ El Sindicato Obrero organiza un cordón de solidaridad. El desalojo queda suspendido.", efecto: { tipo: "perder-pct", val: 0.03 }, boton: "Defender el espacio" };
      } else {
        return { situacion: "❌ Sin apoyo del Sindicato, el desalojo se ejecuta. Pierdes el 20% de tu conciencia.", efecto: { tipo: "perder-pct", val: 0.20 }, boton: "Reagruparse" };
      }
    },
  },
  {
    id: "oferta-corrupta",
    titulo: "💼 Oferta del Gran Capital",
    texto: "Un empresario se acerca con una 'propuesta de colaboración'. Ofrece financiación generosa a cambio de moderar el discurso.",
    condicion: () => true,
    tipo: "eleccion",
  },
  {
    id: "escandalo",
    titulo: "😤 Fractura Interna",
    texto: "Diferencias estratégicas fracturan el movimiento. Una corriente acusa a otra de traicionar los principios fundadores.",
    condicion: () => estado.colectivos.filter(c => c.nivel > 0).length >= 2,
    calcularResolucion() {
      const tieneBiblioteca = estado.colectivos[2].nivel > 0;
      if (tieneBiblioteca) {
        return { situacion: "✅ La Biblioteca Popular facilita el debate constructivo. El conflicto se resuelve internamente.", efecto: { tipo: "produccion", mult: 0.97, dur: 20000 }, boton: "Convocar asamblea" };
      } else {
        return { situacion: "❌ Sin espacio de debate, la fractura se profundiza. Producción −20% durante 90 seg.", efecto: { tipo: "produccion", mult: 0.80, dur: 90000 }, boton: "Intentar mediar" };
      }
    },
  },
  {
    id: "solidaridad",
    titulo: "🌍 Solidaridad Internacional",
    texto: "Un movimiento hermano del exterior contacta con el tuyo. Ofrecen apoyo moral, recursos y experiencia acumulada en la lucha.",
    condicion: () => true,
    tipo: "positivo",
    calcularResolucion() {
      const tieneInternacional = estado.colectivos[9].nivel > 0;
      if (tieneInternacional) {
        return { situacion: "✨ La Internacional profundiza el vínculo. ¡+100% producción durante 2 min!", efecto: { tipo: "produccion", mult: 2.0, dur: 120000 }, boton: "Abrazar la solidaridad" };
      } else {
        return { situacion: "💙 Su apoyo fortalece el movimiento. +50% producción durante 1 min.", efecto: { tipo: "produccion", mult: 1.5, dur: 60000 }, boton: "Aceptar la ayuda" };
      }
    },
  },
  {
    id: "represion",
    titulo: "🚔 Represión Policial",
    texto: "Las fuerzas del orden disuelven violentamente una concentración pacífica. Hay activistas detenidos entre los nuestros.",
    condicion: () => estado.colectivos.filter(c => c.nivel > 0).length >= 1,
    calcularResolucion() {
      const activos = estado.colectivos.filter(c => c.nivel > 0).length;
      if (activos >= 4) {
        return { situacion: "✅ La red de solidaridad amortigua el golpe. Los detenidos son liberados rápidamente.", efecto: { tipo: "perder-pct", val: 0.03 }, boton: "Mantener la calma" };
      } else {
        return { situacion: "❌ El movimiento está aislado. Pierdes 15% de conciencia y la Presión sube +10.", efecto: { tipo: "perder-pct", val: 0.15, presionBonus: 10 }, boton: "Reagruparse" };
      }
    },
  },
];

// ─────────────────────────────────────────
// LÓGICA — disparo de evento
// ─────────────────────────────────────────
export function verificarEventos() {
  if (estado.siguienteEvento === 0) return;
  if (Date.now() < estado.siguienteEvento) return;
  if (!document.getElementById("modal-evento").classList.contains("oculto")) return;
  const activos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (activos === 0) return;

  const disponibles = EVENTOS_ALEATORIOS.filter(e => e.condicion());
  if (disponibles.length === 0) return;

  const evento = disponibles[Math.floor(Math.random() * disponibles.length)];
  // Siguiente evento entre 15 y 60 minutos
  estado.siguienteEvento = Date.now() + 15 * 60000 + Math.random() * 45 * 60000;
  mostrarEvento(evento);
}

function mostrarEvento(evento) {
  document.getElementById("evento-titulo").textContent = evento.titulo;
  document.getElementById("evento-texto").textContent  = evento.texto;

  const situacionEl = document.getElementById("evento-situacion");
  const botonesEl   = document.getElementById("evento-botones");
  botonesEl.innerHTML = "";

  if (evento.tipo === "eleccion") {
    const bonusAceptar  = Math.floor(estado.conciencia * 0.50);
    const costoRechazar = Math.floor(estado.conciencia * 0.10);
    situacionEl.innerHTML = `
      <div class="evento-opcion"><strong>Aceptar:</strong> +<em>${formatear(bonusAceptar)} ${CC}</em> pero Presión Capitalista +25.</div>
      <div class="evento-opcion"><strong>Rechazar:</strong> −<em>${formatear(costoRechazar)} ${CC}</em> pero Presión Capitalista −15.</div>
    `;
    const btnA = document.createElement("button");
    btnA.className = "btn-confirmar";
    btnA.textContent = "Aceptar la financiación";
    btnA.onclick = () => resolverEvento(evento.id, "aceptar", null, bonusAceptar, costoRechazar);

    const btnR = document.createElement("button");
    btnR.className = "btn-cancelar";
    btnR.textContent = "Rechazar y denunciar";
    btnR.onclick = () => resolverEvento(evento.id, "rechazar", null, bonusAceptar, costoRechazar);

    botonesEl.appendChild(btnA);
    botonesEl.appendChild(btnR);
  } else {
    const res = evento.calcularResolucion();
    situacionEl.innerHTML = `<div class="evento-situacion-texto">${res.situacion}</div>`;

    const btn = document.createElement("button");
    btn.className = "btn-confirmar";
    btn.textContent = res.boton;
    btn.onclick = () => resolverEvento(evento.id, "resolver", res.efecto);
    botonesEl.appendChild(btn);
  }

  abrirModal("modal-evento");
}

function resolverEvento(id, accion, efecto, bonusAceptar, costoRechazar) {
  cerrarModal("modal-evento");

  if (id === "oferta-corrupta") {
    if (accion === "aceptar") {
      estado.conciencia      += bonusAceptar;
      estado.concienciaTotal += bonusAceptar;
      estado.presionCapitalista = Math.min(100, estado.presionCapitalista + 25);
      mostrarNotificacion("Has aceptado la financiación. Los recursos llegan... pero el capital ya sabe tu precio.");
    } else {
      estado.conciencia = Math.max(0, estado.conciencia - costoRechazar);
      estado.presionCapitalista = Math.max(0, estado.presionCapitalista - 15);
      mostrarNotificacion("Has rechazado la oferta. La dignidad no se vende. La lucha continúa.");
    }
  } else if (efecto) {
    aplicarEfecto(efecto);
    if (efecto.mult !== undefined && efecto.mult > 1) {
      mostrarNotificacion("La solidaridad es nuestra mayor fortaleza. El movimiento avanza.");
    } else if (efecto.tipo === "perder-pct" && efecto.val <= 0.05) {
      mostrarNotificacion("El golpe duele poco. La organización colectiva nos protege.");
    } else {
      mostrarNotificacion("El golpe duele. Pero el movimiento resiste y aprende.");
    }
  }

  calcularIngreso();
  renderizar();
  guardarEstado();
}

function aplicarEfecto(efecto) {
  if (efecto.tipo === "produccion") {
    estado.efectoTemporal = { tipo: "produccion", mult: efecto.mult, expira: Date.now() + efecto.dur };
    calcularIngreso();
  } else if (efecto.tipo === "perder-pct") {
    estado.conciencia = Math.max(0, estado.conciencia * (1 - efecto.val));
    if (efecto.presionBonus) {
      estado.presionCapitalista = Math.min(100, estado.presionCapitalista + efecto.presionBonus);
    }
  }
}
