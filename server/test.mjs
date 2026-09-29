// Suite de pruebas end-to-end: levanta la API, valida endpoints y CRUD, y termina.
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

// Utilidades geodésicas para validar la geometría del mapa (elipses, no áreas esféricas exactas).
const R_TIERRA = 6371000;
const RAD = Math.PI / 180;
const area = (anillo) => {
  let s = 0;
  for (let i = 0; i < anillo.length; i++) {
    const j = (i + 1) % anillo.length;
    s += anillo[i][0] * anillo[j][1] - anillo[j][0] * anillo[i][1];
  }
  const lat = (anillo[0][1] * RAD);
  return Math.abs(s / 2) * RAD * R_TIERRA * (RAD * R_TIERRA) * Math.cos(lat);
};
const sumaArea = (bs) => bs.reduce((s, b) => s + area(b.anillos[0]), 0);
const dentroDe = (p, anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const a = anillo[i], b = anillo[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) dentro = !dentro;
  }
  return dentro;
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3999;
const B = `http://localhost:${PORT}`;

let pass = 0;
let fail = 0;
const fallos = [];

function chk(desc, exp, got) {
  if (String(exp) === String(got)) {
    console.log(`  \x1b[32mPASS\x1b[0m  ${desc}`);
    pass++;
  } else {
    console.log(`  \x1b[31mFAIL\x1b[0m  ${desc}  → esperado ${exp}, obtenido ${got}`);
    fail++;
    fallos.push(desc);
  }
}

const code = (p, opt = {}) => fetch(B + p, opt).then((r) => r.status);
const json = (p, opt = {}) => fetch(B + p, opt).then((r) => r.json());

