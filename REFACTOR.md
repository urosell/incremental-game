# Plan de refactor — Conciencia de Clase

Documento de referencia para separar `game.js` (1327 líneas) en módulos
manejables. Cada fase es un commit revisable por separado y deja el juego
funcionando.

---

## Diagnóstico actual

`firebase.js` ya está bien aislado: solo expone `loginConGoogle`,
`cerrarSesion`, `escucharAuthEstado`, `guardarPartidaNube` y
`cargarPartidaNube`. Eso es exactamente lo que tendría que ser un módulo. El
problema está concentrado en `game.js`, que mezcla siete responsabilidades
muy distintas en un único archivo:

1. **Constantes de balanceo** (líneas 1‑17).
2. **Catálogos de datos**: colectivos, héroes, mejoras (resistencia, huelga,
   agitación), árbol del legado, eventos, frases (líneas 67‑278).
3. **Estado y persistencia local**: el objeto `estado`, el objeto `legado`,
   y su `localStorage` (líneas 283‑421).
4. **Funciones puras de cálculo**: multiplicadores, descuentos, ingreso,
   presión, llamas, stats de huelga (dispersas).
5. **Sistemas de juego**: presión capitalista, huelga, eventos aleatorios,
   revolución/legado, manifestación.
6. **UI**: notificación, modales, todas las funciones `renderizar*`.
7. **Bucle principal** (`setInterval`), arranque y exposición de funciones a
   `window` para que el HTML las pueda llamar desde sus `onclick`.

A esto se le suma un detalle de `index.html`: el bloque `<script>` de las
líneas 114‑134 existe únicamente para enlazar los `onclick="comprar(0)"`
con las funciones del módulo (`window._comprar`, etc.). Es un parche para
esquivar el aislamiento que imponen los ES modules. Es síntoma del mismo
problema: lógica y UI demasiado entrelazadas.

`style.css` (893 líneas) técnicamente también es candidato a dividir, pero
ahí el dolor es mucho menor que en JS. Lo dejaría para una segunda iteración.

## Por qué importa separar

Cuando todo vive en un mismo fichero, cualquier revisión tiene que paginar
1300 líneas para entender un cambio puntual. Separar da tres beneficios
concretos:

- **Localidad**: si toco la huelga, sé exactamente qué archivo abrir y qué
  archivos no se ven afectados.
- **Diffs limpios**: en una review los cambios se ven en su contexto natural
  en lugar de perdidos entre 1300 líneas no relacionadas.
- **Facilidad para añadir contenido**: añadir un héroe nuevo sería editar
  `data/heroes.js`, no buscar en el medio del archivo grande.

---

## Estructura objetivo

Asumimos ES modules (ya los estás usando) y mantenemos `index.html`,
`style.css` y `firebase.js` en la raíz.

```
incremental-game/
├── index.html
├── style.css
├── firebase.js
├── main.js                    ← punto de entrada (lo que carga el HTML)
└── src/
    ├── config/
    │   └── balance.js         ← UMBRAL_REVOLUCION, DT, PRESION_TASA_*, HUELGA_*, etc.
    ├── data/
    │   ├── colectivos.js      ← const COLECTIVOS
    │   ├── heroes.js          ← const HEROES
    │   ├── mejoras.js         ← MEJORAS_RESISTENCIA, MEJORAS_HUELGA, MEJORAS_AGITACION
    │   ├── arbol.js           ← const ARBOL_LEGADO
    │   ├── eventos.js         ← EVENTOS_ALEATORIOS
    │   └── frases.js          ← FRASES_REVOLUCION
    ├── core/
    │   ├── estado.js          ← objeto `estado` y `legado` + getters básicos
    │   ├── persistencia.js    ← guardarEstado, cargarEstado, guardarLegado, cargarLegado
    │   └── calculos.js        ← formatear, costeMejora, calcularIngreso, obtenerMultiplicador,
    │                             obtenerPoderClic, obtenerBonusArbol, obtenerPenalizacionPresion,
    │                             obtenerTasaPresion, obtenerStatsHuelga, calcularLlamas
    ├── sistemas/
    │   ├── presion.js         ← tickPresion
    │   ├── huelga.js          ← activarHuelga, comprarMejoraHuelga
    │   ├── eventos.js         ← verificarEventos, mostrarEvento, resolverEvento, aplicarEfecto
    │   ├── revolucion.js      ← declararRevolucion, comenzarNuevaRun, mostrarHeroes, heroesAleatorios
    │   └── arbol-legado.js    ← comprarNodoArbol, abrirArbolConsulta
    ├── ui/
    │   ├── notificacion.js    ← mostrarNotificacion
    │   ├── modales.js         ← abrirModal, cerrarModal, abrirLegado
    │   ├── render.js          ← renderizar (orquestador) + actualizarEfectoDisplay + actualizarBotonRevolucion
    │   ├── render-colectivos.js
    │   ├── render-mejoras.js  ← resistencia + huelga + agitación
    │   ├── render-presion.js  ← renderizarPresion + renderizarBtnHuelga
    │   └── render-arbol.js    ← renderizarArbol
    ├── acciones.js            ← comprar, mejorar, mejorarAgitacion, comprarMejoraResistencia,
    │                            listener de #btn-agitar
    ├── auth.js                ← handleLogin, handleLogout, listener onAuthStateChanged
    └── bucle.js               ← el setInterval del juego
```

