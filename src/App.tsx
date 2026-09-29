import React from 'react';
import {
  Menu, X, Sun, Moon, Microscope, MapPinned, ShieldCheck,
  Workflow, CircleHelp, PanelsTopLeft,
} from 'lucide-react';
import { Instagram, Facebook, WhatsApp } from './components/Redes';
import { useTabs } from './utils';
import { useTema, useMedia } from './hooks/useTema';
import type { Tab } from './utils';

const Tab1 = React.lazy(() => import('./pages/Tab1'));
const Tab2 = React.lazy(() => import('./pages/Tab2'));
const Tab3 = React.lazy(() => import('./pages/Tab3'));
const Inicio = React.lazy(() => import('./pages/Inicio'));
const Flujo = React.lazy(() => import('./pages/Flujo'));
// El lienzo del prototipo arrastra Recharts y Leaflet; con el lazy no se
// descargan hasta que se abre la vista.
const Prototipo = React.lazy(() => import('./pages/Prototipo'));

const TABS: { id: Tab; Icono: typeof Microscope; label: string; corto: string; mini: string }[] = [
  { id: 'investigacion', Icono: Microscope, label: 'Investigación y validación', corto: 'Investigación', mini: 'Datos' },
  { id: 'oferta', Icono: MapPinned, label: 'Oferta e identidad territorial', corto: 'Oferta territorial', mini: 'Oferta' },
  { id: 'calidad', Icono: ShieldCheck, label: 'Calidad, cobertura y brechas', corto: 'Calidad y brechas', mini: 'Calidad' },
  { id: 'flujo', Icono: Workflow, label: 'Flujo', corto: 'Flujo', mini: 'Flujo' },
  { id: 'inicio', Icono: CircleHelp, label: '¿Por qué ATLAS C6?', corto: '¿Por qué?', mini: '¿Por qué?' },
  { id: 'prototipo', Icono: PanelsTopLeft, label: 'Prototipo del sistema', corto: 'Prototipo', mini: 'Prototipo' },
];

function Cargando() {
  return <div className="center">Cargando datos reales del archivo…</div>;
}

/**
 * Enlaces sociales. Los iconos quedan apagados si no hay `href`: se ven, pero
 * no navegan ni son tabulables, en vez de romper al hacer clic.
 */
const SOCIALES: { red: string; Icono: (p: { size?: number }) => React.ReactElement; href: string; etiqueta: string }[] = [
  { red: 'instagram', Icono: Instagram, href: 'https://www.instagram.com/jaramillo.s/', etiqueta: 'Instagram @jaramillo.s' },
  { red: 'facebook', Icono: Facebook, href: 'https://www.facebook.com/yeeeeeees', etiqueta: 'Facebook Sebastián Jaramillo' },
  { red: 'whatsapp', Icono: WhatsApp, href: 'https://wa.me/573016335019', etiqueta: 'WhatsApp +57 301 633 5019' },
];

