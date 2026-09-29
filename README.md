# ATLAS_C6 · Dashboard de analítica territorial

Comuna 6 — Doce de Octubre, Medellín · Convocatoria Territorio INN 2026

Dashboard de analítica de datos construido sobre `ATLAS_C6_Base_Datos_Dashboard.xlsx`.
Node.js + Vite + React + TypeScript + SQLite (`node:sqlite` nativo, sin compilación).

> Este proyecto es el **producto de datos y analítica** que sustenta la propuesta.
> **No es** el sistema ATLAS_C6, que se presenta mediante un prototipo independiente.

---

## Reglas del proyecto (heredadas del brief)

Estas reglas no son opcionales: son la defensa del proyecto ante el jurado.

| Regla | Cómo se aplica en el código |
|---|---|
| No crear datos ni completar valores faltantes | Todas las cifras provienen de `server/data.mjs`, transcrito del XLSX. No hay constantes de relleno en el frontend. |
| Una brecha ≠ 0 | `brechas.estado` usa "No disponible" / "No medido" / "Pendiente de validación". El test verifica que ninguna brecha diga `0`. |
| Diferenciar histórico de actual | `evidencia.ambito` = `Historico` \| `Contextual`. Todo histórico lleva año explícito; los 13 contextuales de Medellín/Colombia están en tabla aparte rotulada "No son demanda de la Comuna 6". |
| La advertencia n=28 no probabilística | En el encabezado de la Pestaña 1, en el KPI "Muestra de conveniencia, no probabilística" y en el nota legal del pie de página. No se repite en cada bloque para no saturar la lectura. |
| 4 tipos de dato distinguibles | Sistema de badges: `b-inv` (investigación), `b-his` (histórico), `b-ctx` (contextual), `b-gap` (brecha). |
| Georreferenciación pendiente, no ficticia | `P2MapaTerritorial.tsx` dibuja el **límite oficial** de la Comuna 6 y sus 12 barrios (dato público de Planeación de Medellín), pero **no dibuja marcadores** de activos: el catálogo no tiene coordenadas. El aviso "Georreferenciación pendiente" se mantiene. |
| No perder datos al reiniciar | `asegurarEsquema()` solo crea la base si no existe. Nunca ejecuta `DROP TABLE` al arrancar. `npm run seed` sí regenera, y es explícito. |
| Distinguir dato de origen de dato cargado | Toda tabla tiene `procedencia`: `XLSX` para lo transcrito del archivo, `Manual` para lo creado desde el gestor. |
| Todo dato trazable | Cada fila conserva su `fuente` (INV-002 … INV-008) y se muestra en la tabla. |

---

## Estructura

```
ATLAS_C6/
├── server/
│   ├── schema.sql     7 tablas (validacion, evidencia, activos, estructura, canales, brechas, campos_calidad)
│   ├── data.mjs       117 filas transcritas del XLSX — única fuente de datos
│   ├── crud.mjs       registro de los 7 tipos de información + validación genérica
│   ├── db.mjs         conexión node:sqlite + capa de acceso + CRUD genérico
│   ├── index.mjs      API Express
│   └── test.mjs       124 pruebas end-to-end (con ATLAS_DB temporal)
├── src/
│   ├── pages/         Tab1, Tab2, Tab3, Inicio y Prototipo (lazy-loaded)
│   ├── components/    KPIs, gráficos, tablas, mapa, acordeones, gestor CRUD
│   ├── prototipo/     los 11 componentes del lienzo del prototipo + datos de muestra
│   ├── data/          comuna6.geo.json (Comuna 6 + 12 barrios) y ciudad.geojson (16 comunas)
│   ├── hooks/         useApi (fetch + recarga), useTema (claro/oscuro)
│   ├── index.css      tokens de diseño derivados del logo, tema oscuro, responsive
│   └── types.ts
├── public/logo-atlas-c6.png
└── data/atlas-c6.db   (generada, en .gitignore)
```

---

## Scripts

