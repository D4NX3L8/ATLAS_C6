import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { timingSafeEqual } from 'node:crypto';
import { asegurarEsquema, api, crud, DB_PATH } from './db.mjs';
import { TABLAS as REG, NOMBRES, validar } from './crud.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

/**
 * Clave del gestor de datos, leída de ATLAS_ADMIN_KEY.
 *
 * Si la variable NO está definida, el gestor queda abierto: es lo que permite
 * presentar el CRUD en el pitch sin montar nada. Si está definida, toda
 * escritura exige la clave. Las lecturas nunca se bloquean, porque el
 * dashboard se pinta con ellas y no tiene sentido ocultarlas.
 */
const ADMIN_KEY = process.env.ATLAS_ADMIN_KEY || '';

/** Comparación en tiempo constante; devuelve false si las longitudes difieren. */
function claveCorrecta(recibida) {
  if (!ADMIN_KEY || !recibida) return false;
  const a = Buffer.from(recibida);
  const b = Buffer.from(ADMIN_KEY);
  return a.length === b.length && timingSafeEqual(a, b);
}

const arranque = asegurarEsquema();
console.log(`[atlas-c6] SQLite listo -> ${DB_PATH}${arranque.sembrada ? ' (creada y sembrada)' : ' (conservada)'}`);

const app = express();
app.use(express.json());

/* ---------- Autenticación del gestor ----------
   Se declara antes de cualquier ruta y solo mira las escrituras. Montarla en
   `/api` y no en `/api/tablas` importa por dos motivos: hay dos superficies de
   escritura (`/api/activos` y `/api/tablas`) y dejarla en una sola dejaba el
   catálogo editable sin clave; y así la próxima ruta de escritura nace
   cubierta. Las lecturas nunca se bloquean, porque el dashboard se pinta con
   ellas.
*/
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  if (!ADMIN_KEY) return next();
  if (claveCorrecta(req.get('X-Admin-Key') || '')) return next();
  res.status(401).json({
    error: 'Falta la clave de administrador.',
    detalle: 'Define ATLAS_ADMIN_KEY en el servidor y envíala en la cabecera X-Admin-Key.',
  });
});

const NIVELES = ['Alto', 'Medio', 'Bajo', 'No medido', 'Pendiente de validación'];
const CAMPOS_ACTIVO = ['nombre', 'tipo_activo', 'ubicacion', 'nivel_evidencia', 'identidad', 'ingresos', 'mercados', 'visibilidad', 'descripcion'];

function validarActivo(a, { parcial = false } = {}) {
  const e = {};
  for (const c of CAMPOS_ACTIVO) {
    if (!parcial && (typeof a[c] !== 'string' || !a[c].trim())) e[c] = 'Campo obligatorio.';
  }
  for (const c of CAMPOS_ACTIVO) {
    if (a[c] !== undefined && typeof a[c] !== 'string') e[c] = 'Debe ser texto.';
  }
  for (const c of ['identidad', 'ingresos', 'mercados', 'visibilidad']) {
    if (a[c] !== undefined && !NIVELES.includes(a[c])) {
      e[c] = `Valor no válido. Opciones: ${NIVELES.join(', ')}.`;
    }
  }
  if (a.anio !== undefined && a.anio !== null && a.anio !== '') {
    const y = Number(a.anio);
    if (!Number.isInteger(y) || y < 1900 || y > 2100) e.anio = 'Año inválido.';
  }
  if (a.orden !== undefined && a.orden !== null && a.orden !== '' && !Number.isInteger(Number(a.orden))) {
    e.orden = 'El orden debe ser un número entero.';
  }
  return e;
}

const wrap = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (err) {
    console.error('[atlas-c6] error:', err);
    res.status(500).json({ error: 'Error interno del servidor.', detalle: err.message });
  }
};

app.get('/api/health', wrap((_req, res) => res.json({ ok: true, fuente: 'ATLAS_C6_Base_Datos_Dashboard.xlsx' })));
app.get('/api/meta', wrap((_req, res) => res.json({ ...api.meta(), crud_protegido: !!ADMIN_KEY })));
app.get('/api/validacion', wrap((_req, res) => res.json(api.validacion())));
app.get('/api/evidencia', wrap((_req, res) => res.json(api.evidencia())));
app.get('/api/estructura', wrap((_req, res) => res.json(api.estructura())));
app.get('/api/canales', wrap((_req, res) => res.json(api.canales())));
app.get('/api/brechas', wrap((_req, res) => res.json(api.brechas())));
app.get('/api/campos-calidad', wrap((_req, res) => res.json(api.campos())));

app.get('/api/activos', wrap((req, res) => res.json(api.listActivos({
  tipo_activo: req.query.tipo_activo || undefined,
  identidad: req.query.identidad || undefined,
  buscar: req.query.buscar || undefined,
}))));
app.get('/api/activos/tipos', wrap((_req, res) => res.json(api.distinctTipos())));
app.get('/api/activos/:id', wrap((req, res) => {
  const a = api.getActivo(Number(req.params.id));
  if (!a) return res.status(404).json({ error: 'Activo no encontrado.' });
  res.json(a);
}));

