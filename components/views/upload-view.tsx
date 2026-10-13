'use client'

import { useEffect, useState } from 'react'
import {
  Upload,
  FileText,
  Check,
  LoaderCircle,
  X,
  MessageCircle,
  Archive,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { previewDataset } from '@/lib/dataset/preview'
import type { DatasetPreviewData } from '@/lib/dataset/types'
import type { AutoConvertSourceFormat } from '@/lib/dataset/autoConvert'
import { obtenerFormatoOriginal } from '@/lib/dataset/autoConvert'
import { buildUploadFormData } from '@/lib/dataset/upload'
import { useJobs } from '@/context/jobs-context'
import type { WhatsappLocale } from '@/lib/dataset/parsers/txt'
import { detectWhatsappLocale } from '@/lib/dataset/parsers/txt'

import { DatasetPreview } from '@/components/dataset/DatasetPreview'
import { useQueryClient } from '@tanstack/react-query'

type PosiblePreviewAutoConvertido = DatasetPreviewData & {
  sourceFormat?: AutoConvertSourceFormat
  notice?: string
  convertedFile?: File
}

const COLUMNAS_FIJAS: Record<
  Extract<AutoConvertSourceFormat, 'whatsapp-chat' | 'labeled-folders'>,
  { texto: string; clase: string | null; fecha: string | null }
> = {
  'whatsapp-chat': { texto: 'mensaje', clase: null, fecha: 'fecha' },
  'labeled-folders': { texto: 'texto', clase: 'clase', fecha: null },
}

type TipoArchivoEspecial = 'txt' | 'zip'

const CONFIG_ARCHIVO_ESPECIAL: Record<
  TipoArchivoEspecial,
  { titulo: string; descripcion: string }
> = {
  txt: {
    titulo: 'Archivo de texto detectado',
    descripcion:
      'Solo se permiten archivos de texto que provengan de WhatsApp. Si continuás, el chat se convertirá automáticamente a formato CSV para continuar con los análisis.',
  },
  zip: {
    titulo: 'Archivo comprimido detectado',
    descripcion:
      'Solo se permiten archivos .zip donde cada carpeta de primer nivel represente una clase y contenga archivos .txt con los textos de esa clase. Si continuás, se convertirá automáticamente a formato CSV.',
  },
}

const ETIQUETA_FORMATO_AUTOMATICO: Record<
  Extract<AutoConvertSourceFormat, 'whatsapp-chat' | 'labeled-folders'>,
  { texto: string; icono: 'chat' | 'zip' }
> = {
  'whatsapp-chat': { texto: 'WhatsApp → CSV', icono: 'chat' },
  'labeled-folders': { texto: 'ZIP → CSV', icono: 'zip' },
}

function tipoArchivoEspecial(file: File): TipoArchivoEspecial | null {
  const formato = obtenerFormatoOriginal(file.name)
  return formato === 'txt' || formato === 'zip' ? formato : null
}

export function UploadView() {
  const queryClient = useQueryClient()

  const [archivo, setArchivo] = useState<File | null>(null)

  const [preview, setPreview] =
    useState<DatasetPreviewData | null>(null)

  const [estado, setEstado] = useState<
    'idle' | 'cargando' | 'listo'
  >('idle')

  const [cargandoPreview, setCargandoPreview] =
    useState(false)

  const [error, setError] = useState<string | null>(null)

  const [dragOver, setDragOver] = useState(false)

  const [columnaTexto, setColumnaTexto] =
    useState('')

  const [columnaClase, setColumnaClase] =
    useState('')

  const [sinClasificar, setSinClasificar] =
    useState(false)

  const [esDeChat, setEsDeChat] =
    useState(false)

  const [columnaFecha, setColumnaFecha] =
    useState('')

  const [columnaUsuario, setColumnaUsuario] =
    useState('')

  const [formatoAutomatico, setFormatoAutomatico] = useState<
    Extract<AutoConvertSourceFormat, 'whatsapp-chat' | 'labeled-folders'> | null
  >(null)

  const mapeoAutomatico = formatoAutomatico !== null

  const [archivoConvertido, setArchivoConvertido] =
    useState<File | null>(null)

  const [formatoOriginal, setFormatoOriginal] =
    useState<ReturnType<typeof obtenerFormatoOriginal> | null>(null)

  const [archivoEspecialPendiente, setArchivoEspecialPendiente] = useState<{
    file: File
    tipo: TipoArchivoEspecial
  } | null>(null)

  const [whatsappLocale, setWhatsappLocale] =
    useState<WhatsappLocale>('DMY')

  const [archivoOriginalTxt, setArchivoOriginalTxt] =
    useState<File | null>(null)

  const { tasks, startTask, adoptTask, consumeTask } = useJobs()
  // Key fija: una sola carga a la vez. Al volver a la pantalla, si hay una
  // carga en curso se muestra "cargando" y no se permite otra ejecución.
  const taskKey = 'upload'
  const task = tasks[taskKey]

  // Al montar: lista fresca + retomar carga en curso (si existe).
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['datasets'] })
    adoptTask({
      key: taskKey,
      service: 'dataset',
      jobType: 'upload',
      successMessage: 'Dataset cargado correctamente.',
    })
  }, [])

  useEffect(() => {
    if (!task || task.consumed) return
    if (task.status === 'running') {
      setEstado('cargando')
    } else if (task.status === 'succeeded') {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setEstado('listo')
      consumeTask(task.key)
    } else {
      setEstado('idle')
      consumeTask(task.key)
    }
  }, [task])

  function manejarArchivoElegido(file: File) {
    const tipo = tipoArchivoEspecial(file)

    if (tipo) {
      setArchivoEspecialPendiente({ file, tipo })
      return
    }

    seleccionar(file)
  }

  function cancelarConversionEspecial() {
    setArchivoEspecialPendiente(null)
  }

  function confirmarConversionEspecial() {
    const pendiente = archivoEspecialPendiente
    setArchivoEspecialPendiente(null)

    if (pendiente) {
      seleccionar(pendiente.file)
    }
  }

  async function seleccionar(file: File, opts?: { whatsappLocale?: WhatsappLocale }) {
    setArchivo(file)
    setPreview(null)
    setError(null)
    setEstado('idle')
    setFormatoAutomatico(null)
    setArchivoConvertido(null)
    setFormatoOriginal(obtenerFormatoOriginal(file.name))

    setColumnaTexto('')
    setColumnaClase('')
    setColumnaFecha('')
    setColumnaUsuario('')
    setSinClasificar(false)
    setEsDeChat(false)

    // detectar locale para txt si no se especificó
    let localeOpt = opts?.whatsappLocale
    if (!localeOpt && obtenerFormatoOriginal(file.name) === 'txt') {
      try {
        const txt = await file.text()
        localeOpt = detectWhatsappLocale(txt)
        setWhatsappLocale(localeOpt)
        setArchivoOriginalTxt(file)
      } catch {
        localeOpt = 'DMY'
      }
    }
    if (obtenerFormatoOriginal(file.name) === 'txt' && localeOpt) {
      setWhatsappLocale(localeOpt)
      setArchivoOriginalTxt(file)
    } else {
      setArchivoOriginalTxt(null)
    }

    setCargandoPreview(true)

    try {
      const result =
        (await previewDataset(file, localeOpt ? { whatsappLocale: localeOpt } : undefined)) as PosiblePreviewAutoConvertido

      if (result.sourceFormat === 'unsupported') {
        setError(
          result.notice ??
            'No se pudo reconocer el contenido del archivo.'
        )

        setArchivo(null)
        setPreview(null)
        return
      }

      setPreview(result)

      if (
        result.sourceFormat === 'whatsapp-chat' ||
        result.sourceFormat === 'labeled-folders'
      ) {
        const columnas = COLUMNAS_FIJAS[result.sourceFormat]

        setFormatoAutomatico(result.sourceFormat)
        setArchivoConvertido(result.convertedFile ?? null)
        setColumnaTexto(columnas.texto)
        setColumnaClase(columnas.clase ?? '')
        setSinClasificar(columnas.clase === null)
        setEsDeChat(columnas.fecha !== null)
        setColumnaFecha(columnas.fecha ?? '')
        return
      }

      if (result.textColumn) {
        setColumnaTexto(result.textColumn)
      }

      if (result.classColumn) {
        setColumnaClase(result.classColumn)
      }

      const dateColumn = result.columns.find(
        (column) => column.type === 'date'
      )

      if (dateColumn) {
        setColumnaFecha(dateColumn.name)
      }
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo leer el archivo'
      )

      setArchivo(null)
      setPreview(null)
    } finally {
      setCargandoPreview(false)
    }
  }

  async function regenerarPreviewConLocale(nuevoLocale: WhatsappLocale) {
    if (!archivoOriginalTxt) return
    setWhatsappLocale(nuevoLocale)
    setCargandoPreview(true)
    setError(null)
    try {
      const result = (await previewDataset(archivoOriginalTxt, {
        whatsappLocale: nuevoLocale,
      })) as PosiblePreviewAutoConvertido
      if (result.sourceFormat === 'unsupported') {
        setError(result.notice ?? 'No se pudo reconocer el contenido del archivo.')
        return
      }
      setPreview(result)
      if (
        result.sourceFormat === 'whatsapp-chat' ||
        result.sourceFormat === 'labeled-folders'
      ) {
        const columnas = COLUMNAS_FIJAS[result.sourceFormat]
        setFormatoAutomatico(result.sourceFormat)
        setArchivoConvertido(result.convertedFile ?? null)
        setColumnaTexto(columnas.texto)
        setColumnaClase(columnas.clase ?? '')
        setSinClasificar(columnas.clase === null)
        setEsDeChat(columnas.fecha !== null)
        setColumnaFecha(columnas.fecha ?? '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo regenerar el preview')
    } finally {
      setCargandoPreview(false)
    }
  }

  function quitarArchivo() {
    setArchivo(null)
    setPreview(null)
    setError(null)

    setColumnaTexto('')
    setColumnaClase('')
    setColumnaFecha('')
    setColumnaUsuario('')
    setSinClasificar(false)
    setEsDeChat(false)
    setFormatoAutomatico(null)
    setArchivoConvertido(null)
    setFormatoOriginal(null)
    setArchivoOriginalTxt(null)
    setWhatsappLocale('DMY')

    setEstado('idle')
  }

  async function cargar() {
    if (!archivo || !preview || !formatoOriginal) {
      return
    }

    setEstado('cargando')
    setError(null)

    try {
      const archivoAEnviar = archivoConvertido ?? archivo

      const formData = buildUploadFormData({
        archivo: archivoAEnviar,
        columnaTexto,
        columnaClase: sinClasificar ? null : columnaClase || null,
        columnaFecha: esDeChat ? columnaFecha || null : null,
        columnaUsuario: esDeChat && formatoAutomatico !== 'whatsapp-chat' ? columnaUsuario || null : null,
        formatoOriginal,
        formatoDetectado: formatoAutomatico,
        formatoFecha: esDeChat && columnaFecha ? whatsappLocale : null,
        esChat: esDeChat,
      })

      await startTask({
        key: taskKey,
        service: 'dataset',
        operation: 'uploadDataset',
        jobType: 'upload',
        formData,
        successMessage: 'Dataset cargado correctamente.',
      })
    } catch {
      setEstado('idle')
    }
  }

  const columnas = preview?.columns ?? []

  const configDialogoActual = archivoEspecialPendiente
    ? CONFIG_ARCHIVO_ESPECIAL[archivoEspecialPendiente.tipo]
    : null

  const etiquetaFormatoActual = formatoAutomatico
    ? ETIQUETA_FORMATO_AUTOMATICO[formatoAutomatico]
    : null

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <AlertDialog
        open={archivoEspecialPendiente !== null}
        onOpenChange={(open) => {
          if (!open) cancelarConversionEspecial()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {archivoEspecialPendiente?.tipo === 'zip' ? (
                <Archive className="size-4" />
              ) : (
                <MessageCircle className="size-4" />
              )}
              {configDialogoActual?.titulo}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {configDialogoActual?.descripcion}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarConversionEspecial}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction onClick={confirmarConversionEspecial}>
              Convertir y continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="lg:col-span-3 self-start">
        <CardHeader>
          <CardTitle>
            Seleccionar archivo
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => {
              setDragOver(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)

              const file =
                e.dataTransfer.files?.[0]

              if (file) {
                manejarArchivoElegido(file)
              }
            }}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Upload className="size-5" />
            </span>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                Arrastra un archivo aquí
              </p>

              <p className="text-xs text-muted-foreground">
                CSV, XLSX, TXT (WhatsApp), ZIP (carpetas por clase) · máx. 50 MB
              </p>
            </div>

            <label>
              <input
                type="file"
                className="sr-only"
                accept=".csv,.xlsx,.txt,.zip"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0]

                  if (file) {
                    manejarArchivoElegido(file)
                  }
                  e.target.value = ''
                }}
              />

              <span className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                Examinar archivos
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {archivo && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <FileText className="size-4 text-primary" />

              <span className="truncate text-sm font-medium">
                {archivo.name}
              </span>

              {etiquetaFormatoActual && (
                <Badge variant="secondary">
                  {etiquetaFormatoActual.icono === 'zip' ? (
                    <Archive className="size-3" />
                  ) : (
                    <MessageCircle className="size-3" />
                  )}
                  {etiquetaFormatoActual.texto}
                </Badge>
              )}

              {cargandoPreview ? (
                <Badge
                  variant="secondary"
                  className="ml-auto"
                >
                  <LoaderCircle className="size-3 animate-spin" />
                  Leyendo
                </Badge>
              ) : estado === 'listo' ? (
                <Badge
                  variant="success"
                  className="ml-auto"
                >
                  <Check className="size-3" />
                  Cargado
                </Badge>
              ) : (
                <button
                  onClick={quitarArchivo}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  aria-label="Quitar archivo"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}

          {preview && (
            <DatasetPreview preview={preview} />
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 self-start">
        <CardHeader>
          <CardTitle>
            Mapeo de columnas
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {mapeoAutomatico && (
            <p className="rounded-lg border border-input bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {formatoAutomatico === 'whatsapp-chat'
                ? 'Este dataset se generó automáticamente a partir de un chat de WhatsApp, así que el mapeo de columnas queda fijo.'
                : 'Este dataset se generó automáticamente a partir de las carpetas del .zip, así que el mapeo de columnas queda fijo.'}
            </p>
          )}

          {formatoAutomatico === 'whatsapp-chat' && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Formato de fecha en el .txt original
              <Select
                value={whatsappLocale}
                onValueChange={(value) =>
                  regenerarPreviewConLocale(value as WhatsappLocale)
                }
                disabled={!preview || cargandoPreview}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[360px]">
                  <SelectItem value="DMY" className="whitespace-normal">DD/MM/YYYY — ej. 13/08/2026</SelectItem>
                  <SelectItem value="MDY" className="whitespace-normal">MM/DD/YYYY — ej. 08/13/2026</SelectItem>
                  <SelectItem value="YMD" className="whitespace-normal">YYYY/MM/DD — ej. 2026/08/13</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs font-normal text-muted-foreground">
                Detectado automáticamente como <strong>{whatsappLocale}</strong>. Si las fechas se ven invertidas (mes 13), cambiá el formato y el preview se regenera.
              </span>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Columna de texto

            <Select
              value={columnaTexto}
              onValueChange={(value) => setColumnaTexto(value ?? '')}
              disabled={!preview || mapeoAutomatico}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>

              <SelectContent>
                {columnas.map((column) => (
                  <SelectItem
                    key={column.name}
                    value={column.name}
                  >
                    {column.name}
                    {' '}
                    <span className="text-muted-foreground">
                      ({column.type})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Columna de clase

            <Select
              value={columnaClase}
              onValueChange={(value) => setColumnaClase(value ?? '')}
              disabled={!preview || sinClasificar || mapeoAutomatico}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>

              <SelectContent>
                {columnas
                  .filter(
                    (column) =>
                      column.name !== columnaTexto
                  )
                  .map((column) => (
                    <SelectItem
                      key={column.name}
                      value={column.name}
                    >
                      {column.name}
                      {' '}
                      <span className="text-muted-foreground">
                        ({column.type})
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </label>

          <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2">
            <span className="text-sm font-medium">
              El archivo no está clasificado
            </span>

            <Switch
              checked={sinClasificar}
              disabled={mapeoAutomatico}
              onCheckedChange={(value) => {
                setSinClasificar(value)

                if (value) {
                  setColumnaClase('')
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2">
            <span className="text-sm font-medium">
              El dataset proviene de un chat
            </span>

            <Switch
              checked={esDeChat}
              disabled={mapeoAutomatico}
              onCheckedChange={(value) => {
                setEsDeChat(value)

                if (!value) {
                  setColumnaFecha('')
                  setColumnaUsuario('')
                }
              }}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Columna de fecha

            <Select
              value={columnaFecha}
              onValueChange={(value) => setColumnaFecha(value ?? '')}
              disabled={!preview || !esDeChat || mapeoAutomatico}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>

              <SelectContent>
                {columnas.map((column) => (
                  <SelectItem
                    key={column.name}
                    value={column.name}
                  >
                    {column.name}
                    {' '}
                    <span className="text-muted-foreground">
                      ({column.type})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {esDeChat && formatoAutomatico !== 'whatsapp-chat' && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Columna de usuario

              <Select
                value={columnaUsuario}
                onValueChange={(value) => setColumnaUsuario(value ?? '')}
                disabled={!preview || !esDeChat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>

                <SelectContent>
                  {columnas
                    .filter(
                      (column) =>
                        column.name !== columnaTexto
                    )
                    .map((column) => (
                      <SelectItem
                        key={column.name}
                        value={column.name}
                      >
                        {column.name}
                        {' '}
                        <span className="text-muted-foreground">
                          ({column.type})
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <span className="text-xs font-normal text-muted-foreground">
                Quién escribió cada mensaje. Se usará para prefijar cada mensaje como <strong>[fecha] autor: texto</strong> en la búsqueda.
              </span>
            </label>
          )}

          {esDeChat && formatoAutomatico !== 'whatsapp-chat' && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Formato de fecha
              <Select
                value={whatsappLocale}
                onValueChange={(value) => setWhatsappLocale(value as WhatsappLocale)}
                disabled={!preview || !esDeChat}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[360px]">
                  <SelectItem value="DMY" className="whitespace-normal">DD/MM/YYYY — ej. 13/08/2026</SelectItem>
                  <SelectItem value="MDY" className="whitespace-normal">MM/DD/YYYY — ej. 08/13/2026</SelectItem>
                  <SelectItem value="YMD" className="whitespace-normal">YYYY/MM/DD — ej. 2026/08/13</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs font-normal text-muted-foreground">
                Se normalizará siempre a <strong>YYYY-MM-DD</strong> al guardar. Elegí el formato que tiene tu columna &quot;{columnaFecha || 'fecha'}&quot;.
              </span>
            </label>
          )}

          <Button
            onClick={cargar}
            disabled={
              !archivo ||
              !preview ||
              cargandoPreview ||
              estado !== 'idle' ||
              !columnaTexto ||
              (!sinClasificar && !columnaClase) ||
              (esDeChat && !columnaFecha) ||
              (esDeChat && formatoAutomatico !== 'whatsapp-chat' && !columnaUsuario)
            }
            className="mt-1"
          >
            {estado === 'cargando' && (
              <LoaderCircle className="animate-spin" />
            )}

            {estado === 'cargando'
              ? 'Cargando…'
              : 'Cargar dataset'}
          </Button>

          {estado === 'listo' && (
            <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-700">
                <Check className="size-4" />
                Dataset cargado correctamente
              </p>

              <p className="text-muted-foreground">
                {preview?.totalRows.toLocaleString('es')}{' '}
                registros ·{' '}
                {preview?.columns.length} columnas
                detectadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
