import { useMemo, useState } from 'react';
import { Info, Map as MapIcon, Building2, TriangleAlert } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { BARRIOS, C, COMUNA, contarPorBarrio } from '../mapa/datos';
import geo from '../data/comuna6.geo.json';
import MapaGoogle from './MapaGoogle';
import MapaLeaflet from './MapaLeaflet';
import type { Activo } from '../types';

type Vista = 'ciudad' | 'comuna';

type Props = { activos: Activo[]; loading: boolean };

export default function P2MapaTerritorial({ activos, loading }: Props) {
  const [vista, setVista] = useState<Vista>('ciudad');

  const conteo = useMemo(() => contarPorBarrio(activos), [activos]);

  const total = conteo.c.size;
  const enComuna = vista === 'comuna';
  const google = useGoogleMaps();
  // Google Maps es el motor preferido; Leaflet entra solo si la clave falta o falla.
  const motor: 'google' | 'leaflet' = google.estado === 'listo' ? 'google' : 'leaflet';

  return (
    <div className="card">
      <div className="card-h">
        <Info size={17} className="ic" aria-hidden="true" />
        <div>
          <h3>Distribución territorial de la oferta</h3>
          <p>
            {enComuna ? (
              <>
                Límite oficial de la {COMUNA.identificacion} «{COMUNA.nombre}» con sus{' '}
                {BARRIOS.length} barrios. En verde, los barrios nombrados en el campo «Ubicación» de
                los registros catalogados.
              </>
            ) : (
              <>
                La {COMUNA.identificacion} «{COMUNA.nombre}» resaltada dentro de Medellín, con
                sus {BARRIOS.length} barrios trazados y el resto de la ciudad como contexto.
                Sustituye al mapa general: encajar las 16 comunas reduciría la zona de estudio
                a un punto ilegible.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mapa-vista" role="group" aria-label="Nivel de detalle del mapa">
        <button
          className={vista === 'ciudad' ? 'on' : ''}
          aria-pressed={vista === 'ciudad'}
          onClick={() => setVista('ciudad')}
        >
          <MapIcon size={14} aria-hidden="true" /> Ciudad
        </button>
        <button
          className={vista === 'comuna' ? 'on' : ''}
          aria-pressed={vista === 'comuna'}
          onClick={() => setVista('comuna')}
        >
          <Building2 size={14} aria-hidden="true" /> {COMUNA.identificacion}
        </button>
      </div>

      <div className="card-b">
        <div className="mapa-wrap">
          {motor === 'google' ? (
            <MapaGoogle vista={vista} activos={activos} />
          ) : (
            <MapaLeaflet vista={vista} activos={activos} />
          )}

          {google.estado === 'error' && (
            <p className="mapa-aviso" role="status">
              <TriangleAlert size={14} aria-hidden="true" /> No se pudo cargar Google Maps
              {google.error ? `: ${google.error}` : '.'} Se muestra el motor de respaldo.
            </p>
          )}

          <div className="mapa-side">
            <div className="mapa-stats">
              <div>
                <strong>{(COMUNA.area_m2 / 1e6).toFixed(2)} km²</strong>
                <span>superficie</span>
              </div>
              <div>
                <strong>{(COMUNA.perimetro_m / 1000).toFixed(1)} km</strong>
                <span>perímetro</span>
              </div>
              <div>
                <strong>
                  {total}
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>/{BARRIOS.length}</span>
                </strong>
                <span>barrios con registro</span>
              </div>
            </div>

            <div className="mapa-detail">
              <h4>{total > 0 ? 'Barrios con registro' : 'Sin correspondencia'}</h4>
              {total > 0 ? (
                <p>
                  {BARRIOS.filter((b) => conteo.c.has(b.codigo)).map((b) => (
                    <span key={b.codigo}>«{b.nombre}» </span>
                  ))}
                  , por el texto registrado en «Ubicación».
                </p>
              ) : (
                <p>Ningún registro nombra un barrio oficial de forma exacta.</p>
              )}
            </div>
          </div>
        </div>

        <div className="legend">
          {enComuna ? (
            <>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'rgba(0,168,108,0.55)', borderColor: C.c6.borde }} />
                Barrio nombrado en «Ubicación»
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'rgba(127,191,214,0.14)', borderColor: C.c6Suave.borde }} />
                Barrio sin registro que lo nombre
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'transparent', borderColor: C.limite, borderWidth: 2 }} />
                Límite de la Comuna 6
              </div>
            </>
          ) : (
            <>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'rgba(0,168,108,0.65)', borderColor: C.c6.borde, borderWidth: 2 }} />
                Comuna 6 «Doce de Octubre» · zona de estudio
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'transparent', borderColor: C.c6.borde, borderStyle: 'dashed' }} />
                Límite de los 12 barrios
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: 'rgba(127,191,214,0.1)', borderColor: C.c6Suave.borde }} />
                Comunas vecinas
              </div>
            </>
          )}
        </div>

        <div className="pend pend-inline">
          <div className="ic">📍</div>
          <div>
            <h4>Georreferenciación pendiente</h4>
            <p>
              El mapa muestra el <strong>territorio</strong>, no la ubicación puntual de los{' '}
              {activos.length} activos. El catálogo no registra coordenadas ni direcciones verificables
              (INV-007), por lo que <strong>no se dibujan marcadores</strong>: hacerlo sería inventar
              ubicaciones.
            </p>
            {!loading && conteo.sinCruce.length > 0 && (
              <p className="mapa-nomatch">
                <strong>Ubicaciones sin correspondencia exacta con un barrio oficial ({conteo.sinCruce.length}):</strong>{' '}
                {Array.from(new Set(conteo.sinCruce)).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <p className="mapa-src">
          Geometría: {geo.fuente}, servicio <code>{geo.servicio}</code> — capas {geo.capas.join(' y ')}.
          {geo.crs}. Límite con actualización{' '}
          {COMUNA.fecha_actualizacion.split('-').reverse().join('/')}, simplificado para web. El contexto
          de ciudad usa la misma capa 1 del servicio (16 comunas).{' '}
          {motor === 'google'
            ? 'Cartografía base © Google Maps.'
            : 'Cartografía base © OpenStreetMap © CARTO.'}{' '}
          El límite es administrativo: no representa el área de influencia de ningún activo.
        </p>
      </div>
    </div>
  );
}
