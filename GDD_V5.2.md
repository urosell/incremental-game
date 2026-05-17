# CLASS RISING — Game Design Document v5.2

---

## CONCEPTO

Juego incremental / idle híbrido con temática de organización popular y crítica al capitalismo. El jugador empieza solo, agitando en su barrio, y construye progresivamente un movimiento global. Tono irónico con fondo serio, texto narrativo en momentos clave.

**Recurso principal:** Conciencia de Clase — icono CSS «CC» (dos letras apiladas en diagonal)

---

## MECÁNICA CORE

### Capa 1 — El clic manual
Botón "¡Agitar!" genera CC por clic. Mejorable con el sistema de Fuerza de Agitación (hasta nivel 100). Al hacer clic aparecen iconos flotantes (hoz/martillo) que se multiplican con el nivel de agitación.

### Capa 2 — Los colectivos
Con suficiente CC construyes colectivos que generan automáticamente. El clic sigue existiendo pero es opcional. Cada colectivo tiene **100 niveles**.

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

| ID | Nombre | Coste activar | CC/s base | Tier |
|----|--------|--------------|-----------|------|
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
Campo `imagen` opcional con ruta a PNG en `Imagenes/Colectivos/`. Si no tiene imagen, se muestra el emoji.

---

## FUERZA DE AGITACIÓN

Mejora el poder de clic. Se resetea con cada Revolución. **100 niveles**.

**Fórmulas:**
- `poderClic(N) = 2^N` (×2 por nivel)
- `coste(N) = floor(100 × 2.5^(N-1))` (×2.5 por nivel)

| Nv | Coste | CC por clic |
|----|-------|------------|
| 1 | 100 | 2 |
| 2 | 250 | 4 |
| 3 | 625 | 8 |
| 4 | 1.562 | 16 |
| 5 | 3.906 | 32 |
| 10 | 93.132 | 1.024 |
| 20 | ~5.6B | ~1M |

El coste puede reducirse con la rama **Organización Interna** del árbol de Agitación (hasta −90%).

**UI:** Tarjeta en el panel Mejoras → subtab Agitación. Muestra nivel actual, barra de progreso, preview del siguiente nivel y botón de compra con coste (tachado si hay descuento).

### Efecto visual de clic
Al pulsar "¡Agitar!" aparecen iconos flotantes (hoz/martillo de `Imagenes/Agitar/`) que suben y desaparecen. La cantidad es `2^nivelAgitacion` (máx. 16), con dispersión aleatoria.

---

## SISTEMA DE PRESTIGIO — LA REVOLUCIÓN

**Umbral:** configurable (`UMBRAL_REVOLUCION`, actualmente 500 para pruebas, objetivo final 10.000B)
El contador `concienciaTotal` nunca baja aunque gastes CC.

### Flujo completo de Revolución:
1. El jugador pulsa el icono 🔴 (arriba a la derecha del título)
2. Confirma en el modal
3. Elige 1 de 3 Héroes aleatorios (sin repetición hasta completar los 10)
4. Se calculan y otorgan las **Llamas Revolucionarias** 🔥
5. **Se abre el Árbol Revolucionario** — el jugador gasta sus llamas
6. Pulsa **"▶ Comenzar nueva partida"** — se aplican los bonuses de inicio
7. La partida arranca con el estado reseteado

### Al declarar la Revolución se resetea:
- CC actual (`conciencia = 0`, excepto Allende → 500)
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

Cada colectivo tiene **5 niveles** de mejora de producción.

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

Cada sección tiene **5 niveles**. Coste: **5 🔥 / nivel**. Desbloqueo secuencial.

| Sección | ID | Efecto por nivel | Desbloq. |
|---------|----|-----------------|---------|
| Multiplicador de Clic | `mult` | +50% poder de clic | Siempre |
| Inicio con Agitación | `inicio` | Empiezas cada run con Agitación Nv.N | Requiere `mult` Nv.1 |
| Héroes Agitan | `heroes` | +10 CC por héroe por nivel | Requiere `inicio` Nv.1 |

#### Rama derecha — Organización Interna

**10 niveles**, coste **5 🔥 / nivel**. Descuento: `nivelAgitacionCoste × 10%` (máx. 90%)

---

### 🛡️ Tab Resiliencia — cadena de 5 tiers

**20 niveles** cada tier. Coste: **5 🔥 / nivel**. Desbloqueo secuencial.

| Tier | ID | Colectivos afectados | Efecto por nivel |
|------|----|---------------------|-----------------|
| Barrio | `tier1` | Asamblea, Coop. Alimentos, Biblioteca | −3% coste compra/mejora |
| Movimiento | `tier2` | Sindicato, Vivienda, Radio | −3% coste compra/mejora |
| Poder Popular | `tier3` | Energía, Universidad | −3% coste compra/mejora |
| Revolución | `tier4` | Comunas, Internacional | −3% coste compra/mejora |
| Unidad Total | `all` | Todos los colectivos | −3% coste compra/mejora |

