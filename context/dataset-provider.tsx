"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/api-fetch";

interface DatasetInfo {
    dataset_id: string
    user_id: string
    dataset_name: string;
    dataset_size: number;
    embedding_size: number;
    embedding_chunked_size: number;
}

interface DatasetContextType {
    datasetSeleccionado: string | null;
    setDatasetSeleccionado: (value: string | null) => void
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

const fetchDatasets = async (): Promise<DatasetInfo[]> => {
  // Lectura de fondo global: silenciosa para no spamear (ej. 401 pre-login).
  // Los errores de cada acción se avisan con toast en su propia vista.
  const data = await apiFetch<{ datasets: DatasetInfo[] }>(
    '/dataset/getDatasets',
    { method: 'GET' },
    { silent: true },
  );
  return data.datasets;
};

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [datasetSeleccionado, setDatasetSeleccionado] = useState<string | null>(null);
  
  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: fetchDatasets,
  })

  useEffect(() => {
    if (!datasets) {
      return;
    }
    if (datasets.length === 0) {
      if (datasetSeleccionado !== null) {
        setDatasetSeleccionado(null);
      }
      return;
    }
    const sigueExistiendo = datasetSeleccionado !== null
      && datasets.some((dataset) => dataset.dataset_name === datasetSeleccionado);
    if (!sigueExistiendo) {
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
    queryFn: fetchDatasets,
  });
}
