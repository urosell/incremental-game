# CLASS RISING — Game Design Document v5.1

---

## CONCEPTO

Juego incremental / idle híbrido con temática de organización popular y crítica al capitalismo. El jugador empieza solo, agitando en su barrio, y construye progresivamente un movimiento global. Tono irónico con fondo serio, texto narrativo en momentos clave.

**Recurso principal:** Conciencia de Clase ⚡

---

## MECÁNICA CORE

### Capa 1 — El clic manual
Botón "¡Agitar!" genera ⚡ por clic. Mejorable con el sistema de Fuerza de Agitación (hasta nivel 100). Al hacer clic aparecen iconos flotantes (hoz/martillo) que se multiplican con el nivel de agitación.

### Capa 2 — Los colectivos
Con suficiente ⚡ construyes colectivos que generan automáticamente. El clic sigue existiendo pero es opcional. Cada colectivo tiene **100 niveles**.

### Capa 3 — La Revolución
Cuando la Conciencia Total acumulada llega al umbral puedes declarar La Revolución. Resetea todo pero otorga Llamas Revolucionarias 🔥 para gastar en el Árbol Revolucionario. Es cíclico e ilimitado.

---

## COLECTIVOS Y TIERS

Los colectivos están clasificados en 4 tiers temáticos. La clasificación afecta a las mejoras del Árbol Revolucionario (rama Resiliencia), no al coste base en partida.

| Tier | Nombre | Emoji | Colectivos |
|------|--------|-------|------------|
| 1 | Barrio | 🏘️ | Asamblea (0), Cooperativa Alimentos (1), Biblioteca (2) |
| 2 | Movimiento | ✊ | Sindicato (3), Vivienda (4), Radio (5) |
| 3 | Poder Popular | ⚡ | Energía (6), Universidad (7) |
| 4 | Revolución | 🌐 | Comunas (8), Internacional (9) |

| ID | Nombre | Coste activar | ⚡/seg base | Tier |
|----|--------|--------------|------------|------|
| 0 | Asamblea de Barrio | 50 | 0.5 | 🏘️ Barrio |
| 1 | Cooperativa de Alimentos | 400 | 3 | 🏘️ Barrio |
| 2 | Biblioteca Popular | 3.200 | 22 | 🏘️ Barrio |
| 3 | Sindicato Obrero | 25.600 | 170 | ✊ Movimiento |
| 4 | Colectivo de Vivienda | 204.800 | 1.300 | ✊ Movimiento |
| 5 | Radio Comunitaria | 1.638.400 | 10.000 | ✊ Movimiento |
| 6 | Cooperativa de Energía | 13.107.200 | 80.000 | ⚡ Poder Popular |
| 7 | Universidad Popular | 104.857.600 | 650.000 | ⚡ Poder Popular |
| 8 | Red de Comunas | 838.860.800 | 5.200.000 | 🌐 Revolución |
| 9 | La Internacional | 6.710.886.400 | 42.000.000 | 🌐 Revolución |

**Fórmulas:**
- Producción en nivel N: `ips_base × N`
- Coste de mejora (subir de nivel N a N+1): `floor(coste_base × (N+1) × 1.5 × (1 - descuento_tier) × (1 - descuento_all))`
- Niveles máximos: **100** (`MAX_NIVEL_COLECTIVO`)

### Iconos de colectivos
Campo `imagen` opcional con ruta a PNG en `Imagenes/Colectivos/`. Si no tiene imagen, se muestra el emoji. El tier se muestra como badge en las tarjetas del árbol de producción.

---

## FUERZA DE AGITACIÓN

Mejora el poder de clic. Se resetea con cada Revolución. **100 niveles**.

**Fórmula:** `poderClic(N) = 2^N`

