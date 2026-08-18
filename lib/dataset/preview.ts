import type { DatasetPreviewData } from './types'
import { previewCsv } from './parsers/csv'
import { previewXlsx } from './parsers/xlsx'
import { previewTxt } from './parsers/txt'
import { previewZip } from './parsers/zip'

export async function previewDataset(
  file: File
): Promise<DatasetPreviewData> {
  const extension = file.name
    .split('.')
    .pop()
    ?.toLowerCase()

  switch (extension) {
    case 'csv':
      return previewCsv(file)

    case 'xlsx':
      return previewXlsx(file)

    case 'txt':
      return previewTxt(file)  

    case 'zip':
      return previewZip(file)
    default:
      throw new Error(
        `Formato no soportado: .${extension ?? ''}`
      )
  }
}