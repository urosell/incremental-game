# CLASS RISING — Game Design Document v4.5

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
- Niveles máximos: **100** (`MAX_NIVEL_COLECTIVO`)

### Iconos de colectivos
Campo `imagen` opcional con ruta a PNG en `Imagenes/Colectivos/`. Si no tiene imagen, se muestra el emoji.

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

**UI:** El botón de Fuerza de Agitación muestra la imagen `Imagenes/Mejoras/Fuerza_Agitacion.png` con el coste superpuesto y el nivel actual debajo.

Se combina con el héroe Paulo Freire (×2 poder de clic) y con los nodos del Árbol Revolucionario.

### Efecto visual de clic
Al pulsar "¡Agitar!" aparecen iconos flotantes (hoz/martillo de `Imagenes/Agitar/`) que suben y desaparecen. La cantidad es `2^nivelAgitacion` (máx. 16), con dispersión aleatoria.

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
`LLAMAS_DIVISOR = 100`

Almacenadas en `localStorage` con clave `"conciencia-de-clase-legado-v1"` (separado del estado de partida).

---

## ÁRBOL REVOLUCIONARIO

Panel de 3 ramas independientes. Accesible:
- **Post-revolución:** con compra habilitada y botón "Comenzar nueva partida"
- **Durante la partida:** modo consulta (solo lectura) desde el botón 🔥 Árbol

### 🏭 Rama Producción — por colectivo

Cada colectivo tiene **5 niveles** de mejora de producción. Un solo botón progresivo por colectivo (estilo card, igual que los colectivos del juego).

**Bonificaciones por nivel (aditivas):**
| Nivel | Bonus | Coste |
|-------|-------|-------|
| 1 | +2% producción del colectivo | 1 🔥 |
| 2 | +5% producción del colectivo | 2 🔥 |
| 3 | +10% producción del colectivo | 4 🔥 |
| 4 | +15% producción del colectivo | 7 🔥 |
| 5 | +20% producción del colectivo | 12 🔥 |

Comprar un nivel desbloquea el siguiente. El bonus total máximo por colectivo es +52%.

**IDs de nodo:** `prod-{colId}-{nivel}` (ej: `prod-asamblea-1`, `prod-radio-3`)

### ✊ Rama Agitación

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| agit-1 | Conciencia Popular | 2 🔥 | +50% poder de clic |
| agit-2 | Movilización Masiva | 5 🔥 | Poder de clic ×2 |
| agit-3 | Huelga General | 10 🔥 | Poder de clic ×3 |
| agit-4 | Vanguardia Revolucionaria | 18 🔥 | Empiezas con Fuerza de Agitación nv.1 |
| agit-5 | Los Héroes Agitan | 25 🔥 | Cada héroe añade +10 ⚡ al poder de clic |

### 🛡️ Rama Resiliencia

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| res-1 | Redes de Apoyo | 2 🔥 | Coste de colectivos −10% |
| res-2 | Autogestión | 5 🔥 | Coste de mejorar colectivos −15% |
| res-3 | Fortaleza Popular | 10 🔥 | Presión capitalista sube un 25% más lento |
| res-4 | Territorio Liberado | 18 🔥 | Empiezas con las 3 mejoras de Resistencia activas |

---

## HÉROES DEL MOVIMIENTO

Panel **Legado** — drawer que sube desde abajo (78vh). Muestra cada héroe con:
- Imagen (`Imagenes/Heroes/<id>.png`) — fallback al emoji si no existe
- Nombre y colectivo asociado
- Bio educativa (quién fue históricamente)
- Bonificación activa (destacada en amarillo)
- Frase histórica

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
- Penalización activa cuando supera el 50%
- Se resetea a 0 en cada Revolución

### 🛡️ Mejoras de Resistencia

| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| fondo-solidaridad | Fondo de Solidaridad | 500 ⚡ | Ralentiza Presión 30% |
| red-autodefensa | Red de Autodefensa | 5.000 ⚡ | Ralentiza Presión 30% más |
| contrainformacion | Contrainformación | 50.000 ⚡ | Ralentiza 40% más y reduce penalización |

### 🪧 Huelga General

**Valores base:**
| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `HUELGA_DURACION_BASE` | 30s | Tiempo activa |
| `HUELGA_COOLDOWN_BASE` | 90s | Cooldown tras expirar |
| `HUELGA_REDUCCION_BASE` | 2 %/s | Reducción de presión por segundo |
| `HUELGA_UMBRAL_AUTO` | 75% | % de presión que activa la huelga automáticamente |

**Mejoras de Huelga:**
| ID | Nombre | Coste | Efecto |
|----|--------|-------|--------|
| huelga-duracion | Huelga Prolongada | 3.000 ⚡ | +30s de duración activa |
| huelga-reduccion | Huelga Salvaje | 15.000 ⚡ | ×2 velocidad de reducción de presión |
| huelga-cooldown | Movilización Rápida | 50.000 ⚡ | −30s de cooldown |
| huelga-auto | Red Sindical Activa | 200.000 ⚡ | Se activa sola cuando presión ≥ 75% |

### ⚡ Quick Time Event (implementado, desactivado)
Cada 30–90 segundos aleatorios: popup 5s con frase motivadora + icono grande → evento 10s de ×10 poder de clic. El botón Agitar se pone rojo durante el evento. Para reactivar: descomentar `tickQte()` en `src/bucle.js`.