| Nv | Coste | ⚡ por clic |
|----|-------|------------|
| 1 | 100 | 2 |
| 2 | 500 | 4 |
| 3 | 2.000 | 8 |
| 4 | 8.000 | 16 |
| 5 | 30.000 | 32 |
| 6 | 100.000 | 64 |
| 7 | 350.000 | 128 |
| 8 | 1.200.000 | 256 |
| 9 | 4.000.000 | 512 |
| 10 | 12.000.000 | 1.024 |
| 11-100 | ×3.2 cada nivel | 2^N |

El coste de subir de nivel puede reducirse con la rama **Organización Interna** del árbol de Agitación (hasta −90%).

**UI:** El botón de Fuerza de Agitación muestra la imagen `Imagenes/Mejoras/Fuerza_Agitacion.png` con el coste superpuesto y el nivel actual debajo.

Se combina con el héroe Paulo Freire (×2 poder de clic) y con los nodos del Árbol Revolucionario.

### Efecto visual de clic
Al pulsar "¡Agitar!" aparecen iconos flotantes (hoz/martillo de `Imagenes/Agitar/`) que suben y desaparecen. La cantidad es `2^nivelAgitacion` (máx. 16), con dispersión aleatoria.

---

## SISTEMA DE PRESTIGIO — LA REVOLUCIÓN

**Umbral:** configurable (`UMBRAL_REVOLUCION`, actualmente 500 para pruebas, objetivo final 10.000B)
El contador `concienciaTotal` nunca baja aunque gastes ⚡.

### Flujo completo de Revolución:
1. El jugador pulsa el icono 🔴 (arriba a la derecha del título)
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
- `nivelAgitacion = 0` (excepto si `nivelesAgitacionClic.inicio > 0`)
- `mejorasResistencia = []`
- `presionCapitalista = 0`
- `efectoTemporal = null`
- `huelgaExpira = 0`, `huelgaCooldownHasta = 0`, `mejorasHuelga = []`

### Se conserva entre revoluciones:
- `heroes[]`
- `totalRevoluciones`
- `legado` (llamas, nodos, niveles del árbol) — almacenado en clave separada

### Bonuses de inicio aplicados en `comenzarNuevaRun()`:
- Nodo `prod-4` comprado → colectivo 0 empieza en nivel 1
- `nivelesAgitacionClic.inicio > 0` → `nivelAgitacion = nivelInicio` al arrancar
- Héroe Allende → `conciencia = 500` al arrancar

### Frases narrativas por revolución:
- 1ª → "La primera chispa siempre parece pequeña. La historia dirá lo contrario."
- 2ª → "Cada caída es una lección. El movimiento vuelve más fuerte."
- 3ª → "No es derrota. Es el ciclo natural de toda revolución."
- 4ª+ → "El pueblo que no olvida su historia está condenado a superarla."

---

## LLAMAS REVOLUCIONARIAS 🔥

Nueva moneda meta-progresión, permanente entre revoluciones.

**Fórmula:** `llamas = max(1, floor(√(concienciaTotal / (LLAMAS_DIVISOR × eficiencia)))) × multiplicador`

- `LLAMAS_DIVISOR = 100`
- `eficiencia`: reducida por nodos `llamas-eff-1/2/3` (×0.75 cada uno)
- `multiplicador`: aumentado por nodos `llamas-mult-1` (×1.5), `-2/3/4` (×2 cada uno)

Almacenadas en `localStorage` con clave `"conciencia-de-clase-legado-v1"` (separado del estado de partida).

---

## ÁRBOL REVOLUCIONARIO

Panel de 4 tabs independientes. Accesible:
- **Post-revolución:** con compra habilitada y botón "Comenzar nueva partida"
- **Durante la partida:** modo consulta (solo lectura) desde el tab 🔥 Árbol (mobile) o botón del panel (desktop)

**Estructura visual:** Árbol con raíz trapezoidal (`arbol-raiz`), conectores verticales (`arbol-link`) y bifurcaciones CSS (`arbol-fork` + `arbol-fork-cols`).

---

### 🏭 Tab Producción

Cada colectivo tiene **5 niveles** de mejora de producción. Se muestra el badge del tier en cada tarjeta.

