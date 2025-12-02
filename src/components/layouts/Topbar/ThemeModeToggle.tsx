'use client';

import { Menu } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useLayoutContext, getSystemTheme } from '~/context/useLayoutContext';

const ThemeModeToggle = () => {
  const { theme, updateSettings } = useLayoutContext();

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  const isDark = getCurrentTheme() === 'dark';

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: newTheme });
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <IconDeviceDesktop size={20} />;
    }
    return isDark ? <IconSun size={20} /> : <IconMoon size={20} />;
  };

  return (
    <Menu shadow="md" width={160}>
      <Menu.Target>
        <button
          className="btn btn-icon size-9 hover:bg-default-150 rounded-full cursor-pointer flex items-center justify-center transition-colors"
          type="button"
        >
          {getIcon()}
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconSun size={18} />}
          onClick={() => handleThemeChange('light')}
          style={{
            backgroundColor: theme === 'light' ? 'var(--sidebar-active)' : undefined,
            fontWeight: theme === 'light' ? 600 : undefined,
          }}
        >
          Light
        </Menu.Item>
        <Menu.Item
          leftSection={<IconMoon size={18} />}
          onClick={() => handleThemeChange('dark')}
          style={{
            backgroundColor: theme === 'dark' ? 'var(--sidebar-active)' : undefined,
            fontWeight: theme === 'dark' ? 600 : undefined,
          }}
        >
          Dark
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={18} />}
          onClick={() => handleThemeChange('system')}
          style={{
            backgroundColor: theme === 'system' ? 'var(--sidebar-active)' : undefined,
            fontWeight: theme === 'system' ? 600 : undefined,
          }}
        >
          System
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ThemeModeToggle;
