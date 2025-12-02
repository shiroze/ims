'use client'
import { createTheme, MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

const theme = createTheme({
  /** Your theme override here */
});

const ProvidersWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}

export default ProvidersWrapper;