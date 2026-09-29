import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, RotateCcw, ListFilter } from 'lucide-react';
import Acordeon from './Acordeon';
import type { Validacion } from '../types';
import { fmtInt, fmtPct } from '../utils';

type Orden = 'xlsx' | 'pct' | 'alpha';

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: 'xlsx', etiqueta: 'Orden del archivo' },
  { valor: 'pct', etiqueta: 'Mayor % primero' },
  { valor: 'alpha', etiqueta: 'Alfabético (A → Z)' },
];

/**
 * Sin acentos ni mayúsculas: quien escriba «informacion» tiene que encontrar
 * «Información». La búsqueda corre sobre el texto del XLSX, no sobre la versión
 * recortada de `etiquetaIndicador` (que existe para los ejes de barras, donde el
 * recorte ahorra píxeles; en una tabla de datos quitaría información).
 */
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const COMPARADORES: Record<Orden, (a: Validacion, b: Validacion) => number> = {
  // El desempate por `orden` mantiene la tabla estable: dos indicadores con el
  // mismo porcentaje no se intercambian de posición entre un render y otro.
  xlsx: (a, b) => a.orden - b.orden,
  pct: (a, b) => b.porcentaje - a.porcentaje || a.orden - b.orden,
  alpha: (a, b) => a.indicador.localeCompare(b.indicador, 'es'),
};

/**
 * Explorador de los 27 indicadores de validación: búsqueda, filtro por
 * categoría y orden. Solo reorganiza y filtra lo que ya devuelve `/api/validacion`;
 * no promedia, no rellena y no recalcula porcentajes.
 */
export default function P1Explorador({ v }: { v: Validacion[] }) {
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState<Orden>('xlsx');

  // Las categorías se cuentan sobre los datos en vez de escribirse a mano: una
  // lista fija en el código se desincroniza del XLSX en cuanto cambia la fuente.
  const categorias = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const x of v) cuenta.set(x.categoria, (cuenta.get(x.categoria) ?? 0) + 1);
    return [...cuenta].map(([nombre, n]) => ({ nombre, n }));
  }, [v]);

  const filas = useMemo(() => {
    const t = norm(q.trim());
    return v
      .filter((x) => !categoria || x.categoria === categoria)
      .filter((x) => !t || norm(x.indicador).includes(t) || norm(x.categoria).includes(t))
      .sort(COMPARADORES[orden]);
  }, [v, q, categoria, orden]);

  const filtrando = q.trim() !== '' || categoria !== '';
  const limpiar = () => { setQ(''); setCategoria(''); setOrden('xlsx'); };

  return (
    <Acordeon titulo="Explorar los indicadores de validación" ic={ListFilter} n={v.length}>
      <p className="bar-desc" style={{ marginBottom: 12 }}>
        Los {v.length} indicadores de INV-008 tal como constan en el archivo base. Permite buscarlos,
        filtrarlos por categoría y cambiar el orden; no calcula ni estima nada. n=28 · muestra de
        conveniencia, no probabilística.
      </p>

      <div className="filters">
        <div className="fld wide">
          <label htmlFor="exp-buscar">
            <Search size={12} aria-hidden="true" /> Buscar
          </label>
          <input
            id="exp-buscar"
            type="search"
            value={q}
            placeholder="Escribe una palabra (con o sin acentos)…"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="fld">
          <label htmlFor="exp-categoria">Categoría</label>
          <select id="exp-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas ({v.length})</option>
            {categorias.map((c) => (
              <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.n})</option>
            ))}
          </select>
        </div>

        <div className="fld">
          <label htmlFor="exp-orden">
            <ArrowUpDown size={12} aria-hidden="true" /> Orden
          </label>
          <select id="exp-orden" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
            ))}
          </select>
        </div>

        <div className="fld" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-s" onClick={limpiar} disabled={!filtrando}>
            <RotateCcw size={14} aria-hidden="true" /> Limpiar
          </button>
        </div>
      </div>

      <p className="ayuda" style={{ marginBottom: 8 }} aria-live="polite">
        {filas.length === v.length
          ? `${v.length} indicadores`
          : `${filas.length} de ${v.length} indicadores`}
        {filtrando ? ' — la tabla está filtrada, no recortada: ningún valor se recalcula.' : ''}
      </p>

      {!filas.length ? (
        <div className="pend" style={{ padding: '26px 20px' }}>
          <div className="ic">🔍</div>
          <h4>Ningún indicador coincide</h4>
          <p>Prueba con otra palabra o vuelve a la categoría «Todas».</p>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <caption className="sr">Indicadores de validación · {filas.length} filas</caption>
            <thead>
              <tr>
                <th>#</th>
                <th>Indicador</th>
                <th>Categoría</th>
                <th>n</th>
                <th>%</th>
                <th>Año</th>
                <th>Tipo de evidencia</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((x) => (
                <tr key={x.id}>
                  <td className="mono">{x.orden}</td>
                  <td title={x.nota || undefined}><strong>{x.indicador}</strong></td>
                  <td>{x.categoria}</td>
                  <td className="n">{fmtInt(x.n)}</td>
                  <td className="n">{fmtPct(x.porcentaje)}</td>
                  <td className="mono">{x.anio ?? '—'}</td>
                  <td>{x.tipo_evidencia}</td>
                  <td className="mono">{x.fuente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Acordeon>
  );
}
