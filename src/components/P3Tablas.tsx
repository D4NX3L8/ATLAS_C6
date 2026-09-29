import { Radio, AlertTriangle, ClipboardCheck } from 'lucide-react';
import Acordeon from './Acordeon';
import type { Canal, Brecha, CampoCalidad } from '../types';

export default function P3Tablas({ canales, brechas, campos }: { canales: Canal[]; brechas: Brecha[]; campos: CampoCalidad[] }) {
  return (
    <div className="stack">
      <Acordeon
        titulo="A. Canales y fuentes de descubrimiento identificados"
        ic={Radio}
        n={canales.length}
        abiertoPorDefecto
      >
        <p className="bar-desc" style={{ marginBottom: 10 }}>
          Tipo, cobertura reportada, información disponible, limitación y estado para ATLAS_C6
          (INV-002/004/005/007/008).
        </p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Canal / fuente</th><th>Tipo</th><th>Cobertura C6</th><th>Tipo de oferta</th><th>Información disponible / función</th><th>Limitación identificada</th><th>Fuente / investigación</th><th>Estado para ATLAS_C6</th></tr></thead>
            <tbody>
              {canales.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.canal}</strong></td>
                  <td>{c.tipo}</td>
                  <td>{c.cobertura}</td>
                  <td>{c.tipo_oferta}</td>
                  <td>{c.informacion}</td>
                  <td>{c.limitacion}</td>
                  <td className="mono">{c.fuente}</td>
                  <td>{c.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Acordeon>

      <Acordeon titulo="B. Brechas de información documentadas" ic={AlertTriangle} n={brechas.length}>
        <p className="bar-desc" style={{ marginBottom: 10 }}>
          Una brecha no equivale a cero. No se infieren valores a partir de otros territorios.
        </p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Variable / dato faltante</th><th>Territorio</th><th>Estado</th><th>Implicación para el dashboard</th><th>Fuente / investigación</th><th>Tipo</th></tr></thead>
            <tbody>
              {brechas.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.variable}</strong></td>
                  <td>{b.territorio}</td>
                  <td>{b.estado}</td>
                  <td>{b.implicacion}</td>
                  <td className="mono">{b.fuente}</td>
                  <td><span className="badge b-gap">{b.tipo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Acordeon>

      <Acordeon titulo="C. Campos de calidad y trazabilidad por registro" ic={ClipboardCheck} n={campos.length}>
        <p className="bar-desc" style={{ marginBottom: 10 }}>
          Qué permite medir, prioridad, origen y aplicación en el dashboard (INV-007).
        </p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Campo</th><th>Qué permite medir</th><th>Prioridad</th><th>Origen</th><th>Aplicación en el dashboard</th></tr></thead>
            <tbody>
              {campos.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.campo}</strong></td>
                  <td>{c.mide}</td>
                  <td><span className="badge b-plain">{c.prioridad}</span></td>
                  <td className="mono">{c.origen}</td>
                  <td>{c.aplicacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Acordeon>
    </div>
  );
}
