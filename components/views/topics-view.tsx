'use client'

import { Layers } from 'lucide-react'
import { AnalysisRunner } from '@/components/analysis-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { topicos } from '@/lib/mock-data'

export function TopicsView() {
  return (
    <AnalysisRunner
      icon={Layers}
      runLabel="Extraer tópicos"
      idleHint="Aplica modelado de tópicos (LDA / BERTopic) sobre el corpus para descubrir los temas latentes y sus términos representativos."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {topicos.map((t, i) => (
          <Card key={t.nombre}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {t.nombre}
                </CardTitle>
                <Badge variant="secondary">{t.peso}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(t.peso / 24) * 100}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.terminos.map((term) => (
                  <Badge key={term} variant="outline">
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AnalysisRunner>
  )
}
