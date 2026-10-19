import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'PLASMA | Plataforma de Lenguaje y Análisis de Salud Mental Automatizado',
  description:
    'Plataforma de Lenguaje y Análisis de Salud Mental Automatizado: análisis de corpus textuales para explorar patrones lingüísticos, emociones, tópicos y niveles de riesgo, con foco en la prevención en salud mental.'
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3a4a5c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
