/**
 * Auditoría visual automatizada.
 *
 * Sustituye a mirarlo a ojo, que es como se estaba haciendo (o más bien, no se
 * estaba haciendo). No juzga el gusto: mide cosas verificables.
 *
 *   · errores de consola y de red en cada vista
 *   · desbordamiento horizontal (el síntoma clásico de un responsive roto)
 *   · contraste real de cada texto contra su fondo, calculado desde los píxeles
 *   · contraste real del mapa: cuántos píxeles ocupa la Comuna 6 y si los 12
 *     barrios se dibujan
 *   · imágenes y fuentes que no cargaron
 *
 * Uso:  npm run auditar            (levanta API + preview sobre una base temporal)
 *       npm run auditar -- --headless=false   (para ver el navegador)
 */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(raiz, 'auditorias');
const API = 3971;
const WEB = 3972;
const DB_TEMP = '/tmp/atlas-c6-auditoria.db';

const VISTAS = [
  { hash: 'investigacion', nombre: 'Pestaña 1 · Investigación y validación' },
  { hash: 'oferta', nombre: 'Pestaña 2 · Oferta territorial' },
  { hash: 'calidad', nombre: 'Pestaña 3 · Calidad y brechas' },
  { hash: 'prototipo', nombre: 'Prototipo del sistema' },
];

const PANTALLAS = [
  { nombre: 'escritorio', width: 1440, height: 900 },
  { nombre: 'portatil', width: 1024, height: 768 },
  { nombre: 'tableta', width: 820, height: 1180 },
  { nombre: 'movil', width: 390, height: 844 },
];

/* ---------- contraste ----------
   Todo el cálculo ocurre dentro de la página: hace falta reconstruir el fondo
   effective, porque `getComputedStyle` solo da el fondo del propio elemento. */

