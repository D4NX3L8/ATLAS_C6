import { useCallback, useEffect, useState } from 'react';

/**
 * GET a la API con cancelación, recarga manual y estado de carga.
 * `deps` fuerza el refetch cuando cambian los parámetros de la consulta.
 */
export function useApi<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key = JSON.stringify([path, deps]);

  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();

    setLoading(true);
    setError(null);

    fetch(path, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json() as Promise<T>;
      })
      .then((j) => { if (mounted) setData(j); })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (mounted) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; ctrl.abort(); };
  }, [key, path, n]);

  /** Relanza la petición (por ejemplo tras un alta o una baja). */
  const recargar = useCallback(() => setN((x) => x + 1), []);

  return { data, loading, error, recargar };
}

/** Retrasa la propagación de un valor para no lanzar una petición por pulsación. */
export function useDebounced<T>(valor: T, ms = 250) {
  const [diferido, setDiferido] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDiferido(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return diferido;
}
