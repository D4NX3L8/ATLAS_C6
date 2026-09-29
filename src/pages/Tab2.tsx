import React from 'react';
import type { Activo, Estructura } from '../types';
import P2Kpis from '../components/P2Kpis';
// Leaflet pesa ~150 kB: se carga aparte para no retrasar el resto de la pestaña.
const P2MapaTerritorial = React.lazy(() => import('../components/P2MapaTerritorial'));
import P2Distribuciones from '../components/P2Distribuciones';
import ActivosTabla from '../components/ActivosTabla';
import ActivoModal from '../components/ActivoModal';
import CrudHub from '../components/CrudHub';
import { useApi } from '../hooks/useApi';
import { escribir, ErrorClave } from '../hooks/useAdmin';

export default function Tab2() {
  const { data: est, loading: lEst } = useApi<Estructura[]>('/api/estructura');

  const [activos, setActivos] = React.useState<Activo[] | null>(null);
  const [lA, setLA] = React.useState(true);
  const [modal, setModal] = React.useState<{ open: boolean; id?: number | null }>({ open: false });
  const [sinClave, setSinClave] = React.useState(false);

  const cargarActivos = React.useCallback(async () => {
    setLA(true);
    try {
      const r = await fetch('/api/activos');
      if (r.ok) setActivos(await r.json());
    } catch {
      setActivos([]);
    } finally {
      setLA(false);
    }
  }, []);

  React.useEffect(() => {
    // Carga inicial del catálogo: sincronización con el sistema externo (API).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarActivos();
  }, [cargarActivos]);

  const activoSel = modal.open && modal.id ? (activos ?? []).find((x) => x.id === modal.id) ?? null : null;

  async function guardarActivo(a: Partial<Activo>) {
    const id = modal.id;
    setSinClave(false);
    try {
      const r = await escribir(id ? 'PUT' : 'POST', id ? `/api/activos/${id}` : '/api/activos', a);
      if (!r.ok) {
        let msg = `Error ${r.status}`;
        try {
          const j = await r.json();
          if (j?.campos) msg = `${j.error}: ` + Object.values(j.campos).join(' ');
          else if (j?.error) msg = j.error;
        } catch { /* respuesta sin cuerpo JSON */ }
        throw new Error(msg);
      }
    } catch (e) {
      if (e instanceof ErrorClave) { setSinClave(true); setModal({ open: false }); return; }
      throw e;
    }
    await cargarActivos();
  }

  async function eliminarActivo(a: Activo) {
    if (!confirm(`¿Eliminar el activo "${a.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const r = await escribir('DELETE', `/api/activos/${a.id}`);
      if (r.ok) await cargarActivos();
      else setSinClave(true);
    } catch (e) {
      if (e instanceof ErrorClave) setSinClave(true);
      else throw e;
    }
  }

  return (
    <>
      <div className="page-h">
        <h1>2. Oferta e identidad territorial</h1>
        <p>
          Exploración de los activos documentados, su tipología y las características identificadas.
          El mapa territorial usa el límite oficial de la Comuna 6; como el catálogo no registra
          coordenadas, los activos se <strong>no</strong> ubican como puntos y se advierte{' '}
          <strong>"Georreferenciación pendiente"</strong> en lugar de simular ubicaciones.
        </p>
      </div>

      <P2Kpis activos={activos} meta={est} loading={lA || lEst} />

      <div className="stack" style={{ marginTop: 16 }}>
        {sinClave ? (
          <p className="ayuda" role="alert">
            El gestor está protegido con <code>ATLAS_ADMIN_KEY</code>. Abre «Abrir gestor de datos» más
            abajo e introduce la clave para poder crear, editar o eliminar activos.
          </p>
        ) : null}
        <React.Suspense fallback={<div className="center">Cargando cartografía…</div>}>
          <P2MapaTerritorial activos={activos ?? []} loading={lA} />
        </React.Suspense>
        <P2Distribuciones activos={activos ?? []} />
        <ActivosTabla
          activos={activos ?? []}
          loading={lA}
          onNuevo={() => setModal({ open: true, id: null })}
          onEditar={(a) => setModal({ open: true, id: a.id })}
          onEliminar={eliminarActivo}
        />
        <CrudHub />
      </div>

      <ActivoModal
        key={activoSel?.id ?? 'nuevo'}
        abierto={modal.open}
        activo={activoSel}
        onCerrar={() => setModal({ open: false })}
        onGuardar={guardarActivo}
      />
    </>
  );
}
