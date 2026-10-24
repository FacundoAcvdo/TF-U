# TF-U Frontend — PLASMA

Interfaz web de **PLASMA** (Plataforma de Lenguaje y Análisis de Salud Mental Automatizado), el frontend del Trabajo Final de la carrera. Permite cargar datasets de texto, ejecutar distintos análisis de PLN sobre ellos y explorar los resultados de forma interactiva.

Este proyecto consume la API expuesta por [`TF-U-BACKEND`](../TF-U-BACKEND), un conjunto de microservicios orquestados por un `api-gateway`.

## Características

- Inicio de sesión contra Supabase Auth a través del gateway (JWT en cookie `httpOnly`).
- Carga de datasets en CSV y Excel, con importación de TXT/ZIP que se convierten automáticamente a CSV, y mapeo de columnas.
- Análisis estadístico (EDA) y limpieza de datos configurable.
- Visualización de embeddings (UMAP + clustering).
- Nube de palabras y evolución temporal de términos.
- Detección de emociones y evolución de sentimientos en el tiempo.
- Modelado de tópicos (BERTopic) con títulos generados por LLM.
- Construcción de clasificadores de menciones de suicidio y estimación de nivel de riesgo.
- Chatbots con RAG (general y sobre el dataset) e historial de conversaciones.
- Generación y descarga de informes PDF.
- Administración de usuarios y del almacenamiento.

## Stack

| Área | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) |
| UI | React 19, Tailwind CSS 4, shadcn/ui + Base UI, lucide-react |
| Estado / datos | TanStack Query, Context API |
| Gráficos | Recharts |
| Archivos | PapaParse, SheetJS (`xlsx`), JSZip |
| Markdown | react-markdown + remark-gfm |
| Notificaciones | Sonner |
| Lenguaje | TypeScript 5.7 |

## Requisitos

- Node.js 20 o superior (la imagen Docker usa Node 24).
- npm (hay `package-lock.json`) o pnpm (hay `pnpm-lock.yaml`).
- El backend (`api-gateway`) accesible, ya sea local o por Docker.

## Configuración

Copiá el archivo de ejemplo y ajustá la URL del gateway:

```bash
cp .env.example .env.local
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `API_BASE_SERVER` | Sí | URL del `api-gateway` vista desde el **servidor** de Next.js (SSR, route handlers y rewrites). En local: `http://localhost:7500`. En Docker: `http://api-gateway:7500`. |

> En el navegador las llamadas se hacen a rutas relativas (`/dataset/...`, `/rag/...`, etc.) y Next.js las redirige al gateway mediante los `rewrites` de `next.config.mjs`. Por eso no hace falta CORS ni una URL pública del backend.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>.

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción (puerto 3000 en local; 6001 en Docker por `PORT`) |
| `npm run lint` | Ejecuta ESLint |

## Docker

```bash
docker build -t tf-u-frontend .
docker run --rm -p 6001:6001 -e API_BASE_SERVER=http://host.docker.internal:7500 tf-u-frontend
```

Ese ejemplo asume que el gateway está publicado en el puerto `7500` del host. En Linux, agregá `--add-host=host.docker.internal:host-gateway`. Para el stack completo usá el `compose.yaml` de la raíz: incluye el compose del backend, configura `API_BASE_SERVER=http://api-gateway:7500` y conecta el frontend a la red `microservicios`.

## Estructura

```text
app/
  (auth)/login/          Pantalla de inicio de sesión
  (dashboard)/           Vistas protegidas (una ruta por funcionalidad)
  api/auth/              Route handlers que proxyean login, me y logout al gateway
components/
  ui/                    Componentes base (shadcn/ui)
  views/                 Vistas de cada funcionalidad
  charts/                Gráficos reutilizables
context/                 Providers de React Query, dataset y jobs
lib/                     Cliente HTTP, auth, navegación y utilidades
proxy.ts                 Middleware de protección de rutas
next.config.mjs          Rewrites hacia el api-gateway
```

### Rutas principales

| Ruta | Funcionalidad |
| --- | --- |
| `/login` | Inicio de sesión |
| `/cargar-dataset` | Carga y configuración del dataset |
| `/estadisticas` | Estadísticas generales (EDA) |
| `/limpieza-datos` | Limpieza del corpus |
| `/embeddings` | Visualización de embeddings |
| `/nube-palabras` | Nube de palabras |
| `/emociones-negativas` | Detección de emociones |
| `/topicos` | Tópicos principales |
| `/evolucion-palabras` | Evolución de palabras |
| `/sentimientos-tiempo` | Sentimiento en el tiempo |
| `/mencion-suicidio` | Construcción del clasificador de menciones |
| `/nivel-riesgo` | Nivel de riesgo |
| `/chatbot-general` | Chatbot general (RAG) |
| `/chatbot-dataset` | Chatbot sobre el dataset |
| `/historial-chats` | Historial de conversaciones |
| `/informes` | Generación de informes |
| `/usuarios` | Gestión de usuarios |
| `/gestion-almacenamiento` | Administración del almacenamiento |

## Autenticación

1. `POST /api/auth/login` reenvía las credenciales al gateway; el `auth-service` las valida con Supabase y devuelve una cookie `access_token` (`httpOnly`).
2. `proxy.ts` valida la cookie en cada request y redirige a `/login` si no hay sesión válida.
3. Las llamadas a la API usan `credentials: 'include'` para enviar la cookie al gateway.
4. `POST /api/auth/logout` cierra la sesión y elimina la cookie.

## Jobs asíncronos

Los análisis pesados se ejecutan como jobs en segundo plano:

1. La vista hace `POST /<servicio>/<operación>` y recibe `202 { job_id, status }`.
2. `JobsProvider` consulta `GET /<servicio>/jobs/<job_id>` inicialmente a los 2 segundos y aplica backoff independiente por job de 2, 4, 8 y hasta 15 segundos.
3. Al finalizar se muestra una notificación y se habilitan las vistas de resultados.

El polling es global, por lo que continúa aunque el usuario navegue a otra pantalla. Sólo permanece activo mientras haya jobs en ejecución, detiene cada job al llegar a `succeeded` o `failed` y limita a 3 las consultas simultáneas.

## Notas

- El frontend no guarda credenciales ni claves: solo habla con el gateway.
- Si el backend corre en otra máquina, `API_BASE_SERVER` debe apuntar a una URL alcanzable desde el contenedor/proceso de Next.js.
- El proyecto forma parte de un monorepo; el `compose.yaml` de la raíz incluye al del backend y agrega el frontend.
