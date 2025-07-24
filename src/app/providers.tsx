'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useState } from 'react';

// Configurar tema com modo do sistema
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  );
} 