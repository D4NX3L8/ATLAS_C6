/* Barra lateral del prototipo: navegación de la maqueta.
 *
 * El logo se toma de `public/logo-atlas-c6-dark.png`, que es el mismo archivo
 * que ya usa la barra superior de ATLAS_C6. En el standalone venía importado
 * con `?inline`, que lo convertía en un base64 dentro del bundle (241 kB por
 * imagen, y la foto del encabezado son 2,7 MB); desde `public/` lo sirve el
 * navegador y no entra en el paquete. */

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { id: 'explorar', label: 'Explorar', icon: null }, // círculo+ mango, se dibuja aparte
  { id: 'mapa', label: 'Mapa', icon: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z' },
  { id: 'territorio', label: 'Mi territorio', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
  { id: 'favoritos', label: 'Favoritos', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { id: 'perfil', label: 'Mi perfil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
];

function NavIcon({ id, path }: { id: string; path: string | null }) {
  if (id === 'explorar') {
    return (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
      <path d={path!} />
    </svg>
  );
}

interface Props {
  active: string;
  onNav: (id: string) => void;
}

export default function BarraLateral({ active, onNav }: Props) {
  return (
    <aside data-panel="lateral" style={{
      width: 176,
      flexShrink: 0,
      height: '100%',
      background: '#1a1d2e',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '14px 14px 8px 14px' }}>
        <img
          src="/logo-atlas-c6-dark.png"
          alt="ATLAS C6, Sistema Inteligente de Identidad Territorial"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      {/* ── Navegación ── */}
      <nav style={{ flex: 1 }}>
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 16px',
                background: on ? '#00c9b1' : 'transparent',
                color: on ? '#ffffff' : 'rgba(255,255,255,0.58)',
                border: 'none', cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.12s',
              }}
            >
              <span style={{ flexShrink: 0, opacity: on ? 1 : 0.7, display: 'flex' }}>
                <NavIcon id={item.id} path={item.icon} />
              </span>
              <span style={{ fontSize: 13, fontWeight: on ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Pie / marca ── */}
      <div style={{
        padding: '10px 14px 14px 14px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Ilustración de montaña y árboles */}
        <svg width="100%" height="52" viewBox="0 0 148 55" preserveAspectRatio="xMidYMid meet" fill="none" style={{ marginBottom: 6 }}>
          <polygon points="74,6 116,52 32,52" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2" fill="rgba(255,255,255,0.03)" />
          <polygon points="110,18 136,52 84,52" fill="rgba(255,255,255,0.04)" />
          <polygon points="74,12 104,52 44,52" fill="rgba(0,201,177,0.10)" />
          <polygon points="26,52 31,40 36,52" fill="rgba(0,201,177,0.42)" />
          <rect x="30" y="52" width="3" height="4" fill="rgba(0,201,177,0.28)" />
          <polygon points="112,52 117,40 122,52" fill="rgba(0,201,177,0.42)" />
          <rect x="116" y="52" width="3" height="4" fill="rgba(0,201,177,0.28)" />
          <polygon points="12,52 16,44 20,52" fill="rgba(0,201,177,0.28)" />
          <polygon points="128,52 132,44 136,52" fill="rgba(0,201,177,0.28)" />
        </svg>

        <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 1 }}>Comuna 6</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>Medellín</p>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)', lineHeight: 1.5 }}>
          Gente, cultura y territorio<br />en un solo lugar
        </p>
      </div>
    </aside>
  );
}
