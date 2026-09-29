import { useEffect, useMemo, useRef } from 'react';
import { useTema } from '../hooks/useTema';
import {
  BARRIOS, C, COMUNA, UNIDADES, aLatLng, contarPorBarrio,
  type Anillo,
} from '../mapa/datos';
import type { Activo } from '../types';

type Vista = 'ciudad' | 'comuna';

type Props = { vista: Vista; activos: Activo[] };

/**
 * Mapa con la API de Google Maps.
 *
 * Los límites son los mismos del GeoJSON de Planeación: cambia el motor que
 * dibuja el fondo, no lo que el dashboard afirma del territorio.
 */
export default function MapaGoogle({ vista, activos }: Props) {
  const { tema } = useTema();
  const caja = useRef<HTMLDivElement>(null);
  const enComuna = vista === 'comuna';

  // Sin memo, `contarPorBarrio` devuelve un Map nuevo en cada render y el
  // efecto de abajo se re-ejecutaría siempre.
  const conteo = useMemo(() => contarPorBarrio(activos).c, [activos]);

  useEffect(() => {
    const el = caja.current;
    const googleMaps = window.google?.maps;
    if (!el || !googleMaps || !googleMaps.MapTypeId) return;

    const { Polygon, InfoWindow, LatLngBounds, ColorScheme, MapTypeId } = googleMaps;
    const GMap = googleMaps.Map;

    const map = new GMap(el, {
      center: { lat: 6.28, lng: -75.56 },
      zoom: 12,
      mapTypeId: MapTypeId.ROADMAP,
      colorScheme: tema === 'oscuro' ? ColorScheme.DARK : ColorScheme.LIGHT,
      clickableIcons: false,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      mapTypeControlOptions: { style: window.google.maps.MapTypeControlStyle.DEFAULT, position: window.google.maps.ControlPosition.TOP_RIGHT },
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
      fullscreenControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
      gestureHandling: 'greedy',
      minZoom: 11,
      maxZoom: 18,
      styles: tema === 'oscuro'
        ? [
            { elementType: 'geometry', stylers: [{ color: '#0f1b2a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1b2a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#f5f7fa' }] },
            { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#7f95b1' }, { weight: 0.5 }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1d2f45' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#16263a' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2b4a72' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1d3756' }] },
            { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#b7c7dc' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#13263a' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7fbfd6' }] },
          ]
        : [
            { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f0f5ff' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d7e3ff' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e8eef2' }] },
            { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9d5e3' }] },
          ],
    });

    const globo = new InfoWindow();
    // Solo un globo a la vez: al entrar en otro polígono se retira el anterior.
    let enganche: google.maps.MapsEventListener[] = [];

    const sobre = (obj: google.maps.MVCObject, texto: string) => {
      enganche.forEach((l) => l.remove());
      enganche = [];
      globo.setContent(texto);
      globo.open({ map, anchor: obj });
    };
    const fuera = () => {
      enganche.forEach((l) => l.remove());
      enganche = [];
      globo.close();
    };

    const poligono = (
      anillos: Anillo[],
      opts: google.maps.PolygonOptions,
      texto?: () => string,
    ) => {
      const p = new Polygon({ ...opts, map, paths: anillos.map(aLatLng) });
      if (texto) {
        p.addListener('mouseover', () => sobre(p, texto()));
        p.addListener('mouseout', fuera);
      }
      return p;
    };

    if (enComuna) {
      for (const b of BARRIOS) {
        const n = conteo.get(b.codigo) ?? 0;
        poligono(
          b.anillos,
          {
            strokeColor: n > 0 ? C.c6.borde : C.c6Suave.borde,
            strokeWeight: n > 0 ? 2.5 : 1.2,
            fillColor: n > 0 ? C.c6.relleno : C.c6Suave.relleno,
            fillOpacity: n > 0 ? 0.55 : 0.14,
            clickable: true,
          },
          () =>
            `<b>${b.nombre}</b><br>${n > 0
              ? `${n} registro${n === 1 ? '' : 's'} lo nombra`
              : 'Sin registro que lo nombre'}`,
        );
      }
      // El límite oficial va encima, sin relleno y sin capturar clics.
      COMUNA.anillos.forEach((a) =>
        new Polygon({
          map, paths: aLatLng(a),
          strokeColor: C.limite, strokeWeight: 3, fillOpacity: 0, clickable: false,
        }),
      );
    } else {
      // Las 15 demás comunas, solo como contexto.
      for (const u of UNIDADES) {
        if (u.codigo === COMUNA.codigo) continue;
        poligono(
          u.anillos,
          {
            strokeColor: C.c6Suave.borde,
            strokeWeight: 1,
            fillColor: C.c6Suave.relleno,
            fillOpacity: 0.1,
            clickable: true,
          },
          () => `<b>${u.identificacion}</b> «${u.nombre}»`,
        );
      }
      // Relleno de la 6 por detrás (zIndex 1) y división de barrios encima (zIndex 2).
      for (const u of UNIDADES.filter((x) => x.codigo === COMUNA.codigo)) {
        for (const a of u.anillos) {
          new Polygon({
            map, paths: aLatLng(a),
            strokeColor: C.c6.borde, strokeWeight: 3,
            fillColor: C.c6.relleno, fillOpacity: 0.65, clickable: false, zIndex: 1,
          });
        }
      }
      for (const b of BARRIOS) {
        poligono(
          b.anillos,
          { strokeColor: C.c6.borde, strokeWeight: 1, fillOpacity: 0, clickable: true, zIndex: 2 },
          () =>
            `<b>${b.nombre}</b><br>${conteo.get(b.codigo)
              ? `${conteo.get(b.codigo)} registro(s) lo nombra`
              : 'Sin registro que lo nombre'}`,
        );
      }
    }

    // Encuadre sobre la Comuna 6, no sobre las 16 comunas: encajarlas todas la
    // reduciría a una mancha ilegible.
    //
    // El factor multiplica los límites desde su centro, así que cuanto mayor es
    // más se aleja el mapa y más ciudad alrededor se ven. Se calcula con
    // aritmética propia y no con getNorthEast()/getSouthWest(), que no han
    // tenido la misma forma entre versiones de la API.
    const puntos = COMUNA.anillos.flatMap(aLatLng);
    const sur = Math.min(...puntos.map((p) => p.lat));
    const norte = Math.max(...puntos.map((p) => p.lat));
    const oeste = Math.min(...puntos.map((p) => p.lng));
    const este = Math.max(...puntos.map((p) => p.lng));
    const centro = { lat: (norte + sur) / 2, lng: (este + oeste) / 2 };
    const factor = enComuna ? 1.12 : 1.15;
    const dLat = ((norte - sur) / 2) * factor;
    const dLng = ((este - oeste) / 2) * factor;

    map.fitBounds(
      new LatLngBounds(
        { lat: centro.lat - dLat, lng: centro.lng - dLng },
        { lat: centro.lat + dLat, lng: centro.lng + dLng },
      ),
      enComuna ? 28 : 8,
    );

    return () => {
      enganche.forEach((l) => l.remove());
      globo.close();
      map.unbindAll();
    };
  }, [enComuna, tema, conteo]);

  return (
    <div
      ref={caja}
      className="mapa-gmaps"
      aria-label={
        enComuna ? `Mapa de la ${COMUNA.identificacion}` : 'Mapa de Medellín con la Comuna 6 resaltada'
      }
    />
  );
}
