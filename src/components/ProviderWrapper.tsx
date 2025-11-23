import { createTheme, MantineProvider } from '@mantine/core';
import React, { useEffect } from 'react';

const theme = createTheme({
  /** Your theme override here */
});

const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}

export default ProvidersWrapper;