**Bonificaciones por nivel (aditivas):**
| Nivel | Bonus | Coste |
|-------|-------|-------|
| 1 | +2% producción del colectivo | 1 🔥 |
| 2 | +5% producción del colectivo | 2 🔥 |
| 3 | +10% producción del colectivo | 4 🔥 |
| 4 | +15% producción del colectivo | 7 🔥 |
| 5 | +20% producción del colectivo | 12 🔥 |

---

### ✊ Tab Agitación — bifurcación en dos ramas

#### Rama izquierda — Poder de Clic (3 secciones secuenciales)

Cada sección tiene **5 niveles**. Coste: **5 🔥 / nivel**. Desbloqueo secuencial: necesitas Nv.1 de la sección anterior.

Almacenadas en `legado.nivelesAgitacionClic = { mult, inicio, heroes }`.

| Sección | ID | Emoji | Efecto por nivel | Desbloq. |
|---------|----|-------|-----------------|---------|
| Multiplicador de Clic | `mult` | ⚡ | +50% poder de clic (×3.5 en Nv.5) | Siempre |
| Inicio con Agitación | `inicio` | 🚀 | Empiezas cada run con Agitación Nv.N | Requiere `mult` Nv.1 |
| Héroes Agitan | `heroes` | 🦸 | +10⚡ por héroe por nivel | Requiere `inicio` Nv.1 |

**Fórmulas de aplicación:**
- `multClic = 1 + nivelesAgitacionClic.mult × 0.50`
- `poderClic += heroes.length × 10 × nivelesAgitacionClic.heroes`
- Al iniciar run: `nivelAgitacion = nivelesAgitacionClic.inicio`

#### Rama derecha — Organización Interna

**10 niveles**, coste **5 🔥 / nivel**. Reduce el coste de subir Fuerza de Agitación en el tab de Mejoras.

Almacenado en `legado.nivelAgitacionCoste`.

- Descuento: `nivelAgitacionCoste × 10%` (máx. 90%)
- Se aplica en `mejorarAgitacion()` con `obtenerDescuentoAgitacionMejora()`

---

### 🛡️ Tab Resiliencia — cadena de 5 tiers

**20 niveles** cada tier. Coste: **5 🔥 / nivel**. Desbloqueo secuencial: necesitas Nv.1 del tier anterior.

Almacenados en `legado.nivelesResilienciaTier = { tier1, tier2, tier3, tier4, all }`.

| Tier | ID | Emoji | Colectivos afectados | Desbloq. |
|------|----|-------|---------------------|---------|
| Barrio | `tier1` | 🏘️ | Asamblea, Coop. Alimentos, Biblioteca | Siempre |
| Movimiento | `tier2` | ✊ | Sindicato, Vivienda, Radio | Requiere `tier1` Nv.1 |
| Poder Popular | `tier3` | ⚡ | Energía, Universidad | Requiere `tier2` Nv.1 |
| Revolución | `tier4` | 🌐 | Comunas, Internacional | Requiere `tier3` Nv.1 |
| Unidad Total | `all` | 🌍 | Todos los colectivos | Requiere `tier4` Nv.1 |

**Efecto por nivel:** −3% en el coste de **comprar** y **mejorar** los colectivos de ese tier (−60% en Nv.20).

**Descuentos acumulables:**
- `descuentoTier = nivelesResilienciaTier[tier_del_colectivo] × 0.03`
- `descuentoAll  = nivelesResilienciaTier.all × 0.03`
- `descuentoTotal = min(0.90, descuentoTier + descuentoAll)`

Se aplica en `comprar()` y `costeMejora()` vía `obtenerDescuentoTierColectivo(colIdx)`.

---

### 🔥 Tab Llamas — bifurcación en dos ramas

#### Rama Multiplicador (llamas-mult-1 a -4)
Nodos booleanos. Multiplican las llamas ganadas por revolución.

