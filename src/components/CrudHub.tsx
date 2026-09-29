import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Database, Info, Table2, RotateCw, ChevronDown, KeyRound,
} from 'lucide-react';
import CrudModal from './CrudModal';
import { useApi, useDebounced } from '../hooks/useApi';
import { useAdmin, escribir, ErrorClave } from '../hooks/useAdmin';
import type { TipoInfo, FilaCrud, Meta } from '../types';

/** Panel de un tipo de información: búsqueda, tabla y edición. */
function CrudPanel({ tipo, onCambio }: { tipo: TipoInfo; onCambio: () => void }) {
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState<{ abierto: boolean; fila: FilaCrud | null }>({ abierto: false, fila: null });
  const [avisos, setAvisos] = useState('');

  const buscarD = useDebounced(buscar, 250);
  const q = buscarD.trim();
  const url = `/api/tablas/${tipo.tabla}${q ? `?columna=${encodeURIComponent(tipo.tituloCol)}&buscar=${encodeURIComponent(q)}` : ''}`;
  const { data: filas, loading, recargar } = useApi<FilaCrud[]>(url, [tipo.tabla, q]);

  async function borrar(f: FilaCrud) {
    const nombre = String(f[tipo.tituloCol] ?? `#${f.id}`);
    if (!confirm(`¿Eliminar «${nombre}» de ${tipo.titulo}?\n\nEsta acción no se puede deshacer.`)) return;
    try {
      const r = await escribir('DELETE', `/api/tablas/${tipo.tabla}/${f.id}`);
      setAvisos(r.ok ? `Registro eliminado de ${tipo.titulo}.` : 'No se pudo eliminar.');
      if (r.ok) { recargar(); onCambio(); }
    } catch (e) {
      setAvisos(e instanceof ErrorClave
        ? 'El servidor exige la clave de administrador (ATLAS_ADMIN_KEY).'
        : 'No se pudo conectar con el servidor.');
    }
  }

  return (
    <>
      <div className="bar-top">
        <div>
          <h3>{tipo.em} {tipo.titulo}</h3>
          <p className="bar-desc">{tipo.desc}</p>
        </div>
        <div className="row-act">
          <button className="btn btn-s" onClick={recargar} disabled={loading}>
            <RotateCw size={14} aria-hidden="true" /> Actualizar
          </button>
          <button className="btn btn-p" onClick={() => setModal({ abierto: true, fila: null })}>
            <Plus size={15} aria-hidden="true" /> Nuevo registro
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="fld wide">
          <label htmlFor="crud-buscar">Buscar en {tipo.tituloCol}</label>
          <input
            id="crud-buscar"
            type="search"
            value={buscar}
            placeholder="Escribe para filtrar…"
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        {filas && (
          <span className="fld" style={{ justifyContent: 'flex-end' }}>
            <span className="ayuda">{filas.length} registro{filas.length === 1 ? '' : 's'}</span>
          </span>
        )}
      </div>

      {avisos && (
        <div className="callout c-meta" style={{ marginBottom: 12 }}>
          <Info size={15} className="ic" aria-hidden="true" /><p>{avisos}</p>
        </div>
      )}

      {loading && !filas ? (
        <div className="center">Cargando {tipo.titulo.toLowerCase()}…</div>
      ) : !filas?.length ? (
        <div className="pend" style={{ padding: '28px 20px' }}>
          <div className="ic">🗒️</div>
          <h4>Sin registros que mostrar</h4>
          <p>{q ? 'Ninguno coincide con la búsqueda.' : 'Aún no hay registros de este tipo.'}</p>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <caption className="sr">{tipo.titulo} · {filas.length} registros</caption>
            <thead>
              <tr>
                <th>#</th>
                {tipo.campos.slice(0, 4).map((c) => <th key={c.nombre}>{c.label}</th>)}
                <th>Procedencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td className="mono">{f.id}</td>
                  {tipo.campos.slice(0, 4).map((c) => {
                    const v = f[c.nombre];
                    const txt = v === null || v === undefined || v === '' ? '—' : String(v);
                    return (
                      <td key={c.nombre} title={txt.length > 70 ? txt : undefined}>
                        {c.nombre === tipo.tituloCol
                          ? <strong>{txt}</strong>
                          : c.nombre === tipo.subtituloCol
                            ? <span style={{ color: 'var(--ink-mute)' }}>{txt}</span>
                            : txt.length > 70 ? `${txt.slice(0, 70)}…` : txt}
                      </td>
                    );
                  })}
                  <td>
                    {f.procedencia === 'Manual'
                      ? <span className="badge badge-manual">Manual</span>
                      : <span className="badge b-plain">XLSX</span>}
                  </td>
                  <td>
                    <div className="row-act">
                      <button className="btn-x" onClick={() => setModal({ abierto: true, fila: f })} aria-label={`Editar registro ${f.id}`} title="Editar">
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button className="btn-x" onClick={() => borrar(f)} aria-label={`Eliminar registro ${f.id}`} title="Eliminar">
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.abierto && (
        <CrudModal
          tipo={tipo}
          fila={modal.fila}
          onCerrar={() => setModal({ abierto: false, fila: null })}
          onGuardado={() => {
            setModal({ abierto: false, fila: null });
            setAvisos(`Registro guardado en ${tipo.titulo}.`);
            recargar();
            onCambio();
          }}
        />
      )}
    </>
  );
}

/**
 * Pedir la clave de administrador.
 *
 * Solo aparece si el servidor la exige (`/api/meta` → `crud_protegido`). Si
 * ATLAS_ADMIN_KEY no está definida en el servidor, el gestor está abierto y
 * este bloque no se muestra: es el modo por defecto para presentar.
 */
function ClaveAdmin() {
  const { clave, setClave } = useAdmin();
  const [borrador, setBorrador] = useState('');

  if (clave) {
    return (
      <div className="ftr-cred" style={{ marginBottom: 14 }}>
        <span className="ftr-cred-t"><KeyRound size={13} aria-hidden="true" /> Clave cargada</span>
        <button className="btn btn-s" onClick={() => { setClave(''); setBorrador(''); }}>
          Quitar clave
        </button>
      </div>
    );
  }

  return (
    <form
      className="filters"
      style={{ marginBottom: 14 }}
      onSubmit={(e) => { e.preventDefault(); if (borrador.trim()) setClave(borrador.trim()); }}
    >
      <div className="fld wide">
        <label htmlFor="crud-clave">
          <KeyRound size={13} aria-hidden="true" /> Clave de administrador
        </label>
        <input
          id="crud-clave"
          type="password"
          autoComplete="off"
          value={borrador}
          placeholder="ATLAS_ADMIN_KEY del servidor"
          onChange={(e) => setBorrador(e.target.value)}
        />
        <span className="ayuda">Se guarda solo en esta pestaña y se pierde al cerrarla.</span>
      </div>
      <div className="fld" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-p" disabled={!borrador.trim()}>Activar edición</button>
      </div>
    </form>
  );
}

export default function CrudHub() {
  const { data: catalogo, error, recargar: recargarCatalogo } = useApi<TipoInfo[]>('/api/tablas');
  const { data: meta } = useApi<Meta>('/api/meta');
  const [activo, setActivo] = useState<string>('activos');
  const [abierto, setAbierto] = useState(false);

  const tipo = catalogo?.find((t) => t.tabla === activo);
  const protegido = meta?.crud_protegido === true;

  if (error) {
    return (
      <div className="card">
        <div className="card-b err">No se pudo cargar el catálogo de tipos de información. Verifica que la API esté activa.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-h">
        <Database size={17} className="ic" aria-hidden="true" />
        <div>
          <h3>Gestión de información</h3>
          <p>
            Añade, corrige o elimina registros. Cada tipo de información tiene sus propios campos y
            validaciones. Lo creado aquí se marca como <strong>Manual</strong> para distinguirlo de
            los 117 registros que vienen del XLSX.
          </p>
        </div>
      </div>

      <div className="acc">
        <button className="acc-h" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
          <Table2 size={17} className="ic" aria-hidden="true" />
          <span className="acc-t">{abierto ? 'Ocultar gestor' : 'Abrir gestor de datos'}</span>
          <span className="acc-n">{catalogo?.length ?? 0} tipos</span>
          <ChevronDown size={17} className={`chev ${abierto ? 'abierto' : ''}`} aria-hidden="true" />
        </button>

        {abierto && (
          <div className="acc-b">
            {protegido && <ClaveAdmin />}

            <div className="crud-sel" role="tablist" aria-label="Tipos de información">
              {catalogo?.map((t) => (
                <button
                  key={t.tabla}
                  className="crud-chip"
                  role="tab"
                  aria-pressed={activo === t.tabla}
                  aria-selected={activo === t.tabla}
                  onClick={() => setActivo(t.tabla)}
                >
                  <span aria-hidden="true">{t.em}</span>
                  {t.titulo}
                  <span className="cnt">{t.conteo}{t.manuales > 0 ? ` (+${t.manuales})` : ''}</span>
                </button>
              ))}
            </div>

            {tipo && <CrudPanel tipo={tipo} onCambio={recargarCatalogo} />}
          </div>
        )}
      </div>
    </div>
  );
}
