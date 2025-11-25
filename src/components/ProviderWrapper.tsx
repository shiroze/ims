'use client'
import { createTheme, MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import LayoutProvider from '~/context/useLayoutContext';

const theme = createTheme({
  /** Your theme override here */
});

const ProvidersWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MantineProvider theme={theme}>
      <LayoutProvider>{children}</LayoutProvider>
    </MantineProvider>
  );
}

export default ProvidersWrapper;