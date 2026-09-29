import {
  ArrowDown, ArrowRight, BarChart3, Check, Database, Files, MapPinned,
  Search, ShieldCheck, UsersRound, Waypoints,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Tab } from '../utils';
import type { Validacion } from '../types';
import { fmtPct } from '../utils';

type Props = { onNavigate: (tab: Tab) => void };

const INVESTIGACIONES = [
  ['INV-001', 'Oferta económica, comercial y cultural'],
  ['INV-002', 'Cómo se descubre la oferta'],
  ['INV-003', 'Actores del ecosistema'],
  ['INV-004', 'Barreras identificadas'],
  ['INV-005', 'Demanda y oportunidades'],
  ['INV-006', 'Activos culturales y territoriales'],
  ['INV-007', 'Ecosistema digital y descubrimiento'],
];

const FUENTES = [
  'Google / buscadores', 'Google Maps', 'Redes sociales', 'Agendas culturales',
  'Fuentes institucionales', 'Datos abiertos', 'Directorios / plataformas', 'Fuentes comunitarias',
];

const CAMPOS_DISPERSOS = [
  'Ubicación', 'Horarios', 'Precios', 'Productos / servicios',
  'Disponibilidad', 'Actualización', 'Nivel de detalle', 'Trazabilidad',
];

const DIFERENCIAS = [
  'Estructura de la información', 'Cobertura territorial', 'Actualización de los datos',
  'Nivel de detalle', 'Formatos heterogéneos', 'Trazabilidad de la fuente',
];

const TIPOS_OFERTA = ['Cultura', 'Comercio', 'Servicios', 'Emprendimiento', 'Organizaciones', 'Comunidad'];

const DIMENSIONES = [
  {
    titulo: 'Identidad territorial',
    puntos: ['Activos culturales', 'Organizaciones', 'Artistas', 'Eventos', 'Espacios'],
  },
  {
    titulo: 'Sostenibilidad financiera',
    puntos: ['Visibilidad', 'Comercialización', 'Capacidades', 'Conexión con públicos'],
  },
  {
    titulo: 'Acceso a mercados',
    puntos: ['Descubrimiento', 'Contacto', 'Conexión entre oferta y usuarios'],
  },
];

const ETAPAS = [
  { Icono: Database, titulo: 'Información dispersa', detalle: 'Múltiples fuentes y canales' },
  { Icono: Files, titulo: 'Estructuración', detalle: 'Clasificación, organización y normalización' },
  { Icono: Check, titulo: 'Validación', detalle: 'Contraste de fuentes y estado de la información' },
  { Icono: MapPinned, titulo: 'Catálogo territorial', detalle: 'Oferta organizada y trazable' },
  { Icono: BarChart3, titulo: 'Analítica', detalle: 'Visualización de evidencia y brechas' },
  { Icono: Search, titulo: 'Búsqueda semántica', detalle: 'Lenguaje natural, filtros y categorías' },
  { Icono: Waypoints, titulo: 'ATLAS_C6', detalle: 'Sistema Inteligente de Identidad Territorial' },
];

