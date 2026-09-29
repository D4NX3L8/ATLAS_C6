/* Lista de resultados del prototipo.
 *
 * Es el único punto donde la búsqueda y la categoría seleccionada se aplican
 * realmente: el resto de filtros del panel lateral son decorativos, igual que
 * en el diseño original. */
import { useState } from 'react';
import { resultados } from './muestras';

interface Props {
  selectedId: number | null; onSelect: (id: number) => void;
  search: string; activeCategory: string;
}

/* Las pastillas de categoría van en plural («Emprendimientos», «Eventos») y las
 * categorías de los datos, en singular («Emprendimiento», «Evento»). El original
 * comparaba con `includes` a secas, de modo que esas dos pastillas no llegaban
 * a filtrar nada. Se comparan sobre la misma raíz, quitando la «s»
 * final: así el plural y el singular casan sin tocar un solo dato de muestra.
 * El plural de «Negocios» se queda como está: aquí no hay «Negocio» que
 * emparejar, es un nombre de categoría, no una forma de contar. */
const raiz = (s: string) => s.toLowerCase().replace(/s$/, '');

export default function ListaResultados({ selectedId, onSelect, search, activeCategory }: Props) {
  const [favs, setFavs] = useState<Set<number>>(new Set());

  const filtrados = resultados.filter((r) => {
    const q = search.toLowerCase();
    const coincideTexto = !search || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    const coincideCategoria = !activeCategory
      || raiz(r.category).includes(raiz(activeCategory))
      || raiz(r.subcategory).includes(raiz(activeCategory));
    return coincideTexto && coincideCategoria;
  });

  function alternarFav(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setFavs((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  return (
    <>
      {/* Encabezado */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
          Resultados <span style={{ fontWeight: 400, color: '#9ca3af' }}>({filtrados.length > 0 ? 156 : 0})</span>
        </span>
        <button style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          Más relevantes
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
        </button>
      </div>

      {/* Tarjetas */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtrados.map((r) => {
          const sel = selectedId === r.id;
          const fav = favs.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              style={{
                display: 'flex', gap: 10, width: '100%', padding: '10px 12px',
                textAlign: 'left',
                background: sel ? '#f0fdf9' : '#fff',
                cursor: 'pointer',
                borderTop: 'none', borderRight: 'none',
                borderBottom: '1px solid #f3f4f6',
                borderLeft: `3px solid ${sel ? '#00c9b1' : 'transparent'}`,
                transition: 'background 0.1s',
              }}
            >
              {/* Miniatura */}
              <img
                src={r.image} alt={r.name}
                style={{ width: 58, height: 58, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />

              {/* Información */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{r.name}</span>
                  <span
                    role="button"
                    aria-label={fav ? `Quitar ${r.name} de favoritos` : `Añadir ${r.name} a favoritos`}
                    onClick={(e) => alternarFav(e, r.id)}
                    style={{ flexShrink: 0, marginTop: 1, cursor: 'pointer', color: fav ? '#ef4444' : '#d1d5db', display: 'flex' }}
                  >
                    <svg width="13" height="13" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </span>
                </div>

                {/* Categoría + subcategoría */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                    background: `${r.catColor}1a`, color: r.catColor,
                  }}>{r.catEmoji} {r.category}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>• {r.subcategory}</span>
                </div>

                {/* Barrio */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
                  <svg width="8" height="8" fill="#9ca3af" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{r.barrio}</span>
                </div>

                {/* Calificación + verificado + distancia */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" fill="#fbbf24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{r.rating}</span>
                    <span style={{ fontSize: 9, color: '#9ca3af' }}>({r.reviews})</span>
                    {r.verified && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, fontWeight: 600, color: '#059669' }}>
                        <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        Verificado
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{r.distance}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