```bash
npm install

npm run dev        # API :3001 + Vite :5173 (proxy /api incluido)
npm run build      # tsc -b + bundle de producción en dist/
npm start          # sirve dist/ + API en :3001 (un solo proceso)
npm test           # 141 pruebas end-to-end (base temporal, no toca la de producción)
npm run verify     # typecheck + lint + build + test
npm run typecheck  # tsc -b (proyecto con referencias)
npm run seed       # regenera la base desde el XLSX (destructivo, explícito)

npm run auditar    # auditoría visual automatizada: Chromium, 4 pantallas, 3 pestañas, tema oscuro
```

---

## API

### Lectura

| Endpoint | Devuelve |
|---|---|
| `GET /api/health` | Estado del servicio |
| `GET /api/meta` | n, activos catalogados vs reportados, fuentes, brechas, campos |
| `GET /api/validacion` | 27 indicadores de la encuesta n=28 |
| `GET /api/evidencia` | 24 indicadores: 11 históricos + 13 contextuales |
| `GET /api/estructura` | 7 indicadores de estructura económica |
| `GET /api/canales` | 14 fuentes con cobertura, limitación y estado |
| `GET /api/brechas` | 14 brechas con su implicación en el dashboard |
| `GET /api/campos-calidad` | 21 campos de trazabilidad |

### Protección del gestor (`ATLAS_ADMIN_KEY`)

Si la variable **no** está definida, el gestor queda abierto: es lo que permite
presentar el CRUD en el pitch sin montar nada. Si está definida, **toda
escritura** —las dos superficies, `/api/activos` y `/api/tablas`— exige la
clave en la cabecera `X-Admin-Key`. Las lecturas nunca se bloquean, porque el
dashboard se pinta con ellas.

```bash
ATLAS_ADMIN_KEY=una-clave npm start
```

`GET /api/meta` publica `crud_protegido` para que la UI sepa qué pedir.
La comparación es en tiempo constante. La clave vive en `sessionStorage` en el
navegador, así que se pierde al cerrar la pestaña.

### CRUD del catálogo de activos (`/api/activos`)

`GET` (con filtros `?tipo_activo=` `?identidad=` `?buscar=`) ·
`GET /:id` · `GET /tipos` ·
`POST` · `PUT /:id` (parcial) · `DELETE /:id`

Validación en servidor: 9 campos obligatorios, escala cerrada
`Alto | Medio | Bajo | No medido | Pendiente de validación`, año 1900–2100.
Errores `422` con el detalle por campo; `404` si no existe.

### CRUD genérico de los 7 tipos de información

Un solo par de rutas cubre todo el catálogo. La UI (`src/components/CrudHub.tsx`)
lo consume con un formulario generado a partir de la definición de campos.

| Endpoint | Devuelve |
|---|---|
| `GET /api/tablas` | Catálogo: los 7 tipos con sus campos, enums, rangos, `conteo` y `manuales` |
| `GET /api/tablas/:t` | Filas de `:t`; admite `?columna=` y `?buscar=` |
| `GET /api/tablas/:t/:id` | Una fila |
| `POST /api/tablas/:t` | Alta → `201`, marcada `procedencia = 'Manual'` |
| `PUT /api/tablas/:t/:id` | Edición parcial; no pisa lo que no se envía |
| `DELETE /api/tablas/:t/:id` | Baja → `204`; repetida → `404` |

` :t ` es una tabla registrada: `activos`, `validacion`, `evidencia`, `estructura`,
`canales`, `brechas`, `campos_calidad`. Cualquier otro nombre devuelve `404`.

Garantías de la capa genérica:

- **Whitelist de campos.** Solo se escriben columnas declaradas para esa tabla; el resto se ignora.
- **Valores parametrizados.** Un valor con `'); DROP TABLE …` se guarda como texto.
- **Rangos y enums.** `porcentaje` 0–100, `anio` 1900–2100, escalas cerradas por tipo.
- **Reglas del brief.** Una brecha nunca puede quedar en estado `0` (`422`), y un histórico
  sin año se rechaza señalando el campo `anio`.
- **`procedencia` es de solo lectura.** La fija el servidor; el formulario no la expone.
- **Errores `422` con detalle por campo**, que el modal pinta junto al input culpable.

