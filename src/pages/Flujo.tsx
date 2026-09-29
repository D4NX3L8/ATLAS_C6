import React from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight,
  Check, CircleHelp, Database, FileCheck2, Layers3, Link2, ListFilter,
  MapPin, Network, Search, SearchCheck, ShieldCheck, Sparkles, Tags, UserRound,
} from 'lucide-react';

const ETAPAS = [
  { titulo: 'Fuentes', corto: 'Fuentes', Icono: Database, tipo: 'EVIDENCIA', bajada: 'La información territorial existe, pero está distribuida.' },
  { titulo: 'Estructurar', corto: 'Estructuración', Icono: Layers3, tipo: 'ORGANIZACIÓN', bajada: 'Clasificar, normalizar y registrar lo que cada fuente contiene.' },
  { titulo: 'Catálogo territorial', corto: 'Catálogo', Icono: Network, tipo: 'INFORMACIÓN TRAZABLE', bajada: 'Consultar registros organizados por categorías y territorio.' },
  { titulo: 'Necesidad del usuario', corto: 'Necesidad', Icono: UserRound, tipo: 'EXPERIENCIA CONCEPTUAL', bajada: 'La persona expresa lo que necesita en sus propias palabras.' },
  { titulo: 'Interpretar y buscar', corto: 'Interpretación', Icono: SearchCheck, tipo: 'PROPUESTA', bajada: 'Relacionar la consulta con información estructurada disponible.' },
  { titulo: 'Resultados', corto: 'Resultados', Icono: ListFilter, tipo: 'SALIDA TRAZABLE', bajada: 'Presentar registros pertinentes y mostrar de dónde provienen.' },
];

const FUENTES = [
  'Fuentes institucionales', 'Datos abiertos', 'Google / buscadores', 'Google Maps',
  'Redes sociales', 'Agendas culturales', 'Directorios / plataformas', 'Fuentes comunitarias',
];
const CATEGORIAS = ['Cultura', 'Comercio', 'Servicios', 'Emprendimientos', 'Organizaciones', 'Artistas', 'Eventos', 'Espacios', 'Activos territoriales'];
const CAMPOS = ['Nombre', 'Categoría', 'Ubicación', 'Tipo de actor', 'Producto / servicio', 'Contacto', 'Horarios', 'Fuente', 'Fecha de verificación', 'Estado de información'];
const DIMENSIONES = ['Qué busca', 'Categoría', 'Ubicación', 'Tiempo', 'Características relevantes'];
const ETAPAS_REGISTRO = ['Clasificación', 'Normalización', 'Verificación', 'Registro de fuente'];