### 📰 Eventos Aleatorios
Implementados pero desactivados temporalmente.

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
│  · Agitar (🟡) │                           │                 │
│  · Huelga Gen.  │                           │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Paneles superpuestos (fixed):**
- 🔥 Árbol Revolucionario — 70vw, desde la derecha, con animación slide
- 📜 Legado — 100vw × 78vh, sube desde abajo, con animación slide
- Fondo semitransparente al abrir árbol o legado; clicar fuera cierra

**Fuente del título:** RedOctoberLight.otf (`fonts/RedOctoberLight.otf`)

**Formateo de números:**
- `< 10` → 2 decimales
- `< 1000` → 1 decimal
- `>= 1.000` → entero con puntos
- `>= 1.000.000` → X.XXX millones
- `>= 1.000.000.000` → X.XXX billones

---

## FIREBASE — ARQUITECTURA

**Proyecto:** class-rising
**Servicios:** Authentication (Google) + Firestore (europe-west)

**Guardado:**
- `localStorage` siempre como respaldo local — clave `"conciencia-de-clase-v1"`
- Firestore si hay sesión activa — colección `"partidas/{userId}"`
- Legado en clave separada `"conciencia-de-clase-legado-v1"` (solo localStorage por ahora)
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

### ERA 3 — DINERO 💰
Recurso: Capital 💰
Antagonista: Desigualdad
Transición: *"La historia no se repite. Pero rima."* → vuelve a ERA 1

---

## ESTRUCTURA DEL PROYECTO

```
incremental-game/
├── index.html
├── style.css
├── main.js
├── firebase.js
├── GDD_V4.5.md
├── REFACTOR.md
├── fonts/
│   └── RedOctoberLight.otf
├── Imagenes/
│   ├── Colectivos/
│   │   └── Radio_circular.png
│   ├── Mejoras/
│   │   └── Fuerza_Agitacion.png
│   ├── Agitar/
│   │   ├── martillo.png
│   │   └── hoz.png
│   └── Heroes/
│       └── <id>.png  ← pendiente (rosa, zapata, gramsci…)
└── src/
    ├── config/
    │   └── balance.js
    ├── data/
    │   ├── colectivos.js
    │   ├── heroes.js          ← incluye campo `bio`
    │   ├── mejoras.js         ← poderClic = 2^N
    │   ├── arbol.js           ← COLS_PROD, PROD_BONUSES, PROD_COSTES, ARBOL_LEGADO
    │   └── frases.js
    ├── core/
    │   ├── estado.js
    │   ├── sesion.js
    │   ├── persistencia.js
    │   └── calculos.js        ← getBonusProduccionArbol, getQteMultiplicador
    ├── ui/
    │   ├── notificacion.js
    │   ├── modales.js         ← abrirLegado/cerrarLegado (panel desde abajo)
    │   ├── render.js
    │   ├── render-colectivos.js
    │   ├── render-mejoras.js
    │   ├── render-presion.js
    │   └── render-arbol.js    ← rama producción como cards + ramas lineales
    ├── sistemas/
    │   ├── presion.js
    │   ├── huelga.js
    │   ├── eventos.js
    │   ├── revolucion.js
    │   ├── arbol-legado.js
    │   └── qte.js             ← QTE system (desactivado en bucle.js)
    ├── acciones.js            ← spawnClickFx con hoz/martillo
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

### Constantes de balanceo (`src/config/balance.js`)

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `UMBRAL_REVOLUCION` | 500 | Conciencia total para poder declarar la revolución |
| `MAX_NIVEL_COLECTIVO` | 100 | Nivel máximo de cada colectivo |
| `DT` | 0.1 | Segundos por tick del bucle principal |
| `LLAMAS_DIVISOR` | 100 | Divisor en la fórmula de llamas |
| `PRESION_TASA_BASE` | 0.02 | Presión base por tick |
| `PRESION_TASA_POR_COL` | 0.015 | Presión adicional por colectivo activo |
| `HUELGA_DURACION_BASE` | 30 s | Duración base de la huelga |
| `HUELGA_COOLDOWN_BASE` | 90 s | Cooldown base entre huelgas |
| `HUELGA_REDUCCION_BASE` | 2 %/s | Reducción de presión por segundo |
| `HUELGA_UMBRAL_AUTO` | 75 % | Umbral de auto-activación de huelga |

### Árbol — constantes de producción (`src/data/arbol.js`)

| Constante | Valores |
|-----------|---------|
| `PROD_BONUSES` | [0.02, 0.05, 0.10, 0.15, 0.20] |
| `PROD_COSTES` | [1, 2, 4, 7, 12] 🔥 |

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
| 4.5 | ✅ | Árbol producción por colectivo · agit-5 · panel Legado con bio · efectos visuales clic · QTE (desactivado) · fuente RedOctober · Class Rising |
| 5 | ⏳ | Diseño visual final + adaptación móvil |
| 6 | ⏳ | El Gran Ciclo — Era del Sudor + Era del Dinero |

---

## PARA RETOMAR EN NUEVA CONVERSACIÓN

Pega este GDD y di:
> *"Soy el creador de Class Rising, continuamos donde lo dejamos."*
