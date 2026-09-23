import type { DatasetPreviewData } from './types'
import { previewCsv } from './parsers/csv'
import { previewXlsx } from './parsers/xlsx'
import { previewTxt } from './parsers/txt'
import type { WhatsappLocale } from './parsers/txt'
import { previewZip } from './parsers/zip'

export async function previewDataset(
  file: File,
  options?: { whatsappLocale?: WhatsappLocale }
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
      return previewTxt(file, { locale: options?.whatsappLocale })

    case 'zip':
      return previewZip(file)
    default:
      throw new Error(
        `Formato no soportado: .${extension ?? ''}`
      )
  }
}