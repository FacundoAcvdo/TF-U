import Papa from 'papaparse'
import type {
  DatasetColumn,
  DatasetColumnType,
  DatasetPreviewData,
} from '../types'

function inferColumnType(
  values: unknown[]
): DatasetColumnType {
  const validValues = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== ''
  )

  if (validValues.length === 0) {
    return 'unknown'
  }

  const allNumbers = validValues.every(
    (value) => !Number.isNaN(Number(value))
  )

  if (allNumbers) {
    return 'number'
  }

  const allBooleans = validValues.every(
    (value) =>
      value === true ||
      value === false ||
      value === 'true' ||
      value === 'false'
  )

  if (allBooleans) {
    return 'boolean'
  }

  const allDates = validValues.every((value) => {
    if (typeof value !== 'string') {
      return false
    }

    const date = new Date(value)

    return !Number.isNaN(date.getTime())
  })

  if (allDates) {
    return 'date'
  }

  return 'string'
}

type ColumnStats = {
  name: string
  type: DatasetColumnType
  uniqueCount: number
  uniqueRatio: number
  avgLength: number
  maxLength: number
  avgWords: number
  maxWords: number
}

function getColumnStats(
  name: string,
  values: unknown[]
): ColumnStats {
  const normalizedValues = values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ''
    )
    .map((value) => String(value).trim())

  const uniqueValues = new Set(normalizedValues)

  const lengths = normalizedValues.map(
    (value) => value.length
  )

  const wordCounts = normalizedValues.map(
    (value) =>
      value
        .split(/\s+/)
        .filter(Boolean)
        .length
  )

  return {
    name,
    type: inferColumnType(values),

    uniqueCount: uniqueValues.size,

    uniqueRatio:
      normalizedValues.length > 0
        ? uniqueValues.size / normalizedValues.length
        : 1,

    avgLength:
      lengths.length > 0
        ? lengths.reduce((a, b) => a + b, 0) /
          lengths.length
        : 0,

    maxLength: Math.max(0, ...lengths),

    avgWords:
      wordCounts.length > 0
        ? wordCounts.reduce((a, b) => a + b, 0) /
          wordCounts.length
        : 0,

    maxWords: Math.max(0, ...wordCounts),
  }
}

function scoreClassColumn(
  stats: ColumnStats
): number {
  if (stats.type !== 'string') {
    return -Infinity
  }

  if (stats.uniqueCount < 2) {
    return -Infinity
  }

  let score = 0

  if (stats.uniqueCount <= 3) {
    score += 5
  } else if (stats.uniqueCount <= 10) {
    score += 4
  } else if (stats.uniqueCount <= 20) {
    score += 2
  } else if (stats.uniqueCount > 50) {
    score -= 5
  }

  if (stats.uniqueRatio <= 0.01) {
    score += 5
  } else if (stats.uniqueRatio <= 0.05) {
    score += 4
  } else if (stats.uniqueRatio <= 0.15) {
    score += 2
  } else if (stats.uniqueRatio > 0.5) {
    score -= 5
  }

  if (stats.avgWords <= 1.5) {
    score += 4
  } else if (stats.avgWords <= 3) {
    score += 2
  }

  if (stats.maxWords <= 3) {
    score += 2
  }

  if (stats.avgLength <= 20) {
    score += 2
  }

  return score
}

function scoreTextColumn(
  stats: ColumnStats
): number {
  if (stats.type !== 'string') {
    return -Infinity
  }

  let score = 0

  if (stats.avgLength >= 100) {
    score += 5
  } else if (stats.avgLength >= 50) {
    score += 4
  } else if (stats.avgLength >= 20) {
    score += 2
  }

  if (stats.avgWords >= 20) {
    score += 5
  } else if (stats.avgWords >= 10) {
    score += 4
  } else if (stats.avgWords >= 5) {
    score += 2
  }

  if (stats.uniqueRatio >= 0.5) {
    score += 3
  } else if (stats.uniqueRatio >= 0.25) {
    score += 1
  }

  return score
}

function getClassValues(
  rows: Record<string, unknown>[],
  columnName: string
): string[] {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const value = row[columnName]

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      continue
    }

    const normalized = String(value).trim()

    if (!normalized) {
      continue
    }

    counts.set(
      normalized,
      (counts.get(normalized) ?? 0) + 1
    )
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value)
}

function inferDatasetStructure(
  rows: Record<string, unknown>[]
) {
  if (rows.length === 0) {
    return {
      textColumn: undefined,
      classColumn: undefined,
      classValues: [],
      classConfidence: 0,
    }
  }

  const columnNames = Object.keys(rows[0])

  const stats = columnNames.map((name) =>
    getColumnStats(
      name,
      rows.map((row) => row[name])
    )
  )

  const classCandidates = stats
    .map((column) => ({
      column,
      score: scoreClassColumn(column),
    }))
    .sort((a, b) => b.score - a.score)

  const textCandidates = stats
    .map((column) => ({
      column,
      score: scoreTextColumn(column),
    }))
    .sort((a, b) => b.score - a.score)

  const bestClass = classCandidates[0]
  const bestText = textCandidates[0]

  const classColumn =
    bestClass && bestClass.score >= 7
      ? bestClass.column.name
      : undefined

  const textColumn =
    bestText &&
    bestText.score > 0 &&
    bestText.column.name !== classColumn
      ? bestText.column.name
      : undefined

  const classValues = classColumn
    ? getClassValues(rows, classColumn)
    : []

  return {
    textColumn,
    classColumn,
    classValues,
    classConfidence: classColumn
      ? Math.min(bestClass.score / 20, 1)
      : 0,
  }
}

export async function previewCsv(
  file: File
): Promise<DatasetPreviewData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const rows = results.data

        if (rows.length === 0) {
          resolve({
            columns: [],
            rows: [],
            totalRows: 0,
          })

          return
        }

        const sampleRows = rows.slice(0, 1000)

        const columnNames = Object.keys(rows[0])

        const columns: DatasetColumn[] =
          columnNames.map((name) => {
            const values = sampleRows.map(
              (row) => row[name]
            )

            return {
              name,
              type: inferColumnType(values),
            }
          })

        const inference =
          inferDatasetStructure(sampleRows)

        resolve({
          columns,
          rows: rows.slice(0, 10),
          totalRows: rows.length,
          ...inference,
        })
      },

      error: (error) => {
        reject(error)
      },
    })
  })
}