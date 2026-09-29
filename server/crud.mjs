// Registro de tablas editables y CRUD genérico.
// Cada tabla declara sus campos con tipo, obligatoriedad y lista de valores admitidos.
// Los nombres de columna NUNCA se interpolan desde el cliente: salen de este registro,
// lo que hace imposible una inyección de SQL por nombre de campo.

const txt = (label, opts = {}) => ({ label, tipo: 'txt', ...opts });
const largo = (label, opts = {}) => ({ label, tipo: 'largo', ...opts });
const num = (label, opts = {}) => ({ label, tipo: 'num', ...opts });
const ent = (label, opts = {}) => ({ label, tipo: 'int', ...opts });
const anio = (label = 'Año') => ({ label, tipo: 'anio' });
const sel = (label, opciones, opts = {}) => ({ label, tipo: 'enum', opciones, ...opts });
const sug = (label, opciones, opts = {}) => ({ label, tipo: 'sug', opciones, ...opts });

export const NIVELES = ['Alto', 'Medio', 'Bajo', 'No medido', 'Pendiente de validación'];

/** Estados de brecha: el brief prohíbe reportar una brecha como 0. */
export const ESTADOS_BRECHA = ['No disponible', 'No disponible documentalmente', 'No disponible públicamente', 'No medida'];

/** Leakage: en una brecha, el valor 0 está prohibido por regla del brief. */

