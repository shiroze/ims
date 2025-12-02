'use client';

import { useEffect, useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import type { ReactNode } from 'react';
import { useLayoutContext, getSystemTheme } from '~/context/useLayoutContext';

const theme = createTheme({
  /** Your theme override here */
});

export const MantineThemeWrapper = ({ children }: { children: ReactNode }) => {
  const { theme: layoutTheme } = useLayoutContext();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Determine the effective color scheme
    const effectiveScheme = layoutTheme === 'system' 
      ? getSystemTheme() 
      : layoutTheme;
    
    setColorScheme(effectiveScheme);

    // Listen for system theme changes if using 'system' theme
    if (layoutTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        setColorScheme(getSystemTheme());
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
      }
    }
  }, [layoutTheme]);

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
};
