// Datos simulados (mock) para el prototipo de la plataforma de análisis.
// Nada de esto proviene de un backend real: es únicamente para demostrar la interfaz.

export const datasetInfo = {
  nombre: 'foros_salud_mental_2024.csv',
  registros: 12480,
  columnas: 7,
  idioma: 'Español',
  periodo: 'Ene 2024 – Dic 2024',
  cargadoEl: '27/07/2026 09:14',
  tamano: '8.4 MB',
}

export const estadisticas = [
  { label: 'Total de registros', valor: '12.480', detalle: 'mensajes analizables' },
  { label: 'Usuarios únicos', valor: '3.921', detalle: 'autores distintos' },
  { label: 'Longitud media', valor: '148', detalle: 'caracteres por mensaje' },
  { label: 'Idioma dominante', valor: 'ES', detalle: '97,2% en español' },
]

export const distribucionMensajes = [
  { mes: 'Ene', mensajes: 820 },
  { mes: 'Feb', mensajes: 910 },
  { mes: 'Mar', mensajes: 1040 },
  { mes: 'Abr', mensajes: 980 },
  { mes: 'May', mensajes: 1120 },
  { mes: 'Jun', mensajes: 1210 },
  { mes: 'Jul', mensajes: 1180 },
  { mes: 'Ago', mensajes: 990 },
  { mes: 'Sep', mensajes: 1060 },
  { mes: 'Oct', mensajes: 1150 },
  { mes: 'Nov', mensajes: 1000 },
  { mes: 'Dic', mensajes: 1020 },
]

// Proyección 2D de embeddings (coordenadas ya reducidas con UMAP simulado)
export const embeddings = Array.from({ length: 160 }, (_, i) => {
  const cluster = i % 4
  const centers = [
    { x: -3, y: 2, label: 'Desesperanza' },
    { x: 3, y: 3, label: 'Ansiedad' },
    { x: -2, y: -3, label: 'Apoyo / recuperación' },
    { x: 4, y: -2, label: 'Aislamiento' },
  ]
  const c = centers[cluster]
  return {
    x: +(c.x + (Math.sin(i * 12.9) * 43758.5) % 1.6).toFixed(2),
    y: +(c.y + (Math.cos(i * 78.2) * 12543.1) % 1.6).toFixed(2),
    cluster: c.label,
  }
})

export const clustersEmbeddings = [
  { label: 'Desesperanza', color: 'var(--chart-4)', puntos: 40 },
  { label: 'Ansiedad', color: 'var(--chart-3)', puntos: 40 },
  { label: 'Apoyo / recuperación', color: 'var(--chart-2)', puntos: 40 },
  { label: 'Aislamiento', color: 'var(--chart-5)', puntos: 40 },
]

export const nubePalabras = [
  { texto: 'soledad', peso: 100 },
  { texto: 'ayuda', peso: 92 },
  { texto: 'vacío', peso: 78 },
  { texto: 'cansancio', peso: 74 },
  { texto: 'familia', peso: 70 },
  { texto: 'dolor', peso: 66 },
  { texto: 'miedo', peso: 62 },
  { texto: 'noche', peso: 58 },
  { texto: 'esperanza', peso: 55 },
  { texto: 'terapia', peso: 52 },
  { texto: 'ansiedad', peso: 50 },
  { texto: 'futuro', peso: 46 },
  { texto: 'llorar', peso: 44 },
  { texto: 'amigos', peso: 42 },
  { texto: 'medicación', peso: 40 },
  { texto: 'insomnio', peso: 38 },
  { texto: 'culpa', peso: 36 },
  { texto: 'trabajo', peso: 34 },
  { texto: 'escuchar', peso: 32 },
  { texto: 'respirar', peso: 30 },
  { texto: 'agotado', peso: 28 },
  { texto: 'acompañar', peso: 26 },
  { texto: 'silencio', peso: 24 },
  { texto: 'mañana', peso: 22 },
]

export const emocionesNegativas = [
  { emocion: 'Tristeza', valor: 34 },
  { emocion: 'Ansiedad', valor: 27 },
  { emocion: 'Desesperanza', valor: 18 },
  { emocion: 'Ira', valor: 11 },
  { emocion: 'Culpa', valor: 6 },
  { emocion: 'Miedo', valor: 4 },
]

export const topicos = [
  {
    nombre: 'Aislamiento social',
    peso: 24,
    terminos: ['soledad', 'nadie', 'solo', 'aislado', 'incomprendido'],
  },
  {
    nombre: 'Trastornos del sueño',
    peso: 19,
    terminos: ['insomnio', 'noche', 'dormir', 'cansancio', 'despertar'],
  },
  {
    nombre: 'Búsqueda de ayuda',
    peso: 17,
    terminos: ['terapia', 'psicólogo', 'ayuda', 'medicación', 'consulta'],
  },
  {
    nombre: 'Presión académica/laboral',
    peso: 14,
    terminos: ['trabajo', 'estudios', 'presión', 'estrés', 'fracaso'],
  },
  {
    nombre: 'Relaciones familiares',
    peso: 13,
    terminos: ['familia', 'padres', 'hijos', 'pareja', 'discusión'],
  },
  {
    nombre: 'Recuperación y esperanza',
    peso: 13,
    terminos: ['esperanza', 'mejorar', 'futuro', 'apoyo', 'avanzar'],
  },
]

