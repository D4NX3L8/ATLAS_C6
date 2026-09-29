/* Panel de filtros del prototipo: categorías y cuatro desplegables.
 *
 * Las categorías salen de `muestras.categorias`, la misma lista que alimenta
 * las pastillas del encabezado: en el standalone cada componente repetía la suya
 * y era cuestión de tiempo que una se desincronizara de la otra. */
import { useState } from 'react';
import { barrios, categorias } from './muestras';
import { ICONOS } from './iconos';
const FILTROS = [
  { label: 'Barrio', opts: barrios },
  { label: 'Tipo de oferta', opts: ['Todos los tipos', 'Talleres', 'Cafeterías', 'Salud', 'Moda', 'Eventos'] },
  { label: 'Disponibilidad', opts: ['Todos', 'Abierto ahora', 'Esta semana', 'Este mes'] },
  { label: 'Precio', opts: ['Todos', 'Gratuito', '$', '$$', '$$$'] },
];

const TODOS = FILTROS.map((f) => f.opts[0]);

interface Props { activeCategory: string; onCategory: (id: string) => void }

export default function PanelFiltros({ activeCategory, onCategory }: Props) {
  const [vals, setVals] = useState(TODOS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Categorías ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
          Explora por categorías
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {categorias.map((c) => {
            const on = activeCategory === c.id;
            return (
              <button
                key={c.id}
                aria-pressed={on}
                onClick={() => onCategory(on ? '' : c.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 4px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: on ? c.bg : 'transparent',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: c.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" fill={c.fill} viewBox="0 0 24 24">{ICONOS[c.id]}</svg>
                  </div>
                  <span style={{ fontSize: 11, color: '#374151', fontWeight: on ? 600 : 400 }}>{c.label}</span>
                </div>
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>+{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filtros ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Filtros</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {FILTROS.map((f, i) => (
            <div key={f.label}>
              <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 3, fontWeight: 500 }}>{f.label}</p>
              <div style={{ position: 'relative' }}>
                <select
                  aria-label={f.label}
                  value={vals[i]}
                  onChange={(e) => setVals((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  style={{
                    width: '100%', fontSize: 11, color: '#374151',
                    border: '1px solid #e5e7eb', borderRadius: 7,
                    padding: '5px 22px 5px 8px',
                    background: '#fff', appearance: 'none', cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="10" height="10" fill="#9ca3af" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setVals(TODOS); onCategory(''); }}
          style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