export default function Flujo() {
  const [activa, setActiva] = React.useState(0);

  function avanzar(direccion: number) {
    setActiva((actual) => Math.max(0, Math.min(ETAPAS.length - 1, actual + direccion)));
  }

  return (
    <div className="flow-page">
      <header className="flow-header">
        <div>
          <p className="flow-kicker"><span /> SISTEMA INTELIGENTE DE IDENTIDAD TERRITORIAL · COMUNA 6, MEDELLÍN</p>
          <h1>¿Cómo funcionaría ATLAS_C6?</h1>
          <p className="flow-lede">Transforma información territorial distribuida en una experiencia de búsqueda y descubrimiento estructurada, consultable y trazable.</p>
        </div>
        <span className="flow-concept-tag"><CircleHelp size={14} /> Prototipo conceptual · Funcionamiento propuesto</span>
      </header>

      <div className="flow-reading-key" aria-label="Lectura del flujo">
        <span><i className="key-evidence" /> Evidencia disponible</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span><i className="key-structure" /> Estructuración</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span><i className="key-proposal" /> Propuesta</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span><i className="key-experience" /> Experiencia conceptual</span>
      </div>

      <nav className="flow-rail" aria-label="Etapas del funcionamiento propuesto">
        {ETAPAS.map(({ titulo, Icono, tipo }, i) => (
          <React.Fragment key={titulo}>
            <button
              className={`flow-stage${activa === i ? ' is-active' : ''}`}
              aria-current={activa === i ? 'step' : undefined}
              onClick={() => setActiva(i)}
            >
              <span className="flow-stage-top"><span className="flow-stage-number">0{i + 1}</span><Icono size={19} strokeWidth={1.8} /></span>
              <span className="flow-stage-type">{tipo}</span>
              <strong>{titulo}</strong>
              <span className="flow-stage-blurb">{bajadaStage(i)}</span>
            </button>
            {i < ETAPAS.length - 1 && <ArrowRight className="flow-stage-arrow" size={17} aria-hidden="true" />}
          </React.Fragment>
        ))}
      </nav>

      <section className="flow-detail" aria-live="polite" aria-labelledby="flow-detail-title">
        <div className="flow-detail-header">
          <div className="flow-detail-heading">
            <span className="flow-detail-index">0{activa + 1}</span>
            <div>
              <span className="flow-detail-kicker">ETAPA {activa + 1} DE {ETAPAS.length}</span>
              <h2 id="flow-detail-title">{ETAPAS[activa].titulo}</h2>
            </div>
          </div>
          <div className="flow-step-controls">
            <button className="flow-step-btn" onClick={() => avanzar(-1)} disabled={activa === 0} aria-label="Etapa anterior"><ArrowLeft size={17} /></button>
            <span>{String(activa + 1).padStart(2, '0')} / 06</span>
            <button className="flow-step-btn" onClick={() => avanzar(1)} disabled={activa === ETAPAS.length - 1} aria-label="Etapa siguiente"><ArrowRight size={17} /></button>
          </div>
        </div>
        <div className="flow-detail-body">{contenidoEtapa(activa)}</div>
      </section>

      <section className="flow-intelligence" aria-labelledby="flow-intelligence-title">
        <div className="flow-intelligence-head">
          <div><span className="flow-detail-kicker">EL ELEMENTO DIFERENCIAL</span><h2 id="flow-intelligence-title">¿Dónde está la inteligencia?</h2></div>
          <Network size={22} aria-hidden="true" />
        </div>
        <div className="flow-intelligence-grid">
          <article><span>01</span><Search size={19} /><h3>Interpretar</h3><p>Comprender la necesidad expresada en lenguaje natural.</p></article>
          <ArrowRight className="flow-intelligence-arrow" size={18} aria-hidden="true" />
          <article><span>02</span><Link2 size={19} /><h3>Conectar</h3><p>Relacionar la consulta con información territorial estructurada.</p></article>
          <ArrowRight className="flow-intelligence-arrow" size={18} aria-hidden="true" />
          <article><span>03</span><FileCheck2 size={19} /><h3>Trazar</h3><p>Mostrar de dónde proviene la información utilizada.</p></article>
        </div>
        <p className="flow-intelligence-rule">La IA no inventa la oferta. <span>Interpreta la consulta y recupera información del catálogo.</span></p>
      </section>

      <footer className="flow-outcome">
        <div className="flow-outcome-mark"><Network size={24} /></div>
        <div className="flow-outcome-copy">
          <span className="flow-detail-kicker">ATLAS_C6</span>
          <h2>De información territorial dispersa <ArrowDown size={19} aria-hidden="true" /> a una experiencia de descubrimiento territorial.</h2>
          <p>Una propuesta para hacer más consultable, descubrible y conectable la información existente del territorio.</p>
        </div>
        <span className="flow-outcome-label">FUNCIONAMIENTO PROPUESTO</span>
      </footer>
    </div>
  );
}

function bajadaStage(i: number) {
  return ETAPAS[i].bajada;
}

