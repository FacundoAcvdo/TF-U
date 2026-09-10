export type CleaningOperation =
  | 'lowercase'
  | 'removeUrls'
  | 'removeMentions'
  | 'removeHtml'
  | 'normalizeWhitespace'
  | 'removeDuplicates'
  | 'handleHashtags'
  | 'handleEmojis'
  | 'removePunctuation'
  | 'removeStopwords'
  | 'lemmatization'
  | 'anonymization'

export type CleaningPreset =
  | 'conservative'
  | 'recommended'
  | 'linguistic'
  | 'custom'

export type EmojiStrategy = 'keep' | 'remove' | 'convert'
export type HashtagStrategy = 'keep' | 'removeSymbol' | 'segment'

export interface CleaningConfig {
  operations: CleaningOperation[]
  emojiStrategy: EmojiStrategy
  hashtagStrategy: HashtagStrategy
}

export interface DatasetInfo {
  id: string
  name: string
  format: string
  rows: number
  size: string
  language?: string
}

export interface CleaningStats {
  originalRows: number
  cleanedRows: number

  originalTokens: number
  cleanedTokens: number

  originalUniqueTerms: number
  cleanedUniqueTerms: number

  removedDuplicates: number
  removedUrls: number
  removedMentions: number
  removedHtml: number
  normalizedWhitespace: number
  emojisProcessed: number
  hashtagsProcessed: number

  nullValuesHandled: number
  punctuationRemoved: number
  stopwordsRemoved: number
  lemmasProcessed: number
  entitiesAnonymized: number
}

export interface CleaningPreview {
  original: string
  cleaned: string
}

export interface CleaningResult {
  id: string
  datasetName: string
  format: string
  size: string
  createdAt: string

  stats: CleaningStats
  previews: CleaningPreview[]

  config: CleaningConfig

  downloadUrl?: string
}