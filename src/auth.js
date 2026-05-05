// ─────────────────────────────────────────
// AUTENTICACIÓN — login/logout y sincronización con la nube
// ─────────────────────────────────────────
import {
  loginConGoogle,
  cerrarSesion,
  escucharAuthEstado,
  cargarPartidaNube,
} from "../firebase.js";
import { estado } from "./core/estado.js";
import { sesion } from "./core/sesion.js";
import { calcularIngreso } from "./core/calculos.js";
import { renderizar, actualizarBotonRevolucion } from "./ui/render.js";
import { renderizarColectivos } from "./ui/render-colectivos.js";

export async function handleLogin() {
  const usuario = await loginConGoogle();
  if (usuario) {
    sesion.usuario = usuario;
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

export async function handleLogout() {
  await cerrarSesion();
  sesion.usuario = null;
}

// Engancha el listener de Firebase y refresca el panel de usuario
// cada vez que cambia el estado de auth.
export function inicializarAuth() {
  escucharAuthEstado((usuario) => {
    sesion.usuario = usuario;
    const info     = document.getElementById("usuario-info");
    const btnLogin = document.getElementById("btn-login");
    const avatar   = document.getElementById("usuario-avatar");
    const nombre   = document.getElementById("usuario-nombre");

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
}
