import type { Canal, Brecha, CampoCalidad } from '../types';
import { fmtInt } from '../utils';

type Props = { canales: Canal[]; brechas: Brecha[]; campos: CampoCalidad[] };

export default function P3Kpis({ canales, brechas, campos }: Props) {
  return (
    <div className="kpis">
      <div className="kpi">
        <div className="kpi-l">Fuentes de información identificadas</div>
        <div className="kpi-v">{fmtInt(canales.length)}</div>
        <div className="kpi-s">Matriz de canales, cobertura, limitaciones y estado (Hoja 3 · A).</div>
      </div>
      <div className="kpi is-hist">
        <div className="kpi-l">Brechas documentadas</div>
        <div className="kpi-v">{fmtInt(brechas.length)}</div>
        <div className="kpi-s">No se convierten en 0. Se marcan como No disponible / No medida (Hoja 3 · B).</div>
      </div>
      <div className="kpi is-ctx">
        <div className="kpi-l">Campos de calidad / trazabilidad</div>
        <div className="kpi-v">{fmtInt(campos.length)}</div>
        <div className="kpi-s">Definen qué permite medir y su prioridad (Hoja 3 · C).</div>
      </div>
      <div className="kpi is-gap">
        <div className="kpi-l">Principio de cobertura</div>
        <div className="kpi-v kpi-nm">Cobertura ≠ censo</div>
        <div className="kpi-s">La ausencia de dato no equivale a cero. Diferenciación entre dato disponible / no disponible / no medido / contextual.</div>
      </div>
    </div>
  );
}