---

## Paleta

Extraída de `public/logo-atlas-c6.png`:

| Token | Hex | Uso |
|---|---|---|
| `--navy-800` | `#00243c` | Headers, nav, texto de KPI |
| `--navy-900` | `#001830` | Footer |
| `--green-600` | `#009c6c` | Acento primario · datos de investigación |
| `--green-400` | `#10c080` | Indicador de pestaña activa |
| `--cyan-500` | `#00a8d8` | Acento secundario · datos contextuales |
| `--amber-600` | `#b45309` | Alertas · brechas y datos no medidos |

---

## Mapa territorial: geometría y teselas

El mapa de la Pestaña 2 **no usa el iframe de Google Maps**. Combina dos piezas:

1. **Geometría vectorial oficial** — los polígonos de la comuna y sus barrios, más el contexto
   de las 16 comunas de Medellín, descargados del servicio web de mapas de la Alcaldía de
   Medellín. Van en el bundle: el contorno se dibuja aunque no haya red.

**Dos niveles de vista.** El botón `Ciudad / Comuna 6` de la tarjeta cambia el encuadre sin
recargar la página:

- **Ciudad (por defecto)** — la Comuna 6 resaltada en verde y **subdividida en sus 12 barrios**
  con trazo discontinuo, sobre las comunas vecinas en tono neutro. Responde "¿dónde está la
  Comuna 6 y cómo se subdivide?", sin sacrificar el entorno.
- **Comuna 6** — el detalle: solo la comuna, con los barrios en verde cuando el campo
  «Ubicación» del catálogo los nombra.

**Por qué el encuadre se amplía.** Encajar las 16 comunas reduce la zona de estudio a una mancha
de pocos píxeles; encajar solo la Comuna 6 la llena entera y deja sin ciudad alrededor. La
función `expandir()` toma los límites de la 6 y los extiende ×2,4 desde su centro antes de
ajustar el visor, de modo que la comuna ocupe buena parte del ancho sin perder el contexto
urbano. La vista de detalle usa factor 1.

Ningún nivel dibuja marcadores de activos. El catálogo no tiene coordenadas ni direcciones
verificables (INV-007), y clavar un pin en el centroide de un barrio sería inventar la ubicación
de una sede. La correspondencia se resuelve por texto contra el nombre oficial del barrio y,
cuando no hay coincidencia exacta, el caso se reporta en vez de silenciarse.
2. **Teselas de CARTO** — `basemaps.cartocdn.com` en variante `voyager` (claro) y `dark_all`
   (oscuro), con la atribución de OpenStreetMap y CARTO. Dan el aspecto de mapa base moderno
   sin pedir clave de API ni cuenta de Google. Requieren conexión; sin ella el mapa sigue
   mostrando los límites, pero sin fondo.

`react-leaflet` carga en su propio chunk, así que el mapa no penaliza el primer render.
El centro inicial corrige el orden de coordenadas: `comuna6.geo.json` guarda `[lng, lat]`
(GeoJSON) y Leaflet espera `[lat, lng]`.

**Fuente de la geometría:**

- **Servicio:** `VC_Limite_Politico_Admtivo` (MapServer)
- **Capas:** `1` Comunas y Corregimientos · `0` Barrios y Veredas
- **Entidad:** capa 1, `codigo = '06'` → `identificacion` = **"Comuna 6"**, `nombre` = **"Doce de Octubre"**
- **CRS:** original en MAGNA-SIRGAS 9377, reproyectado a WGS84 (EPSG:4326) por el servicio
- **Actualización del límite:** 2014-12-17 · superficie 3,85 km² · perímetro 10,7 km

Los 12 barrios oficiales son: Santander, Doce de Octubre No.1, Doce de Octubre No.2, Pedregal,
La Esperanza, San Martín de Porres, Kennedy, Picacho, Picachito, Mirador del Doce,
Progreso No.2 y El Triunfo.

