/* Datos de MUESTRA del prototipo interactivo.
 *
 * Nada de lo que hay en este archivo proviene de la investigación ni del
 * ATLAS_C6_Base_Datos_Dashboard.xlsx. Son registros inventados que existen
 * únicamente para poblar la maqueta y poder navegar por ella: los nombres, los
 * teléfonos, las calificaciones, el número de reseñas y las distancias no
 * corresponden a ningún establecimiento real de la Comuna 6.
 *
 * Regla del proyecto: nunca se elaboran datos. Estos no son datos, son relleno
 * de una maqueta, y por eso la vista que los monta (src/pages/Prototipo.tsx)
 * lleva un aviso visible que los identifica como ilustrativos. No conectarlos a
 * la API ni sustituirlos por /api/activos: el esquema real no tiene calificación,
 * reseñas, distancia ni teléfono, y rellenarlos sería inventar igual.
 *
 * Origen: reproducción del diseño de Figma del prototipo de ATLAS C6. El texto
 * y los valores se conservan tal cual para que la maqueta siga siendo fiel al
 * diseño aprobado; cambiarlos para "mejorarlos" rompería esa fidelidad. */

export interface Muestra {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  barrio: string;
  rating: number;
  reviews: number;
  distance: string;
  verified: boolean;
  image: string;
  detailImage: string;
  description: string;
  address: string;
  phone: string;
  schedule: string;
  social: { instagram: boolean; facebook: boolean; youtube: boolean };
  source: string;
  updated: string;
  lat: number;
  lng: number;
  catColor: string;
  catEmoji: string;
}

export interface EventoMuestra {
  id: number;
  name: string;
  date: string;
  time: string;
  place: string;
  tag: string;
  tagColor: string;
  image: string;
}

export interface MarcadorMuestra {
  id: number;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  /** `null` = marcador decorativo: se ve en el mapa pero no selecciona nada. */
  resultId: number | null;
}