async function esperar(ms = 200) {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${B}/api/health`);
      if (r.ok) return;
    } catch { /* aún no levanta */ }
    await new Promise((r) => setTimeout(r, ms));
  }
  throw new Error('El servidor no respondió a tiempo.');
}

// La suite trabaja sobre una base temporal: nunca toca data/atlas-c6.db.
const DB_TEMP = join(tmpdir(), `atlas-c6-test-${process.pid}.db`);
for (const sufijo of ['', '-wal', '-shm']) rmSync(DB_TEMP + sufijo, { force: true });

const TABLAS_SQL = ['validacion', 'evidencia', 'activos', 'estructura', 'canales', 'brechas', 'campos_calidad'];

/** Consulta la base de producción en un proceso hijo, sin ATLAS_DB, y devuelve un número. */
function consultarProduccion(expresion) {
  const r = spawnSync(
    process.execPath,
    ['-e', `import { db } from './server/db.mjs';
            const T = ${JSON.stringify(TABLAS_SQL)};
            process.stdout.write(String(${expresion}));`],
    { cwd: root, encoding: 'utf8', env: { ...process.env, ATLAS_DB: '' } },
  );
  const n = Number((r.stdout ?? '').trim());
  return Number.isFinite(n) ? n : -1;
}

const sumarFilas = (extra = '') =>
  consultarProduccion(`T.reduce((s,t)=>s+db.prepare('SELECT COUNT(*) c FROM '+t+' ${extra}').get().c,0)`);

const PRODUCTO_ANTES = sumarFilas();

const srv = spawn(process.execPath, [join(root, 'server', 'index.mjs')], {
  env: { ...process.env, PORT: String(PORT), ATLAS_DB: DB_TEMP },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
srv.stdout.on('data', (d) => { log += d; });
srv.stderr.on('data', (d) => { log += d; });

const fin = (codigo) => {
  srv.kill('SIGTERM');
  for (const sufijo of ['', '-wal', '-shm']) rmSync(DB_TEMP + sufijo, { force: true });
  setTimeout(() => process.exit(codigo), 150);
};

try {
  await esperar();

  console.log('\n\x1b[1m1. SERVICIO Y METADATOS\x1b[0m');
  chk('GET /api/health → 200', 200, await code('/api/health'));
  const meta = await json('/api/meta');
  chk('meta.n = 28', 28, meta.n);
  chk('meta.activos_catalogados = 10', 10, meta.activos_catalogados);
  chk('meta.activos_reportados = 50', 50, meta.activos_reportados);
  chk('meta.fuentes = 14', 14, meta.fuentes);
  chk('meta.brechas = 14', 14, meta.brechas);
  chk('meta.campos_calidad = 21', 21, meta.campos_calidad);

  console.log('\n\x1b[1m2. DATOS REALES DEL XLSX\x1b[0m');
  const v = await json('/api/validacion');
  chk('validacion → 27 filas', 27, v.length);
  chk('validacion[0] = Muestra n=28', 28, v[0].n);
  chk('categoría Utilidad = 92,9%', 92.9, v.find((x) => x.indicador.includes('sistema integrado'))?.porcentaje);
  chk('categoría Búsqueda natural = 71,4%', 71.4, v.find((x) => x.indicador.includes('escribiendo'))?.porcentaje);
  chk('Facebook = 35,7% (n=10)', 10, v.find((x) => x.indicador === 'Facebook')?.n);
  chk('todas las filas tienen fuente', true, v.every((x) => !!x.fuente));
  chk('todas las filas son Comuna 6 / 2026', true, v.every((x) => x.territorio === 'Comuna 6' && x.anio === 2026));

  const ev = await json('/api/evidencia');
  chk('evidencia → 24 filas', 24, ev.length);
  chk('evidencia: 11 históricas + 13 contextuales', '11/13', `${ev.filter((x) => x.ambito === 'Historico').length}/${ev.filter((x) => x.ambito === 'Contextual').length}`);
  chk('evidencia: históricos con año explícito', true, ev.filter((x) => x.ambito === 'Historico').every((x) => x.anio !== null));
  chk('evidencia: ningún 0 en lugar de dato faltante', true, ev.every((x) => x.valor !== 0));

  chk('estructura → 7 filas', 7, (await json('/api/estructura')).length);
  chk('canales → 14 filas', 14, (await json('/api/canales')).length);
  chk('brechas → 14 filas', 14, (await json('/api/brechas')).length);
  chk('campos → 21 filas', 21, (await json('/api/campos-calidad')).length);

  const brechas = await json('/api/brechas');
  chk('ninguna brecha dice "0"', true, brechas.every((b) => !/^\s*0\s*$/.test(b.estado)));
  chk('todas las brechas tienen implicación', true, brechas.every((b) => b.implicacion.length > 10));

  console.log('\n\x1b[1m3. CRUD · CREAR\x1b[0m');
  const cuerpo = {
    nombre: 'Activo de prueba E2E', tipo_activo: 'Evento cultural', ubicacion: 'Picacho / Comuna 6',
    anio: 2026, nivel_evidencia: 'Medio', identidad: 'No medido', ingresos: 'No medido',
    mercados: 'No medido', visibilidad: 'Pendiente de validación',
    descripcion: 'Registro creado por la suite de pruebas.', origen: 'CRUD dashboard',
  };
  const creado = await json('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo),
  });
  chk('POST crea y devuelve id', true, Number.isInteger(creado.id));
  chk('POST persiste el nombre', cuerpo.nombre, creado.nombre);
  chk('un activo creado a mano queda procedencia Manual, no XLSX', 'Manual', creado.procedencia);

  // El cliente no puede declararse parte del archivo fuente: la procedencia la
  // fija el servidor. Este alta extra se borra enseguida para no alterar los
  // conteos que siguen.
  const falso = await json('/api/activos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, nombre: 'Intento de falsear la procedencia', procedencia: 'XLSX' }),
  });
  chk('el cliente no puede declararse XLSX', 'Manual', falso.procedencia);
  await code(`/api/activos/${falso.id}`, { method: 'DELETE' });

  chk('total pasa a 11', 11, (await json('/api/activos')).length);
  chk('GET /api/activos/:id lo recupera', cuerpo.nombre, (await json(`/api/activos/${creado.id}`)).nombre);

  console.log('\n\x1b[1m4. CRUD · LEER / FILTRAR\x1b[0m');
  chk('filtro tipo_activo=Programa / formación musical → 1', 1, (await json(`/api/activos?tipo_activo=${encodeURIComponent('Programa / formación musical')}`)).length);
  chk('filtro tipo_activo=Evento cultural → 2 (sembrado + prueba)', 2, (await json(`/api/activos?tipo_activo=${encodeURIComponent('Evento cultural')}`)).length);
  chk('filtro identidad=Alto', 7, (await json('/api/activos?identidad=Alto')).length);
  chk('búsqueda "Picacho"', true, (await json('/api/activos?buscar=Picacho')).length >= 2);
  chk('búsqueda sin resultados → 0, no error', 0, (await json('/api/activos?buscar=zzzinexistente')).length);

  console.log('\n\x1b[1m5. CRUD · ACTUALIZAR\x1b[0m');
  const act = await json(`/api/activos/${creado.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identidad: 'Alto', descripcion: 'Actualizado por prueba.' }),
  });
  chk('PUT parcial no borra otros campos', cuerpo.nombre, act.nombre);
  chk('PUT cambia identidad', 'Alto', act.identidad);
  chk('PUT actualiza actualizado_en (resolución ms)', true, act.actualizado_en > creado.actualizado_en);

  console.log('\n\x1b[1m6. CRUD · ELIMINAR\x1b[0m');
  chk('DELETE → 204', 204, await code(`/api/activos/${creado.id}`, { method: 'DELETE' }));
  chk('vuelve a 10 registros', 10, (await json('/api/activos')).length);
  chk('GET del eliminado → 404', 404, await code(`/api/activos/${creado.id}`));

  console.log('\n\x1b[1m7. VALIDACIÓN DE ENTRADA\x1b[0m');
  chk('POST vacío → 422', 422, await code('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }));
  const bad = await json('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, identidad: 'Altísimo' }),
  });
  chk('identidad inválida → 422', 422, await code('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, identidad: 'Altísimo' }),
  }));
  chk('error señala el campo culpable', 'identidad', Object.keys(bad.campos)[0]);
  chk('año inválido → 422', 422, await code('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, anio: 12345 }),
  }));
  chk('PUT inexistente → 404', 404, await code('/api/activos/99999', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
  }));
  chk('DELETE inexistente → 404', 404, await code('/api/activos/99999', { method: 'DELETE' }));
  chk('base intacta tras pruebas inválidas', 10, (await json('/api/activos')).length);

  console.log('\n\x1b[1m8. ENTREGABLES ESTÁTICOS\x1b[0m');
  chk('GET / → 200', 200, await code('/'));
  chk('ruta SPA profunda → 200', 200, await code('/cualquier/ruta/arbitraria'));
  chk('logo.png → 200', 200, await code('/logo-atlas-c6.png'));

  console.log('\n\x1b[1m9. GEOMETRÍA DEL MAPA TERRITORIAL\x1b[0m');
  const geo = JSON.parse(readFileSync(join(root, 'src/data/comuna6.geo.json'), 'utf8'));
  chk('identificación oficial = Comuna 6', 'Comuna 6', geo.comuna.identificacion);
  chk('nombre oficial = Doce de Octubre', 'Doce de Octubre', geo.comuna.nombre);
  chk('12 barrios oficiales', 12, geo.barrios.length);
  chk('cada barrio tiene polígono y centroide', true,
    geo.barrios.every((b) => b.anillos[0]?.length > 2 && b.centroide?.length === 2));
  chk('coordenadas en rango (Comuna 6)', true,
    geo.barrios.every((b) => b.centroide[0] > -75.6 && b.centroide[0] < -75.56 && b.centroide[1] > 6.28 && b.centroide[1] < 6.32));
  chk('centroides dentro de la comuna', true, geo.barrios.every((b) => dentroDe(b.centroide, geo.comuna.anillos[0])));
  chk('superficie oficial ≈ 3,85 km²', true, Math.abs(geo.comuna.area_m2 - 3_849_812) < 5_000);
  chk('perímetro oficial ≈ 10,7 km', true, Math.abs(geo.comuna.perimetro_m - 10_710) < 200);
  chk('suma de barrios ≈ superficie de la comuna', true, Math.abs(sumaArea(geo.barrios) - area(geo.comuna.anillos[0])) < 40_000);
  chk('payload del mapa < 25 KB', true, statSync(join(root, 'src/data/comuna6.geo.json')).size < 25_000);
  chk('sin nombres de barrio duplicados', true, new Set(geo.barrios.map((b) => b.nombre)).size === 12);

  console.log(`\n${'─'.repeat(56)}`);
  console.log('\n\x1b[1m10. CRUD POR TIPO DE INFORMACIÓN\x1b[0m');
  const send = (m, p, b) => fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined });
  const cat = await (await send('GET', '/api/tablas')).json();
  chk('catálogo con los 7 tipos', 7, cat.length);
  chk('cada tipo declara sus campos', true, cat.every((t) => t.campos.length > 0));
  chk('cada tipo trae conteo y manuales', true, cat.every((t) => typeof t.conteo === 'number' && typeof t.manuales === 'number'));
  chk('la base tiene los 7 tipos', true, cat.every((t) => t.conteo > 0));

  const brecha = await send('POST', '/api/tablas/brechas', {
    variable: 'Prueba de suite', territorio: 'Comuna 6', estado: 'No disponible',
    implicacion: 'Verificación automatizada', fuente: 'Suite', tipo: 'Brecha',
  });
  chk('POST crea → 201', 201, brecha.status);
  const nuevo = await brecha.json();
  chk('lo creado queda marcado Manual', 'Manual', nuevo.procedencia);
  chk('lo del XLSX queda marcado XLSX', 'XLSX', (await json('/api/tablas/brechas'))[0].procedencia);

  const put = await send('PUT', `/api/tablas/brechas/${nuevo.id}`, { implicacion: 'Editado' });
  const editado = await put.json();
  chk('PUT edita → 200', 200, put.status);
  chk('campo editado aplicado', 'Editado', editado.implicacion);
  chk('campo no tocado intacto', 'Prueba de suite', editado.variable);
  chk('procedencia sobrevive al PUT', 'Manual', editado.procedencia);

  chk('brecha con estado 0 → 422', 422, (await send('PUT', `/api/tablas/brechas/${nuevo.id}`, { estado: '0' })).status);
  const hist = await send('POST', '/api/tablas/evidencia', {
    indicador: 'H', valor: 1, unidad: '%', territorio: 'Comuna 6',
    nivel: 'Alto', fuente: 'x', uso: 'x', ambito: 'Historico',
  });
  chk('Histórico sin año → 422', 422, hist.status);
  chk('el error señala el campo anio', 'anio', Object.keys((await hist.json()).campos ?? {})[0]);
  chk('Histórico con año → 201', 201, (await send('POST', '/api/tablas/evidencia', {
    indicador: 'H', valor: 1, unidad: '%', territorio: 'Comuna 6', anio: 2020,
    nivel: 'Alto', fuente: 'x', uso: 'x', ambito: 'Historico',
  })).status);
  chk('valor fuera de rango → 422', 422, (await send('POST', '/api/tablas/validacion', {
    indicador: 'X', n: 5, porcentaje: 150, territorio: 'Comuna 6',
    tipo_evidencia: 'Exploratoria', fuente: 'x', nota: 'x', categoria: 'Muestra',
  })).status);
  chk('enum inválido → 422', 422, (await send('POST', '/api/tablas/brechas', {
    variable: 'X', territorio: 'Comuna 6', estado: 'Inventado',
    implicacion: 'x', fuente: 'x', tipo: 'Brecha',
  })).status);
  chk('obligatorio vacío → 422', 422, (await send('POST', '/api/tablas/brechas', {
    variable: '', territorio: 'Comuna 6', estado: 'No disponible',
    implicacion: 'x', fuente: 'x', tipo: 'Brecha',
  })).status);

  chk('tabla no registrada → 404', 404, (await send('POST', '/api/tablas/usuarios', { a: 1 })).status);
  chk('nombre de tabla con SQL → 404', 404, await code('/api/tablas/activos%3B%20DROP%20TABLE%20activos'));
  chk('inyección en valor se guarda como texto', 201, (await send('POST', '/api/tablas/canales', {
    canal: "x'); DROP TABLE canales;--", tipo: 'Buscador', cobertura: 'Parcial',
    tipo_oferta: 'Múltiple', informacion: 'x', limitacion: 'x', fuente: 'x', estado: 'x',
  })).status);
  chk('la tabla sigue en pie tras la inyección', 200, await code('/api/tablas/canales'));
  chk('campo desconocido se ignora', 201, (await send('POST', '/api/tablas/brechas', {
    variable: 'Y', territorio: 'Comuna 6', estado: 'No medida',
    implicacion: 'x', fuente: 'x', tipo: 'Brecha', hack: "'; DROP TABLE brechas;--",
  })).status);
  chk('brechas sigue en pie', 200, await code('/api/tablas/brechas'));

  chk('DELETE → 204', 204, (await send('DELETE', `/api/tablas/brechas/${nuevo.id}`)).status);
  chk('DELETE repetido → 404', 404, (await send('DELETE', `/api/tablas/brechas/${nuevo.id}`)).status);
  chk('GET inexistente → 404', 404, await code('/api/tablas/brechas/999999'));
  chk('búsqueda por columna', 1, (await json('/api/tablas/canales?columna=canal&buscar=' + encodeURIComponent("x'); DROP"))).length);
  chk('el conteo refleja el alta', 15, (await (await send('GET', '/api/tablas')).json()).find((t) => t.tabla === 'canales').conteo);

  console.log('\n\x1b[1m12. MAPA DE CIUDAD, TEMA Y PRESENTACIÓN\x1b[0m');
  const ciudad = JSON.parse(readFileSync(join(root, 'src/data/ciudad.geo.json'), 'utf8'));
  chk('la ciudad trae 16 comunas', 16, ciudad.unidades.length);
  chk('ningún código de residuo tipo SN', true, ciudad.unidades.every((u) => !String(u.codigo).startsWith('SN')));
  const c6ciudad = ciudad.unidades.find((u) => u.codigo === '06');
  chk('la Comuna 6 está en el contexto de ciudad', 'Doce de Octubre', c6ciudad?.nombre);
  chk('todas las unidades tienen nombre', true, ciudad.unidades.every((u) => typeof u.nombre === 'string' && u.nombre.length > 0));
  chk('todas tienen al menos un anillo', true, ciudad.unidades.every((u) => u.anillos.length > 0));
  chk('los anillos están cerrados', true,
    ciudad.unidades.every((u) => u.anillos.every((a) => a[0][0] === a[a.length - 1][0] && a[0][1] === a[a.length - 1][1])));
  chk('coordenadas dentro de Medellín', true, ciudad.unidades.every((u) =>
    u.anillos.every((a) => a.every(([x, y]) => x > -75.75 && x < -75.45 && y > 6.1 && y < 6.4))));
  chk('el centro cae dentro del extent', true,
    ciudad.centro[0] >= ciudad.extent.minx && ciudad.centro[0] <= ciudad.extent.maxx &&
    ciudad.centro[1] >= ciudad.extent.miny && ciudad.centro[1] <= ciudad.extent.maxy);
  chk('el contexto de ciudad es liviano', true, statSync(join(root, 'src/data/ciudad.geo.json')).size < 30_000);

  // El hook escribe data-theme y el CSS debe escuchar el MISMO valor. Si se
  // desincronizan (el hook escribe "oscuro" y el CSS espera "dark"), el tema
  // oscuro deja de aplicarse y solo cambia lo que se maneje con JS.
  const hook = readFileSync(join(root, 'src/hooks/useTema.ts'), 'utf8');
  const css = readFileSync(join(root, 'src/index.css'), 'utf8');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
  const escrito = (hook.match(/dataset\.theme\s*=\s*\w+\s*===\s*'oscuro'\s*\?\s*'(\w+)'/) || [])[1];
  chk('el hook declara el valor de tema que escribe', true, Boolean(escrito));
  chk('el CSS escucha el mismo valor que escribe el hook', true, Boolean(escrito) && css.includes(`[data-theme="${escrito}"]`));
  chk('index.html fija el tema antes de montar React', true, html.includes('dataset.theme'));
  chk('index.html usa la misma clave que el hook', true, html.includes("'atlas-c6-tema'"));

  // Ningún var(--token) puede quedar sin definir: caería a un valor inválido.
  const definidos = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gmi)].map((m) => m[1]));
  const usados = new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]));
  const rotos = [...usados].filter((v) => !definidos.has(v));
  chk('ningún token de CSS sin definir', 'ninguno', rotos.length ? rotos.join(', ') : 'ninguno');

  // Los gráficos no deben duplicar el margen del eje: ese hueco extra dejaba las
  // barras aplastadas contra el borde derecho de la tarjeta.
  const dobleMargen = /margin=\{\{\s*left:\s*(1[0-9]{2}|[2-9][0-9]{2})/;
  chk('P1Charts no duplica el margen del eje', true, !dobleMargen.test(readFileSync(join(root, 'src/components/P1Charts.tsx'), 'utf8')));
  chk('P2Distribuciones no duplica el margen del eje', true, !dobleMargen.test(readFileSync(join(root, 'src/components/P2Distribuciones.tsx'), 'utf8')));

  // El mapa debe invertir las coordenadas: GeoJSON es [lng, lat], los motores [lat, lng].
  // La conversión vive en el módulo compartido para que los dos motores no puedan discrepar.
  const datosMapa = readFileSync(join(root, 'src/mapa/datos.ts'), 'utf8');
  chk('el mapa invierte lng/lat al construir el centro', true,
    /centro\[1\].*centro\[0\]/.test(datosMapa.replace(/\s+/g, ' ')));
  chk('ambos motores toman la geometría del módulo compartido', true,
    ['MapaGoogle', 'MapaLeaflet'].every((f) => {
      const src = readFileSync(join(root, 'src/components', `${f}.tsx`), 'utf8');
      return src.includes("from '../mapa/datos'") && !/comuna6\.geo\.json/.test(src);
    }));

  chk('el autor se cita en el pie', true, app.includes('Sebastian Jaramillo Taborda'));
  chk('ya no queda el nombre retirado en ninguna parte', true, !/Daniel Ochoa/i.test(app));
  chk('créditos de derechos reservados', true, app.includes('Reservados todos los'));
  const redes = readFileSync(join(root, 'src/components/Redes.tsx'), 'utf8');
  chk('los tres iconos sociales presentes', true,
    redes.includes('Instagram') && redes.includes('Facebook') && redes.includes('WhatsApp'));
  chk('los tres perfiles tienen enlace real', true,
    ['https://www.instagram.com/jaramillo.s/',
      'https://www.facebook.com/yeeeeeees',
      'https://wa.me/573016335019'].every((u) => app.includes(u)));
  chk('ningún perfil quedó con href vacío', true, !/href: ''/.test(app));

  console.log('\n\x1b[1m13. ENCUADRE DEL MAPA: ZONA DE ESTUDIO CON ENTORNO\x1b[0m');
  // El render del mapa se movió a su propio componente al añadir el motor Google.
  const mapa2 = readFileSync(join(root, 'src/components/P2MapaTerritorial.tsx'), 'utf8');
  const leaf = readFileSync(join(root, 'src/components/MapaLeaflet.tsx'), 'utf8');

  // El encuadre debe ampliar los límites. Encajar solo la comuna la deja tan grande que
  // no hay ciudad alrededor; encajar las 16 comunas la reduce a un punto ilegible.
  chk('existe la ampliación de límites', true, leaf.includes('function expandir'));
  // El factor solo tiene que ser mayor que 1. Medido en el navegador, un factor
  // de 2 o más dejaba la comuna en el 32 % de la altura del visor — demasiado
  // lejos—, así que la exigencia vieja de `[2-9]` estaba al revés.
  const factor = Number(leaf.match(/<Encuadrar[^>]*factor=\{([\d.]+)\}/)?.[1]);
  chk('la vista ciudad amplía los límites', true, factor > 1);
  chk('el factor está calibrado por medición, no es arbitrario', true, factor >= 1.05 && factor <= 1.4);
  chk('la vista ciudad ya no encaja las 16 comunas', true,
    !/UNIDADES\.flatMap\(\(u\) => u\.anillos\)/.test(leaf));

  // Extraer cada rama del ternario por balance de paréntesis, no por recorte de texto:
  // el mismo ternario se repite en la leyenda y un corte ingenuoRevisa la rama equivocada.
  // "enComuna" aparece en tres ternarios: el texto de la tarjeta, el render del mapa y
  // la leyenda. Anclar despues de <MapContainer> apunta al que de verdad importa.
  const rama = (fuente, etiqueta) => {
    const mapa = fuente.indexOf('<MapContainer');
    const i = fuente.indexOf(`{${etiqueta} ? (`, mapa < 0 ? 0 : mapa);
    if (i < 0) return '';
    let d = 0, j = i + etiqueta.length + 4;
    for (; j < fuente.length; j++) {
      if (fuente[j] === '(') d++;
      else if (fuente[j] === ')') { d--; if (d === 0) break; }
    }
    let d2 = 0;
    for (let k = j + 1; k < fuente.length; k++) {
      if (fuente[k] === '(') d2++;
      else if (fuente[k] === ')') { d2--; if (d2 === 0) return fuente.slice(j + 1, k); }
    }
    return '';
  };
  const ciudadVista = rama(leaf, 'enComuna');
  chk('la vista ciudad dibuja los barrios por dentro', true, ciudadVista.includes('BARRIOS.map'));
  chk('las divisiones internas van sin relleno para no tapar la comuna', true,
    ciudadVista.includes("dashArray: '3 3'") && ciudadVista.includes('fill: false'));
  chk('el relleno de la comuna se dibuja antes que los barrios', true,
    ciudadVista.indexOf('c6-${i}') < ciudadVista.indexOf('BARRIOS.map'));
  chk('la división de barrios está en la leyenda', true, /Límite de los 12 barrios/.test(mapa2));
  chk('el texto de la tarjeta anuncia los barrios', true, /barrios trazados/.test(mapa2));

  // La comuna se dibuja subdividida y, a la vez, como una sola unidad: 1 relleno + 1 trazo
  // continuo por barrio. Las divisiones tienen que ser legibles sinmouseover.
  chk('la comuna conserva un borde continuo que une los barrios', true,
    ciudadVista.includes('weight: 3') && ciudadVista.includes("C.c6.borde"));

  // Los barrios comparten frontera con la comuna. Como el simplificador se aplicó por
  // separado a cada anillo, sus vértices no coinciden y alguno cae unos metros "fuera".
  // Lo tolerable es la escala del ruido, no la coincidencia exacta: a escala urbana esos
  // metros son sub-píxel. Lo que sí debe cumplirse es que no se salgan de la ciudad.
  const comunAnillo = geo.comuna.anillos[0];
  const distBorde = (p, anillo) => {
    const lat = p[1] * RAD, mx = (RAD * R_TIERRA) * Math.cos(lat);
    const ax = anillo.map(([x, y]) => [x * mx, y * RAD * R_TIERRA]);
    let min = Infinity;
    for (let i = 0; i < ax.length; i++) {
      const a = ax[i], b = ax[(i + 1) % ax.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      let t = L ? ((p[0] * mx - a[0]) * dx + (p[1] * RAD * R_TIERRA - a[1]) * dy) / L : 0;
      t = Math.max(0, Math.min(1, t));
      min = Math.min(min, Math.hypot(p[0] * mx - (a[0] + t * dx), p[1] * RAD * R_TIERRA - (a[1] + t * dy)));
    }
    return min;
  };
  const conSigno = (p) => (dentroDe(p, comunAnillo) ? -1 : 1) * distBorde(p, comunAnillo);
  const desviacion = geo.barrios.flatMap((b) => b.anillos.flat().map(conSigno));
  const peor = Math.max(...desviacion);
  chk('los barrios no se salen de la comuna más de 10 m', true, peor < 10);
  chk('la desviación medida se reporta', true, Number.isFinite(peor));
  chk('la vista ciudad recorre los barrios una sola vez', 1, (ciudadVista.match(/BARRIOS\.map/g) || []).length);

  console.log('\n\x1b[1m14. MOTOR DEL MAPA: GOOGLE CON RESPALDO A LEAFLET\x1b[0m');
  const gmaps = readFileSync(join(root, 'src/components/MapaGoogle.tsx'), 'utf8');
  const cargador = readFileSync(join(root, 'src/hooks/useGoogleMaps.ts'), 'utf8');

  chk('la tarjeta elige motor en lugar de dibujar los dos', true,
    mapa2.includes('motor === \'google\'') && mapa2.includes('<MapaGoogle') && mapa2.includes('<MapaLeaflet'));
  chk('solo se usa Google cuando la API quedó lista; cualquier otro estado cae a Leaflet', true,
    /google\.estado === 'listo' \? 'google' : 'leaflet'/.test(mapa2));

  // La clave se lee del entorno, jamás escrita en el código ni en un archivo de repo.
  chk('la clave viene de VITE_GOOGLE_MAPS_KEY', true, cargador.includes('VITE_GOOGLE_MAPS_KEY'));
  chk('no hay ninguna clave de Google escrita a mano en el código', true, !/AIza[\w-]{20,}/.test(gmaps + cargador + mapa2));
  chk('.env está ignorado pero .env.example se versiona', true, {
    ignorado: /^\.env$/m.test(readFileSync(join(root, '.gitignore'), 'utf8')),
    ejemplo: !!readFileSync(join(root, '.env.example'), 'utf8'),
  }.ignorado && /.env\.example/.test(readFileSync(join(root, '.gitignore'), 'utf8')));

  // Si la API falla (clave sin facturación, sin red, quota) el mapa no se queda en blanco.
  chk('un fallo al cargar la API cae a Leaflet y lo avisa', true,
    cargador.includes("'error'") && mapa2.includes('mapa-aviso') && mapa2.includes('motor de respaldo'));
  chk('el error se distingue de la ausencia de clave', true,
    cargador.includes("'sin-clave'") && cargador.includes("'cargando'") && cargador.includes("'listo'"));

  // El modo oscuro de Google depende de la API, no de un filtro CSS que apagaría los polígonos.
  chk('el tema oscuro se pide a la propia API', true,
    gmaps.includes('ColorScheme.DARK') && gmaps.includes('ColorScheme.LIGHT'));
  chk('el marco comparte altura entre los dos motores', true,
    /\.mapa-leaf,\s*\.mapa-gmaps/.test(readFileSync(join(root, 'src/index.css'), 'utf8')));

  chk('la atribución de la cartografía cambia con el motor', true,
    mapa2.includes('Cartografía base © Google Maps.') && mapa2.includes('OpenStreetMap © CARTO.'));
  chk('el recuento de barrios viene del módulo compartido en ambos motores', true,
    gmaps.includes('contarPorBarrio(activos)') && leaf.includes('contarPorBarrio(activos)'));

  console.log('\n\x1b[1m15. EXPLORADOR DE INDICADORES (TAB 1)\x1b[0m');
  // El explorador se documentó en CONTINUIDAD.md §3.2 y en el mapa de archivos,
  // pero el componente no existía: Tab1 no tenía filtros. Estas pruebas fijan
  // lo que la tarjeta promete, para que no vuelva a desaparecer en silencio.
  const explorador = readFileSync(join(root, 'src/components/P1Explorador.tsx'), 'utf8');
  const tab1 = readFileSync(join(root, 'src/pages/Tab1.tsx'), 'utf8');

  chk('el componente existe y Tab1 lo monta', true,
    tab1.includes("from '../components/P1Explorador'") && tab1.includes('<P1Explorador v={val} />'));
  chk('los tres filtros están: búsqueda, categoría y orden', true,
    explorador.includes('id="exp-buscar"') && explorador.includes('id="exp-categoria"') && explorador.includes('id="exp-orden"'));
  chk('el explorador arranca plegado, como el gestor de datos', true,
    !/abiertoPorDefecto/.test(explorador));

  // Filtra lo que la API ya trajo: si hiciera su propio fetch, el filtro y la
  // tabla dejarían de hablar de la misma muestra.
  chk('no consulta la API por su cuenta: recibe la lista ya cargada', true,
    !/\bfetch\(/.test(explorador) && explorador.includes('{ v }: { v: Validacion[] }'));
  chk('no promedia ni recalcula porcentajes', true, !/\.reduce\(/.test(explorador));
  chk('no escribe una lista de categorías a mano: las cuenta sobre los datos', true,
    explorador.includes('cuenta.set(x.categoria') && !/Todas \(' /.test(explorador));

  // Un filtro sin resultados se dice. Una tabla vacía en silencio parece un fallo de datos.
  chk('el filtro sin coincidencias se reporta explícitamente', true,
    explorador.includes('Ningún indicador coincide'));
  chk('el recuento visible dice cuántas filas quedan de las 27', true,
    explorador.includes('de ${v.length} indicadores'));

  // Ordenar es reordenar, no recalcular: los tres comparadores, con desempate por
  // `orden` para que la tabla no se reordene sola entre renders.
  chk('el orden por defecto es el del archivo', true, explorador.includes("useState<Orden>('xlsx')"));
  chk('el orden por % es descendente y estable', true,
    explorador.includes('pct: (a, b) => b.porcentaje - a.porcentaje || a.orden - b.orden'));
  chk('el orden alfabético usa la colación española', true,
    explorador.includes("localeCompare(b.indicador, 'es')"));

  // Escribir «informacion» tiene que encontrar «Información»: la búsqueda
  // normaliza; el recorte de ejes (etiquetaIndicador) no se aplica en una tabla
  // de datos, porque ahí quitaría el nombre completo del indicador.
  chk('la búsqueda ignora acentos y mayúsculas', true, explorador.includes("normalize('NFD')"));
  chk('la tabla conserva el nombre completo del indicador', true,
    explorador.includes('<strong>{x.indicador}</strong>') && !/etiquetaIndicador\(/.test(explorador));

  // Y que el XLSX efectivamente tenga lo que el filtro promete filtrar.
  const normTxt = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  chk('«precio» encuentra los indicadores de precios sin tilde', 2,
    v.filter((x) => normTxt(x.indicador).includes('precio')).length);
  chk('las categorías del XLSX son 8 y todas tienen filas', true,
    new Set(v.map((x) => x.categoria)).size === 8
    && [...new Set(v.map((x) => x.categoria))].every((c) => v.some((x) => x.categoria === c)));
  chk('la suma de los conteos por categoría vuelve a 27', 27,
    [...new Set(v.map((x) => x.categoria))].reduce((s, c) => s + v.filter((x) => x.categoria === c).length, 0));
  chk('todo indicador trae categoría y fuente', true, v.every((x) => !!x.categoria && !!x.fuente));
  chk('ningún porcentaje se sale de 0 a 100', true, v.every((x) => x.porcentaje >= 0 && x.porcentaje <= 100));
  // El porcentaje de la tabla se puede reconstruir desde n: prueba de que no se
  // ajustó a mano. No se exige que sumen 100: son preguntas de opción múltiple.
  chk('el % es siempre n/28 redondeado a un decimal', true,
    v.every((x) => x.porcentaje.toFixed(1) === (Math.round((x.n / meta.n) * 1000) / 10).toFixed(1)));

  console.log('\n\x1b[1m11. AISLAMIENTO DE LA BASE DE PRODUCCIÓN\x1b[0m');
  chk('la suite no usa la base de producción', true, !DB_TEMP.endsWith('atlas-c6.db') || DB_TEMP !== join(root, 'data', 'atlas-c6.db'));
  chk('filas reales intactas tras crear y borrar', PRODUCTO_ANTES, sumarFilas());
  chk('la base real no recibió registros de prueba', 0, sumarFilas("WHERE procedencia='Manual'"));

  console.log('\n\x1b[1m12. AUTENTICACIÓN DEL CRUD (ATLAS_ADMIN_KEY)\x1b[0m');
  chk('sin clave configurada, /api/meta avisa que está abierto', false, meta.crud_protegido);
  const altaLibre = await json('/api/activos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, nombre: 'Alta sin clave' }),
  });
  chk('sin clave, escribir sigue permitido', true, Boolean(altaLibre?.id));
  chk('sin clave, también se puede borrar', 204, await code(`/api/activos/${altaLibre.id}`, { method: 'DELETE' }));
  chk('vuelve a 10 activos', 10, (await json('/api/activos')).length);

  const DB_CLAVE = join(tmpdir(), `atlas-c6-clave-${process.pid}.db`);
  for (const s of ['', '-wal', '-shm']) rmSync(DB_CLAVE + s, { force: true });
  const srvClave = spawn(process.execPath, [join(root, 'server', 'index.mjs')], {
    env: { ...process.env, PORT: String(PORT + 1), ATLAS_DB: DB_CLAVE, ATLAS_ADMIN_KEY: 'llave-de-prueba' },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const B2 = `http://localhost:${PORT + 1}`;
  const code2 = (p, opt = {}) => fetch(B2 + p, opt).then((r) => r.status);
  const json2 = (p, opt = {}) => fetch(B2 + p, opt).then((r) => r.json());
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(`${B2}/api/health`)).ok) break; } catch { await new Promise((r) => setTimeout(r, 200)); }
  }

  chk('con clave, /api/meta informa que está protegido', true, (await json2('/api/meta')).crud_protegido);
  chk('con clave, leer sigue abierto', 200, await code2('/api/activos'));
  chk('sin cabecera → 401', 401, await code2('/api/activos', { method: 'POST' }));
  chk('clave incorrecta → 401', 401, await code2('/api/activos', {
    method: 'POST', headers: { 'X-Admin-Key': 'equivocada' },
  }));
  chk('clave correcta llega al cuerpo → 422', 422, await code2('/api/activos', {
    method: 'POST', headers: { 'X-Admin-Key': 'llave-de-prueba', 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }));
  chk('clave correcta + cuerpo válido → 201', 201, await code2('/api/activos', {
    method: 'POST', headers: { 'X-Admin-Key': 'llave-de-prueba', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cuerpo, nombre: 'Alta con clave' }),
  }));
  chk('borrar también exige la clave', 401, await code2('/api/activos/1', { method: 'DELETE' }));

  srvClave.kill('SIGTERM');
  for (const s of ['', '-wal', '-shm']) rmSync(DB_CLAVE + s, { force: true });

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`\x1b[1mRESULTADO: ${pass} pruebas OK, ${fail} fallos\x1b[0m`);
  if (fail) {
    console.log('Fallos:');
    for (const f of fallos) console.log(`  · ${f}`);
  }
  if (log.trim()) console.log(`\nLog del servidor:\n${log.trim()}`);
  fin(fail ? 1 : 0);
} catch (e) {
  console.error('\n\x1b[31mErrorFatal:\x1b[0m', e);
  console.error(log);
  fin(1);
}