export default function Inicio({ onNavigate }: Props) {
  const { data: validacion } = useApi<Validacion[]>('/api/validacion');
  const indicador = (fragmento: string) => validacion?.find((fila) => fila.indicador.includes(fragmento));
  const muestra = indicador('Residentes de Comuna 6')?.n;
  const hallazgos = [
    { etiqueta: 'Consideró útil un sistema integrado', clave: 'Consideran útil un sistema integrado', lectura: 'Lo consideró útil o muy útil', Icono: UsersRound },
    { etiqueta: 'Prefirió buscar escribiendo lo que necesita', clave: 'Buscar escribiendo lo que necesito', lectura: 'Priorizó la búsqueda en lenguaje natural', Icono: Search },
    { etiqueta: 'Reportó información no actualizada', clave: 'Información no parece actualizada', lectura: 'Reportó esta dificultad al buscar oferta', Icono: Files },
    { etiqueta: 'Consideró importante ubicación y precios', clave: 'Ubicación importante para decidir', lectura: 'También señaló precios como información relevante', Icono: MapPinned },
  ].map((item) => ({ ...item, resultado: indicador(item.clave) }));

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <img className="home-photo" src="/comuna6.png" alt="Vista de la Comuna 6, con su paisaje de ladera y vida barrial" />
        <div className="home-shade" aria-hidden="true" />
        <div className="shell home-hero-inner">
          <div className="home-copy">
            <p className="home-location"><MapPinned size={16} aria-hidden="true" /> COMUNA 6 · DOCE DE OCTUBRE · MEDELLÍN</p>
            <h1 id="home-title">¿POR QUÉ<br />ATLAS C6?</h1>
            <p className="home-lede">
              De información territorial dispersa a conocimiento y conexión.
            </p>
            <p className="home-hero-note">Evidencia para entender por qué es pertinente explorar un sistema inteligente de identidad territorial en la Comuna 6.</p>
            <div className="home-actions">
              <button className="home-cta home-cta-primary" onClick={() => onNavigate('investigacion')}>
                Explorar el análisis <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button className="home-cta home-cta-secondary" onClick={() => onNavigate('oferta')}>
                Ver oferta territorial
              </button>
            </div>
          </div>
          <a className="home-down" href="#razon-de-ser" aria-label="Continuar a la descripción de ATLAS C6">
            <span>CONOCE LA PROPUESTA</span><ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="home-content" id="razon-de-ser" aria-labelledby="reason-title">
        <div className="shell">
          <div className="home-section-heading">
            <p className="home-kicker">EVIDENCIA PARA ENTENDER EL RETO</p>
            <h2 id="reason-title">Siete investigaciones construyen el punto de partida</h2>
            <p>El territorio ya tiene oferta, actores e identidad. El reto identificado es cómo organizar y hacer descubrible esa información.</p>
          </div>

          <div className="home-evidence-grid">
            <article className="home-panel home-studies">
              <div className="home-panel-heading">
                <span className="home-panel-number">01</span>
                <div><h3>¿Qué encontramos?</h3><p>Investigaciones que construyen la evidencia</p></div>
              </div>
              <div className="home-study-grid">
                {INVESTIGACIONES.map(([codigo, titulo]) => (
                  <div className="home-study" key={codigo}>
                    <span>{codigo}</span><strong>{titulo}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="home-panel home-offer">
              <div className="home-panel-heading">
                <span className="home-panel-number">02</span>
                <div><h3>La oferta existe</h3><p>Diversidad de actividades y actores documentados</p></div>
              </div>
              <div className="home-offer-grid">
                {TIPOS_OFERTA.map((tipo, i) => <span className={`home-offer-type type-${i + 1}`} key={tipo}>{tipo}</span>)}
                <div className="home-offer-total"><strong>50+</strong><span>activos reportados por INV-006</span></div>
              </div>
              <p className="home-panel-note">Incluye organizaciones, escenarios, eventos, colectivos y programas. Requiere validar vigencia; no representa un censo total de la oferta.</p>
            </article>

            <article className="home-panel home-scatter">
              <div className="home-panel-heading">
                <span className="home-panel-number">03</span>
                <div><h3>Pero la información está distribuida</h3><p>Fuentes y canales distintos, sin una estructura pública única que integre toda la oferta territorial.</p></div>
              </div>
              <div className="home-scatter-grid">
                <div><h4>Fuentes y canales</h4><ul>{FUENTES.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <ArrowRight className="home-scatter-arrow" size={22} aria-hidden="true" />
                <div><h4>Información fragmentada</h4><ul>{CAMPOS_DISPERSOS.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <ArrowRight className="home-scatter-arrow" size={22} aria-hidden="true" />
                <div><h4>Diferencias entre fuentes</h4><ul>{DIFERENCIAS.map((x) => <li key={x}>{x}</li>)}</ul></div>
              </div>
            </article>

            <article className="home-panel home-survey">
              <div className="home-panel-heading">
                <span className="home-panel-number">04</span>
                <div><h3>¿Qué dice la exploración con habitantes?</h3><p>Resultados de validación exploratoria (INV-008)</p></div>
              </div>
              <div className="home-survey-grid">
                {hallazgos.map(({ etiqueta, lectura, Icono, resultado }) => (
                  <div className="home-stat" key={etiqueta}>
                    <Icono size={19} aria-hidden="true" />
                    <strong>{resultado ? fmtPct(resultado.porcentaje) : '—'}</strong>
                    <span>{lectura}</span>
                    <small>{resultado ? `${resultado.n} de ${resultado.n ? (muestra ?? resultado.n) : '—'} personas` : etiqueta}</small>
                  </div>
                ))}
              </div>
              <p className="home-panel-note">Muestra de conveniencia, no probabilística. Resultados no generalizables a toda la población.</p>
            </article>

            <article className="home-panel home-dimensions">
              <div className="home-panel-heading">
                <span className="home-panel-number">05</span>
                <div><h3>¿Qué tiene que ver esto con el reto?</h3><p>La evidencia se relaciona con dimensiones del reto de economía cultural, identidad territorial y acceso a mercados.</p></div>
              </div>
              <div className="home-dimension-grid">
                {DIMENSIONES.map((dimension, i) => (
                  <div className={`home-dimension dimension-${i + 1}`} key={dimension.titulo}>
                    <h4>{dimension.titulo}</h4><ul>{dimension.puntos.map((punto) => <li key={punto}>{punto}</li>)}</ul>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="home-caveat"><ShieldCheck size={19} aria-hidden="true" /><p>La investigación identifica estas dimensiones como parte del reto, pero no permite atribuir a la fragmentación de información un efecto económico causal ni medir la demanda específica de manera completa.</p></aside>
        </div>
      </section>

      <section className="home-flow" aria-labelledby="flow-title">
        <div className="shell">
          <div className="home-flow-intro">
            <p className="home-kicker">06 · LA PROPUESTA</p>
            <h2 id="flow-title">De información dispersa a una infraestructura territorial</h2>
          </div>
          <div className="home-process">
            {ETAPAS.map(({ Icono, titulo, detalle }, i) => (
              <article className={`home-process-step${i === ETAPAS.length - 1 ? ' home-process-final' : ''}`} key={titulo}>
                <Icono size={21} strokeWidth={1.9} aria-hidden="true" />
                <div><h3>{titulo}</h3><p>{detalle}</p></div>
                {i < ETAPAS.length - 1 && <ArrowRight className="home-process-arrow" size={16} aria-hidden="true" />}
              </article>
            ))}
          </div>
          <div className="home-closing">
            <div><strong>ATLAS_C6 no crea la oferta.</strong><h3>Organiza la información para hacerla más descubrible y conectable.</h3></div>
            <p>La inteligencia está en estructurar datos verificables, interpretar consultas y mantener la trazabilidad de las fuentes.<br /><span>Prototipo conceptual · Información basada en investigación y validación exploratoria.</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}