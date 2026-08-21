"use client";

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
    
    datasets: DatasetInfo[] | null;
    setDatasets: (dataset: DatasetInfo[]) => void
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [datasetSeleccionado, setDatasetSeleccionado] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<DatasetInfo[] | null>(null);  

  useEffect(() => {
    const fetchDatasets = async () => {
        try {
            const response = await fetch('http://localhost:8080/getDatasets', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) {
                throw new Error('Error al obtener los datasets')
            }

            const data: {datasets: DatasetInfo[]} = await response.json()
            
            setDatasets(data.datasets)

            console.log('Datasets obtenidos:', data)

            setDatasetSeleccionado(data.datasets.length > 0 ? data.datasets[0].dataset_name : null)
        } catch (error) {
            console.error('Error al obtener los datasets:', error)
        }
    }

    fetchDatasets()
  }, []);


  return (
    <DatasetContext.Provider value={{ datasetSeleccionado, setDatasetSeleccionado, datasets, setDatasets }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) throw new Error("useDataset debe usarse dentro de DatasetProvider");
  return context;
}