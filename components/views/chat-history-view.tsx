'use client'

import { useEffect, useState } from 'react'
import { History, Trash2, MessageCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api-fetch'
import { useDatasetsQuery } from '@/context/dataset-provider'
import { useRouter } from 'next/navigation'

interface Chat {
  "titulo": string,
  "chat_id": string, 
  "fecha_creacion": string, 
  "updated_at": string, 
  "activo": boolean, 
  "dataset_id": string 
}

interface Chats {
  total: number
  chats: Chat[]
}

const chatMock: Chats = {
  total: 0,
  chats: []
}


export function ChatHistoryView() {
  const [chats, setChats] = useState<Chats>(chatMock)
  const [porEliminar, setPorEliminar] = useState<Chat | null>(null)
  const [eliminarTodoAbierto, setEliminarTodoAbierto] = useState(false)
  const { data: datasets } = useDatasetsQuery()

  const router = useRouter()

  const buscarChats = async() => {
    try {
      const data = await apiFetch<Chats>(`/rag/chats`, { method: 'GET' }, { silent: true })
      setChats(data)
    } catch {
      // lectura de fondo: sin toast para no spamear; las acciones sí avisan
    }
  }

  useEffect(() => {
    buscarChats()
  }, [])

  async function eliminar(id: string) {
    try {
      await apiFetch(`/rag/chat`, {
        method: 'DELETE',
        body: JSON.stringify({ chat_id: id }),
      })
      buscarChats()
    } catch {
      // apiFetch ya mostró el toast de error
    } finally {
      setPorEliminar(null)
    }
  }

  async function eliminarTodos() {
    try {
      await apiFetch(`/rag/chats`, { method: 'DELETE' })
      buscarChats()
    } catch {
      // apiFetch ya mostró el toast de error
    } finally {
      setEliminarTodoAbierto(false)
    }
  }

  async function redirigir(chat_id: string, dataset_id: string) {
    try {
      await apiFetch(`/rag/activate_chat`, {
        method: 'POST',
        body: JSON.stringify({ chat_id: chat_id }),
      })
    } catch {
      // apiFetch ya mostró el toast de error
      return
    }

    if (dataset_id != null && dataset_id != '') {
      const dataset = datasets?.find((d) => d.dataset_id === dataset_id)

      if (!dataset) return

      router.push(`/chatbot-dataset/?dataset_name=${dataset?.dataset_name}`)

      return
    }

    router.push('/chatbot-general')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Conversaciones guardadas</CardTitle>
            { chats && chats.total > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setEliminarTodoAbierto(true)}>
                <Trash2 />
                Eliminar todo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {chats && chats.total === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <History className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No hay conversaciones</p>
              <p className="text-sm text-muted-foreground">Las consultas que realices con los chatbots aparecerán aquí.</p>
            </div>
          ) : (
            chats && chats.chats && chats.chats.map((chat) => (
              <div key={chat.chat_id} className="flex items-center gap-3 rounded-lg border border-border p-3.5 hover:bg-muted cursor-pointer" onClick={() => redirigir(chat.chat_id, chat.dataset_id)}>
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  {chat.dataset_id ? <Database className="size-4" /> : <MessageCircle className="size-4" />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{chat.titulo}</span>
                  <span className="text-xs text-muted-foreground">
                    Fecha creación: {chat.fecha_creacion}
                  </span>
                </div>
                <Badge variant="outline">{chat.dataset_id ? 'Dataset' : 'General'}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); setPorEliminar(chat) }}
                  aria-label={`Eliminar chat ${chat.titulo}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {porEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Eliminar chat</CardTitle>
              <CardDescription>
                {`¿Seguro que quieres eliminar "${porEliminar.titulo || 'Sin título'}"? Esta acción no se puede deshacer.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPorEliminar(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => void eliminar(porEliminar.chat_id)}>
                <Trash2 />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {eliminarTodoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Eliminar todos los chats</CardTitle>
              <CardDescription>
                ¿Seguro que quieres eliminar todas las conversaciones? Esta acción no se puede deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEliminarTodoAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => void eliminarTodos()}>
                <Trash2 />
                Eliminar todo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
