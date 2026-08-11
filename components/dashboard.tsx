'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { viewMeta, type ViewId } from '@/lib/navigation'
import { UploadView } from '@/components/views/upload-view'
import { StatsView } from '@/components/views/stats-view'
import { EmbeddingsView } from '@/components/views/embeddings-view'
import { WordCloudView } from '@/components/views/wordcloud-view'
import { EmotionsView } from '@/components/views/emotions-view'
import { TopicsView } from '@/components/views/topics-view'
import { MentionView } from '@/components/views/mention-view'
import { RiskView } from '@/components/views/risk-view'
import { SentimentTimeView } from '@/components/views/sentiment-time-view'
import { WordEvolutionView } from '@/components/views/word-evolution-view'
import { ChatbotView } from '@/components/views/chatbot-view'
import { ChatHistoryView } from '@/components/views/chat-history-view'
import { ReportsView } from '@/components/views/reports-view'
import { UsersView } from '@/components/views/users-view'
import StorageManagementView from './views/storage-management-view'
import CleaningView from './views/cleaning-view'

function renderView(id: ViewId) {
  switch (id) {
    case 'cargar-dataset':
      return <UploadView />
    case 'estadisticas':
      return <StatsView />
    case 'embeddings':
      return <EmbeddingsView />
    case 'nube-palabras':
      return <WordCloudView />
    case 'emociones-negativas':
      return <EmotionsView />
    case 'topicos':
      return <TopicsView />
    case 'mencion-suicidio':
      return <MentionView />
    case 'nivel-riesgo':
      return <RiskView />
    case 'sentimientos-tiempo':
      return <SentimentTimeView />
    case 'evolucion-palabras':
      return <WordEvolutionView />
    case 'chatbot-general':
      return <ChatbotView variante="general" />
    case 'chatbot-dataset':
      return <ChatbotView variante="dataset" />
    case 'historial-chats':
      return <ChatHistoryView />
    case 'informes':
      return <ReportsView />
    case 'usuarios':
      return <UsersView />
    case 'gestion-almacenamiento':
      return <StorageManagementView />
    case 'limpieza-datos':
      return <CleaningView />
  }
}

export function Dashboard({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  const [activo, setActivo] = useState<ViewId>('estadisticas')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const meta = viewMeta[activo]

  function seleccionar(id: ViewId) {
    setActivo(id)
    setMenuAbierto(false)
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar de escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border lg:block">
        <AppSidebar activo={activo} onSelect={seleccionar} onLogout={onLogout} userEmail={userEmail} />
      </aside>

      {/* Drawer móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuAbierto(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-64">
            <AppSidebar activo={activo} onSelect={seleccionar} onLogout={onLogout} userEmail={userEmail} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3.5 backdrop-blur md:px-8">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-lg font-semibold tracking-tight text-balance">{meta.titulo}</h1>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">{meta.descripcion}</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{renderView(activo)}</div>
        </main>
      </div>
    </div>
  )
}