Descuentos acumulables, cap 90%.

---

### 🔥 Tab Llamas — bifurcación en dos ramas

#### Rama Multiplicador (llamas-mult-1 a -4)
| ID | Coste | Efecto |
|----|-------|--------|
| llamas-mult-1 | 3 🔥 | ×1.5 llamas |
| llamas-mult-2 | 8 🔥 | ×2 llamas |
| llamas-mult-3 | 20 🔥 | ×2 llamas |
| llamas-mult-4 | 50 🔥 | ×2 llamas |

#### Rama Eficiencia (llamas-eff-1 a -3)
| ID | Coste | Efecto |
|----|-------|--------|
| llamas-eff-1 | 5 🔥 | Factor ×0.75 |
| llamas-eff-2 | 15 🔥 | Factor ×0.75 |
| llamas-eff-3 | 40 🔥 | Factor ×0.75 |

---

## HÉROES DEL MOVIMIENTO

| ID | Nombre | Colectivo | Bonificación |
|----|--------|-----------|-------------|
| rosa | Rosa Luxemburg | Asamblea de Barrio | ×2 producción si >3 colectivos activos |
| zapata | Emiliano Zapata | Cooperativa de Alimentos | Cada mejora reduce coste de todos los colectivos 2% |
| gramsci | Antonio Gramsci | Biblioteca Popular | Cada nivel de Biblioteca acelera desbloqueo del siguiente |
| dolores | Dolores Ibárruri | Sindicato Obrero | +50% producción del Sindicato permanentemente |
| engels | Friedrich Engels | Colectivo de Vivienda | Genera CC pasiva con el juego cerrado |
| frida | Frida Kahlo | Radio Comunitaria | Reduce impacto de Eventos de Desinformación un 50% |
| tesla | Nikola Tesla | Cooperativa de Energía | ×2 producción de la Cooperativa de Energía |
| freire | Paulo Freire | Universidad Popular | ×2 poder de cada clic manual |
| kropotkin | Piotr Kropotkin | Red de Comunas | +10% producción de todos los colectivos |
| allende | Salvador Allende | La Internacional | Empiezas cada Revolución con 500 CC |

---

## FUERZAS ANTAGÓNICAS

### 💼 Presión Capitalista
Barra que sube sola con el tiempo. Si llega al máximo reduce generación de CC.

### 🛡️ Mejoras de Resistencia

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| fondo-solidaridad | Fondo de Solidaridad | 500 CC | Ralentiza Presión 30% |
| red-autodefensa | Red de Autodefensa | 5.000 CC | Ralentiza Presión 30% más |
| contrainformacion | Contrainformación | 50.000 CC | Ralentiza 40% más y reduce penalización |

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
| huelga-duracion | Huelga Prolongada | 3.000 CC | +30s duración |
| huelga-reduccion | Huelga Salvaje | 15.000 CC | ×2 velocidad reducción |
| huelga-cooldown | Movilización Rápida | 50.000 CC | −30s cooldown |
| huelga-auto | Red Sindical Activa | 200.000 CC | Auto-activación a 75% presión |

---

## DISEÑO VISUAL — SOVIET CONSTRUCTIVIST

Estética basada en el diseño gráfico soviético de los años 20-50: tipografía heroica, geometría bold, paleta limitada rojo/negro/crema/dorado, energía de póster de propaganda.

**Paleta principal:**
| Variable | Color | Uso |
|----------|-------|-----|
| `--sc-red` | `#C8211A` | Acento principal, bordes, botones |
| `--sc-red-bright` | `#E8321A` | Hover, display principal |
| `--sc-red-dark` | `#8B1510` | Sombras, estados activos |
| `--sc-gold` | `#C8982A` | Secundario, valores, stroke CC |
| `--sc-gold-light` | `#E8B840` | Counters CC, producción |
| `--sc-dark-bg` | `#1A0F08` | Fondo base |
| `--sc-cream` | `#F5EDD6` | Texto principal |
| `--sc-white` | `#FAF6EE` | Texto en botones de fondo rojo |
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

---

## ICONO CC — SISTEMA DE ICONOS

El recurso «Conciencia de Clase» se representa con un objeto CSS puro: dos letras «C» apiladas en diagonal (superior-izquierda / inferior-derecha), sin imágenes externas.

### Implementación (`src/ui/iconos.js`)
```js
export const CC = `<span class="cc-icon"><span class="cc-c cc-top">C</span><span class="cc-c cc-bot">C</span></span>`;
```

