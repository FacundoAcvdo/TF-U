// Traducción al español de las emociones que devuelve el backend (claves en inglés).
// Solo se usa para mostrar; las claves internas no se modifican.

const ETIQUETAS_EMOCION: Record<string, string> = {
  anger: 'Enojo',
  disgust: 'Disgusto',
  fear: 'Miedo',
  joy: 'Alegría',
  sadness: 'Tristeza',
  surprise: 'Sorpresa',
  neutral: 'Neutral',
  trust: 'Confianza',
  anticipation: 'Anticipación',
  love: 'Amor',
  optimism: 'Optimismo',
  pessimism: 'Pesimismo',
  contempt: 'Desprecio',
  anxiety: 'Ansiedad',
  fearfulness: 'Temor',
  disgusted: 'Disgustado',
  angry: 'Enojado',
  sad: 'Triste',
  happy: 'Feliz',
  scared: 'Asustado',
}

export function etiquetaEmocion(clave: string | null | undefined): string {
  if (!clave) return ''
  const normalizada = clave.trim().toLowerCase()
  return ETIQUETAS_EMOCION[normalizada] ?? clave
}
