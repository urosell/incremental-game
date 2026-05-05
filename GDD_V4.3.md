# CONCIENCIA DE CLASE — Game Design Document v4.3

---

## CONCEPTO

Juego incremental / idle híbrido con temática de organización popular y crítica al capitalismo. El jugador empieza solo, agitando en su barrio, y construye progresivamente un movimiento global. Tono irónico con fondo serio, texto narrativo en momentos clave.

**Recurso principal:** Conciencia de Clase ⚡

---

## MECÁNICA CORE

### Capa 1 — El clic manual
Botón "¡Agitar!" genera ⚡ por clic. Mejorable con el sistema de Fuerza de Agitación (hasta nivel 100).

### Capa 2 — Los colectivos
Con suficiente ⚡ construyes colectivos que generan automáticamente. El clic sigue existiendo pero es opcional. Cada colectivo tiene **100 niveles**.

### Capa 3 — La Revolución
Cuando la Conciencia Total acumulada llega al umbral puedes declarar La Revolución. Resetea todo pero otorga Llamas Revolucionarias 🔥 para gastar en el Árbol Revolucionario. Es cíclico e ilimitado.

---

## COLECTIVOS

| ID | Nombre | Coste activar | ⚡/seg base | Imagen |
|----|--------|--------------|------------|--------|
| 0 | Asamblea de Barrio | 50 | 0.5 | emoji 🏘️ |
| 1 | Cooperativa de Alimentos | 400 | 3 | emoji 🌾 |
| 2 | Biblioteca Popular | 3.200 | 22 | emoji 📚 |
| 3 | Sindicato Obrero | 25.600 | 170 | emoji ✊ |
| 4 | Colectivo de Vivienda | 204.800 | 1.300 | emoji 🏠 |
| 5 | Radio Comunitaria | 1.638.400 | 10.000 | `Imagenes/Colectivos/Radio_circular.png` |
| 6 | Cooperativa de Energía | 13.107.200 | 80.000 | emoji ⚡ |
| 7 | Universidad Popular | 104.857.600 | 650.000 | emoji 🎓 |
| 8 | Red de Comunas | 838.860.800 | 5.200.000 | emoji 🌐 |
| 9 | La Internacional | 6.710.886.400 | 42.000.000 | emoji 🌍 |

**Fórmulas:**
- Producción en nivel N: `ips_base × N`
- Coste de mejora (subir de nivel N a N+1): `floor(coste_base × (N+1) × 1.5)`
- Coste acumulado hasta nivel N: `coste_base × (0.75 × N × (N+1) − 0.5)`
- Niveles máximos: **100** (`MAX_NIVEL_COLECTIVO`)

Los colectivos sin activar muestran su producción estimada a nivel 1 (con todos los multiplicadores activos).

### Iconos de colectivos
Cada colectivo puede tener un campo `imagen` opcional con la ruta a un archivo PNG en `Imagenes/Colectivos/`. Si no tiene imagen, se muestra el emoji. Para añadir imagen a un colectivo basta con añadir `imagen: "Imagenes/Colectivos/NombreArchivo.png"` en el array `COLECTIVOS` de `src/data/colectivos.js`.

### Layout de la card
```
[ ICONO 52px ]  Nombre del Colectivo      15.246 ⚡/seg  [Botón]
                Nivel X / 100
```
El icono y el nombre ocupan la parte izquierda; producción y botón van a la derecha en la misma línea.

---

## FUERZA DE AGITACIÓN

Mejora el poder de clic. Se resetea con cada Revolución. **100 niveles** generados algorítmicamente.

Los 10 primeros niveles están fijados manualmente; del 11 al 100 se generan con:
- `coste(N) = floor(coste(N-1) × 3.2)`
- `poderClic(N) = floor(poderClic(N-1) × 1.4)`

| Nv | Coste | ⚡ por clic |
|----|-------|------------|
| 1 | 100 | 2 |
| 2 | 500 | 4 |
| 3 | 2.000 | 8 |
| 4 | 8.000 | 15 |
| 5 | 30.000 | 25 |
| 6 | 100.000 | 40 |
| 7 | 350.000 | 60 |
| 8 | 1.200.000 | 90 |
| 9 | 4.000.000 | 130 |
| 10 | 12.000.000 | 180 |
| 11-100 | ×3.2 cada nivel | ×1.4 cada nivel |

Se combina con el héroe Paulo Freire (×2 poder de clic) y con los nodos del Árbol Revolucionario.

---