export interface KpiMuestra {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

export interface PorcionMuestra {
  name: string;
  value: number;
  color: string;
}

export interface CategoriaMuestra {
  id: string;
  label: string;
  count: number;
  color: string;
  emoji: string;
  bg: string;
  fill: string;
}

export const categorias: CategoriaMuestra[] = [
  { id: 'negocios', label: 'Negocios', count: 324, color: '#3b82f6', emoji: '🏪', bg: '#dbeafe', fill: '#2563eb' },
  { id: 'servicios', label: 'Servicios', count: 198, color: '#10b981', emoji: '⚙️', bg: '#dcfce7', fill: '#16a34a' },
  { id: 'cultura', label: 'Cultura y arte', count: 156, color: '#f59e0b', emoji: '🎨', bg: '#fef9c3', fill: '#ca8a04' },
  { id: 'emprendimientos', label: 'Emprendimientos', count: 112, color: '#8b5cf6', emoji: '🚀', bg: '#ede9fe', fill: '#7c3aed' },
  { id: 'organizaciones', label: 'Organizaciones', count: 87, color: '#06b6d4', emoji: '🤝', bg: '#cffafe', fill: '#0891b2' },
  { id: 'eventos', label: 'Eventos', count: 64, color: '#ef4444', emoji: '📅', bg: '#fee2e2', fill: '#dc2626' },
  { id: 'activos', label: 'Activos territoriales', count: 42, color: '#f97316', emoji: '🏛️', bg: '#ffedd5', fill: '#ea580c' },
];

/** Rótulos cortos de las pastillas del encabezado. */
export const categoriasPildora: { id: string; label: string }[] = [
  { id: 'negocios', label: 'Negocios' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'emprendimientos', label: 'Emprendimientos' },
  { id: 'organizaciones', label: 'Organizaciones' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'activos', label: 'Activos territoriales' },
];

export const barrios = [
  'Todos los barrios',
  'Doce de Octubre',
  'Castilla',
  'Pedregal',
  'El Pesebre',
  'San Martín de Porres',
  'Santa María',
];

export const resultados: Muestra[] = [
  {
    id: 1,
    name: 'TallerArte',
    category: 'Cultura y arte',
    subcategory: 'Talleres',
    barrio: 'Barrio Pedregal',
    rating: 4.8,
    reviews: 24,
    distance: '0.8 km',
    verified: true,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=120&q=80',
    detailImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80',
    description: 'Espacio comunitario dedicado al arte, la formación cultural y la creación colectiva. Ofrece talleres de pintura, arte urbano, arte digital y más.',
    address: 'Cra. 78 # 101-26, Pedregal, Comuna 6',
    phone: '+57 300 123 4567',
    schedule: 'Lun – Sáb: 8:00 a.m. – 6:00 p.m.',
    social: { instagram: true, facebook: true, youtube: true },
    source: 'Alcaldía de Medellín / Secretaría de Cultura',
    updated: '15 abr 2025',
    lat: 6.318,
    lng: -75.588,
    catColor: '#f59e0b',
    catEmoji: '🎨',
  },
  {
    id: 2,
    name: 'Café La 6',
    category: 'Gastronomía',
    subcategory: 'Cafetería',
    barrio: 'Barrio Doce de Octubre',
    rating: 4.6,
    reviews: 18,
    distance: '1.2 km',
    verified: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=80',
    detailImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    description: 'Cafetería local con tradición en la comuna. Punto de encuentro para emprendedores y residentes del barrio Doce de Octubre.',
    address: 'Cl. 98 # 75B-12, Doce de Octubre, Comuna 6',
    phone: '+57 311 456 7890',
    schedule: 'Lun – Dom: 6:00 a.m. – 8:00 p.m.',
    social: { instagram: true, facebook: true, youtube: false },
    source: 'Registro Cámara de Comercio',
    updated: '2 may 2025',
    lat: 6.321,
    lng: -75.584,
    catColor: '#3b82f6',
    catEmoji: '☕',
  },
  {
    id: 3,
    name: 'Consultorio Médico C6',
    category: 'Servicios',
    subcategory: 'Salud',
    barrio: 'Barrio Santa María',
    rating: 4.7,
    reviews: 32,
    distance: '1.5 km',
    verified: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&q=80',
    detailImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    description: 'Centro de atención médica primaria con especialidades en medicina general, pediatría y odontología para la comunidad de la C6.',
    address: 'Cra. 80 # 105-44, Santa María, Comuna 6',
    phone: '+57 604 567 8901',
    schedule: 'Lun – Vie: 7:00 a.m. – 5:00 p.m.',
    social: { instagram: true, facebook: false, youtube: false },
    source: 'Secretaría de Salud de Medellín',
    updated: '10 abr 2025',
    lat: 6.315,
    lng: -75.591,
    catColor: '#10b981',
    catEmoji: '⚕️',
  },
  {
    id: 4,
    name: 'Emprende C6',
    category: 'Emprendimiento',
    subcategory: 'Moda',
    barrio: 'Barrio Castilla',
    rating: 4.5,
    reviews: 12,
    distance: '1.8 km',
    verified: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80',
    detailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: 'Emprendimiento de moda sostenible liderado por mujeres de la Comuna 6. Diseño, confección y comercialización de prendas.',
    address: 'Cra. 73 # 100-18, Castilla, Comuna 6',
    phone: '+57 300 789 0123',
    schedule: 'Lun – Sáb: 9:00 a.m. – 5:00 p.m.',
    social: { instagram: true, facebook: true, youtube: false },
    source: 'Alcaldía de Medellín / Secretaría de Desarrollo',
    updated: '20 mar 2025',
    lat: 6.323,
    lng: -75.586,
    catColor: '#8b5cf6',
    catEmoji: '🚀',
  },
  {
    id: 5,
    name: 'Festival Urbano Comuna 6',
    category: 'Evento',
    subcategory: 'Cultura',
    barrio: 'Barrio Pedregal',
    rating: 4.9,
    reviews: 56,
    distance: '2.1 km',
    verified: true,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&q=80',
    detailImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80',
    description: 'Festival anual que celebra la cultura urbana, el hip-hop, el arte callejero y el talento local de la Comuna 6.',
    address: 'Parque El Pesebre, Comuna 6',
    phone: '+57 300 234 5678',
    schedule: '13 de mayo – 4:00 p.m.',
    social: { instagram: true, facebook: true, youtube: true },
    source: 'Secretaría de Cultura de Medellín',
    updated: '1 may 2025',
    lat: 6.312,
    lng: -75.587,
    catColor: '#ef4444',
    catEmoji: '📅',
  },
];

export const eventos: EventoMuestra[] = [
  { id: 1, name: 'Festival Urbano Comuna 6', date: '13 de mayo', time: '4:00 p.m.', place: 'Pedregal', tag: 'Música', tagColor: '#8b5cf6', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=80&q=80' },
  { id: 2, name: 'Feria de Emprendimientos Locales', date: '17 de mayo', time: '10:00 a.m.', place: 'Castilla', tag: 'Emprendimiento', tagColor: '#3b82f6', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=80&q=80' },
  { id: 3, name: 'Taller de Pintura Infantil', date: '20 de mayo', time: '2:00 p.m.', place: 'Pedregal', tag: 'Cultura', tagColor: '#f59e0b', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=80&q=80' },
  { id: 4, name: 'Cine al Barrio', date: '25 de mayo', time: '6:30 p.m.', place: 'Doce de Octubre', tag: 'Cine', tagColor: '#10b981', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&q=80' },
];

export const kpis: KpiMuestra[] = [
  { label: 'Total de registros', value: '1.254', trend: '+12% vs. mes anterior', icon: '📋' },
  { label: 'Negocios', value: '324', trend: '+8%', icon: '🏪' },
  { label: 'Eventos próximos', value: '28', trend: '+15%', icon: '📅' },
];

export const porcionOferta: PorcionMuestra[] = [
  { name: 'Negocios', value: 26, color: '#3b82f6' },
  { name: 'Servicios', value: 16, color: '#10b981' },
  { name: 'Cultura y arte', value: 12, color: '#f59e0b' },
  { name: 'Emprendimientos', value: 9, color: '#8b5cf6' },
  { name: 'Organizaciones', value: 7, color: '#06b6d4' },
  { name: 'Eventos', value: 5, color: '#ef4444' },
  { name: 'Otros', value: 25, color: '#d1d5db' },
];

export const marcadores: MarcadorMuestra[] = [
  { id: 1, lat: 6.318, lng: -75.588, emoji: '🎨', color: '#f59e0b', resultId: 1 },
  { id: 2, lat: 6.321, lng: -75.584, emoji: '☕', color: '#3b82f6', resultId: 2 },
  { id: 3, lat: 6.315, lng: -75.591, emoji: '⚕️', color: '#10b981', resultId: 3 },
  { id: 4, lat: 6.323, lng: -75.586, emoji: '🚀', color: '#8b5cf6', resultId: 4 },
  { id: 5, lat: 6.312, lng: -75.587, emoji: '📅', color: '#ef4444', resultId: 5 },
  { id: 6, lat: 6.320, lng: -75.590, emoji: '🏪', color: '#3b82f6', resultId: null },
  { id: 7, lat: 6.316, lng: -75.582, emoji: '🤝', color: '#06b6d4', resultId: null },
  { id: 8, lat: 6.325, lng: -75.593, emoji: '🏛️', color: '#f97316', resultId: null },
];
