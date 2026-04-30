// ─────────────────────────────────────────
// DATOS — Colectivos
// ─────────────────────────────────────────
import { loginConGoogle, cerrarSesion, escucharAuthEstado, guardarPartidaNube, cargarPartidaNube } from "./firebase.js";

let usuarioActual = null;

async function handleLogin() {
  const usuario = await loginConGoogle();
  if (usuario) {
    usuarioActual = usuario;
    const partidaNube = await cargarPartidaNube(usuario.uid);
    if (partidaNube) {
      Object.assign(estado, partidaNube);
      calcularIngreso();
      renderizar();
      renderizarColectivos();
      actualizarBotonRevolucion();
    }
  }
}

async function handleLogout() {
  await cerrarSesion();
  usuarioActual = null;
}

document.addEventListener("DOMContentLoaded", () => {
  escucharAuthEstado((usuario) => {
    usuarioActual = usuario;
    const info = document.getElementById("usuario-info");
    const btnLogin = document.getElementById("btn-login");
    const avatar = document.getElementById("usuario-avatar");
    const nombre = document.getElementById("usuario-nombre");

    if (!info || !btnLogin) return;

    if (usuario) {
      info.classList.remove("oculto");
      btnLogin.classList.add("oculto");
      if (avatar) avatar.src = usuario.photoURL || "";
      if (nombre) nombre.textContent = usuario.displayName || usuario.email;
    } else {
      info.classList.add("oculto");
      btnLogin.classList.remove("oculto");
    }
  });
});

const COLECTIVOS = [
  { id: 0, nombre: "Asamblea de Barrio",       emoji: "🏘️", coste: 50,          ingresoPorSegundo: 0.5,      frase: "15 vecinos se reúnen un martes por la noche. Nadie sabe todavía que están cambiando el mundo." },
  { id: 1, nombre: "Cooperativa de Alimentos", emoji: "🌾", coste: 400,         ingresoPorSegundo: 3,        frase: "La comida no es un negocio. Es un derecho." },
  { id: 2, nombre: "Biblioteca Popular",       emoji: "📚", coste: 3200,        ingresoPorSegundo: 22,       frase: "El conocimiento que no se comparte es una herramienta del poder." },
  { id: 3, nombre: "Sindicato Obrero",          emoji: "✊", coste: 25600,       ingresoPorSegundo: 170,      frase: "Solos pedimos. Juntos exigimos." },
  { id: 4, nombre: "Colectivo de Vivienda",     emoji: "🏠", coste: 204800,      ingresoPorSegundo: 1300,     frase: "Ninguna familia debería temer al primer día de mes." },
  { id: 5, nombre: "Radio Comunitaria",         emoji: "📻", coste: 1638400,     ingresoPorSegundo: 10000,    frase: "Por primera vez, el micrófono apunta hacia el pueblo." },
  { id: 6, nombre: "Cooperativa de Energía",    emoji: "⚡", coste: 13107200,    ingresoPorSegundo: 80000,    frase: "El sol sale para todos. La electricidad, también." },
  { id: 7, nombre: "Universidad Popular",       emoji: "🎓", coste: 104857600,   ingresoPorSegundo: 650000,   frase: "Nadie educa a nadie. Nadie se educa solo." },
  { id: 8, nombre: "Red de Comunas",            emoji: "🌐", coste: 838860800,   ingresoPorSegundo: 5200000,  frase: "Lo que uno no tiene, lo tiene el colectivo." },
  { id: 9, nombre: "La Internacional",          emoji: "🌍", coste: 6710886400,  ingresoPorSegundo: 42000000, frase: "El movimiento ha crecido demasiado para tener fronteras." },
];