## SISTEMA DE PRESTIGIO — LA REVOLUCIÓN

**Umbral:** configurable (`UMBRAL_REVOLUCION`, actualmente 500 para pruebas, objetivo final 10.000B)  
El contador `concienciaTotal` nunca baja aunque gastes ⚡.

### Flujo completo de Revolución:
1. El jugador pulsa "🔴 Declarar la Revolución"
2. Confirma en el modal
3. Elige 1 de 3 Héroes aleatorios (sin repetición hasta completar los 10)
4. Se calculan y otorgan las **Llamas Revolucionarias** 🔥
5. **Se abre el Árbol Revolucionario** — el jugador gasta sus llamas
6. Pulsa **"▶ Comenzar nueva partida"** — se aplican los bonuses de inicio
7. La partida arranca con el estado reseteado

### Al declarar la Revolución se resetea:
- ⚡ actual (`conciencia = 0`, excepto Allende → 500)
- `concienciaTotal = 0`
- Todos los colectivos a nivel 0
- `nivelAgitacion = 0`
- `mejorasResistencia = []`
- `presionCapitalista = 0`
- `efectoTemporal = null`
- `huelgaExpira = 0`, `huelgaCooldownHasta = 0`, `mejorasHuelga = []`

### Se conserva entre revoluciones:
- `heroes[]`
- `totalRevoluciones`
- `legado` (llamas y nodos del árbol) — almacenado en clave separada

### Frases narrativas por revolución:
- 1ª → "La primera chispa siempre parece pequeña. La historia dirá lo contrario."
- 2ª → "Cada caída es una lección. El movimiento vuelve más fuerte."
- 3ª → "No es derrota. Es el ciclo natural de toda revolución."
- 4ª+ → "El pueblo que no olvida su historia está condenado a superarla."

---

## LLAMAS REVOLUCIONARIAS 🔥

Nueva moneda meta-progresión, permanente entre revoluciones.

**Fórmula:** `llamas = max(1, floor(√(concienciaTotal / LLAMAS_DIVISOR)))`  
`LLAMAS_DIVISOR = 100` (configurable en constantes de balanceo)

Ejemplos:
- 500 ⚡ acumulados → 2 🔥
- 10.000 ⚡ → 10 🔥
- 40.000 ⚡ → 20 🔥
- 90.000 ⚡ → 30 🔥

Almacenadas en `localStorage` con clave `"conciencia-de-clase-legado-v1"` (separado del estado de partida).

---

## ÁRBOL REVOLUCIONARIO

Panel de 3 ramas independientes. Accesible:
- **Post-revolución:** con compra habilitada y botón "Comenzar nueva partida"
- **Durante la partida:** modo consulta (solo lectura) desde el botón 🔥 Árbol

### 🏭 Rama Producción

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| prod-1 | Organización Básica | 2 🔥 | +5% producción global |
| prod-2 | Solidaridad Obrera | 5 🔥 | +10% producción global (requiere prod-1) |
| prod-3 | Economía Comunitaria | 10 🔥 | +20% producción global (requiere prod-2) |
| prod-4 | Planificación Colectiva | 18 🔥 | Empiezas con Asamblea de Barrio activa (requiere prod-3) |

### ✊ Rama Agitación

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| agit-1 | Conciencia Popular | 2 🔥 | +50% poder de clic |
| agit-2 | Movilización Masiva | 5 🔥 | Poder de clic ×2 (requiere agit-1) |
| agit-3 | Huelga General | 10 🔥 | Poder de clic ×3 (requiere agit-2) |
| agit-4 | Vanguardia Revolucionaria | 18 🔥 | Empiezas con Fuerza de Agitación nv.1 (requiere agit-3) |

### 🛡️ Rama Resiliencia

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| res-1 | Redes de Apoyo | 2 🔥 | Coste de colectivos −10% |
| res-2 | Autogestión | 5 🔥 | Coste de mejorar colectivos −15% (requiere res-1) |
| res-3 | Fortaleza Popular | 10 🔥 | Presión capitalista sube un 25% más lento (requiere res-2) |
| res-4 | Territorio Liberado | 18 🔥 | Empiezas con las 3 mejoras de Resistencia activas (requiere res-3) |

Los bonuses de producción se acumulan multiplicativamente. Los bonuses de inicio se aplican al pulsar "Comenzar nueva partida".

---

## HÉROES DEL MOVIMIENTO

Los héroes no se repiten hasta haberlos conseguido todos (10). A partir de la revolución 11 vuelven a aparecer todos.

