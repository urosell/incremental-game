// ─────────────────────────────────────────
// BUCLE PRINCIPAL — tick a 100ms
// ─────────────────────────────────────────
import { estado } from "./core/estado.js";
import { DT, HUELGA_UMBRAL_AUTO } from "./config/balance.js";
import { calcularIngreso, obtenerStatsHuelga } from "./core/calculos.js";
import { guardarEstado } from "./core/persistencia.js";
import { renderizar, actualizarBotonRevolucion } from "./ui/render.js";
import { tickPresion } from "./sistemas/presion.js";
import { activarHuelga } from "./sistemas/huelga.js";
import { tickQte } from "./sistemas/qte.js";
// import { verificarEventos } from "./sistemas/eventos.js"; // pendiente de reactivar

// Cada 50 ticks (5s) se persiste el estado a disco/nube.
const TICKS_ENTRE_GUARDADOS = 50;

export function iniciarBucle() {
  let ticksParaGuardar = 0;

  setInterval(() => {
    // Producción automática
    if (estado.concienciaPorSegundo > 0) {
      const ganancia = estado.concienciaPorSegundo * DT;
      estado.conciencia      += ganancia;
      estado.concienciaTotal += ganancia;
      actualizarBotonRevolucion();
    }

    // Expirar efecto temporal (eventos)
    if (estado.efectoTemporal && estado.efectoTemporal.expira <= Date.now()) {
      estado.efectoTemporal = null;
      calcularIngreso();
    }

    // Presión capitalista
    tickPresion(DT);

    // Quick Time Event (desactivado temporalmente)
    // tickQte();

    // Auto-activar huelga si la mejora está comprada
    if (obtenerStatsHuelga().auto) {
      const ahora       = Date.now();
      const huelgaCD    = estado.huelgaCooldownHasta || 0;
      const huelgaHasta = estado.huelgaExpira || 0;
      if (ahora >= huelgaCD && ahora >= huelgaHasta && estado.presionCapitalista >= HUELGA_UMBRAL_AUTO) {
        activarHuelga();
      }
    }

    // Eventos aleatorios (pendiente de reactivar)
    // verificarEventos();

    renderizar();

    ticksParaGuardar++;
    if (ticksParaGuardar >= TICKS_ENTRE_GUARDADOS) {
      guardarEstado();
      ticksParaGuardar = 0;
    }
  }, 100);
}