### Parámetros de diseño
- Tamaño de cada C: **80%** del `font-size` del contenedor
- Solapamiento: **50%** → `botPct = 27.27%`
- Contenedor: `1.1em × 1.1em` (`(2×80 − 50) / 100`)
- C superior: `top: 0; left: 0`
- C inferior: `top: 27.27%; left: 27.27%`

### Colores por contexto
| Contexto | Selector | Color |
|----------|----------|-------|
| Display principal | `#conciencia-display .cc-c` | `--sc-red-bright` (rojo, sin stroke) |
| Counter X/s | `#ingreso-display .cc-c` | `--sc-gold-light` (amarillo) |
| Panel mejoras | `#panel-mejoras .cc-c` | `--sc-gold-light` (amarillo) |
| Producción colectivos | `.produccion-texto .cc-c` | `--sc-gold-light` (amarillo) |
| Botón organizar | `.btn-comprar .cc-c` | `--sc-white` (blanco — fondo rojo) |
| Botón mejorar | `.btn-mejorar .cc-c` | `--sc-gold-light` (amarillo) |
| Resto (árbol, eventos…) | `.cc-c` base | Degradado `gold-light → red-bright → red-dark` |

### Icono legacy (img)
Los lugares donde el CC aparece dentro de strings de datos (tutorial, héroes) usan `<img class="icono-cc">` con `Imagenes/Conciencia_Clase.png` a 16px. La clase `.icono-cc` se mantiene separada de `.cc-icon`.

---

## FORMATEO DE NÚMEROS

| Función | Uso | Formato |
|---------|-----|---------|
| `formatearCompleto(n)` | Display principal | Número entero completo con puntos: `1.234.567` |
| `formatear(n)` | Ingreso X/s, colectivos | Abreviado: `1.23 millones` arriba de 1M, puntos debajo |
| `formatearCorto(n)` | Costes, botones | Abreviado: `1.23 M`, `4.56 B` |

El display `#conciencia-display` siempre muestra el número completo sin abreviaturas, escalando hasta miles de millones.

---

## LAYOUT Y UI — DESKTOP

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  Panel Izquierdo│   Panel Central           │  Panel Mejoras  │
│  (300px fijo)   │   (flex: 1)               │  (260px fijo)   │
│                 │                           │                 │
│  · Título       │   · Colectivos (2 cols)   │  · Resistencia  │
│  · Login/Avatar │                           │  · Agitación    │
│  · CC display   │                           │  · Huelga       │
│  · Progreso Rev │                           │                 │
│  · Presión Cap  │                           │                 │
│  · Agitar       │                           │                 │
│  · Huelga Gen.  │                           │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Paneles superpuestos (fixed, desktop):**
- 🔥 Árbol Revolucionario — 70vw, desde la derecha
- 📜 Legado — 100vw × 78vh, desde abajo

---

## LAYOUT Y UI — MOBILE (< 1024px)

Navegación por tabs en barra inferior fija (`#nav-mobile`, 60px). Soporta **swipe horizontal** entre tabs con animación de slide CSS.

**Orden de 6 tabs:**

| Tab | Icono | Panel |
|-----|-------|-------|
| Inicio | ✊ | Inicio + Colectivos combinados |
| Ciudad | 🏙️ | Vista de ciudad |
| Mejoras | ⚙️ | Panel de mejoras |
| Árbol | 🔥 | Árbol Revolucionario (full screen) |
| Legado | 📜 | Panel Legado (full screen) |
| Ajustes | ⚙️ | Cuenta + Audio + Idioma |

### Animaciones de cambio de tab
Al swipe o tap en la barra de navegación, el panel entrante desliza horizontalmente:
- Swipe derecha (ir al tab siguiente): `@keyframes tab-entra-derecha` — `translateX(100%) → 0`
- Swipe izquierda (ir al tab anterior): `@keyframes tab-entra-izquierda` — `translateX(-100%) → 0`
- Duración: 0.22s ease-out

### Panel Mejoras (mobile y desktop)
Usa la misma lógica visual que el Árbol Revolucionario: raíz trapezoidal + conectores + tarjetas `res-tier-card`. 3 subtabs: Resistencia / Agitación / Huelga.

### Tab Inicio (layout en 3 zonas)

```
┌─────────────────────────────┐
│  HEADER (fijo)              │
│  · ★ Class Rising           │
│  · [icono revolución ↗]     │
│  · Conciencia: X.XXX.XXX CC │
│  · X CC/s                   │
│  · Barra progreso revolución│
│  · Barra presión capitalista│
├─────────────────────────────┤
│  COLECTIVOS (scrollable)    │
│  · Lista completa           │
├─────────────────────────────┤
│  FOOTER (fijo, 100px)       │
│  [Convocar Huelga] [¡Agitar!]│
└─────────────────────────────┘
```

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

