/**
 * Etiqueta de eje que envuelve el texto en varias lineas.
 *
 * Los indicadores llegan a 55 caracteres ("Conocen actores locales poco conocidos
 * fuera del barrio"). Con un ancho de eje fijo, recharts los recorta y se pierde
 * información; con esto caben en dos o tres líneas dentro de una franja estrecha.
 */

const MAX_CHARS = 20;
const MAX_LINES = 4;
const LINE_H = 11;

function partir(texto: string): string[] {
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = '';

  for (const p of palabras) {
    const cand = actual ? `${actual} ${p}` : p;
    if (cand.length <= MAX_CHARS || !actual) {
      actual = cand;
    } else {
      lineas.push(actual);
      actual = p;
      if (lineas.length === MAX_LINES) break;
    }
  }
  if (lineas.length < MAX_LINES && actual) lineas.push(actual);
  return lineas;
}

type Props = { x?: number; y?: number; payload?: { value?: string } };

export default function EjeTexto({ x = 0, y = 0, payload }: Props) {
  const lineas = partir(String(payload?.value ?? ''));
  // Se centra el bloque sobre la línea de la barra.
  const dy = (lineas.length - 1) * (LINE_H / 2);

  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor="end"
      dominantBaseline="middle"
      fontSize={10.5}
      fill="var(--ink-mid)"
    >
      {lineas.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : LINE_H}>{l}</tspan>
      ))}
    </text>
  );
}
