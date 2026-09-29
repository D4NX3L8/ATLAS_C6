import type { CampoCalidad } from '../types';
import { fmtPct } from '../utils';

type Props = { campos: CampoCalidad[] };

type Estado = 'calculado' | 'no-medido' | 'no-disponible' | 'pendiente';

const INDICADORES: { campo: string; label: string; estado: Estado; nota: string }[] = [
  { campo: 'Fuente', label: '% con fuente identificada', estado: 'calculado', nota: 'Todos los registros del catálogo declaran origen (INV-003 / INV-006).' },
  { campo: 'Nombre', label: '% con nombre', estado: 'calculado', nota: 'Obligatorio en el esquema. Sin registros incompletos.' },
  { campo: 'Coordenadas', label: '% georreferenciados', estado: 'no-medido', nota: 'El catálogo no incluye coordenadas. Brecha de georreferenciación.' },
  { campo: 'Fecha de verificación', label: '% con fecha de verificación', estado: 'no-disponible', nota: 'No existe campo de fecha de verificación en la base entregada.' },
  { campo: 'Nivel de confianza', label: '% con nivel de confianza', estado: 'no-disponible', nota: 'No existe campo de nivel de confianza por registro.' },
  { campo: 'Estado del registro', label: '% con estado verificado', estado: 'pendiente', nota: 'La base documenta nivel de evidencia, no estado de verificación por registro.' },
];

const ESTILO: Record<Estado, { txt: string; cls: string }> = {
  calculado: { txt: 'Calculado', cls: 'b-inv' },
  'no-medido': { txt: 'No medido', cls: 'b-gap' },
  'no-disponible': { txt: 'No disponible', cls: 'b-gap' },
  pendiente: { txt: 'Pendiente de validación', cls: 'b-gap' },
};

export default function P3Trazabilidad({ campos }: Props) {
  const tiene = (c: string) => campos.some((x) => x.campo === c);

  return (
    <div className="card">
      <div className="card-h">
        <h3>Completitud y trazabilidad de los indicadores</h3>
        <p>Conforme a la vista 3 de la guía visual: calcular desde catálogo, y marcar como "No medido" / "No disponible" / "Pendiente de verificación" lo que la base no contiene. <strong>La cobertura no equivale a un censo.</strong></p>
      </div>

      <div className="card-b">
        <div className="grid g3" style={{ gap: 12 }}>
          {INDICADORES.map((i) => {
            const s = ESTILO[i.estado];
            const esCampo = tiene(i.campo);
            return (
              <div key={i.campo} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 650 }}>
                  {i.label}
                </div>
                {i.estado === 'calculado' ? (
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', margin: '6px 0 4px' }}>{fmtPct(100, 0)}</div>
                ) : (
                  <div className="kpi-nm" style={{ fontSize: 20, margin: '10px 0 6px' }}>{s.txt}</div>
                )}
                <span className={`badge ${s.cls}`}>{s.txt}</span>
                {!esCampo && (
                  <div style={{ fontSize: 11, color: 'var(--amber-700)', marginTop: 8 }}>
                    Campo "{i.campo}" no existe en la base de origen.
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>{i.nota}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--green-600)' }} /> Calculado desde el catálogo</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--amber-600)' }} /> No medido / No disponible / Pendiente de validación</div>
      </div>
    </div>
  );
}
