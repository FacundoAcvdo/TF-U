export type CleaningOperation =
  | "lowercase"
  | "remove_urls"
  | "remove_mentions"
  | "truncation"
  | "normalize_whitespace"
  | "remove_duplicates"
  | "handle_hashtags"
  | "handle_emojis"
  | "remove_punctuation"
  | "remove_stopwords"
  | "lemmatization"
  | "anonymization";

export type EmojiStrategy =
  | "keep"
  | "remove"
  | "convert";

export type HashtagStrategy =
  | "keep"
  | "remove_symbol"
  | "segment";

export type CleaningLanguage =
  | "en"
  | "es"
  | "bilingual";

export interface CleaningConfig {
  operations: CleaningOperation[];
  emoji_strategy: EmojiStrategy;
  hashtag_strategy: HashtagStrategy;
  language?: CleaningLanguage | null;
}

export interface CleaningStats {
  original_rows: number;
  cleaned_rows: number;

  original_tokens: number;
  cleaned_tokens: number;

  original_unique_terms: number;
  cleaned_unique_terms: number;

  removed_duplicates: number;
  removed_urls: number;
  removed_mentions: number;

  normalized_whitespace: number;

  emojis_processed: number;
  hashtags_processed: number;

  punctuation_removed: number;
  stopwords_removed: number;
  lemmas_processed: number;
  truncated_words: number;
  entities_anonymized: number;
}

export interface CleaningPreview {
  original: string;
  cleaned: string;
}

export interface CleaningResult {
  source_dataset_name: string;
  filename: string;
  format: string;
  download_id: string;
  stats: CleaningStats;
  previews: CleaningPreview[];
}