/* Tarjeta promocional del prototipo: maqueta del teléfono y resumen de
 * capacidades. Es una pieza puramente gráfica, sin estado ni datos. */

const VENTAJAS = [
  'Información confiable y verificada',
  'Búsqueda en lenguaje natural',
  'Mapa interactivo',
  'Datos y análisis territoriales',
  'Conexión con usuarios y mercados',
];

export default function TarjetaPromo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Zona oscura: maqueta del teléfono */}
      <div style={{ flex: 1, position: 'relative', background: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Resplandor de fondo */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 55%, rgba(0,201,177,0.18) 0%, transparent 65%)' }} />

        {/* Teléfono */}
        <div style={{
          position: 'relative', width: 88, height: 148,
          background: '#fff', borderRadius: 14,
          border: '2px solid rgba(255,255,255,0.14)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          transform: 'rotate(-4deg) translateY(6px)',
        }}>
          {/* Barra de estado */}
          <div style={{ background: '#1a1d2e', height: 15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
            <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>13:01</span>
            <div style={{ width: 14, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
          </div>

          {/* Contenido de la app */}
          <div style={{ padding: 6 }}>
            {/* Logotipo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
              <svg width="9" height="7" viewBox="0 0 36 29" fill="none">
                <polygon points="18,3 33,27 3,27" stroke="#00c9b1" strokeWidth="3" fill="none" />
                <polygon points="10,27 15,18 20,27" fill="#00c9b1" />
              </svg>
              <span style={{ fontSize: 6, fontWeight: 900, color: '#111' }}>ATLAS<span style={{ color: '#00c9b1' }}>_C6</span></span>
            </div>

            {/* Buscador */}
            <div style={{ background: '#f3f4f6', borderRadius: 999, padding: '3px 7px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#d1d5db' }} />
              <span style={{ fontSize: 5, color: '#9ca3af' }}>Busca en la Comuna 6...</span>
            </div>

            {/* Rejilla de iconos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3, marginBottom: 6 }}>
              {['🏪', '🎨', '⚙️', '🗺️'].map((e) => (
                <div key={e} style={{ aspectRatio: '1', background: '#f3f4f6', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{e}</div>
              ))}
            </div>

            {/* Mapa */}
            <div style={{ height: 48, background: 'linear-gradient(135deg,#bfdbfe,#a7f3d0)', borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 8, opacity: 0.5 }}>● ●</span>
              </div>
              <span style={{ position: 'absolute', bottom: 2, left: 3, fontSize: 5, fontWeight: 700, color: '#2563eb' }}>Comuna 6</span>
            </div>
          </div>

          {/* Navegación inferior */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-around', padding: '2px 0' }}>
            {['🏠', '🗺️', '❤️', '👤'].map((e) => <span key={e} style={{ fontSize: 9 }}>{e}</span>)}
          </div>
        </div>

        {/* Lema */}
        <div style={{ position: 'absolute', bottom: 8, right: 10, textAlign: 'right' }}>
          <p style={{ fontSize: 8, fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>La Comuna 6<br />en tus manos</p>
        </div>
      </div>

      {/* Zona blanca: descripción */}
      <div style={{ background: '#fff', padding: '10px 12px', flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: '#111827', marginBottom: 3 }}>ATLAS_C6</p>
        <p style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, marginBottom: 7 }}>
          Una plataforma inteligente para conectar personas, territorio y oportunidades.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {VENTAJAS.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" fill="#00c9b1" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              <span style={{ fontSize: 9, color: '#374151' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
