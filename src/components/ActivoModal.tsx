import React from 'react';
import type { Activo } from '../types';

const NIVELES = ['Alto', 'Medio', 'Bajo', 'No medido', 'Pendiente de validación'] as const;

const INITIAL: Partial<Activo> = {
  nombre: '',
  tipo_activo: '',
  ubicacion: '',
  anio: null,
  nivel_evidencia: 'Alto',
  identidad: 'No medido',
  ingresos: 'No medido',
  mercados: 'No medido',
  visibilidad: 'No medido',
  descripcion: '',
  origen: 'CRUD dashboard',
};

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (a: Partial<Activo>) => Promise<void> | void;
  activo?: Activo | null;
};

export default function ActivoModal({ abierto, onCerrar, onGuardar, activo }: Props) {
  const [form, setForm] = React.useState<Partial<Activo>>(activo ? { ...activo } : { ...INITIAL });
  const [err, setErr] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  if (!abierto) return null;

  const change = (k: keyof Activo, v: any) => setForm((f) => ({ ...f, [k]: v === '' ? null : v }));

  async function guardar() {
    setSaving(true);
    try {
      await onGuardar(form);
      onCerrar();
    } catch (e: any) {
      const m = e?.message ?? 'Error al guardar.';
      setErr({ _general: m });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mask" role="dialog" aria-modal="true" aria-labelledby="modal-t">
      <div className="modal">
        <div className="modal-h">
          <h3 id="modal-t">{activo ? 'Editar activo territorial' : 'Nuevo activo territorial'}</h3>
          <button className="btn-x" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-b">
          {err._general && <div className="err">{err._general}</div>}

          <div className="form-grid">
            <div className="fld full">
              <label>Nombre *</label>
              <input value={form.nombre ?? ''} onChange={(e) => change('nombre', e.target.value)} />
            </div>

            <div className="fld">
              <label>Tipo de activo *</label>
              <input value={form.tipo_activo ?? ''} onChange={(e) => change('tipo_activo', e.target.value)} placeholder="Ej.: Organización cultural / Evento cultural" />
            </div>

            <div className="fld">
              <label>Ubicación / alcance *</label>
              <input value={form.ubicacion ?? ''} onChange={(e) => change('ubicacion', e.target.value)} placeholder="Comuna 6 / Pedregal / Barrio..." />
            </div>

            <div className="fld">
              <label>Año documentado</label>
              <input type="number" min={1900} max={2100} value={form.anio ?? ''} onChange={(e) => change('anio', e.target.value)} />
            </div>

            <div className="fld">
              <label>Nivel de evidencia *</label>
              <select value={form.nivel_evidencia ?? ''} onChange={(e) => change('nivel_evidencia', e.target.value)}>
                {['Alto', 'Medio', 'Bajo', 'Pendiente de validación'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="fld">
              <label>Identidad territorial</label>
              <select value={form.identidad ?? ''} onChange={(e) => change('identidad', e.target.value)}>
                {NIVELES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="fld">
              <label>Generación de ingresos</label>
              <select value={form.ingresos ?? ''} onChange={(e) => change('ingresos', e.target.value)}>
                {NIVELES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="fld">
              <label>Acceso a mercados</label>
              <select value={form.mercados ?? ''} onChange={(e) => change('mercados', e.target.value)}>
                {NIVELES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="fld">
              <label>Visibilidad digital</label>
              <select value={form.visibilidad ?? ''} onChange={(e) => change('visibilidad', e.target.value)}>
                {NIVELES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="fld full">
              <label>Origen / fuente</label>
              <input value={form.origen ?? ''} onChange={(e) => change('origen', e.target.value)} placeholder="INV-003 / INV-006 / CRUD dashboard" />
            </div>

            <div className="fld full">
              <label>Justificación / descripción *</label>
              <textarea value={form.descripcion ?? ''} onChange={(e) => change('descripcion', e.target.value)} placeholder="Descripción, trayectoria, observaciones o evidencia disponible." />
            </div>
          </div>
        </div>

        <div className="modal-f">
          <button className="btn btn-s" onClick={onCerrar} disabled={saving}>Cancelar</button>
          <button className="btn btn-p" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
