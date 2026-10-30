'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TermsDialog } from '@/components/terms-dialog'
import { viewMeta, getViewIdByPathname } from '@/lib/navigation'
import { useDataset, useDatasetsQuery } from '@/context/dataset-provider'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

import { Button } from '@/components/ui/button'

type DashboardShellProps = {
  children: React.ReactNode
  userEmail?: string
  initialTermsAccepted?: boolean
}

export function DashboardShell({
  children,
  userEmail = 'usuario@demo.local',
  initialTermsAccepted = false,
}: DashboardShellProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  const viewId = pathname ? getViewIdByPathname(pathname) : null
  const meta = viewId ? viewMeta[viewId] : { titulo: 'Dashboard', descripcion: 'Plataforma de Lenguaje y Análisis de Salud Mental Automatizado' }

  const { datasetSeleccionado, setDatasetSeleccionado } = useDataset()
  const { data: datasets } = useDatasetsQuery()

  return (
    <div className="flex min-h-dvh bg-background">
      <TermsDialog initialTermsAccepted={initialTermsAccepted} />

      {/* Sidebar de escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border lg:block">
        <AppSidebar userEmail={userEmail} />
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
            <AppSidebar userEmail={userEmail} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/85 px-3 py-3 backdrop-blur sm:px-4 sm:py-3.5 md:px-8">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="flex flex-1 min-w-0 items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="truncate text-[15px] font-semibold tracking-tight sm:text-lg">{meta.titulo}</h1>
              <p className="hidden truncate text-sm text-muted-foreground sm:block">{meta.descripcion}</p>
            </div>
            <div className="flex shrink-0 items-center">
              <Dialog>
                <form className="w-full">
                  <DialogTrigger
                    render={
                      <Button className="h-9 max-w-[46vw] shrink-0 truncate px-2.5 text-xs sm:h-10 sm:max-w-[280px] sm:px-3 sm:text-sm">
                        <span className="truncate">{datasetSeleccionado || 'Seleccionar dataset'}</span>
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Seleccionar dataset</DialogTitle>
                      <DialogDescription>
                        Selecciona el dataset con el que deseas realizar las funciones.
                      </DialogDescription>
                    </DialogHeader>
                    <Combobox items={datasets?.map((d) => d.dataset_name) || []} value={datasetSeleccionado} onValueChange={setDatasetSeleccionado}>
                      <ComboboxInput placeholder="Selecciona un dataset" />
                      <ComboboxContent>
                        <ComboboxEmpty>No hay datasets disponibles.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <DialogFooter>
                      <DialogClose render={<Button>Seleccionar</Button>} />
                      <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
