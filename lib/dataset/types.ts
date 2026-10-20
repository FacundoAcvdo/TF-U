export type DatasetColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'unknown'

const ETIQUETA_TIPO_COLUMNA: Record<DatasetColumnType, string> = {
  string: 'texto',
  number: 'número',
  boolean: 'booleano',
  date: 'fecha',
  unknown: 'desconocido',
}

export function etiquetaTipoColumna(tipo: DatasetColumnType): string {
  return ETIQUETA_TIPO_COLUMNA[tipo] ?? tipo
}

export type DatasetColumn = {
  name: string
  type: DatasetColumnType
}

export type DatasetPreviewData = {
  columns: DatasetColumn[]
  rows: Record<string, unknown>[]
  totalRows: number
  textColumn?: string
  classColumn?: string
}