function contenidoEtapa(indice: number) {
  if (indice === 0) return (
    <div className="flow-source-layout">
      <div className="flow-source-cloud">{FUENTES.map((x) => <span key={x}><Database size={13} />{x}</span>)}</div>
      <div className="flow-source-result"><span className="flow-mini-label">ENTRADA</span><ArrowRight size={19} /><strong>Información distribuida</strong><p>Fuentes heterogéneas; no se asume conexión automática entre ellas.</p></div>
    </div>
  );
  if (indice === 1) return (
    <div className="flow-structure-layout">
      <div className="flow-steps-vertical">{ETAPAS_REGISTRO.map((x, i) => <React.Fragment key={x}><span><b>0{i + 1}</b>{x}</span>{i < ETAPAS_REGISTRO.length - 1 && <ArrowDown size={14} />}</React.Fragment>)}</div>
      <div className="flow-record">
        <div className="flow-record-head"><FileCheck2 size={17} /><div><strong>Registro territorial</strong><span>Campos según información disponible</span></div><span className="flow-record-badge"><ShieldCheck size={12} /> TRAZABLE</span></div>
        <div className="flow-field-grid">{CAMPOS.map((x, i) => <span key={x}><small>{x}</small><b className={i === 0 || i === 1 || i === 7 ? 'field-available' : 'field-variable'}>{i === 0 || i === 1 || i === 7 ? 'Según fuente' : 'Puede no estar disponible'}</b></span>)}</div>
        <p className="flow-record-foot"><ShieldCheck size={13} /> Información disponible según fuente · No se completan campos faltantes.</p>
      </div>
    </div>
  );
  if (indice === 2) return (
    <div className="flow-catalog-layout">
      <div className="flow-category-wrap"><span className="flow-mini-label">CATEGORÍAS ORGANIZABLES</span><div className="flow-category-grid">{CATEGORIAS.map((x) => <span key={x}><Tags size={13} />{x}</span>)}</div></div>
      <div className="flow-catalog-side"><div className="flow-filter-row"><ListFilter size={15} /><strong>Filtros de consulta</strong></div><div className="flow-filter-chips">{['Categoría', 'Barrio', 'Ubicación', 'Tipo de actor'].map((x) => <span key={x}>{x}</span>)}</div><div className="flow-trace-mark"><Link2 size={16} /><span><b>Información trazable</b><small>Un registro conserva su referencia de origen.</small></span></div></div>
    </div>
  );
  if (indice === 3) return (
    <div className="flow-query-layout">
      <div className="flow-query-device"><div className="flow-query-top"><span /><span /><span /><small>INTERACCIÓN PROPUESTA</small></div><label htmlFor="flow-query">¿Qué necesitas encontrar?</label><div className="flow-query-input"><Search size={17} /><input id="flow-query" defaultValue="Busco actividades culturales para este fin de semana en la Comuna 6." /><button type="button" onClick={() => document.getElementById('flow-query')?.focus()} aria-label="Editar consulta"><ArrowUpRight size={17} /></button></div><p><Sparkles size={13} /> Búsqueda en lenguaje natural · Ejemplo conceptual, no conectado a un servicio.</p></div>
      <div className="flow-query-person"><UserRound size={26} /><span>La persona describe su necesidad<br /><b>con sus propias palabras</b></span></div>
    </div>
  );
  if (indice === 4) return (
    <div className="flow-interpret-layout"><div className="flow-interpret-steps">{['Consulta del usuario', 'Interpretación semántica', 'Filtros territoriales', 'Consulta del catálogo', 'Resultados pertinentes'].map((x, i) => <React.Fragment key={x}><div className={i === 1 ? 'is-proposal' : ''}><span>0{i + 1}</span><strong>{x}</strong></div>{i < 4 && <ArrowDown size={14} />}</React.Fragment>)}</div><div className="flow-interpret-side"><span className="flow-mini-label">CONCEPTOS QUE PUEDE IDENTIFICAR</span>{DIMENSIONES.map((x) => <span className="flow-concept-chip" key={x}><Check size={13} />{x}</span>)}<div className="flow-structured-note"><ShieldCheck size={15} /><span><b>Consulta sobre información estructurada</b><small>Resultados basados en registros disponibles.</small></span></div></div></div>
  );
  return (
    <div className="flow-results-layout"><div className="flow-results-head"><span className="flow-mini-label">PLANTILLAS DE RESULTADO · SIN DATOS DE PRODUCCIÓN</span><span><SearchCheck size={14} /> Registros pertinentes disponibles</span></div><div className="flow-result-grid">{[1, 2, 3].map((n) => <article className="flow-result-card" key={n}><div className="flow-result-title"><span className="flow-result-icon"><MapPin size={15} /></span><strong>Resultado territorial</strong><span className="flow-result-number">0{n}</span></div><div className="flow-result-meta"><span>Categoría según registro</span><span>Ubicación según registro</span></div><p>Información disponible en el registro consultado.</p><div className="flow-result-source"><Link2 size={13} /><span>Fuente: registro consultado</span><ArrowUpRight size={13} /></div><div className="flow-result-actions"><span>Ver fuente</span><span>Ver ficha</span><span>Comparar</span></div></article>)}</div></div>
  );
}