### ERA 1 — CONCIENCIA CC *(modo actual)*
Recurso: Conciencia de Clase CC | Clic: "¡Agitar!"

### ERA 2 — SUDOR 🔨
Recurso: Sudor de Clase 🔨 | Clic: "¡Producir!" | Antagonista: Corrupción Burocrática

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
├── GDD_V5.2.md
├── REFACTOR.md
├── fonts/
│   └── RedOctoberLight.otf
├── Imagenes/
│   ├── Declarar_Revolucion.png
│   ├── Conciencia_Clase.png     ← icono legacy (tutorial, héroes)
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
    │   ├── mejoras.js            ← MEJORAS_AGITACION generado programáticamente ×2.5 coste
    │   ├── arbol.js
    │   └── frases.js
    ├── core/
    │   ├── estado.js
    │   ├── sesion.js
    │   ├── persistencia.js
    │   └── calculos.js           ← formatearCompleto(); obtenerTasaPresion() sin reduccionPresion
    ├── ui/
    │   ├── iconos.js             ← CC como objeto CSS (.cc-icon)
    │   ├── notificacion.js       ← innerHTML para soportar CC en notificaciones
    │   ├── modales.js
    │   ├── render.js             ← conciencia-display usa formatearCompleto()
    │   ├── render-colectivos.js  ← CC interpolado correctamente en btn-mejorar
    │   ├── render-mejoras.js     ← visual tipo árbol con subtabs
    │   ├── render-presion.js
    │   ├── render-arbol.js
    │   └── ciudad.js
    ├── sistemas/
    │   ├── presion.js
    │   ├── huelga.js
    │   ├── eventos.js
    │   ├── revolucion.js
    │   ├── arbol-legado.js       ← CC en notificaciones de desbloqueo
    │   ├── tutorial.js           ← tut-texto usa innerHTML
    │   └── qte.js
    ├── acciones.js
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
- **Rama de desarrollo:** `rediseno-visual`

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
| `RESILIENCIA_TIER_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de cada tier |
| `RESILIENCIA_TIER_MAX_NIVEL` | 20 | Niveles máximos por tier |
| `AGITACION_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de Organización Interna |
| `AGITACION_COSTE_MAX_NIVEL` | 10 | Niveles máximos de Organización Interna |
| `AGITACION_CLIC_COSTE_POR_NIVEL` | 5 🔥 | Coste por nivel de las secciones de clic |
| `AGITACION_CLIC_MAX_NIVEL` | 5 | Niveles máximos por sección de clic |

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
| 4.5 | ✅ | Árbol producción · panel Legado con bio · efectos clic · fuente RedOctober |
| 5.0 | ✅ | Estética Soviet Constructivist + UI Mobile completa |
| 5.1 | ✅ | Árbol rediseñado: tiers Resiliencia + Agitación bifurcada con niveles |
| 5.2 | ✅ | Icono CC como objeto CSS · número completo en display · swipe animado · panel Mejoras con visual de árbol · coste Agitación ×2.5 |
| 5.3 | ⏳ | Sistema probabilidad Revolución + reequilibrio de escalado |
| 6 | ⏳ | El Gran Ciclo — Era del Sudor + Era del Dinero |

### Fase 5.2 — Completado
- **Icono CC como objeto CSS puro:** dos letras «C» apiladas en diagonal (80% / 27.27%), sin fichero de imagen. Colores por contexto (rojo en display principal, amarillo en counters y mejoras, blanco en botones de fondo rojo)
- **Constante CC** en `src/ui/iconos.js` — un único punto de verdad, importado en todos los archivos de render
- **Formateo de números mejorado:** `formatearCompleto()` en el display principal — siempre número entero con puntos (`1.234.567`), sin abreviaciones
- **Coste de Fuerza de Agitación ×2.5** por nivel (antes crecía más rápido); poder sigue siendo ×2
- **Panel de Mejoras** rediseñado con misma lógica visual que el Árbol (raíz + conectores + res-tier-card), con 3 subtabs
- **Orden de tabs mobile** actualizado: Inicio → Ciudad → Mejoras → Árbol → Legado → Ajustes
- **Animación de swipe** entre tabs: slide horizontal CSS (0.22s ease-out)
- **Contador X/s** abreviado a «X/s» (antes «X/seg»)
- **Bug fix:** `obtenerTasaPresion()` tenía referencia a `reduccionPresion` eliminada → propagación de NaN que rompía ambas barras
- **Bug fix:** `render-colectivos.js` — `" ${CC}"` dentro de comillas simples no se interpolaba
- **Bug fix:** `tutorial.js` — `tut-texto` cambiado a `innerHTML` para renderizar iconos

---

## PARA RETOMAR EN NUEVA CONVERSACIÓN

Pega este GDD y di:
> *"Soy el creador de Class Rising, continuamos donde lo dejamos."*
