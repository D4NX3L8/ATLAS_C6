import type { Evidencia } from '../types';
import { fmtInt, fmtPct } from '../utils';

export default function ContextoTerritorial({ e }: { e: Evidencia[] }) {
  const hist = e.filter((x) => x.ambito === 'Historico');
  const ctx = e.filter((x) => x.ambito === 'Contextual');

  return (
    <div className="stack">
      <div className="card">
        <div className="card-h">
          <h3>Contexto territorial — indicadores históricos de la Comuna 6</h3>
          <p>Datos de estructura económica y cultural con año explícito. <strong>Histórico: no es información vigente.</strong> Provenencia: caracterización DAP, Encuesta de Calidad de Vida y Cámara de Comercio (INV-008).</p>
        </div>
        <div className="card-b tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Indicador</th><th>Valor</th><th>Unidad</th><th>Territorio</th><th>Año</th><th>Nivel de evidencia</th><th>Fuente / investigación</th><th>Uso recomendado</th></tr>
            </thead>
            <tbody>
              {hist.map((x) => (
                <tr key={x.id}>
                  <td><strong>{x.indicador}</strong></td>
                  <td className="n">{x.unidad === '%' ? fmtPct(x.valor) : fmtInt(x.valor)}</td>
                  <td>{x.unidad}</td>
                  <td>{x.territorio}</td>
                  <td><span className="badge b-his">{x.anio ?? 'Año no determinado'}</span></td>
                  <td>{x.nivel}</td>
                  <td className="mono">{x.fuente}</td>
                  <td>{x.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Contexto de otro territorio — Medellín / Colombia</h3>
          <p><strong>No son demanda de la Comuna 6.</strong> Se muestran únicamente como referencia de contexto, según la nota metodológica del archivo fuente (INV-005 / INV-008).</p>
        </div>
        <div className="card-b tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Indicador</th><th>Valor</th><th>Unidad</th><th>Territorio</th><th>Año</th><th>Nivel</th><th>Fuente</th><th>Uso</th></tr>
            </thead>
            <tbody>
              {ctx.map((x) => (
                <tr key={x.id}>
                  <td><strong>{x.indicador}</strong></td>
                  <td className="n">{x.unidad.includes('%') ? fmtPct(x.valor) : fmtInt(x.valor)}</td>
                  <td>{x.unidad}</td>
                  <td>{x.territorio}</td>
                  <td><span className="badge b-ctx">{x.anio ?? 'Año no determinado'}</span></td>
                  <td>{x.nivel}</td>
                  <td className="mono">{x.fuente}</td>
                  <td>{x.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend">
          <div className="legend-item"><span className="badge b-inv">Investigación</span> Datos de la validación exploratoria n=28 (INV-008).</div>
          <div className="legend-item"><span className="badge b-his">Histórico</span> Comuna 6, con año explícito. No vigente.</div>
          <div className="legend-item"><span className="badge b-ctx">Contextual</span> Medellín / Colombia. No es demanda de C6.</div>
          <div className="legend-item"><span className="badge b-gap">Brecha</span> No disponible, no medido o pendiente de validación.</div>
        </div>
      </div>
    </div>
  );
}
