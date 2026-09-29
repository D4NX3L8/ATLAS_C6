import { useEffect, useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { escribir, ErrorClave } from '../hooks/useAdmin';
import type { TipoInfo, FilaCrud } from '../types';

type Props = {
  tipo: TipoInfo;
  fila: FilaCrud | null;
  onCerrar: () => void;
  onGuardado: () => void;
};

type Errores = Record<string, string>;

function valoresIniciales(tipo: TipoInfo, fila: FilaCrud | null) {
  const v: Record<string, string> = {};
  for (const c of tipo.campos) {
    const actual = fila?.[c.nombre];
    v[c.nombre] = actual === null || actual === undefined ? '' : String(actual);
  }
  return v;
}

export default function CrudModal({ tipo, fila, onCerrar, onGuardado }: Props) {
  const [vals, setVals] = useState(() => valoresIniciales(tipo, fila));
  const [errores, setErrores] = useState<Errores>({});
  const [general, setGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
  const editando = !!fila;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onCerrar]);

  function set(nombre: string, v: string) {
    setVals((x) => ({ ...x, [nombre]: v }));
    setErrores((e) => {
      if (!e[nombre]) return e;
      const { [nombre]: _fuera, ...resto } = e;
      return resto;
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrores({});
    setGeneral('');

    // Se envían solo los campos con valor: un PUT parcial no pisa lo que no se toca.
    const cuerpo: Record<string, unknown> = {};
    for (const c of tipo.campos) {
      const v = vals[c.nombre]?.trim();
      if (v === '' || v === undefined) continue;
      cuerpo[c.nombre] = c.tipo === 'txt' || c.tipo === 'largo' || c.tipo === 'sug' || c.tipo === 'enum'
        ? v
        : Number(v);
    }

    try {
      const r = await escribir(
        editando ? 'PUT' : 'POST',
        editando ? `/api/tablas/${tipo.tabla}/${fila!.id}` : `/api/tablas/${tipo.tabla}`,
        cuerpo,
      );
      if (r.ok) { onGuardado(); return; }
      const j = await r.json();
      if (j.campos) setErrores(j.campos);
      setGeneral(j.error ?? 'No se pudo guardar.');
    } catch (e) {
      if (e instanceof ErrorClave) {
        setGeneral('El servidor exige la clave de administrador (ATLAS_ADMIN_KEY). Inténtalo de nuevo.');
        return;
      }
      setGeneral('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  }

  const idLista = `dl-${tipo.tabla}-${fila?.id ?? 'nuevo'}`;

  return (
    <div className="mask" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <form className="modal" onSubmit={enviar} role="dialog" aria-modal="true" aria-label={`${editando ? 'Editar' : 'Nuevo'} ${tipo.titulo}`}>
        <div className="modal-h">
          <div>
            <h3><span aria-hidden="true">{tipo.em}</span> {editando ? 'Editar registro' : 'Nuevo registro'} · {tipo.titulo}</h3>
            <p>{editando ? `Registro #${fila!.id}` : 'Los campos marcados con * son obligatorios. Lo creado aquí queda marcado como «Manual».'}</p>
          </div>
          <button type="button" className="iconbtn" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-b">
          {general && (
            <div className="err" role="alert">
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} aria-hidden="true" /> {general}
              </strong>
            </div>
          )}

          <div className="form-grid">
            {tipo.campos.map((c) => {
              const err = errores[c.nombre];
              const ancho = c.tipo === 'largo' || c.nombre === 'descripcion' || c.nombre === 'nota'
                || c.nombre === 'observacion' || c.nombre === 'uso' || c.nombre === 'implicacion'
                || c.nombre === 'informacion' || c.nombre === 'limitacion' || c.nombre === 'aplicacion'
                || c.nombre === 'mide';
              const id = `f-${tipo.tabla}-${c.nombre}`;

              let control: React.ReactNode;
              if (c.tipo === 'enum') {
                control = (
                  <select id={id} value={vals[c.nombre] ?? ''} onChange={(e) => set(c.nombre, e.target.value)}>
                    <option value="">— Elegir —</option>
                    {c.opciones?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                );
              } else if (c.tipo === 'largo') {
                control = <textarea id={id} value={vals[c.nombre] ?? ''} onChange={(e) => set(c.nombre, e.target.value)} />;
              } else {
                control = (
                  <>
                    <input
                      id={id}
                      value={vals[c.nombre] ?? ''}
                      type={c.tipo === 'num' || c.tipo === 'int' || c.tipo === 'anio' ? 'number' : 'text'}
                      min={c.min ?? undefined}
                      max={c.max ?? undefined}
                      list={c.tipo === 'sug' && c.opciones?.length ? idLista : undefined}
                      onChange={(e) => set(c.nombre, e.target.value)}
                    />
                    {c.tipo === 'sug' && c.opciones?.length ? (
                      <datalist id={idLista}>{c.opciones.map((o) => <option key={o} value={o} />)}</datalist>
                    ) : null}
                  </>
                );
              }

              return (
                <div className={`fld ${ancho ? 'full' : ''}`} key={c.nombre}>
                  <label htmlFor={id}>
                    {c.label}{c.req && <span aria-hidden="true" style={{ color: 'var(--red-600)' }}> *</span>}
                  </label>
                  {control}
                  {c.ayuda && <span className="ayuda">{c.ayuda}</span>}
                  {err && <span className="err-fld" role="alert">{err}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-f">
          <span className="pie-nota">
            {editando
              ? 'Solo se envían los campos que modifiques.'
              : 'El registro quedará marcado como «Manual» para distinguirlo del XLSX.'}
          </span>
          <div className="row-act">
            <button type="button" className="btn btn-s" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-p" disabled={guardando}>
              <Save size={15} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
