import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EjeTexto from './EjeTexto';
import type { Validacion } from '../types';
import BarTip from './BarTip';
import { etiquetaIndicador } from '../utils';

const GRUPOS: { titulo: string; sub: string; orden: string[]; color: string; max: number; nota?: string }[] = [
  {
    titulo: '¿Cómo encuentran actualmente la oferta?',
    sub: 'Canales de descubrimiento (INV-008). Datos de la encuesta n=28.',
    orden: [
      'Buscan por familiares, amigos o vecinos',
      'Facebook',
      'Instagram',
      'Google / buscador',
      'Google Maps',
    ],
    color: '#009c6c',
    max: 80,
  },
  {
    titulo: '¿Qué información es más importante para decidir?',
    sub: 'Elementos decisivos para la búsqueda (INV-008).',
    orden: [
      'Ubicación importante para decidir',
      'Precios importantes para decidir',
      'Horarios importantes para decidir',
      'Productos / servicios importantes',
      'Disponibilidad importante',
      'Distancia importante',
    ],
    color: '#00a8d8',
    max: 80,
  },
  {
    titulo: '¿Qué dificultades encuentran?',
    sub: 'Limitaciones al encontrar la oferta (INV-008).',
    orden: [
      'Información no parece actualizada',
      'No encuentran suficientes opciones',
      'No encuentran precios',
      'No saben dónde buscar',
      'No encuentran dirección exacta',
      'No pueden comparar fácilmente',
      'Generalmente no presentan dificultades',
    ],
    color: '#b45309',
    max: 50,
    nota: 'Las respuestas son de opción múltiple: los porcentajes no suman 100%. "Una brecha no equivale a cero".',
  },
  {
    titulo: 'Funcionalidades priorizadas en ATLAS_C6',
    sub: 'Preferencias declaradas sobre la herramienta (INV-008).',
    orden: [
      'Buscar escribiendo lo que necesito',
      'Teléfono / WhatsApp',
      'Buscar por barrio',
      'Horarios',
    ],
    color: '#009c6c',
    max: 80,
  },
  {
    titulo: 'Tipo de oferta que más buscan',
    sub: 'Categorías de oferta con mayor frecuencia declarada (INV-008).',
    orden: ['Buscan restaurantes y alimentación', 'Buscan tiendas y comercios'],
    color: '#00a8d8',
    max: 80,
    nota: 'El archivo base solo documenta estas dos categorías de tipo de oferta; no se agregan otras.',
  },
];

const TIP_PCT = BarTip({ unit: '%' });

export default function P1Charts({ v }: { v: Validacion[] }) {
  const byName = Object.fromEntries(v.map((x) => [x.indicador, x.porcentaje]));

  return (
    <div className="stack">
      <div className="grid g2">
        {GRUPOS.slice(0, 2).map((g) => (
          <Grafico key={g.titulo} g={g} data={g.orden.map((k) => ({ name: etiquetaIndicador(k), pct: +byName[k]?.toFixed(1) || 0 }))} />
        ))}
      </div>
      <div className="grid g2">
        {GRUPOS.slice(2, 4).map((g) => (
          <Grafico key={g.titulo} g={g} data={g.orden.map((k) => ({ name: etiquetaIndicador(k), pct: +byName[k]?.toFixed(1) || 0 }))} />
        ))}
      </div>
      <Grafico g={GRUPOS[4]} data={GRUPOS[4].orden.map((k) => ({ name: etiquetaIndicador(k), pct: +byName[k]?.toFixed(1) || 0 }))} />
    </div>
  );
}

type G = (typeof GRUPOS)[number];

function Grafico({ g, data }: { g: G; data: { name: string; pct: number }[] }) {
  // Alto según cuántas barras haya: con etiquetas de 2-3 líneas, 300px se quedaba corto.
  const alto = Math.max(260, data.length * 34 + 40);

  return (
    <div className="card">
      <div className="card-h"><h3>{g.titulo}</h3><p>{g.sub}</p></div>
      <div className="card-b" style={{ height: alto }}>
        <ResponsiveContainer width="100%" height="100%">
          {/* left=0: el ancho del YAxis ya reserva esa franja; duplicarla dejaba
              las barras aplastadas contra el borde derecho con un hueco vacío. */}
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 18, top: 4, bottom: 4 }} barCategoryGap="22%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis type="number" domain={[0, g.max]} unit="%" tick={{ fill: 'var(--ink-mute)', fontSize: 11 }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={168} tick={<EjeTexto />} axisLine={false} tickLine={false} interval={0} />
            <Tooltip content={TIP_PCT} cursor={{ fill: 'var(--surface-3)' }} />
            <Bar dataKey="pct" fill={g.color} barSize={14} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {g.nota && <div className="chart-note">{g.nota}</div>}
    </div>
  );
}
