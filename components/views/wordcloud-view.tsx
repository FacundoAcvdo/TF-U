'use client'

import { Cloud } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nubePalabras } from '@/lib/mock-data'

// Tamaño de fuente proporcional al peso del término.
function fontSize(peso: number) {
  return 0.85 + (peso / 100) * 2.1 // rem
}

const colores = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-5)', 'var(--foreground)']

export function WordCloudView() {
  return (
    <AnalysisRunner
      icon={Cloud}
      runLabel="Generar nube de palabras"
      idleHint="Tokeniza el corpus, elimina palabras vacías y calcula la frecuencia de cada término para representarlos según su peso."
    >
      <Card>
        <CardHeader>
          <CardTitle>Términos más frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-6">
            {nubePalabras.map((p, i) => (
              <span
                key={p.texto}
                className="font-semibold leading-none transition-colors hover:text-primary"
                style={{
                  fontSize: `${fontSize(p.peso)}rem`,
                  color: colores[i % colores.length],
                  opacity: 0.55 + (p.peso / 100) * 0.45,
                }}
                title={`Frecuencia relativa: ${p.peso}`}
              >
                {p.texto}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnalysisRunner>
  )
}
