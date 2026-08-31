import React, { useEffect, useState } from 'react'
import { almacenamiento, archivosAlmacenados } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'


function StorageManagementView() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
    requestAnimationFrame(() => {
        setProgress(almacenamiento.porcentajeUsado);
    });
    }, [almacenamiento.porcentajeUsado]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">

        <Card className="lg:col-span-2 max-h-[210px]">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex flex-col gap-2">
                    <div>Almacenamiento utilizado</div>
                    <div>Total: {almacenamiento.total}</div>
                    <div>Usado: {almacenamiento.usado}</div>
                    <div>Disponible: {almacenamiento.disponible}</div>
                </CardTitle>
                <Badge variant="secondary">{almacenamiento.porcentajeUsado}%</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary animate-progress-bar"
                    style={{
                    "--progress": `${almacenamiento.porcentajeUsado}%`,
                    } as React.CSSProperties}
                />
                </div>
            </CardContent>
            <CardFooter className="w-full">
                <Button className="w-full" variant="destructive">Eliminar todo</Button>
            </CardFooter>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                    <div>Archivos Almacenados</div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {archivosAlmacenados.map((archivo, i) => (
                    <Card key={archivo.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 justify-between">
                            {archivo.nombre}
                            <div>Total: {archivo.total} MB</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 py-1">
                            <div className="flex flex-wrap gap-1.5">
                                <div className="w-full py-2">
                                    <div className="flex items-center justify-between gap-2 py-1">
                                        <p>Archivo</p>
                                        <Badge variant="secondary">{((archivo.tamano / archivo.total) * 100).toFixed(2)}%</Badge>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary animate-progress-bar"
                                            style={{
                                            "--progress": `${(archivo.tamano / archivo.total) * 100}%`,
                                            } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                                
                                <div className="w-full py-2">
                                    <div className="flex items-center justify-between gap-2 py-1">
                                        <p>Embeddings</p>
                                        <Badge variant="secondary">{((archivo.tamanoEmbeddings / archivo.total) * 100).toFixed(2)}%</Badge>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary animate-progress-bar"
                                            style={{
                                            "--progress": `${(archivo.tamanoEmbeddings / archivo.total) * 100}%`,
                                            } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                                
                                <div className="w-full ">
                                    <div className="flex items-center justify-between gap-2 py-1">
                                        <p>Embeddings Chunks</p>
                                        <Badge variant="secondary">{((archivo.tamanoEmbeddingsChunked / archivo.total) * 100).toFixed(2)}%</Badge>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary animate-progress-bar"
                                            style={{
                                            "--progress": `${(archivo.tamanoEmbeddingsChunked / archivo.total) * 100}%`,
                                            } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="w-full">
                            <Button className="w-full" variant="destructive">Eliminar</Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </div>
  )
}

export default StorageManagementView