// ─────────────────────────────────────────
// NOTIFICACIÓN NARRATIVA
// ─────────────────────────────────────────
let timeoutNotificacion = null;

export function mostrarNotificacion(texto) {
  const el      = document.getElementById("notificacion");
  const textoEl = document.getElementById("notificacion-texto");
  textoEl.textContent = `"${texto}"`;
  el.classList.remove("oculto");
  if (timeoutNotificacion) clearTimeout(timeoutNotificacion);
  timeoutNotificacion = setTimeout(() => el.classList.add("oculto"), 4000);
}
