'use client';

import { UnstyledButton, Tooltip } from '@mantine/core';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useLayoutContext } from '~/context/useLayoutContext';

const SideNavToggle = () => {
  const { sidenav, updateSettings } = useLayoutContext();
  const isCollapsed = sidenav.size === 'sm' || sidenav.size === 'hover';

  const toggleSidebar = () => {
    const newSize = isCollapsed ? 'default' : 'sm';
    updateSettings({
      sidenav: {
        ...sidenav,
        size: newSize,
      },
    });
  };

  return (
    <Tooltip label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} withArrow>
      <UnstyledButton
        onClick={toggleSidebar}
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
        {isCollapsed ? <IconMenu2 size={20} /> : <IconX size={20} />}
      </UnstyledButton>
    </Tooltip>
  );
};

export default SideNavToggle;
