import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EjeTexto from './EjeTexto';
import type { Activo } from '../types';
import BarTip from './BarTip';

const TIP_REG = BarTip({ unit: 'registros' });

function conteo(activos: Activo[], campo: 'tipo_activo' | 'identidad' | 'ingresos' | 'mercados' | 'visibilidad' | 'nivel_evidencia') {
  return Object.entries(
    activos.reduce<Record<string, number>>((a, x) => {
      const k = x[campo] || 'No registrado';
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([name, v]) => ({ name, v }));
}

const GRAFICOS = [
  { campo: 'tipo_activo' as const, titulo: 'Distribución por tipo de oferta', sub: 'Clasificación según el catálogo documentado (INV-003 / INV-006).', color: '#009c6c', nota: 'Solo se muestran los tipos presentes en los registros reales catalogados.' },
  { campo: 'identidad' as const, titulo: 'Valoración de identidad territorial', sub: 'Escala reportada en la investigación.', color: '#00a8d8', nota: '"No medido" corresponde a lo no registrado en la base. No se infiere ni se completa.' },
  { campo: 'ingresos' as const, titulo: 'Generación de ingresos', sub: 'Valoración reportada por la investigación (INV-006).', color: '#00a8d8' },
  { campo: 'visibilidad' as const, titulo: 'Visibilidad digital', sub: 'Valoración reportada por la investigación (INV-006).', color: '#00a8d8' },
];

export default function P2Distribuciones({ activos }: { activos: Activo[] }) {
  return (
    <div className="grid g2">
      {GRAFICOS.map((g) => (
        <div className="card" key={g.campo}>
          <div className="card-h"><h3>{g.titulo}</h3><p>{g.sub}</p></div>
          <div className="card-b" style={{ height: Math.max(240, conteo(activos, g.campo).length * 34 + 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conteo(activos, g.campo)} layout="vertical" margin={{ left: 4, right: 18, top: 4, bottom: 4 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--ink-mute)', fontSize: 11 }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={<EjeTexto />} axisLine={false} tickLine={false} interval={0} />
                <Tooltip content={TIP_REG} cursor={{ fill: 'var(--surface-3)' }} />
                <Bar dataKey="v" fill={g.color} barSize={14} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {g.nota && <div className="chart-note">{g.nota}</div>}
        </div>
      ))}
    </div>
  );
}
