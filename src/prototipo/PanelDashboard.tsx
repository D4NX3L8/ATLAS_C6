/* Panel de analítica del prototipo: KPIs, dona de oferta y mapa de calor.
 *
 * Todos los números vienen de `muestras`, no de la API: son relleno de la
 * maqueta. El gráfico circular usa Recharts, la misma librería que el resto de
 * ATLAS C6, así que no se añade ninguna dependencia. */
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { kpis, porcionOferta } from './muestras';

/**
 * Degradado radial con grano, para que la rejilla tenga forma de mancha.
 *
 * El grano sale de un hash del índice de la celda, no de `Math.random()`. En el
 * diseño original se sorteaba en cada render, con dos consecuencias: el mapa de
 * calor cambiaba de color cada vez que se seleccionaba otro elemento de la
 * lista, y la impureza hacía que dos ejecuciones dieran imágenes distintas.
 * Como la trama es decorativa, un valor fijo por celda se ve igual y además
 * hace reproducible la captura de la auditoría.
 */
function MapaCalor() {
  const cols = 10, rows = 7;
  const grano = (i: number) => ((i * 2654435761) % 1000) / 1000;
  const celdas = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols, y = Math.floor(i / cols);
    const d = Math.sqrt((x - 4.5) ** 2 + (y - 3) ** 2);
    return Math.min(1, Math.max(0, 1 - d / 4.5) + grano(i) * 0.18);
  });
  const color = (v: number) => (v > 0.68 ? '#ef4444' : v > 0.44 ? '#f97316' : v > 0.24 ? '#fef08a' : '#bbf7d0');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 2, padding: 3, width: '100%', height: '100%' }}>
      {celdas.map((v, i) => <div key={i} style={{ borderRadius: 2, background: color(v), aspectRatio: '1' }} />)}
    </div>
  );
}

export default function PanelDashboard() {
  return (
    <>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>📊</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Dashboard territorial</p>
          <p style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>Datos, mapas y análisis para tomar mejores decisiones.</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
          {kpis.map((s) => (
            <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{s.value}</p>
              <p style={{ fontSize: 8, color: '#16a34a', fontWeight: 600 }}>{s.trend}</p>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Dona */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Oferta por categoría</p>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <PieChart width={110} height={110}>
                <Pie data={porcionOferta} dataKey="value" innerRadius={30} outerRadius={46} paddingAngle={2}>
                  {porcionOferta.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 9, padding: '2px 6px' }} />
              </PieChart>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#111827' }}>1.254</p>
                  <p style={{ fontSize: 8, color: '#9ca3af' }}>registros</p>
                </div>
              </div>
            </div>
            {porcionOferta.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 8, color: '#6b7280' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 8, color: '#6b7280', fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>

          {/* Mapa de calor */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Mapa de calor de actividad</p>
            <div style={{ height: 110, borderRadius: 6, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
              <MapaCalor />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {[['#bbf7d0', 'Baja'], ['#fef08a', 'Media'], ['#ef4444', 'Alta']].map(([bg, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 10, height: 5, borderRadius: 2, background: bg }} />
                  <span style={{ fontSize: 7, color: '#9ca3af' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
