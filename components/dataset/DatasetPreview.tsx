'use client'

import type { DatasetPreviewData } from '@/lib/dataset/types'
import { etiquetaTipoColumna } from '@/lib/dataset/types'
import { Badge } from '@/components/ui/badge'

type DatasetPreviewProps = {
  preview: DatasetPreviewData
}

export function DatasetPreview({
  preview,
}: DatasetPreviewProps) {
  if (preview.columns.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        El archivo no contiene datos.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">
            Vista previa
          </h3>

          <p className="text-xs text-muted-foreground">
            Mostrando {preview.rows.length} filas de{' '}
            {preview.totalRows.toLocaleString('es')}
          </p>
        </div>

        <Badge variant="secondary">
          {preview.columns.length} columnas
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {preview.columns.map((column) => (
                <th
                  key={column.name}
                  className="whitespace-nowrap px-3 py-2 text-left font-medium"
                >
                  <div className="flex flex-col gap-1">
                    <span>{column.name}</span>

                    <span className="text-xs font-normal text-muted-foreground">
                      {etiquetaTipoColumna(column.type)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {preview.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b last:border-0"
              >
                {preview.columns.map((column) => (
                  <td
                    key={column.name}
                    className="max-w-[240px] truncate px-3 py-2"
                  >
                    {formatValue(row[column.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  // Mostrar tal cual viene del archivo, sin formateo adicional.
  // Para XLSX con cellDates:false, las fechas ya vienen como string formateado de Excel.
  return String(value)
}