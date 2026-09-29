import type { TooltipContentProps, TooltipValueType } from 'recharts';

type NameType = number | string;
type Props = TooltipContentProps<TooltipValueType, NameType>;

export default function BarTip({ unit = '%' }: { unit?: string }) {
  return function Tip({ active, payload, label }: Props) {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value;
    const shown = Array.isArray(v) ? v.join(' – ') : v;
    // Colores por variable CSS para que el tooltip siga al tema claro/oscuro.
    return (
      <div
        style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 8, padding: '8px 10px', boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontWeight: 650, color: 'var(--ink)' }}>{label}</div>
        <div style={{ color: 'var(--ink-mute)' }}>
          {typeof shown === 'number' ? shown.toLocaleString('es-CO') : String(shown ?? '—')} {unit}
        </div>
      </div>
    );
  };
}
