'use client';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useDebouncedCallback } from '@mantine/hooks';

export type LayoutThemeType = 'light' | 'dark' | 'system';

/**
 * Gets the system's color scheme preference
 * @returns 'light' or 'dark' based on system preference
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

/**
 * Sets or removes a data attribute on the document element
 * @param attribute - The attribute name (without 'data-' prefix)
 * @param value - The value to set, or null/undefined to remove the attribute
 */
export const toggleAttribute = (
  attribute: string,
  value: string | null | undefined
): void => {
  if (typeof document === 'undefined') return;
  
  const attrName = attribute.startsWith('data-') ? attribute : `data-${attribute}`;
  
  if (value === null || value === undefined || value === '') {
    document.documentElement.removeAttribute(attrName);
  } else {
    document.documentElement.setAttribute(attrName, value);
  }
};

export type SideNavSizeType =
  | 'default'
  | 'hover'
  | 'hover-active'
  | 'sm'
  | 'md'
  | 'offcanvas'
  | 'hidden';

export type SideNavColorType = 'light' | 'dark';

export type LayoutStateType = {
  sidenav: {
    size: SideNavSizeType;
    color: SideNavColorType;
  };
  theme: LayoutThemeType;
};

type LayoutContextType = {
  updateSettings: (newSettings: Partial<LayoutStateType>) => void;
  reset: () => void;
} & LayoutStateType;

const INIT_STATE: LayoutStateType = {
  sidenav: {
    size: 'default',
    color: 'light',
  },
  theme: 'light'
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = use(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext can only be used within LayoutProvider');
  }
  return context;
};

const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<LayoutStateType>(
    '__IMS_NEXT_CONFIG__',
    INIT_STATE
  );

  const [hasHydrated, setHasHydrated] = useState(false);
  
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const updateSettings = useCallback(
    (_newSettings: Partial<LayoutStateType>) => {
      setSettings((prevSettings: LayoutStateType) => ({
        ...prevSettings,
        ..._newSettings,
        sidenav: {
          ...prevSettings.sidenav,
          ...(_newSettings.sidenav || {}),
        },
      }));
    },
    [setSettings]
  );

  const reset = useCallback(() => {
    setSettings(INIT_STATE);
  }, [setSettings]);

  const changeSideNavSize = useCallback(
    (nSize: SideNavSizeType, persist = true) => {
      toggleAttribute('sidenav-size', nSize);
      if (persist) {
        setSettings(prev => ({
          ...prev,
          sidenav: { ...prev.sidenav, size: nSize },
        }));
      }
    },
    [setSettings]
  );

  useEffect(() => {
    if (!hasHydrated) return;
    
    toggleAttribute('sidenav-color', settings.sidenav.color);
    toggleAttribute('sidenav-size', settings.sidenav.size);
    
    const effectiveTheme =
      settings.theme === 'system' ? getSystemTheme() : settings.theme;
    toggleAttribute('theme', effectiveTheme);
    
    // Listen for system theme changes if using 'system' theme
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        toggleAttribute('theme', getSystemTheme());
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
      }
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
        return () => {
          mediaQuery.removeListener(handleSystemThemeChange);
        };
      }
    }
  }, [settings, hasHydrated]);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;

    if (width <= 768) {
      changeSideNavSize('offcanvas');
    } else if (width <= 1140) {
      changeSideNavSize('sm');
    } else {
      changeSideNavSize('default');
    }
  }, [changeSideNavSize]);

  const debouncedResize = useDebouncedCallback(handleResize, { delay: 200 });

  useEffect(() => {
    if (!hasHydrated) return;

    handleResize();
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [hasHydrated, handleResize, debouncedResize]);

  return (
    <LayoutContext
      value={useMemo(
        () => ({
          ...settings,
          updateSettings,
          reset,
        }),
        [settings, updateSettings, reset]
      )}
    >
      {children}
    </LayoutContext>
  );
};

export default LayoutProvider;
