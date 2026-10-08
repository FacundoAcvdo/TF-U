import type { LucideIcon } from 'lucide-react'
import {
  Upload,
  ChartColumn,
  Sparkles,
  Cloud,
  Blocks,
  Layers,
  Gauge,
  ChartLine,
  TrendingUp,
  MessageCircle,
  Database,
  History,
  FileText,
  Users,
  BroomSparkles,
  Bubbles
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
  | 'limpieza-datos'
  
export type NavItem = {
  id: ViewId
  label: string
  icon: LucideIcon
  href: string
}

export type NavGroup = {
  titulo: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    titulo: 'Dataset',
    items: [
      { id: 'cargar-dataset', label: 'Cargar dataset', icon: Upload, href: '/cargar-dataset' },
      { id: 'estadisticas', label: 'Estadísticas generales', icon: ChartColumn, href: '/estadisticas' },
      { id: 'limpieza-datos', label: 'Limpieza de datos', icon: BroomSparkles, href: '/limpieza-datos' },
    ],
  },
  {
    titulo: 'Análisis del texto',
    items: [
      { id: 'embeddings', label: 'Visualización de embeddings', icon: Sparkles, href: '/embeddings' },
      { id: 'nube-palabras', label: 'Nube de palabras', icon: Cloud, href: '/nube-palabras' },
      { id: 'emociones-negativas', label: 'Detección de emociones', icon: Bubbles, href: '/emociones-negativas' },
      { id: 'topicos', label: 'Tópicos principales', icon: Layers, href: '/topicos' },
      { id: 'evolucion-palabras', label: 'Evolución de palabras', icon: TrendingUp, href: '/evolucion-palabras' },
      { id: 'sentimientos-tiempo', label: 'Sentimiento en el tiempo', icon: ChartLine, href: '/sentimientos-tiempo' },
    ],
  },
  {
    titulo: 'Detección de riesgo',
    items: [
      { id: 'mencion-suicidio', label: 'Construir clasificador', icon: Blocks, href: '/mencion-suicidio' },
      { id: 'nivel-riesgo', label: 'Nivel de riesgo', icon: Gauge, href: '/nivel-riesgo' },
    ],
  },
  {
    titulo: 'Asistentes',
    items: [
      { id: 'chatbot-general', label: 'Chatbot general', icon: MessageCircle, href: '/chatbot-general' },
      { id: 'chatbot-dataset', label: 'Chatbot del dataset', icon: Database, href: '/chatbot-dataset' },
      { id: 'historial-chats', label: 'Historial de chats', icon: History, href: '/historial-chats' },
    ],
  },
  {
    titulo: 'Administración',
    items: [
      { id: 'informes', label: 'Generar informes', icon: FileText, href: '/informes' },
      { id: 'usuarios', label: 'Gestión de usuarios', icon: Users, href: '/usuarios' },
      { id: 'gestion-almacenamiento', label: 'Almacenamiento', icon: Database, href: '/gestion-almacenamiento' },
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
  'limpieza-datos': {
    titulo: 'Limpieza de datos',
    descripcion: 'Aplica diferentes procesos de limpieza sobre el dataset cargado.',
  },
}

// Helpers para App Router: mapeo ViewId ↔ href
export const viewHref: Record<ViewId, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((i) => [i.id, i.href]))
) as Record<ViewId, string>

export const hrefToViewId: Record<string, ViewId> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((i) => [i.href, i.id]))
) as Record<string, ViewId>

export function getViewIdByPathname(pathname: string): ViewId | null {
  const clean = pathname.split('?')[0].split('#')[0]
  if (hrefToViewId[clean]) return hrefToViewId[clean]
  const match = Object.keys(hrefToViewId).find((href) => clean.startsWith(href + '/'))
  return match ? hrefToViewId[match] : null
}