| ID | Nombre | Colectivo | Bonificación |
|----|--------|-----------|-------------|
| rosa | Rosa Luxemburg | Asamblea de Barrio | ×2 producción si >3 colectivos activos |
| zapata | Emiliano Zapata | Cooperativa de Alimentos | Cada mejora reduce coste de todos los colectivos 2% (máx 50%) |
| gramsci | Antonio Gramsci | Biblioteca Popular | Cada nivel de Biblioteca acelera desbloqueo del siguiente colectivo |
| dolores | Dolores Ibárruri | Sindicato Obrero | +50% producción del Sindicato permanentemente |
| engels | Friedrich Engels | Colectivo de Vivienda | Genera ⚡ pasiva con el juego cerrado |
| frida | Frida Kahlo | Radio Comunitaria | Reduce impacto de Eventos de Desinformación un 50% |
| tesla | Nikola Tesla | Cooperativa de Energía | ×2 producción de la Cooperativa de Energía |
| freire | Paulo Freire | Universidad Popular | ×2 poder de cada clic manual |
| kropotkin | Piotr Kropotkin | Red de Comunas | +10% producción de todos los colectivos |
| allende | Salvador Allende | La Internacional | Empiezas cada Revolución con 500 ⚡ |

**Sinergias:**
- Gramsci + Freire → Universidad y Biblioteca se potencian al doble
- Zapata + Kropotkin → Cooperativa Alimentos comparte producción como Comunas
- Luxemburg + Allende → Cada Revolución genera bonus extra de ⚡ inicial

---

## FUERZAS ANTAGÓNICAS

### 💼 Presión Capitalista
Barra que sube sola con el tiempo. Si llega al máximo reduce generación de ⚡.

- Tasa: `PRESION_TASA_BASE + colectivosActivos × PRESION_TASA_POR_COL`  
  (valores por defecto: `0.02 + activos × 0.015`)
- Penalización activa cuando supera el 50%
- Se resetea a 0 en cada Revolución
- Se puede reducir con Huelga General, Manifestación o Mejoras de Resistencia

### 🛡️ Mejoras de Resistencia (dentro de la partida)

Accesibles desde el panel fijo de la derecha. Se resetean con cada Revolución (salvo nodo `res-4` del árbol).

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| fondo-solidaridad | Fondo de Solidaridad | 500 ⚡ | Ralentiza Presión 30% |
| red-autodefensa | Red de Autodefensa | 5.000 ⚡ | Ralentiza Presión 30% más |
| contrainformacion | Contrainformación | 50.000 ⚡ | Ralentiza 40% más y reduce penalización |

### 🪧 Huelga General

Botón de acción directa en el panel izquierdo. Reduce activamente la Presión Capitalista mientras está activa. Se resetea con la Revolución.

**Mecánica:**
- Al pulsar, se activa durante `HUELGA_DURACION_BASE` segundos
- Mientras activa: la presión baja `HUELGA_REDUCCION_BASE` % por segundo (en lugar de subir)
- Tras expirar entra en cooldown de `HUELGA_COOLDOWN_BASE` segundos
- 3 estados visuales: listo (morado) → activa (verde pulsante) → cooldown (gris)

**Valores base** (configurables en constantes de balanceo):

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `HUELGA_DURACION_BASE` | 30s | Tiempo activa |
| `HUELGA_COOLDOWN_BASE` | 90s | Cooldown tras expirar |
| `HUELGA_REDUCCION_BASE` | 2 %/s | Reducción de presión por segundo |
| `HUELGA_UMBRAL_AUTO` | 75% | % de presión que activa la huelga automáticamente |

**Mejoras (panel derecho — sección 🪧 Acción Directa):**

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| huelga-duracion | Huelga Prolongada | 3.000 ⚡ | +30s de duración activa |
| huelga-reduccion | Huelga Salvaje | 15.000 ⚡ | ×2 velocidad de reducción de presión |
| huelga-cooldown | Movilización Rápida | 50.000 ⚡ | −30s de cooldown |
| huelga-auto | Red Sindical Activa | 200.000 ⚡ | Se activa sola cuando presión ≥ 75% |

### 🚩 Manifestación
Acción activa que reduce la Presión Capitalista en 20 puntos. Cooldown de 60 segundos. Coste: 5% de la ⚡ actual.

