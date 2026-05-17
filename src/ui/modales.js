// ─────────────────────────────────────────
// MODALES — abrir, cerrar y modal de Legado
// ─────────────────────────────────────────
import { estado } from "../core/estado.js";
import { HEROES } from "../data/heroes.js";
import { CC } from "./iconos.js";

export function abrirModal(id)  { document.getElementById(id).classList.remove("oculto"); }
export function cerrarModal(id) { document.getElementById(id).classList.add("oculto"); }

export function abrirLegado() {
  const el = document.getElementById("legado-revoluciones");
  el.textContent = estado.totalRevoluciones === 0
    ? "Aún no has declarado ninguna Revolución."
    : `Has declarado ${estado.totalRevoluciones} Revolución${estado.totalRevoluciones > 1 ? "es" : ""}.`;

  const lista = document.getElementById("lista-heroes-legado");
  lista.innerHTML = "";

  if (estado.heroes.length === 0) {
    lista.innerHTML = "<p class='legado-vacio'>Tu legado está por escribirse.</p>";
  } else {
    estado.heroes.forEach(id => {
      const h = HEROES.find(x => x.id === id);
      if (!h) return;
      const div = document.createElement("div");
      div.className = "legado-heroe";
      const imgSrc = `Imagenes/Heroes/${h.id}.png`;
      div.innerHTML = `
        <div class="legado-heroe-icono">
          <img src="${imgSrc}" alt="${h.nombre}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="legado-heroe-emoji-fallback">${h.emoji}</div>
        </div>
        <div class="legado-heroe-info">
          <div class="legado-heroe-nombre">${h.nombre}</div>
          <div class="legado-heroe-colectivo">📍 ${h.colectivo}</div>
          <div class="legado-heroe-bio">${h.bio}</div>
          <div class="legado-heroe-bonus">${CC} ${h.descripcion}</div>
          <div class="legado-heroe-frase">"${h.frase}"</div>
        </div>
      `;
      lista.appendChild(div);
    });
  }

  document.getElementById("panel-legado").classList.remove("oculto-panel");
  document.getElementById("panel-legado-fondo").classList.remove("oculto");
}

export function cerrarLegado() {
  document.getElementById("panel-legado").classList.add("oculto-panel");
  document.getElementById("panel-legado-fondo").classList.add("oculto");
}
