import React from 'react';

export type Tab = 'inicio' | 'investigacion' | 'oferta' | 'calidad' | 'flujo' | 'prototipo';

const VALIDAS: Tab[] = ['inicio', 'investigacion', 'oferta', 'calidad', 'flujo', 'prototipo'];

/** Lee la pestaña inicial del hash (#oferta) para que la URL sea compartible. */
export function tabInicial(): Tab {
  if (typeof window === 'undefined') return 'investigacion';
  const h = window.location.hash.replace('#', '') as Tab;
  return VALIDAS.includes(h) ? h : 'investigacion';
}

export function useTabs(initial: Tab = tabInicial()) {
  const [t, setT] = React.useState<Tab>(initial);
  return { t, setT, go: (x: Tab) => () => setT(x) };
}

export function fmtPct(v: number | null | undefined, d = 1) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${Number(v).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
}

export function fmtNum(v: number | null | undefined, unit = '') {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const s = Number(v).toLocaleString('es-CO');
  return unit ? `${s} ${unit}` : s;
}

export function fmtInt(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return Math.round(v).toLocaleString('es-CO');
}

export function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/**
 * Recorta los sufijos que el XLSX repite en cada indicador.
 *
 * Los 27 indicadores comparten cola («… importantes para decidir», «Buscan …»),
 * y en un eje de barras eso empuja la etiqueta hasta dejar la barra sin sitio.
 * Se vive en `utils` para que los gráficos fijos y el explorador de filtros
 * recorten igual y las etiquetas no se desincronicen entre bloques.
 */
const CORTES: [RegExp, string][] = [
  [/ para decidir$/, ''],
  [/ importantes$/, ''],
  [/ importante$/, ''],
  [/^Buscan /, ''],
  [/ encuentran$/, ' encuentran'],
  [/ presentan$/, ' sin dificultades'],
];

export function etiquetaIndicador(s: string) {
  let out = s;
  for (const [re, rep] of CORTES) out = out.replace(re, rep);
  return out;
}