| ID | Coste | Efecto |
|----|-------|--------|
| llamas-mult-1 | 3 🔥 | ×1.5 llamas |
| llamas-mult-2 | 8 🔥 | ×2 llamas |
| llamas-mult-3 | 20 🔥 | ×2 llamas |
| llamas-mult-4 | 50 🔥 | ×2 llamas |

#### Rama Eficiencia (llamas-eff-1 a -3)
Nodos booleanos. Reducen el divisor de la fórmula (más llamas por conciencia acumulada).

| ID | Coste | Efecto |
|----|-------|--------|
| llamas-eff-1 | 5 🔥 | Factor ×0.75 (más eficiente) |
| llamas-eff-2 | 15 🔥 | Factor ×0.75 |
| llamas-eff-3 | 40 🔥 | Factor ×0.75 |

---

## HÉROES DEL MOVIMIENTO

Panel **Legado** — accesible via tab 📜 (mobile) o botón del panel (desktop). Muestra cada héroe con:
- Imagen (`Imagenes/Heroes/<id>.png`) — fallback al emoji si no existe
- Nombre y colectivo asociado
- Bio educativa (quién fue históricamente)
- Bonificación activa (destacada en amarillo)
- Frase histórica

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

---

## FUERZAS ANTAGÓNICAS

### 💼 Presión Capitalista
Barra que sube sola con el tiempo. Si llega al máximo reduce generación de ⚡.

### 🛡️ Mejoras de Resistencia

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| fondo-solidaridad | Fondo de Solidaridad | 500 ⚡ | Ralentiza Presión 30% |
| red-autodefensa | Red de Autodefensa | 5.000 ⚡ | Ralentiza Presión 30% más |
| contrainformacion | Contrainformación | 50.000 ⚡ | Ralentiza 40% más y reduce penalización |

### 🪧 Huelga General

| Constante | Valor |
|-----------|-------|
| `HUELGA_DURACION_BASE` | 30s |
| `HUELGA_COOLDOWN_BASE` | 90s |
| `HUELGA_REDUCCION_BASE` | 2 %/s |
| `HUELGA_UMBRAL_AUTO` | 75% |

**Mejoras de Huelga:**
| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| huelga-duracion | Huelga Prolongada | 3.000 ⚡ | +30s duración |
| huelga-reduccion | Huelga Salvaje | 15.000 ⚡ | ×2 velocidad reducción |
| huelga-cooldown | Movilización Rápida | 50.000 ⚡ | −30s cooldown |
| huelga-auto | Red Sindical Activa | 200.000 ⚡ | Auto-activación a 75% presión |

### ⚡ QTE y Eventos Aleatorios
Implementados pero desactivados temporalmente.

---

## DISEÑO VISUAL — SOVIET CONSTRUCTIVIST

Estética basada en el diseño gráfico soviético de los años 20-50: tipografía heroica, geometría bold, paleta limitada rojo/negro/crema/dorado, energía de póster de propaganda.

**Paleta principal:**
| Variable | Color | Uso |
|----------|-------|-----|
| `--sc-red` | `#C8211A` | Acento principal, bordes, botones |
| `--sc-gold` | `#C8982A` | Secundario, valores, highlights |
| `--sc-dark-bg` | `#1A0F08` | Fondo base |
| `--sc-cream` | `#F5EDD6` | Texto principal |
| `--sc-green` | `#5A7A48` | Estados positivos |

**Tipografía:**
- Títulos: `Bebas Neue` (constructivista, mayúsculas)
- Cuerpo: `PT Serif` (serif clásico)
- Mono/datos: `Special Elite` (máquina de escribir)
- Título principal: `RedOctoberLight.otf` (local)

**Elementos visuales:**
- Borde rojo izquierdo grueso en paneles
- Textura de papel/ruido via SVG en `body`
- Barras de progreso con rayas diagonales
- Botones con `clip-path` angular (sin border-radius)
- Estrella constructivista `★` como decoración
- Animación `pulsar` en botones de acción clave

