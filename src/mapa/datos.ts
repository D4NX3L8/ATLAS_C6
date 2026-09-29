// Datos y lógica que usan por igual los dos motores de mapa (Google Maps y
// Leaflet). Vive aparte para que los dos dibujen exactamente las mismas cifras:
// si cada motor calculara su propio conteo, acabarían discrepando en pantalla.

import geo from '../data/comuna6.geo.json';
import ciudad from '../data/ciudad.geo.json';

export type Anillo = [number, number][];
export type Barrio = { codigo: string; nombre: string; anillos: Anillo[]; centroide: [number, number] };
export type Unidad = { codigo: string; nombre: string; identificacion: string; tipo: string; anillos: Anillo[] };

export const COMUNA = geo.comuna as {
  codigo: string; identificacion: string; nombre: string;
  area_m2: number; perimetro_m: number; fecha_actualizacion: string; anillos: Anillo[];
};
export const BARRIOS = geo.barrios as Barrio[];
export const UNIDADES = ciudad.unidades as Unidad[];
/** Medellín es [lng, lat] en el GeoJSON; los mapas usan [lat, lng]. */
export const CENTRO = { lat: ciudad.centro[1], lng: ciudad.centro[0] };

/** Texto de «Ubicación» → barrio oficial, tolerando abreviaturas y tildes. */
export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bbarrio(s)?\b/g, ' ')
    .replace(/\bn[oº.]?\s*(\d)/g, 'no $1')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Claves de coincidencia, de la más larga a la más corta: «cerro picacho» gana a «picacho». */
export const CLAVES = BARRIOS.flatMap((b) => {
  const base = norm(b.nombre);
  return (base === 'picacho' ? [base, 'cerro picacho'] : [base]).map((clave) => ({ clave, codigo: b.codigo }));
}).sort((a, b) => b.clave.length - a.clave.length);

export const C = {
  c6: { borde: '#007d55', relleno: '#00a86c' },
  c6Suave: { borde: '#1a5573', relleno: '#7fbfd6' },
  limite: '#001830',
};

/** Un activo puede nombrar un barrio en su campo «Ubicación»; se cuenta una vez. */
export function contarPorBarrio<T extends { ubicacion: string | null }>(activos: T[]) {
  const c = new Map<string, number>();
  const sinCruce: string[] = [];
  for (const a of activos) {
    const u = norm(a.ubicacion ?? '');
    const hit = CLAVES.find((k) => u.includes(k.clave));
    if (hit) c.set(hit.codigo, (c.get(hit.codigo) ?? 0) + 1);
    else sinCruce.push(a.ubicacion || '—');
  }
  return { c, sinCruce };
}

/** GeoJSON [lng, lat] → [{lat, lng}], que es lo que espera cualquier motor. */
export const aLatLng = (anillo: Anillo): { lat: number; lng: number }[] =>
  anillo.map(([lng, lat]) => ({ lat, lng }));
