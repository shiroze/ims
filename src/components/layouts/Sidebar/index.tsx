'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  NavLink,
  ScrollArea,
  TextInput,
  Text,
  Group,
  Collapse,
  Tooltip,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconSearch } from '@tabler/icons-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import type { MenuItemType } from './menu';
import { useLayoutContext } from '~/context/useLayoutContext';

const isItemActive = (item: MenuItemType, pathname: string): boolean => {
  if (item.href && pathname === item.href) return true;
  if (item.children) {
    return item.children.some((child) => isItemActive(child, pathname));
  }
  return false;
};

type MenuItemProps = {
  item: MenuItemType;
  collapsed: boolean;
  level?: number;
};

const MenuItem = ({ item, collapsed, level = 0 }: MenuItemProps) => {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure(
    isItemActive(item, pathname) || false
  );
  const hasChildren = item.children && item.children.length > 0;
  const isActive = isItemActive(item, pathname);
  const Icon = item.icon;

  if (item.isTitle) {
    if (collapsed) return null;
    return (
      <Text
        size="xs"
        fw={700}
        tt="uppercase"
        c="dimmed"
        px="md"
        py="xs"
        style={{ paddingLeft: `${level * 16 + 16}px` }}
      >
        {item.label}
      </Text>
    );
  }

  const content = (
    <Group gap="xs" style={{ paddingLeft: `${level * 16}px` }}>
      {Icon && (
        <DynamicIcon
          name={Icon}
          size={20}
          style={{ flexShrink: 0 }}
        />
      )}
      {!collapsed && <Text size="sm">{item.label}</Text>}
      {hasChildren && !collapsed && (
        <IconChevronRight
          size={16}
          style={{
            marginLeft: 'auto',
            transform: opened ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      )}
    </Group>
  );

  if (hasChildren) {
    const navLinkContent = (
      <NavLink
        component="button"
        onClick={toggle}
        active={isActive}
        label={collapsed ? undefined : item.label}
        leftSection={
          Icon ? (
            <DynamicIcon name={Icon} size={20} />
          ) : undefined
        }
        rightSection={
          !collapsed && hasChildren ? (
            <IconChevronRight
              size={16}
              style={{
                transform: opened ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          ) : undefined
        }
      >
        {!collapsed && (
          <Collapse in={opened}>
            {item.children?.map((child) => (
              <MenuItem
                key={child.key}
                item={child}
                collapsed={collapsed}
                level={level + 1}
              />
            ))}
          </Collapse>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Box style={{ position: 'relative' }}>
          <Tooltip label={item.label} position="right" withArrow>
            <div>{navLinkContent}</div>
          </Tooltip>
          {opened && (
            <Box
              style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                marginLeft: 8,
                zIndex: 1000,
                minWidth: 200,
                backgroundColor: 'var(--mantine-color-body)',
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 'var(--mantine-radius-md)',
                padding: 4,
                boxShadow: 'var(--mantine-shadow-md)',
              }}
            >
              {item.children?.map((child) => (
                <MenuItem
                  key={child.key}
                  item={child}
                  collapsed={false}
                  level={0}
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    return navLinkContent;
  }

  const linkContent = (
    <NavLink
      component={Link}
      href={item.href ?? '#'}
      active={isActive}
      label={collapsed ? undefined : item.label}
      leftSection={
        Icon ? <DynamicIcon name={Icon} size={20} /> : undefined
      }
    />
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} position="right" withArrow>
        <div>{linkContent}</div>
      </Tooltip>
    );
  }

  return linkContent;
};

const AppMenu = ({ collapsed }: { collapsed: boolean }) => {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/menu', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load menu');
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        setError(e.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.children?.some((child) =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : items;

  if (loading) {
    return (
      <Box p="md">
        <Text size="sm" c="dimmed">
          Loading menu...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="md">
        <Text size="sm" c="red">
          {error}
        </Text>
      </Box>
    );
  }

  return (
    <>
      {!collapsed && (
        <Box p="md" pb="xs">
          <TextInput
            placeholder="Search menu..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
          />
        </Box>
      )}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="xs">
          {filteredItems.map((item) => (
            <MenuItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </Box>
      </ScrollArea>
    </>
  );
};

const Sidebar = () => {
  const { sidenav } = useLayoutContext();
  const collapsed = sidenav.size === 'sm' || sidenav.size === 'hover';

  return (
    <Box
      style={{
        width: collapsed ? 80 : 280,
        height: '100vh',
        transition: 'width 0.3s ease',
        borderRight: '1px solid var(--mantine-color-default-border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <AppMenu collapsed={collapsed} />
    </Box>
  );
};

export default Sidebar;