**Árbol Revolucionario — clases CSS de estructura:**
- `.arbol-raiz` — raíz trapezoidal con emoji y título
- `.arbol-link` — conector vertical entre nodos
- `.arbol-fork` + `.arbol-fork-rama` — bifurcación en Y con bordes CSS
- `.arbol-fork-cols` + `.arbol-fork-col` — dos columnas post-bifurcación
- `.arbol-subtitulo-rama` — etiqueta de rama en cada columna
- `.res-tier-card` — tarjeta de tier con barra de progreso, preview y botón
- `.prod-barra-wrap` + `.prod-barra-fill` — barra de progreso reutilizable
- `.prod-tier-badge` — badge del tier en tarjetas de producción

---

## LAYOUT Y UI — DESKTOP

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  Panel Izquierdo│   Panel Central           │  Panel Mejoras  │
│  (300px fijo)   │   (flex: 1)               │  (260px fijo)   │
│                 │                           │                 │
│  · Título       │   · Colectivos (2 cols)   │  · Resistencia  │
│  · Login/Avatar │                           │  · Agitación    │
│  · ⚡ Conciencia│                           │  · Acción Dir.  │
│  · Progreso Rev │                           │                 │
│  · Presión Cap  │                           │                 │
│  · Agitar       │                           │                 │
│  · Huelga Gen.  │                           │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Paneles superpuestos (fixed, desktop):**
- 🔥 Árbol Revolucionario — 70vw, desde la derecha
- 📜 Legado — 100vw × 78vh, desde abajo
- Fondo semitransparente al abrir; clicar fuera cierra

**Botón Declarar Revolución:** icono `Imagenes/Declarar_Revolucion.png`, 48px, posición absoluta arriba-derecha en `#titulo`. Oculto hasta alcanzar el umbral. Abre el modal de confirmación.

---

## LAYOUT Y UI — MOBILE (< 1024px)

Navegación por tabs en barra inferior fija (`#nav-mobile`, 60px). Soporta **swipe horizontal** entre tabs.

**6 tabs:**

| Tab | Icono | Panel |
|-----|-------|-------|
| Inicio | ✊ | Inicio + Colectivos combinados |
| Mejoras | ⚙️ | Panel de mejoras |
| Árbol | 🔥 | Árbol Revolucionario (full screen) |
| Ciudad | 🏙️ | Vista de ciudad (en desarrollo) |
| Legado | 📜 | Panel Legado (full screen) |
| Ajustes | ⚙️ | Cuenta + Audio + Idioma |

### Tab Inicio (layout en 3 zonas)

```
┌─────────────────────────────┐
│  HEADER (fijo)              │
│  · ★ Class Rising           │
│  · [icono revolución ↗]     │
│  · Conciencia: X.XXX ⚡ (grande) │
│  · Barra progreso revolución│
│  · Barra presión capitalista│
├─────────────────────────────┤
│  COLECTIVOS (scrollable)    │
│  · Lista completa           │
│  · Scroll independiente     │
├─────────────────────────────┤
│  FOOTER (fijo, 100px)       │
│  [Convocar Huelga] [¡Agitar!]│
│  [30s · CD 90s]  [+X ⚡ por clic]│
└─────────────────────────────┘
```

### Tab Ajustes

Cuenta funcional (Google), audio y idioma placeholder con controles visuales. La sección de cuenta en `#panel-izquierdo` se oculta en mobile.

### Árbol y Legado en mobile
No son overlays/drawers — se comportan como tabs normales: `position: fixed; inset: 0 0 60px 0; transform: none !important`. Los backdrops están ocultos en mobile.

---

## FIREBASE — ARQUITECTURA

**Proyecto:** class-rising
**Servicios:** Authentication (Google) + Firestore (europe-west)

**Guardado:**
- `localStorage` siempre como respaldo — clave `"conciencia-de-clase-v1"`
- Firestore si hay sesión activa — colección `"partidas/{userId}"`
- Legado en clave separada `"conciencia-de-clase-legado-v1"` (solo localStorage)
- Guardado automático cada ~5 segundos (50 ticks × 100ms)

