/* Lienzo del prototipo: el shell de la aplicación, a tamaño fijo.
 *
 * El diseño de Figma se midió sobre 1344×896, así que los anchos de panel son
 * números fijos en píxeles y el único elemento elástico es el mapa. Eso obliga
 * a que el lienzo conserve sus dimensiones: quien lo monta (Prototipo.tsx) lo
 * escala con un transform para que entre en el marco sin deformar el diseño.
 *
 * Por eso aquí no hay 100vh/100vw —eso era del standalone, que ocupaba la
 * ventana entera— sino 100% del marco que lo contiene.
 */

import { useState, lazy, Suspense } from 'react';
import BarraLateral from './BarraLateral';
import Cabecera from './Cabecera';
import PanelFiltros from './PanelFiltros';
import ListaResultados from './ListaResultados';
import PanelDetalle from './PanelDetalle';
import ChatInteligente from './ChatInteligente';
import PanelDashboard from './PanelDashboard';
import PanelEventos from './PanelEventos';
import TarjetaPromo from './TarjetaPromo';

/** Medidas de referencia del diseño. La vista que monta el lienzo las usa para escalarlo. */
export const LIENZO_W = 1344;
export const LIENZO_H = 896;

const PanelMapa = lazy(() => import('./PanelMapa'));

// ── Constantes de layout (medidas sobre la referencia de 1344×896) ─────────────
const HERO_H = 188; // alto del encabezado
const BOT_H = 255; // alto de la franja inferior
const G = 6; // separación entre paneles
const PAD = 6; // margen exterior del área de paneles

const FILTER_W = 192; // panel de filtros
const RESULTS_W = 298; // lista de resultados
const DETAIL_W = 318; // panel de detalle
const PROMO_W = 312; // tarjeta promocional

/** Superficie de un panel: tarjeta blanca con borde y sombra suave. */
const TARJETA = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
} as const;

export default function Lienzo() {
  const [nav, setNav] = useState('inicio');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCat] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div data-lienzo="" style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#eef0f4',
    }}>

      {/* ══ BARRA LATERAL ═══════════════════════════════════════════════════ */}
      <BarraLateral active={nav} onNav={setNav} />

      {/* ══ COLUMNA PRINCIPAL ══════════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── ENCABEZADO ──────────────────────────────────────────────────── */}
        <div data-panel="cabecera" style={{ height: HERO_H, flexShrink: 0 }}>
          <Cabecera
            search={search}
            onSearch={setSearch}
            activeCategory={activeCategory}
            onCategory={setActiveCat}
          />
        </div>

        {/* ── FRANJA CENTRAL ──────────────────────────────────────────────── */}
        <div style={{
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          gap: G,
          padding: PAD,
          paddingBottom: G / 2,
        }}>

          {/* Filtros */}
          <div data-panel="filtros" style={{ width: FILTER_W, flexShrink: 0, overflowY: 'auto', padding: 10, ...TARJETA }}>
            <PanelFiltros activeCategory={activeCategory} onCategory={setActiveCat} />
          </div>

          {/* Mapa */}
          <div data-panel="mapa" style={{
            flex: '1 1 0',
            minWidth: 0,
            position: 'relative',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: 13 }}>
                Cargando mapa…
              </div>
            }>
              <PanelMapa selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>

            {/* Conmutador de vista, arriba de los controles de Leaflet */}
            <div style={{
              position: 'absolute', bottom: 10, left: 10, zIndex: 1000,
              display: 'flex', borderRadius: 8, overflow: 'hidden',
              border: '1px solid #d1d5db', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}>
              {(['list', 'map'] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: viewMode === m ? '#1a1d2e' : '#fff',
                  color: viewMode === m ? '#fff' : '#6b7280',
                  border: 'none',
                }}>
                  {m === 'list'
                    ? <><svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>Listado</>
                    : <><svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>Mapa</>}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          <div data-panel="resultados" style={{ width: RESULTS_W, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <ListaResultados
              selectedId={selectedId}
              onSelect={setSelectedId}
              search={search}
              activeCategory={activeCategory}
            />
          </div>

          {/* Detalle */}
          <div data-panel="detalle" style={{ width: DETAIL_W, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <PanelDetalle selectedId={selectedId} />
          </div>
        </div>

        {/* ── FRANJA INFERIOR ─────────────────────────────────────────────── */}
        <div style={{
          height: BOT_H, flexShrink: 0,
          display: 'flex',
          gap: G,
          padding: `${G / 2}px ${PAD}px ${PAD}px ${PAD}px`,
        }}>

          {/* Chat */}
          <div data-panel="chat" style={{ flex: '1.3 1 0', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <ChatInteligente />
          </div>

          {/* Dashboard */}
          <div data-panel="dashboard" style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <PanelDashboard />
          </div>

          {/* Eventos */}
          <div data-panel="eventos" style={{ flex: '1.1 1 0', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <PanelEventos />
          </div>

          {/* Promocional */}
          <div data-panel="promo" style={{ width: PROMO_W, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...TARJETA }}>
            <TarjetaPromo />
          </div>
        </div>

      </div>
    </div>
  );
}
