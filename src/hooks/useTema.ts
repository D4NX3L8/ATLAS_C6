import * as React from 'react';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'atlas-c6-tema';

function inicial(): Tema {
  if (typeof window === 'undefined') return 'claro';
  let guardado: string | null = null;
  try {
    guardado = window.localStorage.getItem(CLAVE);
  } catch {
    // El tema sigue funcionando en memoria si el navegador bloquea el almacenamiento.
  }
  if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

let temaActual = inicial();
const oyentes = new Set<() => void>();

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

function leerTema() {
  return temaActual;
}

function leerTemaServidor(): Tema {
  return 'claro';
}

function fijarTema(tema: Tema) {
  temaActual = tema;
  document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
  try {
    window.localStorage.setItem(CLAVE, tema);
  } catch {
    // El tema permanece sincronizado en memoria durante esta sesión.
  }
  oyentes.forEach((oyente) => oyente());
}

/** Tema claro/oscuro aplicado a <html data-theme> y persistido en localStorage. */
export function useTema() {
  const tema = React.useSyncExternalStore(suscribir, leerTema, leerTemaServidor);
  const alternar = React.useCallback(() => {
    fijarTema(temaActual === 'claro' ? 'oscuro' : 'claro');
  }, []);
  return { tema, alternar };
}

/** true cuando la ventana es más estrecha que el ancho indicado. */
export function useMedia(query: string) {
  const [ok, setOk] = React.useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setOk(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return ok;
}