---

## Plan por fases

Cada fase es un commit revisable por separado. **Después de cada fase, el
juego debe seguir funcionando.** Probar en navegador antes de pasar a la
siguiente.

### Fase 1 — Datos puros *(riesgo bajo, beneficio alto)*

Mover los catálogos a `src/data/*.js`. Son arrays/constantes sin
dependencias hacia el resto del código. Solo necesitan `export`. En
`game.js` se sustituyen por `import`.

Mover:

- `COLECTIVOS` → `src/data/colectivos.js`
- `HEROES` → `src/data/heroes.js`
- `MEJORAS_RESISTENCIA`, `MEJORAS_HUELGA`, `MEJORAS_AGITACION` →
  `src/data/mejoras.js`
- `ARBOL_LEGADO` → `src/data/arbol.js`
- `EVENTOS_ALEATORIOS` → `src/data/eventos.js`
- `FRASES_REVOLUCION` → `src/data/frases.js`

Resultado esperado: `game.js` pierde unas 200 líneas. Es la fase con mayor
relación beneficio/coste.

### Fase 2 — Constantes de balanceo

Mover el bloque de líneas 1‑17 a `src/config/balance.js`. Trivial.
Exportarlas con `export const` e importarlas donde haga falta.

### Fase 3 — Cálculos puros

Mover a `src/core/calculos.js`:

- `formatear`
- `costeMejora`
- `calcularIngreso`
- `obtenerMultiplicador`
- `obtenerPoderClic`
- `obtenerDescuentoMejoras`
- `obtenerBonusArbol`
- `obtenerPenalizacionPresion`
- `obtenerTasaPresion`
- `obtenerStatsHuelga`
- `calcularLlamas`

**Reto**: casi todas leen del objeto `estado`. Dos opciones:

- **Opción A (rápida)**: mover `estado` y `legado` primero a
  `src/core/estado.js` y reimportarlos donde haga falta. Como en JS los
  imports son referencias vivas al objeto, todo sigue funcionando.
- **Opción B (más pura)**: las funciones reciben `estado` como parámetro.
  Más correcto, pero implica tocar muchos call sites. Para un primer juego,
  la A es suficiente.

Recomendación: hacer **A ahora** y dejar la posibilidad de migrar a B en
una iteración futura cuando el código ya esté separado.

### Fase 4 — Persistencia

A `src/core/persistencia.js`:

- `guardarEstado` / `cargarEstado`
- `guardarLegado` / `cargarLegado`
- Constantes `CLAVE_GUARDADO` y `CLAVE_LEGADO`

Aquí también vive la integración con `firebase.js` (la línea
`if (usuarioActual) guardarPartidaNube(...)` que ahora está en
`guardarEstado`).

**Mejora oportunista**: la función `cargarEstado` ya tiene migraciones
manuales (líneas 405‑412). Centralizar eso con un campo `version` en el
objeto guardado, para que en el futuro renombrar un campo no rompa las
partidas existentes.

### Fase 5 — UI base

A `src/ui/`:

- `mostrarNotificacion` → `notificacion.js`
- `abrirModal` / `cerrarModal` → `modales.js`
- `abrirLegado` → `modales.js` (es solo abrir un modal con datos)

### Fase 6 — Renderización

Cada `renderizar*` a su archivo en `src/ui/`:

- `renderizarColectivos` → `render-colectivos.js`
- `renderizarMejorasResistencia`, `renderizarMejorasHuelga`,
  `renderizarAgitacion` → `render-mejoras.js`
- `renderizarPresion`, `renderizarBtnHuelga` → `render-presion.js`
- `renderizarArbol` → `render-arbol.js`
- `mostrarEvento` → `render-evento.js` *(o se queda en sistemas/eventos.js
  si prefieres mantener UI y lógica del sistema juntos)*

