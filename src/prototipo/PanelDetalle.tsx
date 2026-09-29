/* Panel de detalle del prototipo: ficha del elemento seleccionado. */
import { useState } from 'react';
import { resultados } from './muestras';

interface Props { selectedId: number | null }

export default function PanelDetalle({ selectedId }: Props) {
  const item = resultados.find((r) => r.id === selectedId) ?? resultados[0];
  const [fav, setFav] = useState(false);

  return (
    <>
      {/* Imagen */}
      <div style={{ position: 'relative', height: 128, flexShrink: 0 }}>
        <img src={item.detailImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Volver */}
        <button aria-label="Volver" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          <svg width="11" height="11" fill="none" stroke="#374151" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {/* Acciones arriba a la derecha */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'} aria-pressed={fav} onClick={() => setFav((v) => !v)} style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            <svg width="12" height="12" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : '#6b7280'} strokeWidth={1.8} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </button>
          <button aria-label="Compartir" style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            <svg width="11" height="11" fill="none" stroke="#6b7280" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 6px 12px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 5 }}>{item.name}</h2>

        {/* Categoría + subcategoría */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: `${item.catColor}1a`, color: item.catColor }}>
            {item.catEmoji} {item.category}
          </span>
          <span style={{ fontSize: 9, color: '#9ca3af' }}>• {item.subcategory}</span>
        </div>

        {/* Calificación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <svg width="12" height="12" fill="#fbbf24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{item.rating}</span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>({item.reviews} reseñas)</span>
          {item.verified && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 600, color: '#059669' }}>
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              Verificado
            </span>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>{item.description}</p>

        {/* Fichas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Fila icono="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" etiqueta="Dirección" valor={item.address} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" fill="#9ca3af" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
            <div>
              <p style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>Contacto</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#111827', fontWeight: 500 }}>{item.phone}</span>
                <button style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#25d366', border: 'none', borderRadius: 999, padding: '2px 7px', cursor: 'pointer' }}>WhatsApp</button>
              </div>
            </div>
          </div>
          <Fila icono="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" etiqueta="Horario" valor={item.schedule} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" fill="#9ca3af" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
            <div>
              <p style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4 }}>Redes</p>
              <div style={{ display: 'flex', gap: 5 }}>
                {item.social.instagram && <BotonRed color="#e1306c" l="IG" />}
                {item.social.facebook && <BotonRed color="#1877f2" l="FB" />}
                {item.social.youtube && <BotonRed color="#ff0000" l="YT" />}
              </div>
            </div>
          </div>
          <Fila icono="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" etiqueta="Fuente" valor={item.source} />
          <Fila icono="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" etiqueta="Última actualización" valor={item.updated} />
        </div>
      </div>

      {/* Acciones */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#00c9b1', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5z" /></svg>
          Ver en el mapa
        </button>
        <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Compartir
        </button>
      </div>
    </>
  );
}

function Fila({ icono, etiqueta, valor }: { icono: string; etiqueta: string; valor: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" fill="#9ca3af" viewBox="0 0 24 24"><path d={icono} /></svg>
      <div>
        <p style={{ fontSize: 9, color: '#9ca3af', marginBottom: 1 }}>{etiqueta}</p>
        <p style={{ fontSize: 11, color: '#111827', fontWeight: 500, lineHeight: 1.4 }}>{valor}</p>
      </div>
    </div>
  );
}

function BotonRed({ color, l }: { color: string; l: string }) {
  return <button aria-label={l} style={{ width: 18, height: 18, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', fontSize: 7, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l}</button>;
}
