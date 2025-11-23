import { IconName } from 'lucide-react/dynamic';

export type MenuItemType = {
  key: string;
  label: string;
  isTitle?: boolean;
  href?: string;
  children?: MenuItemType[];

  icon?: IconName;
  parentKey?: string;
  target?: string;
  isDisabled?: boolean;
};

// This is default menu
export const menuItemsData: MenuItemType[] = [
];