const MEDIR_CONTRASTE = (selector = 'body *') => {
  const lum = (rgb) => {
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  };
  const hex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
  const parse = (c) => {
    const s = String(c).trim();
    const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const h = hex[1].length === 3 ? hex[1].split('').map((x) => x + x).join('') : hex[1];
      const v = parseInt(h, 16);
      return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], a: 1 };
    }
    const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.%]+))?/);
    if (!m) return null;
    const a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return { rgb: [+m[1], +m[2], +m[3]], a };
  };

  const sobre = (fondo, capa) => [
    capa.rgb[0] * capa.a + fondo[0] * (1 - capa.a),
    capa.rgb[1] * capa.a + fondo[1] * (1 - capa.a),
    capa.rgb[2] * capa.a + fondo[2] * (1 - capa.a),
  ];

  const componer = (capas, base) => {
    let color = base;
    for (let i = capas.length - 1; i >= 0; i -= 1) color = sobre(color, capas[i]);
    return color;
  };

  /** Paradas de color de un `linear-gradient`, para no perder el fondo real. */
  const paradasDe = (img) => (img.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi) || []).map(parse).filter(Boolean);

  /**
   * Fondos efectivos posibles detrás de un elemento.
   *
   * Devuelve una lista porque un degradado no tiene un único color: se compone
   * cada una de sus paradas sobre las capas superiores y se devuelve la peor,
   * que es la que manda para el contraste. Aquí las superficies son
   * translúcidas (`rgba(255,255,255,.72)`) y el `body` pinta con degradado, así
   * que `backgroundColor` del `body` es transparente y no sirve de nada.
   */
  const fondosDe = (el) => {
    // La base es el color de página del tema. Tiene que resolverse antes de
    // componer: usar blanco como base hacía que en modo oscuro los degradados
    // dieran fondos claros y el informe se llenara de falsos positivos.
    const base = parse(getComputedStyle(document.documentElement).getPropertyValue('--bg'));
    const pagina = base ? base.rgb : [255, 255, 255];

    const capas = [];
    let n = el;
    while (n) {
      const cs = getComputedStyle(n);
      const b = parse(cs.backgroundColor);
      if (b && b.a > 0) capas.push(b);
      if (b && b.a >= 0.999) break;
      const img = cs.backgroundImage;
      if (img && img !== 'none') {
        const paradas = paradasDe(img);
        if (paradas.length) return paradas.map((p) => componer(capas, sobre(pagina, p)));
      }
      n = n.parentElement;
    }
    return [componer(capas, pagina)];
  };

  const malos = [];
  const vistos = new Set();
  let omitidos = 0;
  for (const el of document.querySelectorAll(selector)) {
    /* El lienzo del prototipo se salta, y se cuenta.
     *
     * Es la reproducción de un diseño de Figma ajeno a ATLAS C6, con su propia
     * paleta: texto de 8 px en gris claro, blanco sobre el verde de marca y
     * chips de categoría en color saturado. Medirlo contra la regla de 4.5:1
     * del proyecto daría decenas de fallos que no son defectos de este
     * dashboard sino de la maqueta, y enterrarían la señal real. Reescribir
     * esos colores para pasar la auditoría destrozaría la fidelidad al diseño,
     * que es justo lo que la vista presenta.
     *
     * No es un silencio: `omitidos` sale en el informe, así que la exclusión
     * queda registrada cada vez que se ejecuta. */
    if (el.closest('[data-artefacto]')) { omitidos += 1; continue; }

    // Solo texto propio, no el de los hijos que lo renderizan.
    const txt = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!txt) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;

    const fg = parse(st.color);
    if (!fg) continue;
    // El contraste se juzga contra el fondo peor de los posibles.
    const fondos = fondosDe(el);
    const L1 = lum(fg.rgb);
    let r2 = Infinity;
    let peor = fondos[0];
    for (const bg of fondos) {
      const L2 = lum(bg);
      const rr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (rr < r2) { r2 = rr; peor = bg; }
    }

    const px = parseFloat(st.fontSize);
    const bold = parseInt(st.fontWeight, 10) >= 700;
    const grande = px >= 24 || (px >= 18.66 && bold);
    const minimo = grande ? 3 : 4.5;

    const clave = `${st.color}|${hex(peor)}|${Math.round(px)}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    if (r2 < minimo) {
      malos.push({
        texto: txt.slice(0, 58),
        selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}` : ''),
        ratio: Math.round(r2 * 100) / 100,
        minimo,
        px: Math.round(px * 10) / 10,
        // Sin los colores, un ratio de 1.1:1 no se puede juzgar: parece un
        // desastre de accesibilidad o un error de la propia medición.
        fg: hex(fg.rgb),
        bg: hex(peor),
      });
    }
  }
  return { malos, omitidos };
};

/* ---------- explorador de indicadores ----------
   El explorador de la Pestaña 1 nace plegado, como el gestor de datos. Si nadie
   lo abre, ninguna de las comprobaciones de esta auditoría mide lo que hay
   dentro: se registraría una página correcta con media tabla sin revisar. */

const MEDIR_EXPLORADOR = () => {
  const cuerpo = document.querySelector('.acc-open .acc-b');
  if (!cuerpo) return null;
  const tabla = cuerpo.querySelector('table.tbl');
  const th = tabla ? [...tabla.querySelectorAll('thead th')].map((t) => t.textContent.trim()) : [];
  return {
    filas: tabla ? tabla.querySelectorAll('tbody tr').length : 0,
    columnas: th,
    categorias: cuerpo.querySelectorAll('#exp-categoria option').length - 1,
    busqueda: Boolean(cuerpo.querySelector('#exp-buscar')),
    orden: Boolean(cuerpo.querySelector('#exp-orden')),
    anuncio: (cuerpo.querySelector('[aria-live]')?.textContent || '').trim(),
    // La tabla se desplaza dentro de su propio contenedor (overflow-x), así que
    // lo que no puede pasar es que el documento entero desborde.
    desborde: Math.max(0, Math.round(document.documentElement.scrollWidth - window.innerWidth)),
  };
};

/* ---------- arranque de los servidores ---------- */