// ─────────────────────────────────────────
// DATOS — Héroes del Movimiento
// ─────────────────────────────────────────
const HEROES = [
  { id: "rosa",     nombre: "Rosa Luxemburg",   emoji: "🌹", colectivo: "Asamblea de Barrio",      descripcion: "Doble producción cuando tienes más de 3 colectivos activos.",        frase: "La libertad es siempre la libertad del que piensa diferente." },
  { id: "zapata",   nombre: "Emiliano Zapata",  emoji: "🌽", colectivo: "Cooperativa de Alimentos", descripcion: "Cada mejora reduce el coste de todos los colectivos un 2%.",          frase: "La tierra es de quien la trabaja." },
  { id: "gramsci",  nombre: "Antonio Gramsci",  emoji: "📖", colectivo: "Biblioteca Popular",       descripcion: "Cada nivel de Biblioteca acelera el desbloqueo del siguiente colectivo.", frase: "Instruíos, porque necesitaremos toda vuestra inteligencia." },
  { id: "dolores",  nombre: "Dolores Ibárruri", emoji: "✊", colectivo: "Sindicato Obrero",          descripcion: "+50% producción del Sindicato permanentemente.",                      frase: "Es mejor morir de pie que vivir de rodillas." },
  { id: "engels",   nombre: "Friedrich Engels", emoji: "🏭", colectivo: "Colectivo de Vivienda",     descripcion: "Genera ⚡ pasiva con el juego cerrado.",                              frase: "Una onza de acción vale más que una tonelada de teoría." },
  { id: "frida",    nombre: "Frida Kahlo",      emoji: "🎨", colectivo: "Radio Comunitaria",         descripcion: "Reduce el impacto de Eventos de Desinformación un 50%.",              frase: "Pies, ¿para qué los quiero si tengo alas para volar?" },
  { id: "tesla",    nombre: "Nikola Tesla",     emoji: "⚡", colectivo: "Cooperativa de Energía",    descripcion: "Doble producción de la Cooperativa de Energía.",                     frase: "El presente es suyo, el futuro es mío." },
  { id: "freire",   nombre: "Paulo Freire",     emoji: "🎓", colectivo: "Universidad Popular",       descripcion: "Doble poder de cada clic manual.",                                   frase: "Nadie educa a nadie, nadie se educa solo." },
  { id: "kropotkin",nombre: "Piotr Kropotkin",  emoji: "🤝", colectivo: "Red de Comunas",            descripcion: "+10% producción de todos los colectivos.",                           frase: "El apoyo mutuo es la ley de la naturaleza." },
  { id: "allende",  nombre: "Salvador Allende", emoji: "🌟", colectivo: "La Internacional",          descripcion: "Empiezas cada Revolución con 500 ⚡ ya acumulados.",                  frase: "Tienen la fuerza, pero no tienen la razón." },
];

// ─────────────────────────────────────────
// DATOS — Mejoras de Resistencia (Fase 3)
// ─────────────────────────────────────────
const MEJORAS_RESISTENCIA = [
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
// DATOS — Eventos Aleatorios (Fase 3)
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
// FRASES DE REVOLUCIÓN
// ─────────────────────────────────────────
const FRASES_REVOLUCION = [
  "La primera chispa siempre parece pequeña. La historia dirá lo contrario.",
  "Cada caída es una lección. El movimiento vuelve más fuerte.",
  "No es derrota. Es el ciclo natural de toda revolución.",
  "El pueblo que no olvida su historia está condenado a superarla.",
];

// ─────────────────────────────────────────
// ESTADO DEL JUEGO
// ─────────────────────────────────────────
const estado = {
  conciencia: 0,
  concienciaTotal: 0,
  concienciaPorSegundo: 0,
  clicPoder: 1,

  colectivos: COLECTIVOS.map(c => ({ id: c.id, nivel: 0 })),

  legadoRevolucionario: 0,
  heroes: [],
  totalRevoluciones: 0,

  // Fase 3
  presionCapitalista: 0,
  mejorasResistencia: [],
  efectoTemporal: null,
  siguienteEvento: 0,

  eventos: [], // reservado
};

// ─────────────────────────────────────────
// FORMATEAR NÚMEROS
// ─────────────────────────────────────────
function formatear(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(2) + "K";
  return Math.floor(n).toString();
}

// ─────────────────────────────────────────
// GUARDADO LOCAL
// ─────────────────────────────────────────
const CLAVE_GUARDADO = "conciencia-de-clase-v1";

function guardarEstado() {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado));
    if (usuarioActual) {
      guardarPartidaNube(usuarioActual.uid, estado);
    }
  } catch (e) {
    console.error("Error al guardar estado:", e);
  }
}