export const mencionSuicidio = {
  totalDetectados: 842,
  porcentaje: 6.7,
  confianzaMedia: 0.89,
  ejemplos: [
    { id: 'M-1042', confianza: 0.96, extracto: 'No sé cuánto tiempo más pueda seguir así…' },
    { id: 'M-2381', confianza: 0.91, extracto: 'A veces pienso que sería más fácil no despertar.' },
    { id: 'M-3120', confianza: 0.84, extracto: 'Siento que soy una carga para todos los que me rodean.' },
    { id: 'M-4455', confianza: 0.79, extracto: 'Ya no le encuentro sentido a nada de lo que hago.' },
  ],
}

export const nivelesRiesgo = [
  { nivel: 'Bajo', valor: 58, color: 'var(--chart-2)' },
  { nivel: 'Moderado', valor: 27, color: 'var(--chart-3)' },
  { nivel: 'Alto', valor: 11, color: 'var(--chart-4)' },
  { nivel: 'Crítico', valor: 4, color: 'var(--chart-4)' },
]

export const sentimientoTiempo = [
  { mes: 'Ene', positivo: 22, neutro: 40, negativo: 38 },
  { mes: 'Feb', positivo: 20, neutro: 39, negativo: 41 },
  { mes: 'Mar', positivo: 18, neutro: 38, negativo: 44 },
  { mes: 'Abr', positivo: 21, neutro: 37, negativo: 42 },
  { mes: 'May', positivo: 19, neutro: 36, negativo: 45 },
  { mes: 'Jun', positivo: 17, neutro: 35, negativo: 48 },
  { mes: 'Jul', positivo: 20, neutro: 37, negativo: 43 },
  { mes: 'Ago', positivo: 24, neutro: 38, negativo: 38 },
  { mes: 'Sep', positivo: 26, neutro: 39, negativo: 35 },
  { mes: 'Oct', positivo: 28, neutro: 40, negativo: 32 },
  { mes: 'Nov', positivo: 27, neutro: 41, negativo: 32 },
  { mes: 'Dic', positivo: 30, neutro: 40, negativo: 30 },
]

export const evolucionPalabras = [
  { mes: 'Ene', soledad: 60, ayuda: 30, esperanza: 18 },
  { mes: 'Feb', soledad: 64, ayuda: 32, esperanza: 17 },
  { mes: 'Mar', soledad: 72, ayuda: 34, esperanza: 15 },
  { mes: 'Abr', soledad: 70, ayuda: 40, esperanza: 19 },
  { mes: 'May', soledad: 78, ayuda: 44, esperanza: 20 },
  { mes: 'Jun', soledad: 82, ayuda: 50, esperanza: 22 },
  { mes: 'Jul', soledad: 76, ayuda: 55, esperanza: 26 },
  { mes: 'Ago', soledad: 68, ayuda: 58, esperanza: 30 },
  { mes: 'Sep', soledad: 62, ayuda: 60, esperanza: 34 },
  { mes: 'Oct', soledad: 58, ayuda: 62, esperanza: 40 },
  { mes: 'Nov', soledad: 55, ayuda: 63, esperanza: 44 },
  { mes: 'Dic', soledad: 50, ayuda: 65, esperanza: 48 },
]

export type Usuario = {
  id: string
  nombre: string
  email: string
  rol: 'Administrador' | 'Investigador' | 'Analista'
  estado: 'Activo' | 'Inactivo'
  ultimoAcceso: string
}

export const usuariosIniciales: Usuario[] = [
  { id: 'u1', nombre: 'Dra. Elena Ruiz', email: 'elena.ruiz@instituto.org', rol: 'Administrador', estado: 'Activo', ultimoAcceso: 'Hace 2 h' },
  { id: 'u2', nombre: 'Carlos Méndez', email: 'c.mendez@instituto.org', rol: 'Investigador', estado: 'Activo', ultimoAcceso: 'Hace 1 día' },
  { id: 'u3', nombre: 'Marta Solís', email: 'm.solis@instituto.org', rol: 'Analista', estado: 'Activo', ultimoAcceso: 'Hace 3 días' },
  { id: 'u4', nombre: 'Javier Torres', email: 'j.torres@instituto.org', rol: 'Analista', estado: 'Inactivo', ultimoAcceso: 'Hace 3 semanas' },
]

export type Chat = {
  id: string
  titulo: string
  tipo: 'General' | 'Dataset'
  fecha: string
  mensajes: number
}

export const historialChats: Chat[] = [
  { id: 'c1', titulo: 'Factores de riesgo en adolescentes', tipo: 'General', fecha: '27/07/2026', mensajes: 8 },
  { id: 'c2', titulo: '¿Qué tópicos predominan en Q3?', tipo: 'Dataset', fecha: '26/07/2026', mensajes: 5 },
  { id: 'c3', titulo: 'Recursos de prevención disponibles', tipo: 'General', fecha: '24/07/2026', mensajes: 12 },
  { id: 'c4', titulo: 'Evolución del sentimiento negativo', tipo: 'Dataset', fecha: '21/07/2026', mensajes: 6 },
]

export const informesGenerados = [
  { id: 'r1', nombre: 'Informe mensual - Diciembre 2024', formato: 'PDF', fecha: '05/01/2025', tamano: '2.1 MB' },
  { id: 'r2', nombre: 'Resumen de emociones negativas Q4', formato: 'PDF', fecha: '02/01/2025', tamano: '1.4 MB' },
  { id: 'r3', nombre: 'Exportación de tópicos principales', formato: 'CSV', fecha: '28/12/2024', tamano: '640 KB' },
]
