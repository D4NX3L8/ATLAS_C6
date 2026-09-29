import React from 'react';
import type { Activo } from '../types';

type Props = {
  activos: Activo[];
  loading: boolean;
  onNuevo: () => void;
  onEditar: (a: Activo) => void;
  onEliminar: (a: Activo) => void;
};

export default function ActivosTabla({ activos, loading, onNuevo, onEditar, onEliminar }: Props) {
  return (
    <>
      <div className="filters">
        <div className="fld wide">
          <label>Atención</label>
          <input disabled value="CRUD exclusivo para el catálogo de activos territoriales (Hoja 2 · A). Los demás datos se mantienen como solo lectura, conforme al brief." />
        </div>
        <button className="btn btn-p" onClick={onNuevo}>Nuevo activo</button>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>A. Activos culturales y territoriales documentados</h3>
          <p>Fuente: INV-003 / INV-006. No se crean datos ficticios. Se muestra únicamente lo documentado. Si no existe georreferenciación suficiente, el mapa permanece como "Georreferenciación pendiente".</p>
        </div>

        <div className="card-b tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo de activo</th>
                <th>Ubicación / alcance</th>
                <th>Año</th>
                <th>Evidencia</th>
                <th>Identidad</th>
                <th>Ingresos</th>
                <th>Mercados</th>
                <th>Visibilidad</th>
                <th>Origen</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: 32 }}>Cargando…</td></tr>
              ) : activos.length === 0 ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: 32 }}>Sin registros documentados.</td></tr>
              ) : (
                activos.map((a, i) => (
                  <tr key={a.id}>
                    <td className="mono">{a.orden ?? i + 1}</td>
                    <td><strong>{a.nombre}</strong></td>
                    <td>{a.tipo_activo}</td>
                    <td>{a.ubicacion}</td>
                    <td className="mono">{a.anio ?? '—'}</td>
                    <td><span className={`nv nv-${a.nivel_evidencia.replace(/\s+/g, '')}`}>{a.nivel_evidencia}</span></td>
                    <td><span className={`badge b-ctx`}>{a.identidad}</span></td>
                    <td><span className={`badge b-ctx`}>{a.ingresos}</span></td>
                    <td><span className={`badge b-ctx`}>{a.mercados}</span></td>
                    <td><span className={`badge b-ctx`}>{a.visibilidad}</span></td>
                    <td className="mono">{a.origen}</td>
                    <td className="mono">{a.actualizado_en.replace('T', ' ').slice(0, 16)}</td>
                    <td>
                      <div className="row-act">
                        <button className="btn btn-s" onClick={() => onEditar(a)}>Editar</button>
                        <button className="btn btn-d" onClick={() => onEliminar(a)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
