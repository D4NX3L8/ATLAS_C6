import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTema } from '../hooks/useTema';
import {
  BARRIOS, C, CENTRO, COMUNA, UNIDADES, aLatLng, contarPorBarrio,
  type Anillo,
} from '../mapa/datos';
import type { Activo } from '../types';

type Vista = 'ciudad' | 'comuna';

type Props = { vista: Vista; activos: Activo[] };

/** Leaflet usa [lat, lng]; el GeoJSON viene en [lng, lat]. */
const limites = (anillos: Anillo[]) => L.latLngBounds(anillos.flatMap(aLatLng));

const TILES = {
  claro: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  oscuro: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const ATRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &middot; ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Amplía los límites desde su centro. Es lo que permite ver la Comuna 6 resaltada
 * *y* el entorno: encajar solo la 6 la deja tan grande que no hay ciudad alrededor,
 * y encajar las 16 comunas la reduce a una mancha diminuta.
 */
function expandir(bounds: L.LatLngBounds, factor: number): L.LatLngBounds {
  const c = bounds.getCenter();
  const dLat = (bounds.getNorth() - bounds.getSouth()) / 2;
  const dLng = (bounds.getEast() - bounds.getWest()) / 2;
  return L.latLngBounds(
    [c.lat - dLat * factor, c.lng - dLng * factor],
    [c.lat + dLat * factor, c.lng + dLng * factor],
  );
}

function Encuadrar({ anillos, pad, factor = 1 }: { anillos: Anillo[]; pad: number; factor?: number }) {
  const map = useMap();
  useEffect(() => {
    const b = limites(anillos);
    map.fitBounds(factor === 1 ? b : expandir(b, factor), { padding: [pad, pad] });
  }, [map, anillos, pad, factor]);
  return null;
}

/**
 * Motor Leaflet. Es el respaldo cuando no hay clave de Google Maps: mismo
 * territorio, mismo conteo y mismos rótulos, distinto fondo.
 */
export default function MapaLeaflet({ vista, activos }: Props) {
  const { tema } = useTema();
  const enComuna = vista === 'comuna';
  const { c: conteo } = contarPorBarrio(activos);

  const otros = UNIDADES.filter((u) => u.codigo !== COMUNA.codigo);
  const c6 = UNIDADES.find((u) => u.codigo === COMUNA.codigo);

  return (
    <div className="mapa-leaf">
      <MapContainer
        center={[CENTRO.lat, CENTRO.lng]}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        aria-label={enComuna ? `Mapa de la ${COMUNA.identificacion}` : 'Mapa de Medellín con la Comuna 6 resaltada'}
      >
        <TileLayer key={tema} url={TILES[tema]} attribution={ATRIB} maxZoom={19} detectRetina />

        {enComuna ? (
          <>
            <Encuadrar anillos={COMUNA.anillos} pad={18} />
            {BARRIOS.map((b) => {
              const n = conteo.get(b.codigo) ?? 0;
              return (
                <Polygon
                  key={b.codigo}
                  positions={b.anillos.map(aLatLng)}
                  pathOptions={{
                    color: n > 0 ? C.c6.borde : C.c6Suave.borde,
                    weight: n > 0 ? 2.5 : 1.2,
                    fillColor: n > 0 ? C.c6.relleno : C.c6Suave.relleno,
                    fillOpacity: n > 0 ? 0.55 : 0.14,
                  }}
                >
                  <Tooltip sticky direction="top">
                    <b>{b.nombre}</b>
                    <br />
                    {n > 0
                      ? `${n} registro${n === 1 ? '' : 's'} lo nombra`
                      : 'Sin registro que lo nombre'}
                  </Tooltip>
                </Polygon>
              );
            })}
            {COMUNA.anillos.map((a, i) => (
              <Polygon
                key={`c${i}`}
                positions={aLatLng(a)}
                pathOptions={{ color: C.limite, weight: 3, fill: false }}
                interactive={false}
              />
            ))}
          </>
        ) : (
          <>
            {/* Encuadre sobre la Comuna 6, no sobre las 16 comunas: así la 6 se lee
                como zona de estudio y aun así queda ciudad alrededor.
                Ojo al signo: `expandir` multiplica los límites, así que un factor
                mayor aleja el mapa. Medido: 2.4 dejaba la comuna en el 32 % de la
                altura del visor y 5.4 en el 16 %. */}
            <Encuadrar anillos={COMUNA.anillos} pad={8} factor={1.15} />
            {otros.map((u) => (
              <Polygon
                key={u.codigo}
                positions={u.anillos.map(aLatLng)}
                pathOptions={{
                  color: C.c6Suave.borde,
                  weight: 1,
                  fillColor: C.c6Suave.relleno,
                  fillOpacity: 0.1,
                }}
              >
                <Tooltip sticky direction="top">
                  <b>{u.identificacion}</b> «{u.nombre}»
                </Tooltip>
              </Polygon>
            ))}

            {/* Relleno de la comuna, detrás de la división de barrios. */}
            {c6?.anillos.map((a, i) => (
              <Polygon
                key={`c6-${i}`}
                positions={aLatLng(a)}
                pathOptions={{ color: C.c6.borde, weight: 3, fillColor: C.c6.relleno, fillOpacity: 0.65 }}
                interactive={false}
              />
            ))}

            {/* La Comuna 6 resaltada, con sus 12 barrios trazados dentro para que se lea
                como una sola unidad territorial subdividida. */}
            {BARRIOS.map((b) => (
              <Polygon
                key={b.codigo}
                positions={b.anillos.map(aLatLng)}
                pathOptions={{ color: C.c6.borde, weight: 1, dashArray: '3 3', fill: false }}
              >
                <Tooltip sticky direction="center">
                  <b>{b.nombre}</b>
                  <br />
                  {conteo.get(b.codigo)
                    ? `${conteo.get(b.codigo)} registro(s) lo nombra`
                    : 'Sin registro que lo nombre'}
                </Tooltip>
              </Polygon>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
