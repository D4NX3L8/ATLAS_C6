/* Mapa del prototipo: marcadores de los cinco registros de muestra.
 *
 * Se carga con `React.lazy` desde Lienzo, igual que el mapa de la Pestaña 2:
 * Leaflet pesa alrededor de 150 kB y no tiene por qué entrar en el primer
 * chunk. El CSS se importa aquí y no en index.css porque es la única hoja que
 * necesita este componente. */
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { marcadores } from './muestras';

function crearIcono(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="background:white;border:2.5px solid ${color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/**
 * Vuela al marcador seleccionado.
 *
 * El contenedor puede medir 0×0 cuando el mapa se monta dentro de un ancestro
 * oculto o escalado, y Leaflet se queda con tamaño cero para siempre. Se
 * comprueba y, si toca, se espera al primer `resize` tras `invalidateSize`.
 */
function ActualizadorMapa({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const pendienteRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    if (!isFinite(lat) || !isFinite(lng)) return;

    const size = map.getSize();
    if (size.x === 0 || size.y === 0) {
      pendienteRef.current = center;
      map.once('resize', () => {
        if (pendienteRef.current) {
          map.flyTo(pendienteRef.current, 15, { duration: 1 });
          pendienteRef.current = null;
        }
      });
      map.invalidateSize();
    } else {
      map.flyTo(center, 15, { duration: 1 });
    }
  }, [center, map]);

  return null;
}

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function PanelMapa({ selectedId, onSelect }: Props) {
  const seleccionado = marcadores.find((m) => m.resultId === selectedId);
  const center: [number, number] | null = seleccionado ? [seleccionado.lat, seleccionado.lng] : null;

  return (
    <MapContainer
      center={[6.318, -75.588]}
      zoom={14}
      style={{ width: '100%', height: '100%', borderRadius: 8 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      {marcadores.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={crearIcono(m.emoji, m.resultId === selectedId ? '#00c9b1' : m.color)}
          eventHandlers={{ click: () => { if (m.resultId) onSelect(m.resultId); } }}
        >
          <Popup>
            <span style={{ fontSize: 12 }}>{m.emoji} Punto en la C6</span>
          </Popup>
        </Marker>
      ))}
      <ActualizadorMapa center={center} />
    </MapContainer>
  );
}
