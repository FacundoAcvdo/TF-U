'use client'

import { useState } from 'react'
import { History, Trash2, MessageCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { historialChats, type Chat } from '@/lib/mock-data'

export function ChatHistoryView() {
  const [chats, setChats] = useState<Chat[]>(historialChats)

  function eliminar(id: string) {
    setChats((c) => c.filter((chat) => chat.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Conversaciones guardadas</CardTitle>
          {chats.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setChats([])}>
              <Trash2 />
              Eliminar todo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <History className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No hay conversaciones</p>
            <p className="text-sm text-muted-foreground">Las consultas que realices con los chatbots aparecerán aquí.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="flex items-center gap-3 rounded-lg border border-border p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                {chat.tipo === 'General' ? <MessageCircle className="size-4" /> : <Database className="size-4" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{chat.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {chat.fecha} · {chat.mensajes} mensajes
                </span>
              </div>
              <Badge variant="outline">{chat.tipo}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => eliminar(chat.id)}
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
  )
}