export const TABLAS = {
  activos: {
    titulo: 'Activos territoriales',
    em: '🏛️',
    desc: 'Catálogo de activos culturales, educativos y sociales documentados en la Comuna 6.',
    principal: true,
    tituloCol: 'nombre',
    subtituloCol: 'tipo_activo',
    campos: {
      nombre: txt('Nombre del activo', { req: true }),
      tipo_activo: sug('Tipo de activo', [
        'Cultural', 'Educativo', 'Deporte', 'Social', 'Ambiental', 'Espacio público', 'Economico',
      ], { req: true }),
      ubicacion: txt('Ubicación', { req: true, ayuda: 'Barrio o zona dentro de la Comuna 6.' }),
      anio: anio(),
      nivel_evidencia: sel('Nivel de evidencia', NIVELES, { req: true }),
      identidad: sel('Identidad', NIVELES, { req: true }),
      ingresos: sel('Ingresos', NIVELES, { req: true }),
      mercados: sel('Mercados', NIVELES, { req: true }),
      visibilidad: sel('Visibilidad', NIVELES, { req: true }),
      descripcion: largo('Descripción', { req: true }),
      origen: txt('Fuente / referencia', { req: true, defecto: 'Manual' }),
      orden: ent('Orden de presentación'),
    },
  },

  validacion: {
    titulo: 'Indicadores validados',
    em: '✅',
    desc: 'Resultados de la validación exploratoria. n = 28 es una muestra de conveniencia, no probabilística.',
    tituloCol: 'indicador',
    subtituloCol: 'categoria',
    campos: {
      indicador: txt('Indicador', { req: true }),
      n: ent('Respuestas (n)', { req: true, min: 0, max: 1_000_000 }),
      porcentaje: num('Porcentaje', { req: true, min: 0, max: 100 }),
      territorio: sug('Territorio', ['Comuna 6'], { req: true }),
      anio: anio(),
      tipo_evidencia: sel('Tipo de evidencia', ['Exploratoria'], { req: true }),
      fuente: txt('Fuente', { req: true }),
      nota: largo('Nota', { req: true }),
      categoria: sug('Categoría', [
        'Canales de descubrimiento', 'Conocimiento de oferta local', 'Dificultades',
        'Funcionalidades priorizadas', 'Información para decidir', 'Muestra',
        'Tipo de oferta buscada', 'Utilidad del sistema',
      ], { req: true }),
      orden: ent('Orden'),
    },
  },

  evidencia: {
    titulo: 'Evidencia territorial',
    em: '📊',
    desc: 'Indicadores de demanda y territorio. "Histórico" exige año; "Contextual" no es de la Comuna 6.',
    tituloCol: 'indicador',
    subtituloCol: 'unidad',
    campos: {
      indicador: txt('Indicador', { req: true }),
      valor: num('Valor', { req: true }),
      unidad: sug('Unidad', [
        '%', '% del gasto', '+ restaurantes', 'emprendedores', 'equipamiento', 'equipamientos',
        'espacios', 'espacios/eventos', 'eventos', 'hogares', 'millones COP +',
      ], { req: true }),
      territorio: sug('Territorio', ['Comuna 6', 'Medellín', 'Colombia'], { req: true }),
      anio: anio(),
      nivel: sel('Nivel', ['Alto', 'Medio', 'Bajo', 'Medio-Alto', 'Alto / contexto', 'Medio / contexto'], { req: true }),
      fuente: txt('Fuente', { req: true }),
      uso: largo('Uso en la lectura', { req: true }),
      ambito: sel('Ámbito', ['Historico', 'Contextual'], { req: true }),
    },
  },

  estructura: {
    titulo: 'Estructura económica y cultural',
    em: '🏗️',
    desc: 'Magnitudes estructurales documentadas para el territorio.',
    tituloCol: 'indicador',
    subtituloCol: 'unidad',
    campos: {
      indicador: txt('Indicador', { req: true }),
      valor: num('Valor', { req: true }),
      unidad: sug('Unidad', ['%', 'activos (mínimo)', 'hogares'], { req: true }),
      territorio: sug('Territorio', ['Comuna 6', 'Medellín', 'Colombia'], { req: true }),
      anio: anio(),
      fuente: txt('Fuente', { req: true }),
      observacion: largo('Observación', { req: true }),
    },
  },

  canales: {
    titulo: 'Canales de descubrimiento',
    em: '📡',
    desc: 'Fuentes y medios por los que la comunidad encuentra la oferta.',
    tituloCol: 'canal',
    subtituloCol: 'tipo',
    campos: {
      canal: txt('Canal', { req: true }),
      tipo: sug('Tipo', [
        'Buscador', 'Canal de contacto', 'Comunitario', 'Datos abiertos', 'Empresarial / institucional',
        'Estadística oficial', 'Institucional', 'Institucional / cultural', 'Mapa / buscador',
        'Plataforma comercial', 'Red social',
      ], { req: true }),
      cobertura: sug('Cobertura', [
        'Irregular', 'No determinada', 'Parcial', 'Parcial / no determinada', 'Parcial / variable',
        'Presencia documentada', 'Presencia documentada / no cuantificada',
      ], { req: true }),
      tipo_oferta: sug('Tipo de oferta', [
        'Bibliotecas / cultura / eventos', 'Comercio / servicios', 'Cultura / eventos / programas',
        'Emprendimientos / comunidad / oferta local', 'Emprendimientos / cultura / comercio',
        'Empresas / población / territorio', 'Empresas / territorio / indicadores', 'Empresas formales',
        'Eventos / cultura', 'Gastronomía / comercio', 'Información territorial / comunidad',
        'Múltiple', 'Negocios / servicios', 'Oferta / cultura / emprendimientos',
      ], { req: true }),
      informacion: largo('Información que aporta', { req: true }),
      limitacion: largo('Limitación', { req: true }),
      fuente: txt('Fuente', { req: true }),
      estado: sug('Estado', [
        'Campo de catálogo cuando exista', 'Fuente complementaria', 'Fuente contextual/estructurante',
        'Fuente estructurante', 'Fuente prioritaria', 'Fuente prioritaria para eventos',
        'Fuente seleccionable; requiere normalización/verificación',
      ], { req: true }),
    },
  },

  brechas: {
    titulo: 'Brechas de información',
    em: '🕳️',
    desc: 'Variables sin dato verificable. Nunca se reportan como 0: se declaran "no disponible" o "no medida".',
    tituloCol: 'variable',
    subtituloCol: 'estado',
    campos: {
      variable: txt('Variable', { req: true }),
      territorio: sug('Territorio', ['Comuna 6', 'Medellín', 'Colombia'], { req: true }),
      estado: sel('Estado', ESTADOS_BRECHA, { req: true }),
      implicacion: largo('Implicación para la lectura', { req: true }),
      fuente: txt('Fuente', { req: true }),
      tipo: sel('Tipo', ['Brecha', 'Brecha + validación'], { req: true }),
    },
  },

  campos_calidad: {
    titulo: 'Campos de calidad y trazabilidad',
    em: '🧭',
    desc: 'Definición de cada campo capturado y su prioridad de completitud.',
    tituloCol: 'campo',
    subtituloCol: 'mide',
    campos: {
      campo: txt('Campo', { req: true }),
      mide: largo('Qué mide', { req: true }),
      prioridad: sel('Prioridad', ['Alta', 'Media'], { req: true }),
      origen: txt('Origen del dato', { req: true }),
      aplicacion: largo('Aplicación en ATLAS C6', { req: true }),
    },
  },
};