### 📰 Eventos Aleatorios
Implementados pero desactivados temporalmente. Ejemplos: Campaña Mediática, Orden de Desalojo, Oferta del Gran Capital, Fractura Interna, Solidaridad Internacional, Represión Policial.

---

## LAYOUT Y UI

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  Panel Izquierdo│   Panel Central           │  Panel Mejoras  │
│  (300px fijo)   │   (flex: 1)               │  (260px fijo)   │
│                 │                           │                 │
│  · Título       │   · Colectivos (2 cols)   │  · Resistencia  │
│  · Legado/Árbol │                           │  · Agitación    │
│  · Login        │                           │  · Acción Dir.  │
│  · ⚡ / seg     │                           │                 │
│  · Progreso Rev │                           │                 │
│  · Presión Cap  │                           │                 │
│  · Agitar       │                           │                 │
│  · Huelga Gen.  │                           │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Paneles superpuestos (fixed):**
- 🔥 Árbol Revolucionario — 70vw, desde la derecha, con animación slide
- Panel fondo semitransparente al abrir el árbol en modo consulta

**Formateo de números:**
- `< 10` → 2 decimales
- `< 1000` → 1 decimal
- `>= 1000` → entero con puntos
- `>= 1.000.000` → X.XX millones
- `>= 1.000.000.000` → X.XXB

---

## FIREBASE — ARQUITECTURA

**Proyecto:** class-rising  
**Servicios:** Authentication (Google) + Firestore (europe-west)

Funciones exportadas desde `firebase.js`:
- `loginConGoogle()`
- `cerrarSesion()`
- `escucharAuthEstado(callback)`
- `guardarPartidaNube(userId, estado)`
- `cargarPartidaNube(userId)`

**Guardado:**
- `localStorage` siempre como respaldo local — clave `"conciencia-de-clase-v1"`
- Firestore si hay sesión activa — colección `"partidas/{userId}"`
- Legado (llamas + árbol) en clave separada `"conciencia-de-clase-legado-v1"` (solo localStorage por ahora)
- Guardado automático cada ~5 segundos (50 ticks × 100ms)

---

## EL GRAN CICLO — LAS TRES ERAS (Fase 6, pendiente)

### ERA 1 — CONCIENCIA ⚡ *(modo actual)*
Recurso: Conciencia de Clase ⚡ | Clic: "¡Agitar!"  
Transición: Tras N Revoluciones → *"Lo conseguisteis. El viejo mundo ha caído. Ahora toca construir el nuevo."*

### ERA 2 — SUDOR 🔨
Recurso: Sudor de Clase 🔨 | Clic: "¡Producir!"  
Antagonista: Corrupción Burocrática (sube sola, no se puede parar)

| Estructura | Frase |
|-----------|-------|
| Granja Colectiva | "La tierra es de todos. La cosecha, del Estado." |
| Fábrica de Acero | "El acero construye el futuro. Quién vive en ese futuro, aún no está claro." |
| Central Eléctrica | "La luz llega a todos los hogares. Primero a los del Comité." |
| Red Ferroviaria | "El tren llega puntual. A donde el Plan decide." |
| Comité de Planificación | "Alguien tiene que decidir qué necesita el pueblo. El pueblo, no." |
| Ministerio de Información | "La verdad es demasiado importante para dejarla al azar." |
| Cuerpo de Inspectores | "Confiar está bien. Verificar, mejor." |
| Academia del Partido | "Educar es moldear. Moldear es gobernar." |
| Empresa Exterior | "Exportamos los valores de la revolución. Y el trigo. Todo el trigo." |
| La Nomenclatura | "Al final, toda revolución produce su propia aristocracia." |

Transición: *"Los que liberaron al pueblo aprendieron demasiado rápido a hablar como sus opresores."*

### ERA 3 — DINERO 💰
Recurso: Capital 💰  
Antagonista: Desigualdad (sube con cada acumulación)  
Estructuras: pendiente (Empresa, Banco, Lobby, Medios...)  
Transición: *"La historia no se repite. Pero rima."* → vuelve a ERA 1

**Legado entre eras:** Los Héroes se conservan (sus efectos se adaptan). Cada vuelta completa del Gran Ciclo otorga bonus permanente (por definir).

---

## ESTRUCTURA DEL PROYECTO

Tras el refactor (Fase 4.4) el código está separado por responsabilidad. Cada módulo hace una cosa, se importan por nombre y `main.js` solo orquesta el arranque.

