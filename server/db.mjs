import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VALIDACION, EVIDENCIA, ACTIVOS, ESTRUCTURA, CANALES, BRECHAS, CAMPOS_CALIDAD,
} from './data.mjs';
import { TABLAS as CRUD_TABLAS } from './crud.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
// ATLAS_DB permite que las pruebas usen una base temporal y no toquen la real.
export const DB_PATH = process.env.ATLAS_DB || join(DATA_DIR, 'atlas-c6.db');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

export function initSchema({ seed = true } = {}) {
  db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
  if (seed) seedData();
}

/**
 * Arranque no destructivo: solo crea el esquema y siembra si la base está vacía.
 * `initSchema` sigue siendo el reset explícito de `npm run seed`.
 * Sin esto, reiniciar el servidor borraría todo lo creado por el CRUD.
 */
export function asegurarEsquema() {
  const existe = db
    .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='activos'")
    .get().n;
  if (existe) return { creada: false, sembrada: false };
  initSchema({ seed: true });
  return { creada: true, sembrada: true };
}

function seedData() {
  const ins = (sql, rows) => {
    const st = db.prepare(sql);
    db.exec('BEGIN');
    try {
      for (const r of rows) st.run(...r);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };

  ins(
    `INSERT INTO validacion (indicador, n, porcentaje, territorio, anio, tipo_evidencia, fuente, nota, categoria, orden)
     VALUES (?, ?, ?, 'Comuna 6', 2026, 'Exploratoria', 'INV-008', ?, ?, ?)`,
    VALIDACION.map(([ind, n, pct, cat, nota], i) => [ind, n, pct, nota, cat, i + 1]),
  );

  ins(
    `INSERT INTO evidencia (indicador, valor, unidad, territorio, anio, nivel, fuente, uso, ambito)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    EVIDENCIA,
  );

  ins(
    `INSERT INTO activos (orden, nombre, tipo_activo, ubicacion, anio, nivel_evidencia, identidad, ingresos, mercados, visibilidad, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ACTIVOS,
  );

  ins(
    `INSERT INTO estructura (indicador, valor, unidad, territorio, anio, fuente, observacion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ESTRUCTURA,
  );

  ins(`INSERT INTO canales (canal, tipo, cobertura, tipo_oferta, informacion, limitacion, fuente, estado) VALUES (?,?,?,?,?,?,?,?)`, CANALES);
  ins(`INSERT INTO brechas (variable, territorio, estado, implicacion, fuente, tipo) VALUES (?,?,?,?,?,?)`, BRECHAS);
  ins(`INSERT INTO campos_calidad (campo, mide, prioridad, origen, aplicacion) VALUES (?,?,?,?,?)`, CAMPOS_CALIDAD);
}

// Los statements se preparan de forma perezosa: initSchema() debe correr antes.
const cache = new Map();
export const prep = (sql) => {
  let st = cache.get(sql);
  if (!st) {
    st = db.prepare(sql);
    cache.set(sql, st);
  }
  return st;
};

export const api = {
  validacion: () => prep('SELECT * FROM validacion ORDER BY orden').all(),
  evidencia: () => prep('SELECT * FROM evidencia ORDER BY ambito, territorio, anio, id').all(),
  estructura: () => prep('SELECT * FROM estructura ORDER BY id').all(),
  canales: () => prep('SELECT * FROM canales ORDER BY id').all(),
  brechas: () => prep('SELECT * FROM brechas ORDER BY id').all(),
  campos: () => prep('SELECT * FROM campos_calidad ORDER BY id').all(),

  meta: () => prep(`SELECT
      (SELECT n FROM validacion WHERE categoria='Muestra' LIMIT 1) AS n,
      (SELECT COUNT(*) FROM activos) AS activos_catalogados,
      (SELECT valor FROM estructura WHERE indicador LIKE 'Activos culturales%' LIMIT 1) AS activos_reportados,
      (SELECT COUNT(*) FROM canales) AS fuentes,
      (SELECT COUNT(*) FROM brechas) AS brechas,
      (SELECT COUNT(*) FROM campos_calidad) AS campos_calidad`).get(),

  listActivos: (f = {}) => {
    const w = [];
    const p = [];
    if (f.tipo_activo) { w.push('tipo_activo = ?'); p.push(f.tipo_activo); }
    if (f.identidad) { w.push('identidad = ?'); p.push(f.identidad); }
    if (f.buscar) {
      w.push('(nombre LIKE ? OR descripcion LIKE ? OR ubicacion LIKE ?)');
      const s = `%${f.buscar}%`;
      p.push(s, s, s);
    }
    const sql = `SELECT * FROM activos ${w.length ? `WHERE ${w.join(' AND ')}` : ''} ORDER BY (orden IS NULL), orden, id`;
    return prep(sql).all(...p);
  },

  getActivo: (id) => prep('SELECT * FROM activos WHERE id = ?').get(id),

  createActivo: (a) => {
    const next = prep('SELECT COALESCE(MAX(orden),0)+1 AS n FROM activos').get().n;
    // `procedencia` va explícita: si se deja fuera, el default del esquema es
    // 'XLSX' y un activo escrito a mano quedaría presentado como si viniera del
    // archivo fuente. `crud.crear` ya lo hace así en las demás tablas.
    const r = prep(
      `INSERT INTO activos (orden, nombre, tipo_activo, ubicacion, anio, nivel_evidencia,
        identidad, ingresos, mercados, visibilidad, descripcion, origen, procedencia)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      a.orden ?? next, a.nombre, a.tipo_activo, a.ubicacion, a.anio ?? null,
      a.nivel_evidencia, a.identidad, a.ingresos, a.mercados, a.visibilidad,
      a.descripcion, a.origen ?? 'CRUD dashboard', 'Manual',
    );
    return api.getActivo(r.lastInsertRowid);
  },

  updateActivo: (id, a) => {
    const cur = api.getActivo(id);
    if (!cur) return null;
    const f = (k) => (a[k] === undefined ? cur[k] : a[k]);
    prep(
      `UPDATE activos SET orden=?, nombre=?, tipo_activo=?, ubicacion=?, anio=?, nivel_evidencia=?,
        identidad=?, ingresos=?, mercados=?, visibilidad=?, descripcion=?, origen=?, actualizado_en=strftime('%Y-%m-%d %H:%M:%f','now')
       WHERE id=?`,
    ).run(
      a.orden === undefined ? cur.orden : a.orden, f('nombre'), f('tipo_activo'),
      f('ubicacion'), a.anio === undefined ? cur.anio : a.anio, f('nivel_evidencia'),
      f('identidad'), f('ingresos'), f('mercados'), f('visibilidad'), f('descripcion'),
      f('origen'), id,
    );
    return api.getActivo(id);
  },

  deleteActivo: (id) => prep('DELETE FROM activos WHERE id = ?').run(id).changes > 0,

  distinctTipos: () => prep('SELECT DISTINCT tipo_activo AS v FROM activos ORDER BY v').all().map((r) => r.v),
};

/* ---------- CRUD genérico para las 7 tablas ----------
   Los nombres de tabla y columna provienen SIEMPRE del registro de server/crud.mjs,
   nunca del cuerpo de la petición. Los valores viajan como parámetros (?).
   Por eso un cliente no puede inyectar SQL ni escribir en una tabla no registrada. */

const columnasDe = (t) => Object.keys(CRUD_TABLAS[t].campos);

/** Columnas que gestiona el servidor y no aparecen en el formulario. */
const SISTEMA = ['procedencia'];

/** `solo` es el conjunto de columnas presentes en el cuerpo de un PUT. */
function escribir(t, datos, { id = null, solo = null } = {}) {
  const permitidas = [...columnasDe(t), ...SISTEMA.filter((c) => allColumnas(t).includes(c))];
  const todas = permitidas.filter((c) => datos[c] !== undefined);
  const usar = solo ? todas.filter((c) => solo.has(c)) : todas;
  if (!usar.length) return id;

  const vals = usar.map((c) => datos[c] ?? null);

  if (id === null) {
    const st = prep(`INSERT INTO ${t} (${usar.join(',')}) VALUES (${usar.map(() => '?').join(',')})`);
    return Number(st.run(...vals).lastInsertRowid);
  }

  const sets = usar.map((c) => `${c}=?`);
  const tienecreado = allColumnas(t).includes('creado_en');
  if (tienecreado) sets.push("actualizado_en=strftime('%Y-%m-%d %H:%M:%f','now')");
  prep(`UPDATE ${t} SET ${sets.join(',')} WHERE id=?`).run(...vals, id);
  return id;
}

function allColumnas(t) {
  return prep(`SELECT name FROM pragma_table_info(?)`).all(t).map((r) => r.name);
}

export const crud = {
  columnas: (t) => columnasDe(t),

  listar: (t, { buscar = '', columna = '' } = {}) => {
    const cols = columnasDe(t);
    const ordenables = ['orden', 'anio', 'id'];
    const ord = ordenables.filter((c) => allColumnas(t).includes(c));
    const order = ord.length ? `ORDER BY ${ord.map((c) => (c === 'id' ? 'id' : `(${c} IS NULL), ${c}`)).join(', ')}` : 'ORDER BY id';
    if (buscar && columna && cols.includes(columna)) {
      return prep(`SELECT * FROM ${t} WHERE ${columna} LIKE ? ${order}`).all(`%${buscar}%`);
    }
    return prep(`SELECT * FROM ${t} ${order}`).all();
  },

  obtener: (t, id) => prep(`SELECT * FROM ${t} WHERE id = ?`).get(id),

  crear: (t, datos) => {
    const next = allColumnas(t).includes('orden')
      ? prep(`SELECT COALESCE(MAX(orden),0)+1 AS n FROM ${t}`).get().n
      : null;
    const cuerpo = next !== null && datos.orden === undefined ? { ...datos, orden: next } : datos;
    // Todo lo creado por el dashboard queda marcado para distinguirlo del XLSX.
    const conProc = allColumnas(t).includes('procedencia') ? { ...cuerpo, procedencia: 'Manual' } : cuerpo;
    return crud.obtener(t, escribir(t, conProc));
  },

  actualizar: (t, id, datos, solo) => {
    if (!crud.obtener(t, id)) return null;
    escribir(t, datos, { id, solo });
    return crud.obtener(t, id);
  },

  borrar: (t, id) => prep(`DELETE FROM ${t} WHERE id = ?`).run(id).changes > 0,

  conteo: (t) => prep(`SELECT COUNT(*) AS n FROM ${t}`).get().n,
  manuales: (t) =>
    allColumnas(t).includes('procedencia')
      ? prep(`SELECT COUNT(*) AS n FROM ${t} WHERE procedencia='Manual'`).get().n
      : 0,
};
