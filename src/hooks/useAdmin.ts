import { useCallback, useSyncExternalStore } from 'react';

/**
 * Clave de administrador del gestor de datos.
 *
 * Vive en `sessionStorage`, no en `localStorage`: se pierde al cerrar la
 * pestaña, así que en un equipo compartido la clave no queda flotando en el
 * disco entre sesiones. Si el navegador bloquea el almacenamiento (modo
 * privado), se degrada a memoria y el gestor sigue funcionando mientras la
 * pestaña esté abierta.
 *
 * Es un almacén de módulo con `useSyncExternalStore` porque la necesitan tres
 * componentes a la vez (CrudHub, CrudPanel, CrudModal) sin pasarla por props.
 */

const LLAVE = 'atlas-c6:clave-admin';

function leer(): string {
  try {
    return sessionStorage.getItem(LLAVE) ?? '';
  } catch {
    return '';
  }
}

let valor = leer();
const oyentes = new Set<() => void>();

function fijar(v: string) {
  valor = v;
  try {
    if (v) sessionStorage.setItem(LLAVE, v);
    else sessionStorage.removeItem(LLAVE);
  } catch {
    /* sin almacenamiento: se mantiene solo en memoria */
  }
  for (const f of oyentes) f();
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => { oyentes.delete(f); };
}

/** Error de autenticación: la API respondió 401. */
export class ErrorClave extends Error {
  constructor() {
    super('Falta la clave de administrador.');
    this.name = 'ErrorClave';
  }
}

/** Lectura del estado y setter de la clave. */
export function useAdmin() {
  const clave = useSyncExternalStore(suscribir, leer, () => '');
  const setClave = useCallback((v: string) => fijar(v), []);
  return { clave, setClave };
}

/**
 * Escritura autenticada contra `/api/tablas`.
 * Añade la cabecera `X-Admin-Key` cuando hay clave y convierte un 401 en
 * `ErrorClave`, para que la UI ofrezca pedirla en vez de mostrar «error».
 */
export async function escribir(
  method: 'POST' | 'PUT' | 'DELETE',
  url: string,
  cuerpo?: unknown,
): Promise<Response> {
  const cabeceras: Record<string, string> = {};
  if (valor) cabeceras['X-Admin-Key'] = valor;
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';

  const r = await fetch(url, {
    method,
    headers: cabeceras,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  if (r.status === 401) throw new ErrorClave();
  return r;
}