```
incremental-game/
├── index.html                      ← estructura visual (data-accion en lugar de onclick)
├── style.css                       ← diseño y apariencia (variables CSS en :root)
├── main.js                         ← punto de entrada: carga, listener delegado, init, primer pintado
├── firebase.js                     ← conexión Firebase (auth + Firestore)
├── GDD_V4.3.md                     ← este archivo
├── REFACTOR.md                     ← plan de refactor por fases (referencia histórica)
├── Imagenes/
│   └── Colectivos/
│       └── Radio_circular.png      ← icono Radio Comunitaria
└── src/
    ├── config/
    │   └── balance.js              ← constantes de balanceo (UMBRAL, DT, PRESIÓN, HUELGA…)
    ├── data/
    │   ├── colectivos.js           ← array COLECTIVOS
    │   ├── heroes.js               ← array HEROES
    │   ├── mejoras.js              ← MEJORAS_RESISTENCIA / MEJORAS_HUELGA / MEJORAS_AGITACION
    │   ├── arbol.js                ← ARBOL_LEGADO (12 nodos × 3 ramas)
    │   └── frases.js               ← FRASES_REVOLUCION
    ├── core/
    │   ├── estado.js               ← objetos `estado` y `legado` (reactivos vía import)
    │   ├── sesion.js               ← `sesion.usuario` compartido auth ↔ persistencia
    │   ├── persistencia.js         ← guardar/cargar estado y legado (local + nube)
    │   └── calculos.js             ← funciones puras: formatear, ingreso, multiplicadores…
    ├── ui/
    │   ├── notificacion.js         ← mostrarNotificacion (toast narrativo)
    │   ├── modales.js              ← abrir/cerrar modales + abrirLegado
    │   ├── render.js               ← orquestador del refresh ligero
    │   ├── render-colectivos.js    ← reconstruye lista de colectivos
    │   ├── render-mejoras.js       ← Resistencia + Huelga + Agitación
    │   ├── render-presion.js       ← barra de Presión + botón de Huelga
    │   └── render-arbol.js         ← Árbol Revolucionario
    ├── sistemas/
    │   ├── presion.js              ← tickPresion (sube o baja según huelga)
    │   ├── huelga.js               ← activarHuelga, comprarMejoraHuelga
    │   ├── eventos.js              ← EVENTOS_ALEATORIOS + verificarEventos + modal de evento
    │   ├── revolucion.js           ← declararRevolucion, comenzarNuevaRun, mostrarHeroes
    │   └── arbol-legado.js         ← comprarNodoArbol + abrir/cerrar panel árbol
    ├── acciones.js                 ← comprar, mejorar, mejorarAgitacion, comprarMejoraResistencia, btn-agitar
    ├── auth.js                     ← handleLogin / handleLogout / inicializarAuth
    └── bucle.js                    ← setInterval principal (iniciarBucle)
```

**Modelo de actualización del UI:** los botones llevan atributos `data-accion="..."` y opcionalmente `data-arg="..."`. Un único listener delegado en `document.body` (definido en `main.js`) consulta un mapa `accion → función` y dispara la acción correspondiente. No hay `onclick=` en el HTML ni shim de funciones globales en `window`.

---

## NOTAS TÉCNICAS

- **Stack:** HTML + CSS + JavaScript puro con ES modules
- **Sin frameworks** ni librerías externas
- **Editor:** VS Code + Live Server + Claude Cowork
- **Versiones:** Node.js v24, Git v2.54
- Los scripts usan `type="module"`. La interacción HTML→JS se hace con `data-accion`/`data-arg` y un listener delegado en `main.js` (no se usa `window._foo`).
- **Bucle principal:** 100ms (`DT = 0.1`)
- **Guardado:** localStorage + Firestore cada ~5 segundos
- **Repositorio:** https://github.com/urosell/incremental-game
- **URL pública:** https://urosell.github.io/incremental-game

### Constantes de balanceo (`src/config/balance.js`)

Todas las constantes que afectan al equilibrio del juego viven en un único módulo:

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `UMBRAL_REVOLUCION` | 500 | Conciencia total para poder declarar la revolución |
| `MAX_NIVEL_COLECTIVO` | 100 | Nivel máximo de cada colectivo |
| `COOLDOWN_MANIFESTACION` | 60.000 ms | Cooldown entre manifestaciones |
| `DT` | 0.1 | Segundos por tick del bucle principal |
| `LLAMAS_DIVISOR` | 100 | Divisor en la fórmula de llamas |
| `PRESION_TASA_BASE` | 0.02 | Presión base por tick |
| `PRESION_TASA_POR_COL` | 0.015 | Presión adicional por colectivo activo |
| `HUELGA_DURACION_BASE` | 30 s | Duración base de la huelga |
| `HUELGA_COOLDOWN_BASE` | 90 s | Cooldown base entre huelgas |
| `HUELGA_REDUCCION_BASE` | 2 %/s | Reducción de presión por segundo |
| `HUELGA_UMBRAL_AUTO` | 75 % | Umbral de auto-activación de huelga |