---

## EL GRAN CICLO — LAS TRES ERAS (Fase 6, pendiente)

### ERA 1 — CONCIENCIA ⚡ *(modo actual)*
Recurso: Conciencia de Clase ⚡ | Clic: "¡Agitar!"

### ERA 2 — SUDOR 🔨
Recurso: Sudor de Clase 🔨 | Clic: "¡Producir!"
Antagonista: Corrupción Burocrática

### ERA 3 — DINERO 💰
Recurso: Capital 💰 | Antagonista: Desigualdad
Transición: *"La historia no se repite. Pero rima."* → vuelve a ERA 1

---

## ESTRUCTURA DEL PROYECTO

```
incremental-game/
├── index.html
├── style.css
├── main.js
├── firebase.js
├── GDD_V5.1.md
├── REFACTOR.md
├── fonts/
│   └── RedOctoberLight.otf
├── Imagenes/
│   ├── Declarar_Revolucion.png
│   ├── Colectivos/
│   │   └── Radio_circular.png
│   ├── Mejoras/
│   │   └── Fuerza_Agitacion.png
│   ├── Agitar/
│   │   ├── martillo.png
│   │   └── hoz.png
│   └── Heroes/
│       └── <id>.png
└── src/
    ├── config/
    │   └── balance.js
    ├── data/
    │   ├── colectivos.js
    │   ├── heroes.js
    │   ├── mejoras.js
    │   ├── arbol.js          ← TIERS_RESILIENCIA exportado; sin agit-1..5 ni res-1..4
    │   └── frases.js
    ├── core/
    │   ├── estado.js         ← legado con nivelesResilienciaTier, nivelAgitacionCoste, nivelesAgitacionClic
    │   ├── sesion.js
    │   ├── persistencia.js   ← migraciones para los nuevos campos de legado
    │   └── calculos.js       ← obtenerDescuentoTierColectivo(), obtenerDescuentoAgitacionMejora()
    ├── ui/
    │   ├── notificacion.js
    │   ├── modales.js
    │   ├── render.js
    │   ├── render-colectivos.js
    │   ├── render-mejoras.js ← precio con tachado cuando hay descuento de Organización Interna
    │   ├── render-presion.js
    │   ├── render-arbol.js   ← 4 tabs; árbol visual con raíz, links, bifurcaciones
    │   └── ciudad.js
    ├── sistemas/
    │   ├── presion.js
    │   ├── huelga.js
    │   ├── eventos.js
    │   ├── revolucion.js     ← sin referencias a res-4/agit-4 booleanos; usa nivelesAgitacionClic.inicio
    │   ├── arbol-legado.js   ← subirNivelResilienciaTier(), subirNivelAgitacionCoste(), subirNivelAgitacionClic()
    │   ├── tutorial.js
    │   └── qte.js
    ├── acciones.js           ← comprar() y mejorarAgitacion() usan los nuevos descuentos
    ├── auth.js
    └── bucle.js
```

---

## NOTAS TÉCNICAS

- **Stack:** HTML + CSS + JavaScript puro con ES modules
- **Sin frameworks** ni librerías externas
- **Editor:** VS Code + Live Server + Claude Cowork
- **Versiones:** Node.js v24, Git v2.54
- **Bucle principal:** 100ms (`DT = 0.1`)
- **Guardado:** localStorage + Firestore cada ~5 segundos
- **Repositorio:** https://github.com/urosell/incremental-game
- **URL pública:** https://urosell.github.io/incremental-game
- **Rama de desarrollo:** `rediseno-visual` (visual + mobile)