function cargarEstado() {
  try {
    const datos = localStorage.getItem(CLAVE_GUARDADO);
    if (datos) {
      const guardado = JSON.parse(datos);
      Object.assign(estado, guardado);

      if (!Array.isArray(estado.colectivos)) {
        estado.colectivos = COLECTIVOS.map(c => ({ id: c.id, nivel: 0 }));
      }

      // Migración Fase 3
      if (!Array.isArray(estado.mejorasResistencia)) estado.mejorasResistencia = [];
      if (estado.efectoTemporal && estado.efectoTemporal.expira <= Date.now()) {
        estado.efectoTemporal = null;
      }

      console.log("✓ Partida cargada");
      return true;
    }
  } catch (e) {
    console.error("Error al cargar estado:", e);
  }
  return false;
}

// ─────────────────────────────────────────
// HÉROES Y REVOLUCIONES
// ─────────────────────────────────────────
function obtenerMultiplicador() {
  let multiplicador = 1;
  if (estado.heroes.includes("kropotkin")) multiplicador += 0.10;
  const colectivosActivos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (estado.heroes.includes("rosa") && colectivosActivos > 3) multiplicador *= 2;
  return multiplicador;
}

function obtenerPoderClic() {
  let poder = estado.clicPoder;
  if (estado.heroes.includes("freire")) poder *= 2;
  return poder;
}

function obtenerDescuentoMejoras() {
  const mejoras = estado.colectivos.reduce((total, col) => total + Math.max(0, col.nivel - 1), 0);
  if (estado.heroes.includes("zapata")) return Math.min(0.5, mejoras * 0.02);
  return 0;
}

function heroesDisponibles() {
  return HEROES.filter(h => !estado.heroes.includes(h.id));
}