### Variables CSS (`:root` en `style.css`)

Todos los colores, tamaños de paneles y radios de borde están como variables CSS en `:root`. Las principales:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--bg-base` | `#0f0f0f` | Fondo general |
| `--bg-panel` | `#141414` | Paneles y cards |
| `--bg-elevado` | `#1a1a1a` | Modales y widgets |
| `--rojo` | `#ef4444` | Acción principal |
| `--amarillo` | `#facc15` | Mejoras |
| `--verde` | `#22c55e` | Resistencia / positivo |
| `--naranja` | `#f97316` | Árbol / llamas |
| `--morado` | `#7c3aed` | Huelga general |
| `--fuente` | `'Segoe UI'` | Tipografía global |
| `--ancho-panel-izq` | `300px` | Ancho panel izquierdo |
| `--ancho-panel-mejoras` | `260px` | Ancho panel mejoras |
| `--icono-colectivo` | `52px` | Tamaño icono en cards |
| `--radio-sm/md/lg/xl/xxl` | `6/8/10/12/16px` | Border radius |

### Funciones de renderizado

Cada función vive en su propio módulo bajo `src/ui/`:

| Función | Archivo | Qué hace |
|---------|---------|----------|
| `renderizar()` | `render.js` | Refresh ligero: números, disabled, barras (no reconstruye DOM) |
| `actualizarBotonRevolucion()` | `render.js` | Muestra el botón cuando `concienciaTotal ≥ UMBRAL_REVOLUCION` |
| `actualizarEfectoDisplay()` | `render.js` | Indicador del efecto temporal (de eventos aleatorios) |
| `renderizarColectivos()` | `render-colectivos.js` | Reconstruye las cards de colectivos |
| `renderizarMejorasResistencia()` | `render-mejoras.js` | Reconstruye panel de mejoras de resistencia |
| `renderizarMejorasHuelga()` | `render-mejoras.js` | Reconstruye sección de mejoras de huelga |
| `renderizarAgitacion()` | `render-mejoras.js` | Sección de agitación + `#agitar-info` |
| `renderizarPresion()` | `render-presion.js` | Barra de Presión Capitalista (color según %) |
| `renderizarBtnHuelga()` | `render-presion.js` | Estado/texto del botón de huelga (listo/activa/cooldown) |
| `renderizarArbol(consulta)` | `render-arbol.js` | Árbol Revolucionario; `consulta=true` deshabilita compras |

### Estados guardados por separado
- `estado` (partida actual) → clave `conciencia-de-clase-v1`
- `legado` (llamas + nodos árbol) → clave `conciencia-de-clase-legado-v1`

---

## HOJA DE RUTA

| Fase | Estado | Descripción |
|------|--------|-------------|
| 0 | ✅ | Prototipo base genérico |
| 1 | ✅ | Nueva identidad — Conciencia, colectivos, narrativa, guardado local |
| 2 | ✅ | La Revolución cíclica + Héroes + Legado + barra progreso |
| 3 | ✅ | Presión Capitalista + Eventos aleatorios |
| 4 | ✅ | Firebase — login Google + guardado en nube |
| 4.1 | ✅ | Mejoras de UI — grid colectivos, formateo números, Fuerza de Agitación |
| 4.2 | ✅ | Árbol Revolucionario + Llamas 🔥 + niveles 100 colectivos y agitación + panel mejoras fijo |
| 4.3 | ✅ | Huelga General + iconos personalizados en cards + variables CSS/JS |
| 4.4 | ✅ | Refactor modular: `game.js` (1327 líneas) → `main.js` + 26 módulos en `src/`; HTML con `data-accion` y listener delegado |
| 5 | ⏳ | Diseño visual final + adaptación móvil |
| 6 | ⏳ | El Gran Ciclo — Era del Sudor + Era del Dinero |

---

## PARA RETOMAR EN NUEVA CONVERSACIÓN

Pega este GDD y di:
> *"Soy el creador de Conciencia de Clase, continuamos donde lo dejamos."*
