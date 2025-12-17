"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const TanstackProvider = ({ children }: { children: React.ReactNode }) => {
  // Tworzymy klienta raz na sesję przeglądarki, żeby nie resetował cache'u przy każdym renderze
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Domyślnie dane będą uznawane za "nieświeże" po 60 sekundach
        staleTime: 60 * 1000, 
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};