La geometría se simplificó con Ramer–Douglas–Peucker (ε = 5·10⁻⁵) y quedó en
`src/data/comuna6.geo.json` (15 KB, 3,3 KB con gzip) para no depender de red ni de clave de API.
La simplificación introduce una desviación máxima de **5,4 m** y un error de superficie de **0,34 %**,
validados en la suite de pruebas.

El contexto de ciudad (`src/data/ciudad.geo.json`, 22 KB) usa la **capa 1** del mismo servicio,
filtrada a las 16 comunas urbanas: se descartan los 5 corregimientos rurales y los 2 artefactos
`SN01`/`SN02`. Centro `[-75.5786, 6.244165]` y extent `[-75.63242, -75.52478] x [6.17572, 6.31261]`.
La suite comprueba que los anillos estén cerrados y dentro de Medellín, que el centro caiga en el
extent y que el archivo no supere los 30 KB.

**Por qué no el iframe:** el parámetro `pb` de Google Maps es una búsqueda, no una geometría
—no contiene el polígono—. Además ata la presentación a una clave de API. El aviso
"Georreferenciación pendiente" se conserva porque el catálogo de activos sigue sin coordenadas.

**Sobre el mensaje "API key required":** no existe en el código ni en `dist/`. Si aparece en el
navegador, pertenece a una versión anterior cacheada: reconstruir y recargar con `Ctrl+Shift+R`.
Esta implementación **no necesita ninguna clave de API**; la geometría es local y las teselas de
CARTO son de dominio público.

**Un dato que se corrigió:** *Mirador del Doce* **sí** es un barrio oficial de la Comuna 6.
En una versión temprana de este README se dudó de su existencia; el listado del servicio
municipal lo confirma. Los 12 barrios del punto anterior son los verificados, no una selección.

---

## Nota sobre los mockups de referencia

Los dos mockups de ChatGPT del material de entrada **no se usaron como fuente de datos**:
sus cifras contradicen al XLSX entre sí (p. ej. Facebook 42,9 % / 17,9 % frente al 35,7 % real)
y uno de ellos suma 110 % en su distribución por tipo. Se usaron solo como
referencia de layout y jerarquía visual. Todos los valores visibles provienen del archivo base.

---

## Vista «Prototipo» (pestaña 5)

La quinta pestaña aloja el **prototipo del sistema ATLAS C6**: la aplicación que la propuesta
plantea construir, no el dashboard de analítica. Son dos piezas distintas y el brief pide
presentarlas por separado, así que la vista se deja explícito desde el encabezado.

**No es un iframe ni un build pegado dentro.** Los componentes están portados a React en
`src/prototipo/` y se sirven desde el mismo bundle, con el mismo tema y la misma navegación:

| Del diseño original | Aquí |
|---|---|
| `App.tsx` | `Lienzo.tsx` (exporta `LIENZO_W = 1344`, `LIENZO_H = 896`) |
| `data.ts` | `muestras.ts` (tipos + datos ilustrativos) |
| `components/Sidebar` | `BarraLateral.tsx` |
| `components/Header` | `Cabecera.tsx` |
| `components/FilterPanel` | `PanelFiltros.tsx` |
| `components/ResultsList` | `ListaResultados.tsx` |
| `components/DetailPanel` | `PanelDetalle.tsx` |
| `components/MapPanel` | `PanelMapa.tsx` (lazy, Leaflet) |
| `components/ChatWidget` | `ChatInteligente.tsx` |
| `components/DashboardPanel` | `PanelDashboard.tsx` (Recharts) |
| `components/EventsPanel` | `PanelEventos.tsx` |
| `components/PromoCard` | `TarjetaPromo.tsx` |
| `components/icons` | `iconos.tsx` (compartido) |

**Los datos son de muestra y la vista lo dice.** No hay un solo dato del prototipo conectado a
`/api`. Los nombres, teléfonos, calificaciones, reseñas, distancias, eventos, el gráfico de
anillo y el mapa de calor son relleno inventado para poder navegar el diseño; el mapa de calor
sale de un hash de la posición de cada celda, no de la base de 28 respuestas. La advertencia de
la cabecera de la vista lo declara, y es lo único que separa la maqueta de los datos reales: las
pestañas 1, 2 y 3 sí son trazables hasta `ATLAS_C6_Base_Datos_Dashboard.xlsx`.