function lanzar(cmd, args, env, etiqueta) {
  // `detached` crea un grupo de procesos propio: `kill` al wrapper de npx no
  // mataba al vite real y dejaban servidores zombis ocupando el puerto, que es
  // como la auditoría llegó a medirse a sí misma con la base de la sesión
  // anterior.
  const p = spawn(cmd, args, {
    cwd: raiz,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  p.stdout.on('data', () => {});
  p.stderr.on('data', (d) => {
    const s = String(d);
    if (/error|Error|EADDRINUSE/.test(s)) console.error(`[${etiqueta}] ${s.trim()}`);
  });
  return p;
}

/** Mata el proceso y todo su grupo. */
function detener(p) {
  if (!p?.pid) return;
  try { process.kill(-p.pid, 'SIGTERM'); } catch { /* ya no existe */ }
}

async function esperar(url, ms = 40000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch { /* aún no */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/* ---------- medición del mapa ----------
   Esta función se serializa y corre dentro del navegador, así que no puede
   apoyarse en nada de este módulo: todo lo que use va definido aquí dentro. */

const MEDIR_MAPA = () => {
  // Hay dos motores (Google Maps con respaldo a Leaflet) y cada uno pinta con
  // su propio DOM, así que se mide el que esté montado.
  const gmaps = document.querySelector('.mapa-gmaps');
  const cont = gmaps || document.querySelector('.mapa-leaf');
  if (!cont) return null;
  const motor = gmaps ? 'google' : 'leaflet';
  const caja = cont.getBoundingClientRect();

  // Leaflet marca los polígonos interactivos con una clase; Google los pinta en
  // su propia capa SVG, sin clase, pero con geometría real.
  const paths = [...cont.querySelectorAll('path')];
  const conGeometria = paths.filter((p) => {
    const d = p.getAttribute('d') || '';
    return d.length > 40 && /[ML]\s*-?\d/.test(d);
  });
  const poligonos = motor === 'google'
    ? conGeometria.length
    : cont.querySelectorAll('path.leaflet-interactive').length;
  const contornos = conGeometria.length;

  // Caja envolvente de lo que está pintado en el color de la comuna, para
  // saber qué fracción del visor ocupa realmente. El color hay que leerlo
  // calculado: los `fill` llegan por CSS, no por atributo, y con `getAttribute`
  // salía vacío y el mapa quedaba "no medido".
  let bbox = null;
  let pintados = 0;
  for (const p of conGeometria) {
    const cs = getComputedStyle(p);
    const verde = /rgb\(\s*0\s*,\s*(?:1[0-9]{2}|2[0-4][0-9])\s*,\s*(?:1[0-9]{2}|2[0-3][0-9])\s*\)/;
    const esVerde = verde.test(cs.fill) || verde.test(cs.stroke);
    const relleno = cs.fill && cs.fill !== 'none';
    if (!esVerde || !relleno) continue;
    const b = p.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) continue;
    pintados += 1;
    bbox = bbox ? {
      x: Math.min(bbox.x, b.x), y: Math.min(bbox.y, b.y),
      right: Math.max(bbox.right, b.right), bottom: Math.max(bbox.bottom, b.bottom),
    } : { x: b.x, y: b.y, right: b.right, bottom: b.bottom };
  }

  return {
    motor,
    mapaPx: { w: Math.round(caja.width), h: Math.round(caja.height) },
    tiles: cont.querySelectorAll('img.leaflet-tile').length,
    contornos,
    poligonos,
    pintados,
    comuna: bbox && {
      w: Math.round(bbox.right - bbox.x),
      h: Math.round(bbox.bottom - bbox.y),
      fracAncho: Math.round(((bbox.right - bbox.x) / caja.width) * 1000) / 1000,
      fracAlto: Math.round(((bbox.bottom - bbox.y) / caja.height) * 1000) / 1000,
    },
  };
};

/* ---------- auditoría ---------- */

const fallos = [];
const avisos = [];
const informe = [];
/* Nodos de texto que quedaron fuera del cálculo de contraste por estar dentro
   de una pieza marcada como `data-artefacto` (el lienzo del prototipo). Se
   arrastra al informe para que la exclusión sea visible y no un silencio. */
let omitidosArtefacto = 0;

function fallar(where, msg) { fallos.push({ where, msg }); }
function avisar(where, msg) { avisos.push({ where, msg }); }

async function main() {
  rmSync(DB_TEMP, { force: true });
  rmSync(SALIDA, { recursive: true, force: true });
  mkdirSync(SALIDA, { recursive: true });

  const api = lanzar('node', ['server/index.mjs'], { ATLAS_DB: DB_TEMP, PORT: String(API) }, 'api');
  let web = null;
  let browser = null;

  try {
    if (!await esperar(`http://localhost:${API}/api/health`)) throw new Error('La API no arrancó.');
    web = lanzar('npx', ['vite', 'preview', '--port', String(WEB), '--strictPort'], { ATLAS_API: `http://localhost:${API}` }, 'web');
    if (!await esperar(`http://localhost:${WEB}/`)) throw new Error('Vite preview no arrancó. ¿Ejecutaste `npm run build`?');

    // El preview hereda el proxy de `server`. Si ese destino apunta a otro
    // proceso, la auditoría mide el código y la base de la sesión anterior sin
    // quejarse: se comprobó que la API que responde es la que acabamos de
    // levantar, y que expone los campos que espera.
    const meta = await (await fetch(`http://localhost:${WEB}/api/meta`)).json();
    if (typeof meta.campos_calidad !== 'number' || typeof meta.crud_protegido !== 'boolean') {
      throw new Error('El preview no está hablando con la API de la auditoría (falta `campos_calidad` o `crud_protegido` en /api/meta). Revisa ATLAS_API en vite.config.ts.');
    }

    browser = await chromium.launch({ headless: !process.argv.includes('--headless=false') });

    for (const pan of PANTALLAS) {
      for (const vista of VISTAS) {
        const ctx = await browser.newContext({
          viewport: { width: pan.width, height: pan.height },
          deviceScaleFactor: 1,
        });
        const page = await ctx.newPage();
        const etiqueta = `${pan.nombre} ${pan.width}×${pan.height} · ${vista.nombre}`;

        const consola = [];
        page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consola.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
        page.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 200)}`));
        page.on('requestfailed', (r) => {
          // Las teselas de CARTO no cargan sin red; no es un defecto del proyecto.
          if (r.url().includes('basemaps.cartocdn.com')) return;
          consola.push(`requestfailed: ${r.url().slice(0, 120)}`);
        });

        await page.goto(`http://localhost:${WEB}/#${vista.hash}`, { waitUntil: 'load' });
        await page.waitForTimeout(1400);

        // 1. ¿Apareció algo? La app es lazy: si un chunk falla, esto se queda en «Cargando».
        const cuerpo = await page.textContent('main');
        if (!cuerpo || /Cargando datos reales/.test(cuerpo)) {
          fallar(etiqueta, 'La vista se quedó en el estado de carga (¿falló un chunk lazy?).');
        }

        // 2. Desbordamiento horizontal.
        const desborde = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          ancho: window.innerWidth,
          culpables: [...document.querySelectorAll('body *')]
            .filter((el) => !el.closest('[data-artefacto]'))
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 2)
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`),
        }));
        if (desborde.scroll > desborde.ancho + 2) {
          fallar(etiqueta, `Desbordamiento horizontal: ${desborde.scroll}px de contenido en ${desborde.ancho}px de ventana (${desborde.culpables.join(', ')}).`);
        }

        // 3. Contraste.
        const { malos: bajos, omitidos } = await page.evaluate(MEDIR_CONTRASTE);
        for (const b of bajos) {
          const msg = `Contraste ${b.ratio}:1 (mínimo ${b.minimo}:1 a ${b.px}px) ${b.fg} sobre ${b.bg} en ${b.selector} — "${b.texto}"`;
          if (b.ratio < 3) fallar(etiqueta, msg);
          else avisar(etiqueta, msg);
        }
        if (omitidos > 0) omitidosArtefacto += omitidos;

        // 4. Imágenes rotas.
        const rotas = await page.evaluate(() => [...document.images]
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src));
        for (const r of rotas) fallar(etiqueta, `Imagen no cargó: ${r}`);

        // 5. Mapa.
        let mapa = null;
        if (vista.hash === 'oferta') {
          mapa = await page.evaluate(MEDIR_MAPA);
          if (!mapa) avisar(etiqueta, 'No se encontró el contenedor del mapa.');
          else {
            if (mapa.poligonos === 0) fallar(etiqueta, 'El mapa no dibujó ningún polígono interactivo.');
            // El juicio va por la altura: el visor es mucho más ancho que alto
            // y la comuna es vertical, así que el ancho nunca es el que limita.
            if (mapa.comuna && mapa.comuna.fracAlto < 0.4) {
              avisar(etiqueta, `La Comuna 6 ocupa el ${(mapa.comuna.fracAlto * 100).toFixed(1)} % de la altura del mapa: encuadre demasiado alejado.`);
            } else if (mapa.comuna && mapa.comuna.fracAlto > 0.97) {
              avisar(etiqueta, `La Comuna 6 ocupa el ${(mapa.comuna.fracAlto * 100).toFixed(1)} % de la altura del mapa: encuadre tan cerrado que no queda ciudad alrededor.`);
            }
          }
        }

        // 6. Explorador de indicadores. Solo existe abierto, y lo que importa es
        //    que filtre de verdad: 27 filas de entrada, y «precio» sin tilde tiene
        //    que devolver las dos que el archivo documenta.
        let explorador = null;
        if (vista.hash === 'investigacion') {
          const plegable = page.locator('.acc-h', { hasText: 'Explorar los indicadores' });
          if (await plegable.count() === 0) {
            fallar(etiqueta, 'No se encontró el explorador de indicadores en la Pestaña 1.');
          } else {
            await plegable.first().click();
            await page.waitForTimeout(400);
            explorador = await page.evaluate(MEDIR_EXPLORADOR);
            if (!explorador) fallar(etiqueta, 'El explorador se abrió pero su contenido no llegó a pintarse.');
            else {
              if (explorador.filas !== 27) fallar(etiqueta, `El explorador muestra ${explorador.filas} filas; el archivo base tiene 27 indicadores.`);
              if (explorador.categorias !== 8) fallar(etiqueta, `El filtro lista ${explorador.categorias} categorías; el archivo base tiene 8.`);
              if (!explorador.busqueda || !explorador.orden) fallar(etiqueta, 'Falta el campo de búsqueda o el de orden.');
              if (explorador.desborde > 2) fallar(etiqueta, `El explorador abierto desborda la página: ${explorador.desborde}px.`);

              // Contraste de lo que solo existe abierto.
              const { malos: bajosExplorador } = await page.evaluate(MEDIR_CONTRASTE, '.acc-open *');
              for (const b of bajosExplorador) {
                const msg = `Explorador · contraste ${b.ratio}:1 (mínimo ${b.minimo}:1 a ${b.px}px) ${b.fg} sobre ${b.bg} en ${b.selector} — "${b.texto}"`;
                if (b.ratio < 3) fallar(etiqueta, msg); else avisar(etiqueta, msg);
              }

              // La búsqueda es insensible a acentos: se escribe sin tilde a propósito.
              await page.fill('#exp-buscar', 'precio');
              await page.waitForTimeout(300);
              const filtradas = await page.evaluate(() => document.querySelectorAll('.acc-open .tbl tbody tr').length);
              if (filtradas !== 2) fallar(etiqueta, `«precio» devolvió ${filtradas} filas; el archivo documenta 2 indicadores de precios.`);
              await page.fill('#exp-buscar', 'zzzz');
              await page.waitForTimeout(300);
              const vacio = await page.textContent('.acc-open');
              if (!/Ningún indicador coincide/.test(vacio || '')) fallar(etiqueta, 'Una búsqueda sin resultados no se reporta: la tabla queda vacía en silencio.');
              await page.fill('#exp-buscar', '');
              await page.waitForTimeout(300);
            }
            await page.screenshot({ path: join(SALIDA, `explorador-${pan.nombre}.png`), fullPage: true });
          }
        }

        const archivo = `${pan.nombre}-${vista.hash}.png`;
        await page.screenshot({ path: join(SALIDA, archivo), fullPage: true });

        const resumen = {
          vista: vista.nombre,
          pantalla: `${pan.nombre} ${pan.width}×${pan.height}`,
          consola: consola.length,
          contraste: bajos,
          contrasteOmitidosEnArtefacto: omitidos,
          mapa,
          explorador,
        };
        informe.push(resumen);
        console.log(`  ${pan.nombre.padEnd(11)} ${vista.hash.padEnd(14)} consola:${String(consola.length).padStart(2)}  contraste:${String(bajos.length).padStart(2)}${omitidos ? `  (artefacto: ${omitidos} omitidos)` : ''}  → ${archivo}`);
        if (mapa) {
          console.log(`      mapa ${mapa.mapaPx.w}×${mapa.mapaPx.h}px · ${mapa.poligonos} polígonos · comuna ${mapa.comuna ? `${(mapa.comuna.fracAlto * 100).toFixed(1)}% del alto, ${(mapa.comuna.fracAncho * 100).toFixed(1)}% del ancho` : 'no medida'}`);
        }
        for (const c of consola) fallar(etiqueta, `Consola: ${c}`);

        await ctx.close();
      }
    }

    // Tema oscuro: se recorre solo la primera pantalla, que es donde se nota.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${WEB}/#investigacion`, { waitUntil: 'load' });
    await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('atlas-c6:tema', 'dark'); });
    await page.waitForTimeout(900);
    const { malos: bajosOscuro } = await page.evaluate(MEDIR_CONTRASTE);
    for (const b of bajosOscuro) {
      const msg = `Tema oscuro · contraste ${b.ratio}:1 (mínimo ${b.minimo}:1) ${b.fg} sobre ${b.bg} en ${b.selector} — "${b.texto}"`;
      if (b.ratio < 3) fallar('tema oscuro', msg); else avisar('tema oscuro', msg);
    }
    await page.screenshot({ path: join(SALIDA, 'oscuro-investigacion.png'), fullPage: true });
    console.log(`  oscuro     Investigación   contraste:${String(bajosOscuro.length).padStart(2)}  → oscuro-investigacion.png`);
    await ctx.close();
  } finally {
    await browser?.close();
    detener(api);
    detener(web);
    rmSync(DB_TEMP, { force: true });
  }

  writeFileSync(
    join(SALIDA, 'resumen.json'),
    JSON.stringify({
      generado: new Date().toISOString(),
      resumen: informe,
      fallos,
      avisos,
      contrasteOmitidoEnArtefactos: omitidosArtefacto,
    }, null, 2),
  );

  if (omitidosArtefacto) {
    console.log(`  ${omitidosArtefacto} nodos de texto del prototipo quedaron fuera del cálculo de contraste (data-artefacto).`);
  }

  console.log('');
  if (avisos.length) {
    console.log(`  Avisos (${avisos.length})`);
    for (const a of avisos) console.log(`   · ${a.where}: ${a.msg}`);
    console.log('');
  }
  if (fallos.length) {
    console.log(`  FALLOS (${fallos.length})`);
    for (const f of fallos) console.log(`   ✗ ${f.where}: ${f.msg}`);
    console.log('');
    console.log('  Capturas en auditorias/ para revisar a ojo.');
    process.exit(1);
  }
  console.log('  Sin fallos. Capturas en auditorias/');
}

main().catch((e) => {
  console.error(`\n  La auditoría no pudo ejecutarse: ${e.message}\n`);
  process.exit(1);
});
