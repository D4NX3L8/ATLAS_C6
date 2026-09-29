import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  titulo: string;
  em?: string;
  ic?: React.ElementType;
  n?: number | string;
  abiertoPorDefecto?: boolean;
  children: React.ReactNode;
};

/**
 * Revelación progresiva: mantiene toda la información disponible pero
 * plegada, para que la página se lea de un vistazo.
 */
export default function Acordeon({
  titulo, em, ic: Ic, n, abiertoPorDefecto = false, children,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto);
  const id = `acc-${titulo.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div className={`acc ${abierto ? 'acc-open' : ''}`}>
      <button
        className="acc-h"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
      >
        {Ic ? <Ic size={17} className="ic" aria-hidden="true" /> : em ? <span aria-hidden="true">{em}</span> : null}
        <span className="acc-t">{titulo}</span>
        {n !== undefined && <span className="acc-n">{n}</span>}
        <ChevronDown size={17} className={`chev ${abierto ? 'abierto' : ''}`} aria-hidden="true" />
      </button>
      {abierto && <div className="acc-b" id={id}>{children}</div>}
    </div>
  );
}
