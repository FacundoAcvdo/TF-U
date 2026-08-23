"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface DatasetInfo {
    dataset_name: string;
    dataset_size: number;
    embeddings_size: number;
    embeddings_chunked_size: number;
}

interface DatasetContextType {
    datasetSeleccionado: string | null;
    setDatasetSeleccionado: (value: string | null) => void
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

const fetchDatasets = async (): Promise<DatasetInfo[]> => {
  const response = await fetch('http://localhost:8080/getDatasets', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) throw new Error('Error al obtener los datasets');
  
  const data: { datasets: DatasetInfo[] } = await response.json();
  return data.datasets;
};

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [datasetSeleccionado, setDatasetSeleccionado] = useState<string | null>(null);
  
  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: fetchDatasets,
  })

  useEffect(() => {
    if (datasets && datasets.length > 0 && !datasetSeleccionado) {
      setDatasetSeleccionado(datasets[0].dataset_name);
    }
  }, [datasets, datasetSeleccionado])

  return (
    <DatasetContext.Provider value={{ datasetSeleccionado, setDatasetSeleccionado }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) throw new Error("useDataset debe usarse dentro de DatasetProvider");
  return context;
}

export function useDatasetsQuery() {
  return useQuery<DatasetInfo[]>({
    queryKey: ['datasets'],
    queryFn: fetchDatasets, // 👈 Al ponerlo aquí, garantizas que la función siempre acompañe a la llave
  });
}
