/* Encabezado del prototipo: foto panorámica, buscador en lenguaje natural y
 * pastillas de categoría.
 *
 * La foto viene de `public/comuna6.png` —el mismo archivo que ya usa la portada
 * de ATLAS_C6— en vez del `?inline` del standalone, que la empaquetaba como
 * base64 (2,7 MB dentro del bundle). */
import { useState } from 'react';
import { categorias, categoriasPildora } from './muestras';
import { ICONOS } from './iconos';

/* El encabezado usa el rótulo corto («Cultura») mientras el panel lateral usa
 * el completo («Cultura y arte»). El tinte y el color del icono salen siempre de
 * `categorias`, de modo que rótulo, tinte e icono no puedan desincronizarse. */
const PILLS = categoriasPildora.map((p) => {
  const cat = categorias.find((c) => c.id === p.id)!;
  return { id: p.id, label: p.label, bg: cat.bg, color: cat.fill, svg: ICONOS[p.id] };
});

interface Props {
  search: string; onSearch: (v: string) => void;
  activeCategory: string; onCategory: (id: string) => void;
}

export default function Cabecera({ search, onSearch, activeCategory, onCategory }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── Foto panorámica ── */}
      <img
        src="/comuna6.png"
        alt="Panorámica de la Comuna 6, Medellín"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 38%',
        }}
      />

      {/* ── Degradado ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.62) 100%)',
      }} />

      {/* ── Arriba a la derecha: campana + usuario ── */}
      <div style={{
        position: 'absolute', top: 10, right: 14,
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 2,
      }}>
        <button aria-label="Notificaciones" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>
          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
        </button>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#00c9b1,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>SJ</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>Sebastian Jaramillo</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', lineHeight: 1 }}>Usuario</p>
        </div>
      </div>

      {/* ── Lema en la esquina ── */}
      <div style={{ position: 'absolute', bottom: 38, right: 14, textAlign: 'right', zIndex: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          La Comuna 6<br />se vive, se emprende,<br />se comparte
        </p>
        <div style={{ height: 2, width: 36, background: '#00c9b1', borderRadius: 2, marginTop: 4, marginLeft: 'auto' }} />
      </div>

      {/* ── Contenido centrado ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 6, paddingBottom: 2,
        paddingLeft: 24, paddingRight: 24,
        gap: 10,
      }}>
        {/* Título */}
        <h1 style={{
          margin: 0,
          fontSize: 19, fontWeight: 700, color: '#fff',
          textAlign: 'center', lineHeight: 1.3,
          textShadow: '0 1px 6px rgba(0,0,0,0.4)',
        }}>
          Hola, ¿qué quieres descubrir hoy en la <span style={{ color: '#00c9b1' }}>Comuna 6</span>?
        </h1>

        {/* Buscador */}
        <div style={{
          display: 'flex', alignItems: 'center',
          width: '100%', maxWidth: 720,
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          outline: focused ? '2px solid #00c9b1' : '2px solid transparent',
          transition: 'outline 0.12s',
        }}>
          <svg style={{ flexShrink: 0, marginLeft: 14, color: '#9ca3af' }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            aria-label="Buscar en la Comuna 6"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder='Escribe lo que necesitas... (ej. "cafés con música en vivo", "talleres de arte", "servicios de salud")'
            style={{
              flex: 1, minWidth: 0, border: 'none', background: 'transparent',
              outline: 'none', fontSize: 12, color: '#374151',
              padding: '10px 10px',
            }}
          />
          <button aria-label="Buscar" style={{
            flexShrink: 0, margin: 6, width: 30, height: 30,
            borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pastillas de categoría */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {PILLS.map((p) => {
            const on = activeCategory === p.id;
            return (
              <button
                key={p.id}
                aria-pressed={on}
                onClick={() => onCategory(on ? '' : p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  paddingLeft: 4, paddingRight: 10, paddingTop: 3, paddingBottom: 3,
                  borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: on ? '#00c9b1' : 'rgba(255,255,255,0.95)',
                  color: on ? '#fff' : '#1f2937',
                  fontSize: 11, fontWeight: 600,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
                  transition: 'background 0.12s',
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: on ? 'rgba(255,255,255,0.22)' : p.bg,
                }}>
                  <svg width="12" height="12" fill={on ? '#fff' : p.color} viewBox="0 0 24 24">{p.svg}</svg>
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
