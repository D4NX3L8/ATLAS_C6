import * as React from 'react';

const ID = 'google-maps-js';
const URL_BASE = 'https://maps.googleapis.com/maps/api/js';

/** La clave se expone al navegador por diseño: debe restringirse por dominio y por API. */
export const CLAVE_GOOGLE = (import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '').trim();

declare global {
  interface Window {
    __atlasGoogleMaps?: {
      cargada: boolean;
      error?: string;
      promesa?: Promise<void>;
      script?: HTMLScriptElement;
    };
    gm_authFailure?: () => void;
  }
}

function cargar(clave: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();

  const estado = (window.__atlasGoogleMaps ??= { cargada: false });
  if (estado.cargada) return Promise.resolve();
  if (estado.promesa) return estado.promesa;

  estado.promesa = new Promise<void>((resolve, reject) => {
    const existente = document.getElementById(ID) as HTMLScriptElement | null;

    if (existente) {
      const aceptar = () => {
        estado.cargada = true;
        estado.error = undefined;
        requestAnimationFrame(() => resolve());
      };
      const fallar = () => {
        estado.cargada = false;
        estado.error = 'No se pudo cargar el script de Google Maps (error de red o CSP).';
        estado.promesa = undefined;
        reject(new Error('No se pudo cargar el script de Google Maps.'));
      };
      existente.addEventListener('load', aceptar, { once: true });
      existente.addEventListener('error', fallar, { once: true });
      return;
    }

    const s = document.createElement('script');
    s.id = ID;
    s.async = true;
    s.defer = true;
    s.src = `${URL_BASE}?key=${encodeURIComponent(clave)}&v=weekly&libraries=marker`;
    estado.script = s;

    s.onload = () => {
      estado.cargada = true;
      estado.error = undefined;
      // La API suele estar lista en onload; un rAF evita carreras puntuales.
      requestAnimationFrame(() => resolve());
    };
    s.onerror = () => {
      estado.cargada = false;
      estado.error = 'No se pudo cargar el script de Google Maps (error de red o CSP).';
      estado.promesa = undefined;
      reject(new Error('No se pudo cargar el script de Google Maps.'));
    };
    document.head.appendChild(s);
  }).finally(() => {
    const estadoActual = window.__atlasGoogleMaps;
    if (estadoActual) estadoActual.promesa = undefined;
  });

  return estado.promesa ?? Promise.resolve();
}

export type Estado = 'sin-clave' | 'cargando' | 'listo' | 'error';

/**
 * Carga la API de Google Maps una sola vez. Si no hay clave, o si la clave está
 * mal, sin facturación o sin permisos, devuelve `error` y el mapa cae a Leaflet:
 * en una presentación es preferible un mapa de respaldo a un recuadro gris.
 */
export function useGoogleMaps(): { estado: Estado; error: string | null } {
  const [estado, setEstado] = React.useState<Estado>(CLAVE_GOOGLE ? 'cargando' : 'sin-clave');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!CLAVE_GOOGLE) return;

    let vivo = true;

    // Detecta errores de autenticación/facturación de Google Maps.
    // No se limpia en desmontaje porque hay un único global por página y puede
    // haber varios montajes temporales con StrictMode en desarrollo.
    const onAuthFailure = () => {
      if (!vivo) return;
      const msg = 'La clave de Google Maps no está autorizada (puede faltar habilitar "Maps JavaScript API" o tener facturación sin activar).';
      window.__atlasGoogleMaps = { cargada: false, error: msg };
      setError(msg);
      setEstado('error');
    };
    window.gm_authFailure = onAuthFailure;

    cargar(CLAVE_GOOGLE)
      .then(() => {
        if (!vivo) return;
        if (window.google?.maps) {
          setEstado('listo');
        } else {
          const msg = 'El script cargó pero `google.maps` no está disponible.';
          setError(msg);
          setEstado('error');
        }
      })
      .catch((e: Error) => {
        if (!vivo) return;
        setError(e.message);
        setEstado('error');
      });

    return () => {
      vivo = false;
    };
  }, []);

  return { estado, error };
}
