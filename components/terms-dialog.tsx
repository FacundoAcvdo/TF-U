'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, LoaderCircle, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type TermsDialogProps = {
  initialTermsAccepted?: boolean
}

export function TermsDialog({ initialTermsAccepted = false }: TermsDialogProps) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [aceptadoCheck, setAceptadoCheck] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (initialTermsAccepted) {
      setMostrarModal(false)
      return
    }

    let cancelado = false
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelado || !data?.user) return
        if (data.user.terms_accepted === true) {
          setMostrarModal(false)
        } else {
          setMostrarModal(true)
        }
      })
      .catch(() => {
        // Si falla la consulta, no bloqueamos por error de red transitorio
      })

    return () => {
      cancelado = true
    }
  }, [initialTermsAccepted])

  async function handleAccept() {
    if (!aceptadoCheck || guardando) return
    setGuardando(true)
    try {
      const res = await fetch('/api/auth/terms', {
        method: 'POST',
      })
      if (!res.ok) {
        toast.error('No se pudo registrar la aceptación. Intenta nuevamente.')
        setGuardando(false)
        return
      }
      setMostrarModal(false)
      toast.success('Términos y condiciones aceptados.')
      await queryClient.invalidateQueries()
      router.refresh()
    } catch {
      toast.error('Sin conexión con el servidor. Revisa tu red.')
      setGuardando(false)
    }
  }

  async function handleDeclineLogout() {
    setCerrandoSesion(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/login')
    router.refresh()
  }

  if (!mostrarModal) return null

  return (
    <Dialog open={mostrarModal} onOpenChange={() => {}} disablePointerDismissal>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] sm:max-w-2xl flex flex-col gap-4 p-6"
      >
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold">
                Términos y Condiciones de Uso — PLASMA
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Plataforma de Lenguaje y Análisis de Salud Mental Automatizado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-4 max-h-[52dvh]">
          <p className="text-muted-foreground">
            Bienvenido/a a <strong>PLASMA</strong>. Dado que el acceso al sistema es administrado y las
            cuentas son provistas por un administrador, es necesario que lea y acepte el presente
            acuerdo antes de utilizar la plataforma por primera vez.
          </p>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">1. Acceso y Uso de la Cuenta</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Cuentas administradas:</strong> Su cuenta ha sido creada y asignada por un
                administrador del sistema. Las credenciales de acceso son personales e intransferibles.
              </li>
              <li>
                <strong>Responsabilidad del usuario:</strong> Usted es responsable de mantener la
                confidencialidad de su contraseña y de todas las operaciones, cargas de archivos y
                análisis ejecutados desde su sesión.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">
              2. Tratamiento de Datasets y Capa de Anonimización
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Recomendación de anonimización previa:</strong> Se recomienda que los conjuntos
                de datos (<em>datasets</em>), documentos o historiales de chat cargados en la plataforma
                se encuentren previamente anonimizados o desprovistos de información personal sensible
                que no sea necesaria para el análisis.
              </li>
              <li>
                <strong>Alcance de la anonimización automática en la ingesta:</strong> Al cargar un
                dataset, <strong>PLASMA</strong> aplica automáticamente una capa de anonimización básica
                basada en reglas y patrones que:
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>
                    Reemplaza los nombres o identificadores de la columna de remitente/autor (y sus
                    menciones directas en el texto) por etiquetas genéricas (<code>PERSONA_1</code>,{' '}
                    <code>PERSONA_2</code>, etc.).
                  </li>
                  <li>
                    Enmascara direcciones de correo electrónico (<code>[EMAIL]</code>), números
                    telefónicos (<code>[TEL]</code>), direcciones IP (<code>[IP]</code>) y enlaces web (
                    <code>[URL]</code>).
                  </li>
                </ul>
              </li>
              <li>
                <strong>Limitaciones técnicas:</strong> Este proceso automático es una medida de
                resguardo inicial y <strong>no emplea modelos de detección de entidades abiertas (NER)</strong>.
                Por lo tanto, no garantiza la eliminación de datos personales incluidos de forma libre o
                implícita en los textos (como nombres de terceros que no figuren como remitentes,
                domicilios, números de documento o referencias contextuales). El usuario comprende estas
                limitaciones y asume la responsabilidad sobre el contenido de los archivos que decide
                cargar.
              </li>
              <li>
                <strong>Diccionario de anonimización efímero:</strong> La plataforma{' '}
                <strong>no almacena en su base de datos</strong> la correspondencia entre los datos
                originales y las etiquetas generadas. Dicho diccionario se mantiene temporalmente en
                memoria únicamente al finalizar la carga para que el usuario pueda descargarlo si lo
                requiere; una vez descargado o expirado el tiempo breve de sesión, se elimina de forma
                definitiva.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">
              3. Uso de Inteligencia Artificial (RAG y Modelado de Tópicos): APIs Externas y Modo Local
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Uso de APIs externas:</strong> En los chatbots de consulta asistidos por
                inteligencia artificial (sistema RAG) y en la generación automática de títulos del
                módulo de <em>Modelado de Tópicos</em>, el modo estándar envía las consultas, el
                historial reciente o los términos y fragmentos representativos a{' '}
                <strong>APIs de proveedores externos de modelos de lenguaje</strong> (como Groq o Google
                Gemini) para elaborar las respuestas y etiquetas.
              </li>
              <li>
                <strong>Modo Privacidad (Modelo Local):</strong> Tanto los asistentes de chat como el
                módulo de <em>Modelado de Tópicos</em> disponen de un interruptor de{' '}
                <strong>&ldquo;Privacidad&rdquo;</strong> (ejecución mediante modelo local Qwen3). Al
                activar este modo, tanto las consultas como los fragmentos del dataset se procesan
                íntegramente en la infraestructura local del servidor, sin transmitir información a
                servicios externos (pudiendo requerir un mayor tiempo de procesamiento). Es
                responsabilidad del usuario activar el modo local cuando la confidencialidad o
                sensibilidad de los datos así lo requiera.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">
              4. Almacenamiento y Gestión de la Información
            </h3>
            <p>
              Para el funcionamiento de los módulos analíticos y la generación de reportes, la
              plataforma almacena en sus bases de datos (relacional y vectorial):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Los textos procesados (con la anonimización básica aplicada), sus metadatos asociados
                (fechas, clases, etiquetas de remitente) y sus representaciones vectoriales (
                <em>embeddings</em>).
              </li>
              <li>
                Los resultados estadísticos y analíticos generados (EDA, limpieza de texto, clustering,
                nube y evolución de palabras, análisis de emociones, tópicos, clasificadores entrenados
                y estimación de riesgo).
              </li>
              <li>El historial de conversaciones y mensajes con los asistentes virtuales.</li>
              <li>
                Registros técnicos de ejecución de tareas (<em>jobs</em>) y auditoría de solicitudes
                asociados a su identificador de usuario.
              </li>
              <li>
                <strong>Control y eliminación:</strong> El usuario puede eliminar en cualquier momento
                sus datasets, vectores e historiales de conversación desde las secciones de{' '}
                <em>Gestión de Almacenamiento</em> e <em>Historial de Chats</em>.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">
              5. Propósito Analítico y Descargo de Responsabilidad Clínica
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>No constituye diagnóstico médico ni psicológico:</strong> Los resultados
                generados por <strong>PLASMA</strong> —en especial los módulos de <em>Emociones</em>,{' '}
                <em>Detección de Menciones de Suicidio</em> y <em>Estimación de Nivel de Riesgo</em>—
                provienen de modelos estadísticos y de inteligencia artificial experimentales que
                detectan patrones lingüísticos y pueden contener errores (falsos positivos y falsos
                negativos).
              </li>
              <li>
                <strong>Supervisión profesional:</strong> Ningún resultado, métrica o informe PDF
                emitido por la plataforma reemplaza el criterio clínico ni constituye una evaluación o
                diagnóstico de salud mental. Cualquier caso o alerta detectada debe ser interpretada y
                revisada exclusivamente por profesionales cualificados.
              </li>
            </ul>
          </section>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={aceptadoCheck}
            onChange={(e) => setAceptadoCheck(e.target.checked)}
            disabled={guardando || cerrandoSesion}
            className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary cursor-pointer"
          />
          <span className="text-xs sm:text-sm leading-snug text-foreground">
            He leído y acepto los Términos y Condiciones de Uso de PLASMA. Comprendo el alcance de la
            anonimización automática, el funcionamiento de las APIs externas frente al modo de
            privacidad local en los asistentes y en el modelado de tópicos, y que los resultados del
            sistema son de carácter orientativo y no constituyen diagnóstico clínico.
          </span>
        </label>

        <DialogFooter className="-mx-6 -mb-6 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDeclineLogout}
            disabled={guardando || cerrandoSesion}
          >
            {cerrandoSesion ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Rechazar y cerrar sesión
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!aceptadoCheck || guardando || cerrandoSesion}
          >
            {guardando && <LoaderCircle className="size-4 animate-spin" />}
            {guardando ? 'Guardando…' : 'Aceptar y continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
