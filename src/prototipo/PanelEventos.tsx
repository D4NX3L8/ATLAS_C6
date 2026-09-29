/* Agenda cultural del prototipo: próximos eventos y calendario.
 *
 * El calendario está fijo en mayo de 2025 con los días marcados a mano, tal
 * como venía en el diseño. Montar un calendario de verdad exigiría saber el
 * año y el mes reales, y aquí no hay ningún dato de la investigación que los
 * fije: inventarlos sería justo lo que el proyecto no permite. */
import { useState } from 'react';
import { eventos } from './muestras';

type Vista = 'proximos' | 'calendario';

export default function PanelEventos() {
  const [tab, setTab] = useState<Vista>('proximos');

  return (
    <>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>🎉</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Eventos y agenda cultural</p>
          <p style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>Conoce lo que pasa en tu territorio.</p>
        </div>
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        {(['proximos', 'calendario'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '6px 4px', fontSize: 10, fontWeight: 500, border: 'none', cursor: 'pointer',
              background: '#fff', color: tab === t ? '#00c9b1' : '#6b7280',
              borderBottom: `2px solid ${tab === t ? '#00c9b1' : 'transparent'}`,
            }}
          >
            {t === 'proximos' ? 'Próximos eventos' : 'Calendario completo'}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {tab === 'proximos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eventos.map((ev) => (
              <button key={ev.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 0' }}>
                <img src={ev.image} alt={ev.name} style={{ width: 44, height: 44, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#111827', lineHeight: 1.3, marginBottom: 2 }}>{ev.name}</p>
                  <p style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4 }}>{ev.date} – {ev.time} · {ev.place}</p>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', background: ev.tagColor, borderRadius: 999, padding: '2px 7px' }}>{ev.tag}</span>
                </div>
              </button>
            ))}
            <button style={{ fontSize: 10, fontWeight: 600, color: '#00c9b1', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 2 }}>
              Ver toda la agenda →
            </button>
          </div>
        ) : (
          <VistaCalendario />
        )}
      </div>
    </>
  );
}

function VistaCalendario() {
  const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const fechas = Array.from({ length: 31 }, (_, i) => i + 1);
  const conEvento = new Set([13, 17, 20, 25, 28]);
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Mayo 2025</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {dias.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {[1, 2, 3].map((i) => <div key={`e${i}`} />)}
        {fechas.map((d) => (
          <div key={d} style={{
            aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', fontSize: 9, fontWeight: conEvento.has(d) ? 700 : 400, cursor: 'pointer',
            background: conEvento.has(d) ? '#00c9b1' : 'transparent',
            color: conEvento.has(d) ? '#fff' : '#374151',
          }}>{d}</div>
        ))}
      </div>
    </div>
  );
}
