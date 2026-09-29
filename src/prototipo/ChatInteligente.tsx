/* Chat del prototipo.
 *
 * No llama a ningún servicio: los mensajes de arranque están escritos a mano y
 * la respuesta es una simulación con retardo fijo. Es una maqueta, no una
 * integración, y el aviso de la vista que lo monta lo dice. */
import { useState } from 'react';

type Lado = 'user' | 'bot';

const INICIO: { from: Lado; text: string }[] = [
  { from: 'user', text: '¿Dónde puedo encontrar talleres de arte para niños en la Comuna 6?' },
  { from: 'bot', text: 'Encontré varias opciones de talleres de arte para niños en la Comuna 6. Aquí tienes algunas:\n\n1. TallerArte – Pedregal\n2. Casa de Cultura Pedregal – Pedregal\n3. Corporación Cultural Simón Bolívar – Castilla\n\nVer resultados completos →' },
];

export default function ChatInteligente() {
  const [msgs, setMsgs] = useState(INICIO);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  function enviar() {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMsgs((m) => [...m, { from: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: 'bot', text: `Buscando "${q}" en la C6… Encontré ${Math.floor(Math.random() * 15) + 3} opciones relevantes para ti.` }]);
    }, 1100);
  }

  return (
    <>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00c9b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>🤖</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Chat inteligente</p>
          <p style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>Pregunta en lenguaje natural y encuentra la mejor opción.</p>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 5 }}>
            {m.from === 'bot' && (
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00c9b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '84%', padding: '6px 10px', borderRadius: 10, fontSize: 10, lineHeight: 1.55, whiteSpace: 'pre-line',
              background: m.from === 'user' ? '#1a1d2e' : '#f3f4f6',
              color: m.from === 'user' ? '#fff' : '#374151',
              borderBottomRightRadius: m.from === 'user' ? 3 : undefined,
              borderBottomLeftRadius: m.from === 'bot' ? 3 : undefined,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00c9b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🤖</div>
            <div style={{ background: '#f3f4f6', borderRadius: 10, padding: '7px 10px', display: 'flex', gap: 3 }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#9ca3af', animation: 'proto-blink 0.8s infinite', animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Entrada */}
      <div style={{ display: 'flex', gap: 7, padding: '7px 10px', borderTop: '1px solid #f3f4f6', flexShrink: 0, alignItems: 'center' }}>
        <input
          value={input}
          aria-label="Escribe tu pregunta"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escribe tu pregunta..."
          style={{ flex: 1, fontSize: 11, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '5px 11px', outline: 'none' }}
        />
        <button onClick={enviar} aria-label="Enviar" style={{ width: 26, height: 26, borderRadius: '50%', background: '#00c9b1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
}
