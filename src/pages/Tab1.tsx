import React from 'react';
import { useApi } from '../hooks/useApi';
import type { Meta, Validacion, Evidencia } from '../types';
import P1Kpis from '../components/P1Kpis';
import P1Charts from '../components/P1Charts';
import P1Explorador from '../components/P1Explorador';
import ContextoTerritorial from '../components/ContextoTerritorial';

export default function Tab1() {
  const { data: meta } = useApi<Meta>('/api/meta');
  const { data: v } = useApi<Validacion[]>('/api/validacion');
  const { data: ev } = useApi<Evidencia[]>('/api/evidencia');

  const n = meta?.n ?? v?.[0]?.n ?? 28;
  const val = v ?? [];
  const pct = (frag: string, fallback: number) =>
    (val.find((x) => x.indicador.includes(frag))?.porcentaje ?? fallback).toFixed(1).replace('.', ',');

  return (
    <>
      <div className="page-h">
        <h1>1. Investigación y validación</h1>
        <p>
          Resultados de la validación exploratoria (n={n}) — muestra de conveniencia, no probabilística.
          Los datos se muestran tal como constan en el archivo adjunto, diferenciando datos de investigación,
          históricos, contextuales y brechas de información.
        </p>
      </div>

      <P1Kpis v={val} n={meta?.n ?? null} />
      <P1Charts v={val} />

      <div style={{ marginTop: 16 }}>
        <P1Explorador v={val} />
      </div>

      <div className="callout c-find" style={{ marginTop: 18 }}>
        <div className="ic">💡</div>
        <div>
          <h4>Hallazgo clave</h4>
          <p>
            El {pct('sistema integrado', 92.9)}% de los participantes considera útil o muy útil un sistema integrado,
            y el {pct('escribiendo', 71.4)}% prefiere buscar la oferta local escribiendo lo que necesita.
            Esto respalda la incorporación de búsqueda en lenguaje natural en ATLAS_C6.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <ContextoTerritorial e={ev ?? []} />
      </div>
    </>
  );
}
