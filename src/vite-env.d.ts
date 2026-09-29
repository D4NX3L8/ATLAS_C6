/// <reference types="vite/client" />

/**
 * Clave de la API de Google Maps (Maps JavaScript API).
 *
 * Es opcional: sin ella el mapa cae a Leaflet y todo lo demás funciona igual.
 * La clave viaja al navegador, así que hay que restringarla por dominio y por
 * API en Google Cloud; no es un secreto de servidor.
 */
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_KEY?: string;
}