function heroesAleatorios() {
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

function declararRevolucion(idHeroe) {
  estado.heroes.push(idHeroe);
  estado.totalRevoluciones++;

  const concienciaInicial = estado.heroes.includes("allende") ? 500 : 0;
  estado.conciencia = concienciaInicial;
  estado.concienciaPorSegundo = 0;
  estado.colectivos = COLECTIVOS.map(c => ({ id: c.id, nivel: 0 }));
  estado.presionCapitalista = 0;
  estado.efectoTemporal = null;

  calcularIngreso();
  guardarEstado();

  const fraseIdx = Math.min(estado.totalRevoluciones - 1, FRASES_REVOLUCION.length - 1);
  mostrarNotificacion(FRASES_REVOLUCION[fraseIdx]);

  cerrarModal("modal-heroes");
  renderizar();
  renderizarColectivos();
  renderizarMejorasResistencia();
  actualizarBotonRevolucion();
}

// ─────────────────────────────────────────
// CALCULAR INGRESOS
// ─────────────────────────────────────────
function calcularIngreso() {
  const multiplicador    = obtenerMultiplicador();
  const penPresion       = obtenerPenalizacionPresion();
  const multEvento       = (estado.efectoTemporal &&
                            estado.efectoTemporal.tipo === "produccion" &&
                            estado.efectoTemporal.expira > Date.now())
                           ? estado.efectoTemporal.mult : 1;

  estado.concienciaPorSegundo = estado.colectivos.reduce((total, col) => {
    if (col.nivel === 0) return total;
    const datos = COLECTIVOS[col.id];
    let produccion = datos.ingresoPorSegundo * col.nivel;
    if (estado.heroes.includes("dolores") && col.id === 3) produccion *= 1.5;
    if (estado.heroes.includes("tesla")   && col.id === 6) produccion *= 2;
    return total + produccion;
  }, 0) * multiplicador * penPresion * multEvento;
}

// ─────────────────────────────────────────
// COSTE DE MEJORA
// ─────────────────────────────────────────
function costeMejora(colectivo) {
  const datos = COLECTIVOS[colectivo.id];
  return Math.floor(datos.coste * (colectivo.nivel + 1) * 1.5);
}

// ─────────────────────────────────────────
// NOTIFICACIÓN NARRATIVA
// ─────────────────────────────────────────
let timeoutNotificacion = null;

function mostrarNotificacion(texto) {
  const el     = document.getElementById("notificacion");
  const textoEl = document.getElementById("notificacion-texto");
  textoEl.textContent = `"${texto}"`;
  el.classList.remove("oculto");
  if (timeoutNotificacion) clearTimeout(timeoutNotificacion);
  timeoutNotificacion = setTimeout(() => el.classList.add("oculto"), 4000);
}

// ─────────────────────────────────────────
// FASE 3 — PRESIÓN CAPITALISTA
// ─────────────────────────────────────────
function obtenerTasaPresion() {
  const activos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (activos === 0) return 0;
  let tasa = 0.02 + activos * 0.015;
  if (estado.mejorasResistencia.includes("fondo-solidaridad")) tasa *= 0.70;
  if (estado.mejorasResistencia.includes("red-autodefensa"))   tasa *= 0.70;
  if (estado.mejorasResistencia.includes("contrainformacion")) tasa *= 0.60;
  return tasa;
}

function obtenerPenalizacionPresion() {
  const p = estado.presionCapitalista;
  if (p < 50) return 1;
  let penBase;
  if (p < 80) penBase = (p - 50) / 30 * 0.10;
  else        penBase = 0.10 + (p - 80) / 20 * 0.15;
  const reduccion = estado.mejorasResistencia.includes("contrainformacion") ? 0.12 : 0;
  return 1 - Math.max(0, penBase - reduccion);
}

function tickPresion(dt) {
  const tasa = obtenerTasaPresion();
  if (tasa > 0) {
    estado.presionCapitalista = Math.min(100, estado.presionCapitalista + tasa * dt);
  }
}

// ─────────────────────────────────────────
// FASE 3 — RESISTENCIA ACTIVA (Manifestación)
// ─────────────────────────────────────────
let ultimaManifestacion = 0;
const COOLDOWN_MANIFESTACION = 60000;

function costeManifestation() {
  return Math.max(100, Math.floor(estado.conciencia * 0.05));
}

function organizarManifestacion() {
  const ahora = Date.now();
  if (ahora - ultimaManifestacion < COOLDOWN_MANIFESTACION) return;
  const coste = costeManifestation();
  if (estado.conciencia < coste) return;

  estado.conciencia -= coste;
  estado.presionCapitalista = Math.max(0, estado.presionCapitalista - 20);
  ultimaManifestacion = ahora;

  calcularIngreso();
  renderizar();
  guardarEstado();
  mostrarNotificacion("La gente sale a las calles. La Presión Capitalista retrocede.");
}

// ─────────────────────────────────────────
// FASE 3 — MEJORAS DE RESISTENCIA
// ─────────────────────────────────────────
function comprarMejoraResistencia(id) {
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

// ─────────────────────────────────────────
// FASE 3 — EVENTOS ALEATORIOS
// ─────────────────────────────────────────
function verificarEventos() {
  if (estado.siguienteEvento === 0) return;
  if (Date.now() < estado.siguienteEvento) return;
  if (!document.getElementById("modal-evento").classList.contains("oculto")) return;
  const activos = estado.colectivos.filter(c => c.nivel > 0).length;
  if (activos === 0) return;

  const disponibles = EVENTOS_ALEATORIOS.filter(e => e.condicion());
  if (disponibles.length === 0) return;

  const evento = disponibles[Math.floor(Math.random() * disponibles.length)];
  estado.siguienteEvento = Date.now() + 90000 + Math.random() * 90000;
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
      <div class="evento-opcion"><strong>Aceptar:</strong> +<em>${formatear(bonusAceptar)} ⚡</em> pero Presión Capitalista +25.</div>
      <div class="evento-opcion"><strong>Rechazar:</strong> −<em>${formatear(costoRechazar)} ⚡</em> pero Presión Capitalista −15.</div>
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

// ─────────────────────────────────────────
// RENDERIZAR
// ─────────────────────────────────────────
function renderizar() {
  document.getElementById("conciencia-display").textContent =
    formatear(estado.conciencia) + " ⚡";
  document.getElementById("ingreso-display").textContent =
    formatear(estado.concienciaPorSegundo) + " ⚡ / seg";

  // Botones colectivos
  estado.colectivos.forEach(col => {
    const datos = COLECTIVOS[col.id];
    if (col.nivel === 0) {
      const btn = document.querySelector(`button[onclick="comprar(${col.id})"]`);
      if (btn) btn.disabled = estado.conciencia < datos.coste;
    } else {
      const btn = document.querySelector(`button[onclick="mejorar(${col.id})"]`);
      if (btn) {
        const coste = costeMejora(col);
        btn.disabled = estado.conciencia < coste || col.nivel >= 10;
      }
    }
  });

  // Barra de progreso revolución
  const umbral     = UMBRAL_REVOLUCION;
  const porcentaje = Math.min(100, (estado.concienciaTotal / umbral) * 100);
  const barra      = document.getElementById("progreso-barra");
  const texto      = document.getElementById("progreso-texto");
  if (barra) barra.style.width = porcentaje + "%";
  if (texto) texto.textContent = formatear(estado.concienciaTotal) + " / " + formatear(umbral) + " ⚡";

  // Fase 3
  renderizarPresion();
  actualizarEfectoDisplay();

  // Botón manifestación
  const btnMan = document.getElementById("btn-manifestacion");
  if (btnMan) {
    const ahora     = Date.now();
    const enCooldown = ahora - ultimaManifestacion < COOLDOWN_MANIFESTACION;
    const coste     = costeManifestation();
    btnMan.disabled = enCooldown || estado.conciencia < coste || estado.presionCapitalista === 0;
    if (enCooldown) {
      const segs = Math.ceil((COOLDOWN_MANIFESTACION - (ahora - ultimaManifestacion)) / 1000);
      btnMan.textContent = `🚩 Manifestación · ${segs}s`;
    } else {
      btnMan.textContent = `🚩 Manifestación · ${formatear(coste)} ⚡`;
    }
  }

  // Botones mejoras resistencia
  MEJORAS_RESISTENCIA.forEach(mejora => {
    if (estado.mejorasResistencia.includes(mejora.id)) return;
    const btn = document.querySelector(`button[data-mejora="${mejora.id}"]`);
    if (btn) btn.disabled = estado.conciencia < mejora.coste;
  });
}

function actualizarEfectoDisplay() {
  const el = document.getElementById("efecto-activo-display");
  if (!el) return;
  if (estado.efectoTemporal && estado.efectoTemporal.expira > Date.now()) {
    const segs = Math.ceil((estado.efectoTemporal.expira - Date.now()) / 1000);
    const m    = estado.efectoTemporal.mult;
    const pct  = m >= 1 ? `+${Math.round((m - 1) * 100)}%` : `−${Math.round((1 - m) * 100)}%`;
    el.textContent = `${pct} producción (${segs}s)`;
    el.className   = m >= 1 ? "efecto-activo positivo" : "efecto-activo negativo";
  } else {
    el.textContent = "";
    el.className   = "efecto-activo";
  }
}

function renderizarPresion() {
  const barra  = document.getElementById("presion-barra");
  const texto  = document.getElementById("presion-texto");
  const penEl  = document.getElementById("presion-penalizacion");
  if (!barra) return;

  const p = estado.presionCapitalista;
  barra.style.width = p + "%";

  if      (p >= 80) barra.className = "presion-barra-fill presion-alta";
  else if (p >= 50) barra.className = "presion-barra-fill presion-media";
  else              barra.className = "presion-barra-fill presion-baja";

  if (texto) texto.textContent = Math.round(p) + "%";

  if (penEl) {
    const pen = obtenerPenalizacionPresion();
    if (pen < 1) {
      penEl.textContent = `−${Math.round((1 - pen) * 100)}% prod.`;
      penEl.className = "presion-penalizacion activa";
    } else {
      penEl.textContent = "";
      penEl.className = "presion-penalizacion";
    }
  }
}

function renderizarColectivos() {
  const lista = document.getElementById("lista-colectivos");
  lista.innerHTML = "";

  estado.colectivos.forEach(col => {
    const datos       = COLECTIVOS[col.id];
    const esPrimero   = col.id === 0;
    const anterior    = col.id > 0 ? estado.colectivos[col.id - 1] : null;
    const desbloqueado = esPrimero || (anterior && anterior.nivel > 0);

    const card = document.createElement("div");
    card.className = "colectivo-card" + (desbloqueado ? "" : " bloqueado");

    const produccionActual = col.nivel > 0
      ? formatear(datos.ingresoPorSegundo * col.nivel) + " ⚡/seg"
      : "Sin activar";

    if (col.nivel === 0) {
      card.innerHTML = `
        <div class="colectivo-info">
          <h3>${datos.emoji} ${datos.nombre}</h3>
          <div class="nivel-texto">No organizado</div>
          <div class="produccion-texto">${produccionActual}</div>
        </div>
        <div class="colectivo-acciones">
          <button class="btn-comprar"
            onclick="comprar(${col.id})"
            ${!desbloqueado || estado.conciencia < datos.coste ? "disabled" : ""}>
            Organizar · ${formatear(datos.coste)} ⚡
          </button>
        </div>
      `;
    } else {
      const coste   = costeMejora(col);
      const maxNivel = 10;
      card.innerHTML = `
        <div class="colectivo-info">
          <h3>${datos.emoji} ${datos.nombre}</h3>
          <div class="nivel-texto">Nivel ${col.nivel} / ${maxNivel}</div>
          <div class="produccion-texto">${produccionActual}</div>
        </div>
        <div class="colectivo-acciones">
          <button class="btn-mejorar"
            onclick="mejorar(${col.id})"
            ${col.nivel >= maxNivel ? "disabled" : ""}>
            ${col.nivel >= maxNivel ? "Máximo" : "Mejorar · " + formatear(coste) + " ⚡"}
          </button>
        </div>
      `;
    }
    lista.appendChild(card);
  });
}

function renderizarMejorasResistencia() {
  const contenedor = document.getElementById("mejoras-resistencia");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  MEJORAS_RESISTENCIA.forEach(mejora => {
    const comprada = estado.mejorasResistencia.includes(mejora.id);
    const div = document.createElement("div");
    div.className = "mejora-resistencia" + (comprada ? " comprada" : "");
    div.innerHTML = `
      <span class="mejora-nombre" title="${mejora.descripcion}">${mejora.emoji} ${mejora.nombre}</span>
      <button class="btn-mejora-resistencia"
        data-mejora="${mejora.id}"
        onclick="comprarMejoraResistencia('${mejora.id}')"
        ${comprada || estado.conciencia < mejora.coste ? "disabled" : ""}>
        ${comprada ? "✓ Activa" : formatear(mejora.coste) + " ⚡"}
      </button>
    `;
    contenedor.appendChild(div);
  });
}

// ─────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────
document.getElementById("btn-agitar").addEventListener("click", (e) => {
  e.stopPropagation();
  const poder = obtenerPoderClic();
  estado.conciencia      += poder;
  estado.concienciaTotal += poder;
  renderizar();
  guardarEstado();
  actualizarBotonRevolucion();
});

function comprar(id) {
  const col      = estado.colectivos[id];
  const datos    = COLECTIVOS[id];
  const descuento = obtenerDescuentoMejoras();
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

function mejorar(id) {
  const col   = estado.colectivos[id];
  const coste = costeMejora(col);
  if (estado.conciencia >= coste && col.nivel < 10) {
    estado.conciencia -= coste;
    col.nivel++;
    calcularIngreso();
    renderizar();
    renderizarColectivos();
    guardarEstado();
  }
}

const UMBRAL_REVOLUCION = 500;

function actualizarBotonRevolucion() {
  const btn = document.getElementById("btn-revolucion");
  if (!btn) return;
  if (estado.concienciaTotal >= UMBRAL_REVOLUCION) {
    btn.classList.remove("oculto");
  }
}

function abrirModal(id)  { document.getElementById(id).classList.remove("oculto"); }
function cerrarModal(id) { document.getElementById(id).classList.add("oculto"); }

function mostrarHeroes() {
  cerrarModal("modal-revolucion");
  const heroes = heroesAleatorios();
  const lista  = document.getElementById("lista-heroes-seleccion");
  lista.innerHTML = "";

  if (heroes.length === 0) {
    lista.innerHTML = "<p style='color:#888'>Ya tienes todos los héroes.</p>";
    abrirModal("modal-heroes");
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

function abrirLegado() {
  const el = document.getElementById("legado-revoluciones");
  el.textContent = estado.totalRevoluciones === 0
    ? "Aún no has declarado ninguna Revolución."
    : `Has declarado ${estado.totalRevoluciones} Revolución${estado.totalRevoluciones > 1 ? "es" : ""}.`;

  const lista = document.getElementById("lista-heroes-legado");
  lista.innerHTML = "";

  if (estado.heroes.length === 0) {
    lista.innerHTML = "<p style='color:#555;margin-top:12px'>Tu legado está por escribirse.</p>";
  } else {
    estado.heroes.forEach(id => {
      const h = HEROES.find(x => x.id === id);
      if (!h) return;
      const div = document.createElement("div");
      div.className = "legado-heroe";
      div.innerHTML = `<h3>${h.emoji} ${h.nombre}</h3><p>${h.descripcion}</p>`;
      lista.appendChild(div);
    });
  }

  abrirModal("modal-legado");
}

// ─────────────────────────────────────────
// BUCLE PRINCIPAL
// ─────────────────────────────────────────
let ticksParaGuardar = 0;
const DT = 0.1; // 100ms en segundos

setInterval(() => {
  // Producción automática
  if (estado.concienciaPorSegundo > 0) {
    const ganancia = estado.concienciaPorSegundo * DT;
    estado.conciencia      += ganancia;
    estado.concienciaTotal += ganancia;
    actualizarBotonRevolucion();
  }

  // Fase 3: expirar efecto temporal
  if (estado.efectoTemporal && estado.efectoTemporal.expira <= Date.now()) {
    estado.efectoTemporal = null;
    calcularIngreso();
  }

  // Fase 3: presión capitalista
  tickPresion(DT);

  // Fase 3: eventos
  verificarEventos();

  renderizar();

  ticksParaGuardar++;
  if (ticksParaGuardar >= 50) {
    guardarEstado();
    ticksParaGuardar = 0;
  }
}, 100);

// ─────────────────────────────────────────
// INICIO
// ─────────────────────────────────────────
cargarEstado();
if (!Array.isArray(estado.mejorasResistencia)) estado.mejorasResistencia = [];
estado.siguienteEvento = Date.now() + 120000; // primer evento tras 2 min

window._comprar = comprar;
window._mejorar = mejorar;
window._handleLogin = handleLogin;
window._handleLogout = handleLogout;
window._abrirModal = abrirModal;
window._cerrarModal = cerrarModal;
window._mostrarHeroes = mostrarHeroes;
window._abrirLegado = abrirLegado;

calcularIngreso();
renderizar();
renderizarColectivos();
renderizarMejorasResistencia();
actualizarBotonRevolucion();
