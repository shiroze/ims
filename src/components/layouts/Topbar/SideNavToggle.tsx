'use client';

import { UnstyledButton, Tooltip } from '@mantine/core';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useLayoutContext } from '~/context/useLayoutContext';
import { useEffect, useState } from 'react';

const SideNavToggle = () => {
  const { sidenav, updateSettings } = useLayoutContext();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isCollapsed = sidenav.size === 'sm' || sidenav.size === 'hover';
  const isSidebarHidden = sidenav.size === 'offcanvas';

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile: toggle between 'offcanvas' (hidden) and 'default' (shown)
      const newSize = isSidebarHidden ? 'default' : 'offcanvas';
      updateSettings({
        sidenav: {
          ...sidenav,
          size: newSize,
        },
      });
    } else {
      // On desktop: toggle between 'sm' (collapsed) and 'default' (expanded)
      const newSize = isCollapsed ? 'default' : 'sm';
      updateSettings({
        sidenav: {
          ...sidenav,
          size: newSize,
        },
      });
    }
  };

  // On desktop: always show hamburger
  // On mobile: show X when sidebar is visible, hamburger when hidden
  const showXIcon = isMobile && !isSidebarHidden;

  const tooltipLabel = isMobile
    ? (isSidebarHidden ? 'Open menu' : 'Close menu')
    : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');

  return (
    <Tooltip label={tooltipLabel} withArrow>
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
        {showXIcon ? <IconX size={20} /> : <IconMenu2 size={20} />}
      </UnstyledButton>
    </Tooltip>
  );
};

export default SideNavToggle;
