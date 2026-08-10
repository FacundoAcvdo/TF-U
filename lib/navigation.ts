import type { LucideIcon } from 'lucide-react'
import {
  Upload,
  ChartColumn,
  Settings,
  Sparkles,
  Cloud,
  HeartCrack,
  Layers,
  ShieldAlert,
  Gauge,
  ChartLine,
  TrendingUp,
  MessageCircle,
  Database,
  History,
  FileText,
  Users,
} from 'lucide-react'

export type ViewId =
  | 'cargar-dataset'
  | 'estadisticas'
  | 'embeddings'
  | 'nube-palabras'
  | 'emociones-negativas'
  | 'topicos'
  | 'mencion-suicidio'
  | 'nivel-riesgo'
  | 'sentimientos-tiempo'
  | 'evolucion-palabras'
  | 'chatbot-general'
  | 'chatbot-dataset'
  | 'historial-chats'
  | 'informes'
  | 'usuarios'
  | 'gestion-almacenamiento'

export type NavItem = {
  id: ViewId
  label: string
  icon: LucideIcon
}

export type NavGroup = {
  titulo: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    titulo: 'Dataset',
    items: [
      { id: 'cargar-dataset', label: 'Cargar dataset', icon: Upload },
      { id: 'estadisticas', label: 'Estadísticas generales', icon: ChartColumn },
    ],
  },
  {
    titulo: 'Análisis del texto',
    items: [
      { id: 'embeddings', label: 'Visualización de embeddings', icon: Sparkles },
      { id: 'nube-palabras', label: 'Nube de palabras', icon: Cloud },
      { id: 'emociones-negativas', label: 'Emociones negativas', icon: HeartCrack },
      { id: 'topicos', label: 'Tópicos principales', icon: Layers },
      { id: 'evolucion-palabras', label: 'Evolución de palabras', icon: TrendingUp },
      { id: 'sentimientos-tiempo', label: 'Sentimiento en el tiempo', icon: ChartLine },
    ],
  },
  {
    titulo: 'Detección de riesgo',
    items: [
      { id: 'mencion-suicidio', label: 'Mención de suicidio', icon: ShieldAlert },
      { id: 'nivel-riesgo', label: 'Nivel de riesgo', icon: Gauge },
    ],
  },
  {
    titulo: 'Asistentes',
    items: [
      { id: 'chatbot-general', label: 'Chatbot general', icon: MessageCircle },
      { id: 'chatbot-dataset', label: 'Chatbot del dataset', icon: Database },
      { id: 'historial-chats', label: 'Historial de chats', icon: History },
    ],
  },
  {
    titulo: 'Administración',
    items: [
      { id: 'informes', label: 'Generar informes', icon: FileText },
      { id: 'usuarios', label: 'Gestión de usuarios', icon: Users },
      { id: 'gestion-almacenamiento', label: 'Gestión de almacenamiento', icon: Database },
    ],
  },
]

export const viewMeta: Record<ViewId, { titulo: string; descripcion: string }> = {
  'cargar-dataset': {
    titulo: 'Cargar dataset',
    descripcion: 'Sube un archivo con los textos a analizar y define sus columnas.',
  },
  estadisticas: {
    titulo: 'Estadísticas generales del dataset',
    descripcion: 'Resumen descriptivo del conjunto de datos cargado.',
  },
  embeddings: {
    titulo: 'Visualización de embeddings',
    descripcion: 'Proyección 2D de los mensajes agrupados por similitud semántica.',
  },
  'nube-palabras': {
    titulo: 'Nube de palabras',
    descripcion: 'Términos más frecuentes en el corpus, ponderados por su peso.',
  },
  'emociones-negativas': {
    titulo: 'Detección de emociones negativas',
    descripcion: 'Distribución de emociones negativas detectadas en los textos.',
  },
  topicos: {
    titulo: 'Tópicos principales',
    descripcion: 'Temas latentes identificados mediante modelado de tópicos.',
  },
  'mencion-suicidio': {
    titulo: 'Detección de mención de suicidio',
    descripcion: 'Mensajes clasificados como posibles menciones de ideación suicida.',
  },
  'nivel-riesgo': {
    titulo: 'Nivel de riesgo de suicidio',
    descripcion: 'Estimación del nivel de riesgo agregado sobre el conjunto de datos.',
  },
  'sentimientos-tiempo': {
    titulo: 'Análisis de sentimiento en el tiempo',
    descripcion: 'Evolución del sentimiento positivo, neutro y negativo por mes.',
  },
  'evolucion-palabras': {
    titulo: 'Evolución de palabras más utilizadas',
    descripcion: 'Cómo cambia la frecuencia de términos clave a lo largo del tiempo.',
  },
  'chatbot-general': {
    titulo: 'Chatbot de consultas generales',
    descripcion: 'Asistente informativo sobre prevención y factores de riesgo.',
  },
  'chatbot-dataset': {
    titulo: 'Chatbot de consultas sobre el dataset',
    descripcion: 'Haz preguntas en lenguaje natural sobre los datos cargados.',
  },
  'historial-chats': {
    titulo: 'Historial de chats',
    descripcion: 'Consulta y elimina conversaciones anteriores.',
  },
  informes: {
    titulo: 'Generar informes',
    descripcion: 'Crea y descarga informes con los resultados del análisis.',
  },
  usuarios: {
    titulo: 'Gestión de usuarios',
    descripcion: 'Crea y elimina cuentas con acceso a la plataforma.',
  },
  'gestion-almacenamiento': {
    titulo: 'Gestión de almacenamiento',
    descripcion: 'Administra el espacio de almacenamiento disponible para los datos.',
  },
}