export default function App() {
  const { t, setT } = useTabs();
  const { tema, alternar } = useTema();
  const esMovil = useMedia('(max-width: 900px)');
  const navCompacta = useMedia('(max-width: 1680px)');
  const navMuyCompacta = useMedia('(max-width: 1100px)');
  const [abierto, setAbierto] = React.useState(false);

  React.useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const x = (e.state as { tab?: Tab } | null)?.tab;
      if (x) setT(x);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setT]);

  React.useEffect(() => {
    if (!abierto) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [abierto]);

  // Bloquea el scroll de fondo mientras el panel móvil está abierto.
  React.useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, [abierto]);

  function ir(id: Tab) {
    setT(id);
    setAbierto(false);
    window.history.pushState({ tab: id }, '', `#${id}`);
    window.scrollTo({ top: 0 });
  }

  const btn = (x: (typeof TABS)[number], corto = false, mini = false) => (
    <button
      key={x.id}
      className="nav-btn"
      data-tab={x.id}
      aria-current={t === x.id ? 'page' : undefined}
      onClick={() => ir(x.id)}
    >
      <span className="nav-icon-wrap" aria-hidden="true"><x.Icono className="nav-icon" size={17} strokeWidth={2} /></span>
      <span>{mini ? x.mini : corto ? x.corto : x.label}</span>
    </button>
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="shell topbar-in">
          {esMovil && (
            <button
              className="burger"
              onClick={() => setAbierto(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={abierto}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          )}

          <div className="brand">
            <img
              src={tema === 'claro' ? '/logo-atlas-c6.png' : '/logo-atlas-c6-dark.png'}
              alt="ATLAS C6 — Sistema Inteligente de Identidad Territorial, Comuna 6, Medellín"
              className="brand-logo"
            />
          </div>

          {!esMovil && <nav className="topnav" aria-label="Secciones del dashboard">{TABS.map((x) => btn(x, navCompacta, navMuyCompacta))}</nav>}

          <div className="topbar-actions">
            <button
              className="iconbtn"
              onClick={alternar}
              aria-label={tema === 'claro' ? 'Activar modo oscuro' : 'Activar modo claro'}
              title={tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}
            >
              {tema === 'claro' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {abierto && (
        <>
          <button className="drawer-mask" aria-label="Cerrar menú" onClick={() => setAbierto(false)} />
          <nav className="drawer" aria-label="Secciones del dashboard">
            <div className="drawer-h">
              <strong>Secciones</strong>
              <button className="iconbtn" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {TABS.map((x) => btn(x, true))}
          </nav>
        </>
      )}

      <main className={`main${t === 'inicio' ? ' main-home' : ''}`}>
        <React.Suspense fallback={<Cargando />}>
          {t === 'inicio' ? (
            <Inicio onNavigate={ir} />
          ) : (
            <div className="shell">
            {t === 'investigacion' && <Tab1 />}
            {t === 'oferta' && <Tab2 />}
            {t === 'calidad' && <Tab3 />}
            {t === 'flujo' && <Flujo />}
            {t === 'prototipo' && <Prototipo />}
            </div>
          )}
        </React.Suspense>
      </main>

      <footer className="ftr">
        <div className="shell ftr-in">
          <div>
            <strong>ATLAS C6</strong> <span className="sep">•</span> Producto de datos y analítica
            que sustenta la propuesta. No es el sistema ATLAS_C6, que se presenta mediante un
            prototipo independiente.
          </div>
          <div>
            Territorio INN 2026 <span className="sep">•</span> Comuna 6 – Doce de Octubre – Medellín
          </div>
          <div className="ftr-cred">
            <span className="ftr-cred-t">Autoría</span>
            <strong>Sebastian Jaramillo Taborda</strong>
          </div>
          <div className="ftr-cred">
            <span className="ftr-cred-t">Síguenos</span>
            <div className="social">
              {SOCIALES.map(({ red, Icono, href, etiqueta }) => (
                href ? (
                  <a
                    key={red}
                    className="social-b"
                    href={href}
                    aria-label={`ATLAS_C6 en ${etiqueta}`}
                    title={etiqueta}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icono size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    key={red}
                    className="social-b social-b-off"
                    aria-label={`${etiqueta}: enlace pendiente`}
                    title={`${etiqueta}: enlace pendiente`}
                  >
                    <Icono size={17} aria-hidden="true" />
                  </span>
                )
              ))}
            </div>
          </div>
          <div className="ftr-meta">
            <b>Nota metodológica.</b> La información de percepciones proviene de una{' '}
            <b>muestra de conveniencia de n = 28</b>, aplicada en la Comuna 6. <b>No es una muestra
            probabilística ni representativa</b> de la comuna: sus resultados describen únicamente a
            las personas alcanzadas y no permiten inferir porcentajes poblacionales. Los datos
            históricos corresponden a años distintos y los de contexto a Medellín o Colombia, no a la
            Comuna 6. Las brechas se reportan como «No disponible» o «No medido», nunca como 0.
            <br />
            <b>Fuente de datos:</b> ATLAS_C6_Base_Datos_Dashboard.xlsx (INV-002…INV-008).{' '}
            <b>Geometría territorial:</b> Departamento Administrativo de Planeación de Medellín.
            No se elaboran datos ficticios ni se completan valores ausentes.
            <br />
            <b>© 2026 Sebastian Jaramillo Taborda.</b> Reservados todos los derechos.
          </div>
        </div>
      </footer>
    </div>
  );
}
