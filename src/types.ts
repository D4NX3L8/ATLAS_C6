export interface Meta { n: number | null; activos_catalogados: number; activos_reportados: number | null; fuentes: number; brechas: number; campos_calidad: number; crud_protegido?: boolean; }
export interface Validacion { id: number; indicador: string; n: number; porcentaje: number; territorio: string; anio: number | null; tipo_evidencia: string; fuente: string; nota: string; categoria: string; orden: number; }
export interface Evidencia { id: number; indicador: string; valor: number; unidad: string; territorio: string; anio: number | null; nivel: string; fuente: string; uso: string; ambito: string; }
export interface Activo { id: number; orden: number | null; nombre: string; tipo_activo: string; ubicacion: string; anio: number | null; nivel_evidencia: string; identidad: string; ingresos: string; mercados: string; visibilidad: string; descripcion: string; origen: string; creado_en: string; actualizado_en: string; }
export interface Estructura { id: number; indicador: string; valor: number; unidad: string; territorio: string; anio: number | null; fuente: string; observacion: string; }
export interface Canal { id: number; canal: string; tipo: string; cobertura: string; tipo_oferta: string; informacion: string; limitacion: string; fuente: string; estado: string; }
export interface Brecha { id: number; variable: string; territorio: string; estado: string; implicacion: string; fuente: string; tipo: string; }
export interface CampoCalidad { id: number; campo: string; mide: string; prioridad: string; origen: string; aplicacion: string; }

/* ---------- catálogo del CRUD genérico ---------- */
export type TipoCampo = 'txt' | 'largo' | 'num' | 'int' | 'anio' | 'enum' | 'sug';

export interface CampoCrud {
  nombre: string;
  label: string;
  tipo: TipoCampo;
  req: boolean;
  opciones: string[] | null;
  min: number | null;
  max: number | null;
  ayuda: string | null;
}

export interface TipoInfo {
  tabla: string;
  titulo: string;
  em: string;
  desc: string;
  principal: boolean;
  tituloCol: string;
  subtituloCol: string;
  campos: CampoCrud[];
  conteo: number;
  manuales: number;
}

export type FilaCrud = Record<string, string | number | null> & { id: number; procedencia?: string };