### Constantes de balanceo (`src/config/balance.js`)

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `UMBRAL_REVOLUCION` | 500 | Conciencia total para declarar la revolución |
| `MAX_NIVEL_COLECTIVO` | 100 | Nivel máximo de cada colectivo |
| `DT` | 0.1 | Segundos por tick |
| `LLAMAS_DIVISOR` | 100 | Divisor en fórmula de llamas |
| `PRESION_TASA_BASE` | 0.02 | Presión base por tick |
| `PRESION_TASA_POR_COL` | 0.015 | Presión adicional por colectivo activo |
| `HUELGA_DURACION_BASE` | 30s | Duración base de la huelga |
| `HUELGA_COOLDOWN_BASE` | 90s | Cooldown base entre huelgas |
| `HUELGA_REDUCCION_BASE` | 2 %/s | Reducción de presión por segundo |
| `RESILIENCIA_TIER_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de cada tier de resiliencia |
| `RESILIENCIA_TIER_MAX_NIVEL` | 20 | Niveles máximos por tier |
| `RESILIENCIA_TIER_PCT_POR_NIVEL` | 0.03 | Descuento por nivel (3%) |
| `AGITACION_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de Organización Interna |
| `AGITACION_COSTE_MAX_NIVEL` | 10 | Niveles máximos de Organización Interna |
| `AGITACION_COSTE_PCT_NIVEL` | 0.10 | Descuento por nivel sobre coste de agitación (10%) |
| `AGITACION_CLIC_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de las secciones de clic |
| `AGITACION_CLIC_MAX_NIVEL` | 5 | Niveles máximos por sección de clic |
| `AGITACION_CLIC_PCT_POR_NIVEL` | 0.50 | Bonus de Multiplicador de Clic por nivel (+50%) |
| `AGITACION_CLIC_HEROES_POR_NIV` | 10 | ⚡ extra por héroe por nivel de Héroes Agitan |

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
| 4.2 | ✅ | Árbol Revolucionario + Llamas 🔥 + niveles 100 colectivos y agitación |
| 4.3 | ✅ | Huelga General + iconos personalizados + variables CSS/JS |
| 4.4 | ✅ | Refactor modular: `game.js` → `main.js` + 26 módulos en `src/` |
| 4.5 | ✅ | Árbol producción · agit-5 · panel Legado con bio · efectos clic · QTE · fuente RedOctober |
| 5.0 | ✅ | Estética Soviet Constructivist + UI Mobile completa |
| 5.1 | ✅ | Árbol rediseñado: tiers de colectivos + Resiliencia por tier + Agitación bifurcada con niveles |
| 5.2 | ⏳ | Sistema probabilidad Revolución + Era Comunista + Era Capitalista |
| 6 | ⏳ | El Gran Ciclo — Era del Sudor + Era del Dinero |

### Fase 5.1 — Completado
- **Clasificación de colectivos en 4 tiers** temáticos (Barrio / Movimiento / Poder Popular / Revolución)
- **Badge de tier** visible en las tarjetas del tab Producción del árbol
- **Rama Resiliencia rediseñada:** 5 elementos en cadena (4 tiers + universal), 20 niveles cada uno, 5🔥/nivel, −3% por nivel sobre compra Y mejora de los colectivos del tier, descuentos acumulables con cap 90%
- **Rama Agitación rediseñada:** bifurcación en dos ramas independientes
  - *Poder de Clic:* 3 secciones secuenciales (Multiplicador de Clic, Inicio con Agitación, Héroes Agitan), 5 niveles cada una, 5🔥/nivel
  - *Organización Interna:* 10 niveles, 5🔥/nivel, −10%/nivel sobre coste de subir Fuerza de Agitación
- **Árbol visual con estructura CSS:** raíz trapezoidal, conectores, bifurcaciones en Y, barras de progreso
- **Eliminados** los nodos booleanos `agit-1..5` y `res-1..4`; sustituidos por el nuevo sistema de niveles
- **Migración hacia atrás** en `persistencia.js` para partidas guardadas antes de 5.1

---

## PARA RETOMAR EN NUEVA CONVERSACIÓN

Pega este GDD y di:
> *"Soy el creador de Class Rising, continuamos donde lo dejamos."*
