PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS validacion;
DROP TABLE IF EXISTS evidencia;
DROP TABLE IF EXISTS activos;
DROP TABLE IF EXISTS estructura;
DROP TABLE IF EXISTS canales;
DROP TABLE IF EXISTS brechas;
DROP TABLE IF EXISTS campos_calidad;

-- Hoja 1 · A. Validación exploratoria n=28 (muestra de conveniencia, no probabilística)
CREATE TABLE validacion (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  indicador     TEXT    NOT NULL,
  n             INTEGER NOT NULL,
  porcentaje    REAL    NOT NULL,
  territorio    TEXT    NOT NULL,
  anio          INTEGER,
  tipo_evidencia TEXT   NOT NULL,
  fuente        TEXT    NOT NULL,
  nota          TEXT    NOT NULL,
  categoria     TEXT    NOT NULL,
  orden         INTEGER NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 1 · B. Indicadores territoriales y de demanda contextual
CREATE TABLE evidencia (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  indicador     TEXT    NOT NULL,
  valor         REAL    NOT NULL,
  unidad        TEXT    NOT NULL,
  territorio    TEXT    NOT NULL,
  anio          INTEGER,
  nivel         TEXT    NOT NULL,
  fuente        TEXT    NOT NULL,
  uso           TEXT    NOT NULL,
  ambito        TEXT    NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 2 · A. Catálogo de activos culturales y territoriales (CRUD)
CREATE TABLE activos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  orden         INTEGER,
  nombre        TEXT    NOT NULL,
  tipo_activo   TEXT    NOT NULL,
  ubicacion     TEXT    NOT NULL,
  anio          INTEGER,
  nivel_evidencia TEXT  NOT NULL,
  identidad     TEXT    NOT NULL,
  ingresos      TEXT    NOT NULL,
  mercados      TEXT    NOT NULL,
  visibilidad   TEXT    NOT NULL,
  descripcion   TEXT    NOT NULL,
  origen        TEXT    NOT NULL DEFAULT 'INV-003 / INV-006',
  creado_en     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  actualizado_en TEXT   NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 2 · B. Estructura económica y cultural documentada
CREATE TABLE estructura (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  indicador     TEXT    NOT NULL,
  valor         REAL    NOT NULL,
  unidad        TEXT    NOT NULL,
  territorio    TEXT    NOT NULL,
  anio          INTEGER,
  fuente        TEXT    NOT NULL,
  observacion   TEXT    NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 3 · A. Canales y fuentes de descubrimiento
CREATE TABLE canales (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  canal         TEXT    NOT NULL,
  tipo          TEXT    NOT NULL,
  cobertura     TEXT    NOT NULL,
  tipo_oferta   TEXT    NOT NULL,
  informacion   TEXT    NOT NULL,
  limitacion    TEXT    NOT NULL,
  fuente        TEXT    NOT NULL,
  estado        TEXT    NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 3 · B. Brechas de información documentadas
CREATE TABLE brechas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  variable      TEXT    NOT NULL,
  territorio    TEXT    NOT NULL,
  estado        TEXT    NOT NULL,
  implicacion   TEXT    NOT NULL,
  fuente        TEXT    NOT NULL,
  tipo          TEXT    NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);

-- Hoja 3 · C. Campos de calidad y trazabilidad por registro
CREATE TABLE campos_calidad (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  campo         TEXT    NOT NULL,
  mide          TEXT    NOT NULL,
  prioridad     TEXT    NOT NULL,
  origen        TEXT    NOT NULL,
  aplicacion    TEXT    NOT NULL,
  procedencia   TEXT    NOT NULL DEFAULT 'XLSX'
);
