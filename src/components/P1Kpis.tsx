import React from 'react';
import type { Validacion } from '../types';
import { fmtPct, fmtInt } from '../utils';

type Props = { v: Validacion[]; n: number | null };

export default function P1Kpis({ v, n }: Props) {
  const find = (cat: string) => v.find((x) => x.categoria === cat);
  const k = {
    muestra: find('Muestra')?.n ?? n ?? 28,
    util: find('Utilidad del sistema')?.porcentaje ?? 92.9,
    busca: find('Funcionalidades priorizadas')?.porcentaje ?? 71.4,
    actores: find('Conocimiento de oferta local')?.porcentaje ?? 71.4,
  };

  return (
    <div className="kpis">
      <div className="kpi">
        <div className="kpi-l">Respuestas exploratorias (n)</div>
        <div className="kpi-v">{fmtInt(k.muestra)}</div>
        <div className="kpi-s">Muestra de conveniencia, no probabilística. Visible en Pestaña 1.</div>
      </div>
      <div className="kpi">
        <div className="kpi-l">Consideran útil un sistema integrado</div>
        <div className="kpi-v">{fmtPct(k.util)}</div>
        <div className="kpi-s">Algo o muy útil (INV-008).</div>
      </div>
      <div className="kpi">
        <div className="kpi-l">Prefieren buscar escribiendo lo que necesitan</div>
        <div className="kpi-v">{fmtPct(k.busca)}</div>
        <div className="kpi-s">Respaldan búsqueda en lenguaje natural (INV-008).</div>
      </div>
      <div className="kpi">
        <div className="kpi-l">Conocen actores locales poco conocidos fuera del barrio</div>
        <div className="kpi-v">{fmtPct(k.actores)}</div>
        <div className="kpi-s">Indicador de conocimiento de oferta local (INV-008).</div>
      </div>
    </div>
  );
}
