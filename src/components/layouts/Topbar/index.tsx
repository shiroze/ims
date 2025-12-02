'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from '@mantine/core';
import { useSession, signOut } from 'next-auth/react';
import SidenavToggle from './SideNavToggle';
import ThemeModeToggle from './ThemeModeToggle';
import { LogOut, BellRing } from 'lucide-react';
import UsFlag from '~/assets/images/flags/us.jpg';
import IdFlag from '~/assets/images/flags/id.png';

import LanguageSwitcher from '~/components/LanguageSwitcher';
import { useLocale } from 'next-intl';

const Topbar = () => {
  const locale = useLocale();
  const { data: session } = useSession();
  const currentFlag = locale === 'id' ? IdFlag : UsFlag;

  const user = session?.user as any;
  const userName = user?.name || user?.UserName || 'User';
  const userRole = user?.role || user?.RoleName || 'Guest';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="app-header flex items-center sticky top-0 z-30 bg-(--topbar-background) border-b border-default-200 py-3">
      <div className="w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <SidenavToggle />
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <button
                className="btn btn-icon size-9 hover:bg-default-150 rounded-full relative cursor-pointer flex items-center justify-center transition-colors"
                type="button"
              >
                <Image src={currentFlag} alt="language-flag" className="size-5 rounded" />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <LanguageSwitcher />
            </Menu.Dropdown>
          </Menu>

          {/* Theme Toggle */}
          <ThemeModeToggle />

          {/* Notifications */}
          <button
            type="button"
            className="btn btn-icon size-9 hover:bg-default-150 rounded-full relative cursor-pointer flex items-center justify-center transition-colors"
          >
            <BellRing className="size-5" />
            <span className="absolute end-0 top-0 size-2 bg-primary/90 rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <Menu shadow="md" width={280}>
            <Menu.Target>
              <button className="cursor-pointer bg-pink-100 rounded-full size-10 flex items-center justify-center text-pink-600 font-semibold hover:bg-pink-200 transition-colors">
                {userName.charAt(0).toUpperCase()}
              </button>
            </Menu.Target>

            <Menu.Dropdown>
              <div className="p-3 border-b border-default-200">
                <p className="text-xs text-default-500 mb-1">Welcome to IMS</p>
                <p className="font-semibold text-sm text-default-800">{userName}</p>
                <p className="text-xs text-default-600">{userRole}</p>
              </div>

              <Menu.Item
                leftSection={<LogOut className="size-4" />}
                onClick={handleSignOut}
                color="red"
              >
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
