import React from 'react';
import { Info, TriangleAlert, ExternalLink } from 'lucide-react';
import Lienzo, { LIENZO_W, LIENZO_H } from '../prototipo/Lienzo';

/* El diseño de Figma se midió sobre 1344×896 con paneles de ancho fijo, así que
 * no se puede dejar fluir como el resto de páginas. Se monta a su tamaño real
 * dentro de un marco y se reduce con un transform; a partir de 1344 px de
 * contenedor se ve a escala 1:1, que es como se diseñó. */
const ESCALA_MAXIMA = 1;
const ABAJO_DE_LECTURA = 0.5;

export default function Prototipo() {
  const marcoRef = React.useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = React.useState(0);

  // Se mide el marco, no la ventana: el ancho útil depende de los márgenes de
  // `.shell` y del comportamiento de `.grid` en pantallas estrechas.
  React.useEffect(() => {
    const el = marcoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ro.observe(el);
    setAncho(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const escala = Math.min(ESCALA_MAXIMA, ancho / LIENZO_W);
  const medido = ancho > 0;

  return (
    <>
      <div className="page-h">
        <h1>Prototipo interactivo de ATLAS C6</h1>
        <p>
          Esta vista aloja el <strong>prototipo del sistema ATLAS C6</strong>: la aplicación que la
          propuesta plantea construir. No es el dashboard que estás viendo. El dashboard es el
          producto de datos y analítica de la investigación; el prototipo es el sistema inteligente
          que se soporta sobre esos datos, y por eso se presenta aparte, con su propia identidad
          visual y su propio lenguaje de interacción.
        </p>
      </div>

      <div className="callout c-warn">
        <TriangleAlert size={16} className="ic" aria-hidden="true" />
        <div>
          <h4>Los datos dentro del prototipo son ilustrativos</h4>
          <p>
            Los nombres, teléfonos, direcciones, calificaciones, reseñas, distancias, eventos y
            cifras que se ven en la maqueta <strong>no provienen de la investigación</strong> ni del
            archivo <code>ATLAS_C6_Base_Datos_Dashboard.xlsx</code>: son de muestra, y están ahí
            para poder navegar por el diseño. Los datos reales de la Comuna 6 están en las pestañas
            1, 2 y 3, y todos son rastreables hasta el archivo. Tampoco el mapa de calor ni el chat
            están conectados a la base de 28 respuestas: generan valores al vuelo para que el
            diseño se vea completo.
          </p>
        </div>
      </div>

      {/* Marco del navegador */}
      <div className="proto-marco">
        <div className="proto-barra">
          <span className="proto-luces" aria-hidden="true"><i /><i /><i /></span>
          <span className="proto-url">atlas-c6 · prototipo · Comuna 6, Medellín</span>
          <span className="proto-escala">
            {medido ? `${Math.round(escala * 100)} %` : '—'}
          </span>
        </div>

        {/* Se conserva la composición de escritorio del prototipo. */}
        <div
          className="proto-lienzo"
          ref={marcoRef}
          data-artefacto="prototipo"
          style={{
            height: medido ? LIENZO_H * escala : undefined,
            minHeight: medido ? undefined : 260,
          }}
        >
          {medido && (
            <div style={{
              width: LIENZO_W,
              height: LIENZO_H,
              transform: `scale(${escala})`,
              transformOrigin: 'top left',
            }}>
              <Lienzo />
            </div>
          )}
        </div>
      </div>

      {medido && escala < ABAJO_DE_LECTURA && (
        <p className="ayuda" style={{ marginTop: 12 }}>
          La vista completa se reduce al {Math.round(escala * 100)} % para conservar la composición
          de {LIENZO_W}×{LIENZO_H} px. Para recorrer con comodidad la maqueta, usa una pantalla ancha.
        </p>
      )}

      <div className="stack" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-h">
            <Info size={17} className="ic" aria-hidden="true" />
            <div>
              <h3>Qué se puede recorrer aquí</h3>
              <p className="sub">La maqueta es navegable: el buscador filtra la lista, las categorías
                seleccionan, los marcadores del mapa se corresponden con la ficha y el chat responde.</p>
            </div>
          </div>
          <div className="card-b">
            <ul className="proto-lista">
              <li><b>Buscador en lenguaje natural.</b> Escribe en la barra superior y la lista se
                filtra por nombre o categoría.</li>
              <li><b>Categorías.</b> Las pastillas del encabezado y las del panel lateral seleccionan
                la misma cosa; son el mismo filtro en dos sitios.</li>
              <li><b>Mapa y ficha sincronizadas.</b> Al elegir un marcador, la lista se desplaza a ese
                elemento y la ficha de la derecha cambia.</li>
              <li><b>Chat y agenda.</b> El chat simula la respuesta de un asistente; la agenda alterna
                entre próximos eventos y calendario.</li>
            </ul>
            <p className="proto-nota" style={{ marginTop: 12 }}>
              <TriangleAlert size={13} aria-hidden="true" />
              <span>
                Los cuatro desplegables de barrio, tipo, disponibilidad y precio son visuales: en el
                diseño original no llegan a filtrar nada y se mantienen así para no inventar un
                comportamiento que el prototipo no define.
              </span>
            </p>
          </div>
        </div>

        <p className="proto-credito">
          <ExternalLink size={13} aria-hidden="true" />
          Reproducción del diseño de Figma del prototipo de ATLAS C6. El código vive en{' '}
          <code>src/prototipo/</code>; los datos de muestra, en <code>src/prototipo/muestras.ts</code>.
          Comuna 6, Medellín <span className="sep">•</span> Territorio INN 2026.
        </p>
      </div>

    </>
  );
}
