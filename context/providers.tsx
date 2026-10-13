"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DatasetProvider } from "./dataset-provider";
import { JobsProvider } from "./jobs-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, 
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <JobsProvider>
        <DatasetProvider>
            {children}
        </DatasetProvider>
      </JobsProvider>
    </QueryClientProvider>
  );
}
