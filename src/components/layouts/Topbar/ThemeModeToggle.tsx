'use client';

import { UnstyledButton, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useLayoutContext, getSystemTheme } from '~/context/useLayoutContext';

const ThemeModeToggle = () => {
  const { theme, updateSettings } = useLayoutContext();

  const toggleTheme = () => {
    let newTheme: 'light' | 'dark' | 'system';
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }
    updateSettings({ theme: newTheme });
  };

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  const isDark = getCurrentTheme() === 'dark';

  return (
    <Tooltip
      label={
        theme === 'system'
          ? `System (${isDark ? 'Dark' : 'Light'}) - Click to change`
          : isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
      }
      withArrow
    >
      <UnstyledButton
        onClick={toggleTheme}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 'var(--mantine-radius-sm)',
          color: 'var(--mantine-color-text)',
        }}
        styles={{
          root: {
            '&:hover': {
              backgroundColor: 'var(--mantine-color-default-hover)',
            },
          },
        }}
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </UnstyledButton>
    </Tooltip>
  );
};

export default ThemeModeToggle;