export const NOMBRES = Object.keys(TABLAS);

const esTabla = (t) => Object.hasOwn(TABLAS, t);

/**
 * Valida el REGISTRO COMPLETO (ya fusionado con lo existente en un PUT).
 * `solo` limita qué campos se escriben; la validación se hace siempre sobre el
 * estado final, de modo que un PUT parcial no puede dejar un registro inválido.
 */
export function validar(t, registro, { solo } = {}) {
  if (!esTabla(t)) return { __tabla: 'Tabla no permitida.' };
  const campos = TABLAS[t].campos;
  const salida = {};
  const limpios = {};

  for (const [nombre, def] of Object.entries(campos)) {
    const viene = registro?.[nombre];
    const vacio = viene === undefined || viene === null || String(viene).trim() === '';

    if (vacio) {
      if (def.req) salida[nombre] = 'Campo obligatorio.';
      continue;
    }

    switch (def.tipo) {
      case 'num': {
        const n = Number(viene);
        if (!Number.isFinite(n)) salida[nombre] = 'Debe ser un número.';
        else if (def.min !== undefined && n < def.min) salida[nombre] = `Mínimo ${def.min}.`;
        else if (def.max !== undefined && n > def.max) salida[nombre] = `Máximo ${def.max}.`;
        else limpios[nombre] = n;
        break;
      }
      case 'int': {
        const n = Number(viene);
        if (!Number.isInteger(n)) salida[nombre] = 'Debe ser un número entero.';
        else if (def.min !== undefined && n < def.min) salida[nombre] = `Mínimo ${def.min}.`;
        else if (def.max !== undefined && n > def.max) salida[nombre] = `Máximo ${def.max}.`;
        else limpios[nombre] = n;
        break;
      }
      case 'anio': {
        const n = Number(viene);
        if (!Number.isInteger(n) || n < 1900 || n > 2100) salida[nombre] = 'Año inválido (1900–2100).';
        else limpios[nombre] = n;
        break;
      }
      case 'enum': {
        const s = String(viene).trim();
        if (!def.opciones.includes(s)) salida[nombre] = `Valor no válido. Opciones: ${def.opciones.join(', ')}.`;
        else limpios[nombre] = s;
        break;
      }
      default: {
        const s = String(viene).trim();
        if (s.length > 2000) salida[nombre] = 'Texto demasiado largo (máx. 2000 caracteres).';
        else limpios[nombre] = s;
        break;
      }
    }
  }

  // Regla del brief: un indicador histórico siempre lleva año explícito.
  if (limpios.ambito === 'Historico' && !limpios.anio) {
    salida.anio = 'Un indicador con ámbito "Historico" debe llevar su año explícito.';
  }

  // Regla del brief: una brecha no se reporta como 0. El campo es un enum de texto,
  // así que basta con impedir que llegue el literal 0 o un estado que lo simule.
  if (t === 'brechas' && !salida.estado) {
    const est = String(registro?.estado ?? '').trim();
    if (/^0(\.0+)?$/.test(est) || /^(cero|no medido = 0)$/i.test(est)) {
      salida.estado = 'Una brecha no se reporta como 0. Use "No disponible" o "No medida".';
    }
  }

  const aEscribir = solo
    ? Object.fromEntries(Object.entries(limpios).filter(([k]) => solo.has(k)))
    : limpios;

  return { errores: salida, datos: aEscribir, todos: limpios };
}
