'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import type { MenuItemType } from './menu';
import { DynamicIcon } from 'lucide-react/dynamic';

const isItemActive = (item: MenuItemType, pathname: string): boolean => {
  if (item.href && pathname === item.href) return true;
  if (item.children) {
    return item.children.some(child => isItemActive(child, pathname));
  }
  return false;
};

const MenuItemWithChildren = ({ item }: { item: MenuItemType }) => {
  const pathname = usePathname();
  const Icon = item.icon?.replace('fas fa-', ''); // Example: 'fas fa-user' -> 'user'

  const isActive = isItemActive(item, pathname);

  return (
    <li className={`menu-item hs-accordion ${isActive ? 'active' : ''}`}>
      <button
        className={`hs-accordion-toggle menu-link ${isActive ? 'active' : ''}`}
      >
        {Icon && (
          <span className="menu-icon">
            <DynamicIcon name={Icon} size={48} />
          </span>
        )}
        <span className="menu-text">{item.label}</span>
        <span className="menu-arrow">
          <LuChevronRight />
        </span>
      </button>

      <ul
        className={`sub-menu hs-accordion-content hs-accordion-group ${
          isActive ? 'block' : 'hidden'
        }`}
      >
        {item.children?.map((child: MenuItemType) =>
          child.children && child.children.length > 0 ? (
            <MenuItemWithChildren key={child.key} item={child} />
          ) : (
            <MenuItem key={child.key} item={child} />
          )
        )}
      </ul>
    </li>
  );
};

const MenuItem = ({ item }: { item: MenuItemType }) => {
  const pathname = usePathname();
  const Icon = item.icon?.replace('fas fa-', ''); // Example: 'fas fa-user' -> 'user'
  const isActive = pathname === item.href;

  return (
    <li className={`menu-item ${isActive ? 'active' : ''}`}>
      <Link href={item.href ?? '#'} className={`menu-link ${isActive ? 'active' : ''}`}>
        {Icon && (
          <span className="menu-icon">
            <DynamicIcon name={Icon} size={48} />
          </span>
        )}
        <div className="menu-text">{item.label}</div>
      </Link>
    </li>
  );
};

const AppMenu = () => {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return null;
  if (error) return null;

  return (
    <ul className="side-nav p-3 hs-accordion-group">
      {items.map((item: MenuItemType) =>
        item.isTitle ? (
          <li className="menu-title" key={item.key}>
            <span>{item.label}</span>
          </li>
        ) : item.children && item.children.length > 0 ? (
          <MenuItemWithChildren key={item.key} item={item} />
        ) : (
          <MenuItem key={item.key} item={item} />
        )
      )}
    </ul>
  );
};

const Sidebar = () => {
  return (
    <aside id="app-menu" className="app-menu">
      {/** Logo */}
      <AppMenu />
    </aside>
  )
}

export default Sidebar;