**Cómo se encaja en el responsive.** El lienzo se diseñó sobre 1344×896 px con anchos de panel
fijos, así que `src/pages/Prototipo.tsx` lo monta a tamaño real dentro de un marco y lo reduce
con un `transform: scale()` medido con `ResizeObserver`, sin pasar de 100 %. Por debajo del 50 %
la vista avisa que se está viendo en pequeño y a qué tamaño real corresponde.

**Dos detalles que se conservan a propósito, porque son del diseño:**

- El contador de la lista dice `(156)` siempre que haya al menos un resultado, aunque se haya
  filtrado a uno. Viene del Figma (`ResultsList.tsx:32` del original) y es parte de la maqueta.
- El conmutador «Listado / Mapa» no oculta nada: los dos paneles se dibujan siempre. El original
  tampoco lo usaba (`App.tsx:107`).

### Ver cada ventanita en un marco de celular

Para presentar, el prototipo se puede abrir **panel por panel dentro de un marco de teléfono**, a
pantalla completa, con `Esc` o el botón *Cerrar* para volver, el desplazamiento del fondo bloqueado
y el foco devuelto al abrir y cerrar.

- **Dónde están los botones.** En la barra lateral del propio prototipo, bajo el rótulo
  «Ver en celular», hay uno por cada ventanita (`src/prototipo/paneles.ts`): barra lateral,
  encabezado, filtros, mapa, resultados, ficha, chat, analítica, eventos y promo. El catálogo de
  botones vive en ese archivo y los paneles se marcan con `data-panel` en `Lienzo.tsx`.
- **Cómo funciona.** No es una copia ni una captura: es **el mismo lienzo con la cámara
  desplazada**. Se monta un segundo `<Lienzo/>` dentro del teléfono y se recorta la pantalla a la
  región del panel elegido, con la escala justa para que quepa (`medirRegion()` saca el rectángulo
  en coordenadas de diseño y `VentanaTelefono` aplica `translate` + `scale` con
  `transform-origin: top left`). Como es el mismo código, **el mapa, el buscador, la lista y el
  chat siguen siendo los de verdad y se pueden usar dentro del teléfono**.
- **Por qué panel por panel y no el lienzo entero.** El diseño es horizontal (1344×896 = 1.5:1) y el
  celular vertical (390×844 = 0.46:1). Encajado por el ancho, el lienzo entero baja al **24 %** y el
  texto de 8 px queda en 2–4 px: se ve la estructura, no se lee. **Una ventanita sí se lee**, porque
  los paneles miden 176–330 px de ancho y el celular tiene 390. Escalas medidas:

  | Ventanita | Diseño | Portátil 1440×900 | Proyector 1920×1080 |
  |---|---|---|---|
  | Filtros | 192×444 | 155 % | 180 % |
  | Analítica | 243×246 | 134 % | 165 % |
  | Eventos | 267×246 | 122 % | 150 % |
  | Resultados | 298×444 | 109 % | 135 % |
  | Chat | 316×246 | 103 % | 127 % |
  | Promo | 312×246 | 104 % | 129 % |
  | Ficha | 318×444 | 102 % | 126 % |
  | Mapa | 330×444 | 99 % | 122 % |
  | Barra lateral | 176×896 | 77 % | 95 % |
  | **Encabezado** | **1168×188** | **28 %** | **34 %** |

  El **encabezado es la excepción**: es una franja de 1168 px de ancho, así que en un teléfono
  queda pequeño por mucho que se amplíe. Se incluye por completitud, pero para presentarlo conviene
  tocar el buscador directamente en el lienzo de la vista, no el botón del encabezado.
- **El botón «Ver todo en celular»** de la barra del marco abre el lienzo entero en el mismo marco.
  Sirve para dar una vista de conjunto de un vistazo, no para leer.

