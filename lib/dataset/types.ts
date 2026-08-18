export type DatasetColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'unknown'

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