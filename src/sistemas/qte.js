// ─────────────────────────────────────────
// SISTEMA — Quick Time Event
// Cada X segundos aleatorios aparece una ventana de Y segundos
// en la que el poder de clic se multiplica ×10.
// ─────────────────────────────────────────

const QTE_DURACION       = 10;   // segundos que dura el evento (tras el popup)
const QTE_INTERVALO_MIN  = 30;   // segundos mínimos entre eventos
const QTE_INTERVALO_MAX  = 90;   // segundos máximos entre eventos
const QTE_MULTIPLICADOR  = 10;
const QTE_POPUP_DURACION = 5000; // ms que se muestra el popup (antes de activar el evento)

const FRASES_QTE = [
  "El poder está distraído con sus casos de corrupción... ¡es hora de agitar!",
  "El jefe ha salido a comer con el consejo de administración... ¡ahora!",
  "Los medios hablan de escándalos ajenos... ¡nadie nos mira!",
  "La policía está ocupada protegiendo al alcalde... ¡a las calles!",
  "El Congreso está de vacaciones... ¡el pueblo no descansa!",
  "Wall Street cierra por festivo... ¡nosotros nunca paramos!",
];

const ICONOS_QTE = [
  "Imagenes/Agitar/martillo.png",
  "Imagenes/Agitar/hoz.png",
];

let _qteExpira    = 0;
let _qteSiguiente = Date.now() + _randomIntervalo();
let _iconoIdx     = 0;

function _randomIntervalo() {
  return (QTE_INTERVALO_MIN + Math.random() * (QTE_INTERVALO_MAX - QTE_INTERVALO_MIN)) * 1000;
}

export function qteActivo() {
  return Date.now() < _qteExpira;
}

export function getQteMultiplicador() {
  return qteActivo() ? QTE_MULTIPLICADOR : 1;
}

export function tickQte() {
  const ahora = Date.now();

  if (!_popupActivo && !qteActivo() && ahora >= _qteSiguiente) {
    _qteSiguiente = ahora + QTE_POPUP_DURACION + QTE_DURACION * 1000 + _randomIntervalo();
    _lanzarPopup();
  }

  _actualizarUI();
}

let _popupActivo = false;

function _lanzarPopup() {
  _popupActivo = true;

  const frase = FRASES_QTE[Math.floor(Math.random() * FRASES_QTE.length)];
  const icono = ICONOS_QTE[_iconoIdx % ICONOS_QTE.length];
  _iconoIdx++;

  const popup      = document.getElementById("qte-popup");
  const popupIcono = document.getElementById("qte-popup-icono");
  const popupFrase = document.getElementById("qte-popup-frase");

  if (!popup) return;
  popupIcono.src         = icono;
  popupFrase.textContent = frase;
  popup.classList.remove("oculto", "qte-popup-salir");
  popup.classList.add("qte-popup-entrar");

  // Cerrar popup y arrancar el evento
  setTimeout(() => {
    popup.classList.remove("qte-popup-entrar");
    popup.classList.add("qte-popup-salir");
    setTimeout(() => {
      popup.classList.add("oculto");
      _popupActivo = false;
      _activarQte();
    }, 400);
  }, QTE_POPUP_DURACION);
}

function _activarQte() {
  _qteExpira = Date.now() + QTE_DURACION * 1000;
  document.getElementById("btn-agitar")?.classList.add("qte-activo");
}

function _actualizarUI() {
  if (!qteActivo()) {
    document.getElementById("btn-agitar")?.classList.remove("qte-activo");
  }
}
