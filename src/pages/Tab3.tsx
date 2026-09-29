import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Canal, Brecha, CampoCalidad } from '../types';
import P3Kpis from '../components/P3Kpis';
import P3Trazabilidad from '../components/P3Trazabilidad';
import P3Tablas from '../components/P3Tablas';

export default function Tab3() {
  const { data: can } = useApi<Canal[]>('/api/canales');
  const { data: bre } = useApi<Brecha[]>('/api/brechas');
  const { data: cam } = useApi<CampoCalidad[]>('/api/campos-calidad');

  return (
    <>
      <div className="page-h">
        <h1>3. Calidad, cobertura y brechas</h1>
        <p>
          Fuentes de información, qué aportan, cuáles son sus limitaciones y qué información todavía
          no está disponible o requiere validación. <strong>Una brecha de información no equivale a cero.</strong>
        </p>
        <details className="callout c-warn reveal">
          <summary>
            <AlertTriangle size={15} className="ic" aria-hidden="true" />
            <strong>Principio metodológico</strong>
            <span className="reveal-hint">la cobertura no es un censo</span>
          </summary>
          <p>
            La cobertura identificada <strong>no constituye un censo</strong>. En ausencia de información pública
            o verificada se utiliza "No disponible", "No medido" o "Pendiente de validación".
            Nunca se completan valores faltantes ni se convierten ausencias en ceros.
          </p>
        </details>
      </div>

      <P3Kpis canales={can ?? []} brechas={bre ?? []} campos={cam ?? []} />

      <div className="stack" style={{ marginTop: 16 }}>
        <P3Trazabilidad campos={cam ?? []} />
        <P3Tablas canales={can ?? []} brechas={bre ?? []} campos={cam ?? []} />
      </div>
    </>
  );
}
