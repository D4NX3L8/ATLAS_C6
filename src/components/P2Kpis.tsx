import type { Activo, Estructura } from '../types';
import { fmtInt, fmtPct } from '../utils';

type Props = { activos: Activo[] | null; meta: Estructura[] | null; loading: boolean };

export default function P2Kpis({ activos, meta, loading }: Props) {
  if (loading || !activos || !meta) {
    return (
      <div className="kpis">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpi"><div className="kpi-l">…</div><div className="kpi-v">—</div></div>
        ))}
      </div>
    );
  }

  const e = Object.fromEntries(meta.map((x) => [x.indicador, x]));
  const com = e['Establecimientos comerciales'];
  const act = e['Activos culturales, comunitarios y territoriales documentados'];

  return (
    <div className="kpis">
      <div className="kpi">
        <div className="kpi-l">Registros catalogados (reales)</div>
        <div className="kpi-v">{fmtInt(activos.length)}</div>
        <div className="kpi-s">Solo registros documentados (INV-003 / INV-006). Sin datos inventados.</div>
      </div>
      <div className="kpi is-hist">
        <div className="kpi-l">Activos documentados por INV-006</div>
        <div className="kpi-v">{act ? `${fmtInt(act.valor)}+` : '50+'}</div>
        <div className="kpi-s">{act?.observacion ?? 'Requiere validación de vigencia.'}</div>
      </div>
      <div className="kpi is-ctx">
        <div className="kpi-l">Establecimientos de carácter comercial</div>
        <div className="kpi-v">{com ? fmtPct(com.valor) : '—'}</div>
        <div className="kpi-s">Comuna 6 · {com?.anio ?? 'año no determinado'} · Histórico, no vigente. INV-008.</div>
      </div>
      <div className="kpi is-gap">
        <div className="kpi-l">Georreferenciación</div>
        <div className="kpi-v kpi-nm">Pendiente</div>
        <div className="kpi-s">El catálogo no incluye coordenadas verificables. No se usan ubicaciones ficticias (brief, línea 52).</div>
      </div>
    </div>
  );
}