app.post('/api/activos', wrap((req, res) => {
  const e = validarActivo(req.body);
  if (Object.keys(e).length) return res.status(422).json({ error: 'Datos inválidos.', campos: e });
  res.status(201).json(api.createActivo(req.body));
}));

app.put('/api/activos/:id', wrap((req, res) => {
  const id = Number(req.params.id);
  if (!api.getActivo(id)) return res.status(404).json({ error: 'Activo no encontrado.' });
  const e = validarActivo(req.body, { parcial: true });
  if (Object.keys(e).length) return res.status(422).json({ error: 'Datos inválidos.', campos: e });
  res.json(api.updateActivo(id, req.body));
}));

app.delete('/api/activos/:id', wrap((req, res) => {
  if (!api.deleteActivo(Number(req.params.id))) return res.status(404).json({ error: 'Activo no encontrado.' });
  res.status(204).end();
}));

/* ---------- CRUD genérico por tipo de información ----------
   GET    /api/tablas                    → catálogo de las 7 tablas editables
   GET    /api/tablas/:t                 → filas (opcional ?buscar=&columna=)
   GET    /api/tablas/:t/:id             → una fila
   POST   /api/tablas/:t                 → crear   (queda marcada procedencia='Manual')
   PUT    /api/tablas/:t/:id             → editar
   DELETE /api/tablas/:t/:id             → eliminar
*/

const idValido = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

app.get('/api/tablas', wrap((_req, res) => {
  res.json(NOMBRES.map((t) => ({
    tabla: t,
    titulo: REG[t].titulo,
    em: REG[t].em,
    desc: REG[t].desc,
    principal: !!REG[t].principal,
    tituloCol: REG[t].tituloCol,
    subtituloCol: REG[t].subtituloCol,
    campos: Object.entries(REG[t].campos).map(([nombre, d]) => ({
      nombre, label: d.label, tipo: d.tipo, req: !!d.req,
      opciones: d.opciones ?? null, min: d.min ?? null, max: d.max ?? null, ayuda: d.ayuda ?? null,
    })),
    conteo: crud.conteo(t),
    manuales: crud.manuales(t),
  })));
}));

app.get('/api/tablas/:t', wrap((req, res) => {
  const { t } = req.params;
  if (!NOMBRES.includes(t)) return res.status(404).json({ error: 'Tipo de información no disponible.' });
  res.json(crud.listar(t, { buscar: req.query.buscar || '', columna: req.query.columna || '' }));
}));

app.get('/api/tablas/:t/:id', wrap((req, res) => {
  const { t } = req.params;
  if (!NOMBRES.includes(t)) return res.status(404).json({ error: 'Tipo de información no disponible.' });
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Registro no encontrado.' });
  const fila = crud.obtener(t, Number(req.params.id));
  if (!fila) return res.status(404).json({ error: 'Registro no encontrado.' });
  res.json(fila);
}));

app.post('/api/tablas/:t', wrap((req, res) => {
  const { t } = req.params;
  if (!NOMBRES.includes(t)) return res.status(404).json({ error: 'Tipo de información no disponible.' });
  const cuerpo = req.body ?? {};
  const { errores, datos } = validar(t, cuerpo);
  if (Object.keys(errores).length) return res.status(422).json({ error: 'Datos inválidos.', campos: errores });
  res.status(201).json(crud.crear(t, datos));
}));

app.put('/api/tablas/:t/:id', wrap((req, res) => {
  const { t } = req.params;
  if (!NOMBRES.includes(t)) return res.status(404).json({ error: 'Tipo de información no disponible.' });
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Registro no encontrado.' });
  const id = Number(req.params.id);
  const actual = crud.obtener(t, id);
  if (!actual) return res.status(404).json({ error: 'Registro no encontrado.' });

  const cuerpo = req.body ?? {};
  const solo = new Set(Object.keys(cuerpo).filter((k) => k in REG[t].campos));
  if (!solo.size) return res.status(422).json({ error: 'No se recibió ningún campo editable.' });

  // Se valida el estado final (existente + parche), no solo el parche.
  const fusionado = { ...actual };
  for (const k of solo) fusionado[k] = cuerpo[k];
  const { errores, datos } = validar(t, fusionado, { solo });
  if (Object.keys(errores).length) return res.status(422).json({ error: 'Datos inválidos.', campos: errores });

  res.json(crud.actualizar(t, id, datos, solo));
}));

app.delete('/api/tablas/:t/:id', wrap((req, res) => {
  const { t } = req.params;
  if (!NOMBRES.includes(t)) return res.status(404).json({ error: 'Tipo de información no disponible.' });
  if (!idValido(req.params.id)) return res.status(404).json({ error: 'Registro no encontrado.' });
  if (!crud.borrar(t, Number(req.params.id))) return res.status(404).json({ error: 'Registro no encontrado.' });
  res.status(204).end();
}));

const dist = join(__dirname, '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`[atlas-c6] API en http://localhost:${PORT}`));