La función `renderizar` (la grande, líneas 892‑964) queda en `render.js`
como **orquestador** que llama a los renderizadores específicos junto con
`actualizarEfectoDisplay` y `actualizarBotonRevolucion`.

### Fase 7 — Sistemas de juego

Cada sistema a su archivo en `src/sistemas/`:

- `tickPresion` → `presion.js`
- `activarHuelga`, `comprarMejoraHuelga` → `huelga.js`
- `verificarEventos`, `resolverEvento`, `aplicarEfecto` → `eventos.js`
- `declararRevolucion`, `comenzarNuevaRun`, `mostrarHeroes`,
  `heroesDisponibles`, `heroesAleatorios` → `revolucion.js`
- `comprarNodoArbol` y la apertura del árbol → `arbol-legado.js`
- `organizarManifestacion` (legacy, quizá eliminar si no se usa) →
  `manifestacion.js` *(o borrar si confirmamos que ya no se llama)*

### Fase 8 — Acciones, auth y bucle

- `comprar`, `mejorar`, `mejorarAgitacion`, `comprarMejoraResistencia`,
  el listener de `#btn-agitar` → `src/acciones.js`
- `handleLogin`, `handleLogout`, listener `escucharAuthEstado` →
  `src/auth.js`
- El `setInterval` del bucle principal → `src/bucle.js`

### Fase 9 — `main.js` y limpieza del HTML

Crear `main.js` en la raíz que:

1. Importa todo lo necesario.
2. Llama a `cargarLegado()` y `cargarEstado()`.
3. Hace los `renderizar*` iniciales.
4. Arranca el bucle (`iniciarBucle()`).
5. Engancha los listeners.

Y entonces, **eliminar el shim de `window._foo` del HTML**: en lugar de
`onclick="comprar(0)"`, usar `data-accion="comprar" data-id="0"` y un único
listener delegado en `main.js`:

```js
document.body.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion]");
  if (!btn) return;
  const accion = btn.dataset.accion;
  const id = btn.dataset.id;
  if (accion === "comprar") comprar(Number(id));
  // ...
});
```

Eso desacopla el HTML del nombrado interno de las funciones y hace que el
`<script>` inline de las líneas 114‑134 desaparezca por completo.

En `index.html` el `<script>` final pasa de los 21 binds actuales a:

```html
<script type="module" src="main.js"></script>
```

---

## Mejoras adicionales detectadas

Mientras se hace el split, conviene arreglar tres cosas:

**1. Validación al cargar partida.** En `game.js` línea 25
(`async function handleLogin`) y en `cargarEstado` se hace
`Object.assign(estado, partidaNube/guardado)` sin validar campos. Si en el
futuro se renombra un campo, las partidas guardadas pueden romperse.
Centralizar las migraciones en `persistencia.js` con un número de versión
del esquema.

**2. Héroes referenciados por índice numérico.** En `calcularIngreso`
(línea ~535) y otros sitios se hace `col.id === 3`, `col.id === 6`. Si
reordenas el array `COLECTIVOS` se rompe todo. Al mover `heroes.js`,
referenciar por identificador semántico:
`colectivoId: "sindicato"` en lugar de un número.

**3. Inconsistencia HTML/JS.** En `index.html` líneas 130‑133, la función
`cerrarArbolConsulta` está implementada inline en el HTML mientras que
`abrirArbolConsulta` sí está en JS. Al hacer la Fase 9, unificarlo.

---

## Comprobación entre fases

Después de cada fase, abrir el juego en el navegador y verificar:

- Se ve la conciencia y va subiendo con clic.
- Se puede comprar un colectivo y mejorarlo.
- Se carga la partida guardada al recargar.
- Login/logout con Google sigue funcionando.
- El árbol se abre y se compra un nodo.
- La huelga se activa y reduce la presión.

Si algo falla, el commit de esa fase es pequeño y fácil de revertir.

---

## Resumen ejecutivo

| Fase | Qué se mueve | Riesgo | Líneas que pierde `game.js` |
|------|--------------|--------|------------------------------|
| 1 | Datos puros | Bajo | ~210 |
| 2 | Constantes de balanceo | Mínimo | ~17 |
| 3 | Cálculos puros + estado | Medio | ~150 |
| 4 | Persistencia | Bajo | ~50 |
| 5 | UI base (notificación, modales) | Bajo | ~30 |
| 6 | Renderización | Medio | ~280 |
| 7 | Sistemas | Medio | ~250 |
| 8 | Acciones, auth, bucle | Medio | ~150 |
| 9 | Limpieza HTML + main.js | Bajo | resto |

Al final, `game.js` deja de existir como archivo y queda sustituido por
`main.js` (~50 líneas de orquestación) más la estructura de `src/`.