**Un defecto del original que sí se corrigió.** Las pastillas de categoría van en plural
(«Emprendimientos», «Eventos») y las categorías de los datos en singular («Emprendimiento»,
«Evento»), y el filtro comparaba con `includes` a secas: esas dos pastillas no llegaban a filtrar
nada. Ahora se comparan sobre la misma raíz, quitando la «s» final, sin tocar un solo dato de
muestra. Comprobado en el navegador: Cultura → 2, Servicios → 1, Emprendimientos → 1, Eventos → 1.
Las tres pastillas que siguen vacías (Negocios, Organizaciones, Activos territoriales) es porque
ninguno de los 5 datos de muestra cae en esas categorías, no porque el filtro falle: haría falta
inventar más datos ficticios.

**Contraste.** El prototipo es una pieza con su propia paleta (texto de 8 px en gris claro,
blanco sobre el verde de marca, chips de color saturado) y llega con ratios por debajo de 4.5:1.
No se reescriben esos colores: son la identidad que la vista presenta, y `data-artefacto="prototipo"`
marca el lienzo para que la auditoría no los mida contra la regla del dashboard. La exclusión
**no es silenciosa**: `npm run auditar` informa cuántos nodos quedaron fuera y los deja en
`auditorias/resumen.json` bajo `contrasteOmitidoEnArtefactos`.

---

## Comprobaciones

```bash
npm run verify     # typecheck + lint + build + test
npm run auditar    # auditoría visual en Chromium
```

`npm run verify` ejecuta `typecheck` → `lint` → `build` → `test`. La suite cubre:

- Los 117 registros y su conteo por tabla.
- Que una brecha no pueda quedar en 0 y que un histórico exija año.
- Que la geometría oficial sea coherente con los datos calculados (área, perímetro, centroides).
- El CRUD genérico de los 7 tipos: alta, edición parcial, borrado, búsqueda, enums, rangos,
  campos desconocidos y un intento de inyección SQL.
- El encuadre del mapa, incluida la calibración del factor de ampliación.
- La autenticación: sin `ATLAS_ADMIN_KEY` el gestor queda abierto; con ella, tanto `/api/activos`
  como `/api/tablas` exigen `X-Admin-Key` en las escrituras y las lecturas siguen abiertas.
- **Aislamiento:** la suite corre contra una base temporal (`ATLAS_DB` en `/tmp`) y comprueba
  al terminar que la base real conserva sus 117 filas y no recibió ningún registro de prueba.
  Antes de esto, el arranque del servidor recreaba la base y se perdían las altas manuales.

`npm run auditar` levanta la API y el preview sobre una base temporal y recorre las 3 pestañas
en 4 pantallas (escritorio, portátil, tableta, móvil) más el tema oscuro. No juzga el gusto:
mide errores de consola, desbordamiento horizontal, imágenes que no cargaron, el contraste
real de cada texto contra su fondo compuesto y la fracción de la Comuna 6 dentro del mapa.
Deja capturas y un `resumen.json` en `auditorias/`.

Medir importó: el encuadre del mapa estaba calibrado al revés. `expandir` multiplica los
límites, así que un factor mayor aleja el mapa — con `2.4` la comuna ocupaba el 32 % de la
altura del visor y con `5.4` el 16 %. Está en `1.15`, que la deja en el 65 % conservando
ciudad alrededor. Del mismo modo, `--ink-mute` daba 2.8–3.0:1 y el verde de marca con texto
blanco daba 3.08:1; ambos se ajustaron hasta pasar 4.5:1.

Una nota sobre la auditoría: la primera versión reportaba casi todo como fallo porque
componía las capas mal — devolvía el rgb de un fondo transparente en vez de componer las capas
translúcidas, y componía los degradados sobre blanco en vez de sobre el color del tema. Los
contrastes se miden contra el peor fondo posible, y el informe incluye los dos colores
calculados para que un ratio sospechoso se pueda distinguir de un fallo real.

La revisión de responsive ya no es estática: `npm run auditar` la mide en Chromium sobre las
cuatro pantallas. Lo que **sigue sin poder juzgarse desde el código** es el gusto: la auditoría
no compara el resultado con los bocetos de referencia, solo lo que se puede medir.
