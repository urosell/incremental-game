// ─────────────────────────────────────────
// SESIÓN — usuario actualmente logueado
// ─────────────────────────────────────────
// Compartido entre el sistema de auth y el de persistencia.
// game.js / auth lo escribe; persistencia.js lo lee para decidir
// si sincronizar la partida en la nube.
export const sesion = { usuario: null };
