'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import SidenavToggle from './SideNavToggle';
import ThemeModeToggle from './ThemeModeToggle';
import { LogOut, BellRing } from 'lucide-react';
import UsFlag from '~/assets/images/flags/us.jpg';
import IdFlag from '~/assets/images/flags/id.png';

import LanguageSwitcher from '~/components/LanguageSwitcher';
import { useLocale } from 'next-intl';

type ProfileMenuItem = {
  icon?: ReactNode;
  label?: string;
  href?: string;
  badge?: string;
  divider?: boolean;
};

const profileMenu: ProfileMenuItem[] = [
  // {
  //   icon: <LuMail className="size-4" />,
  //   label: 'Inbox',
  //   href: '/mailbox',
  //   badge: '15',
  // },
  // { icon: <LuMessagesSquare className="size-4" />, label: 'Chat', href: '/chat' },
  // { icon: <LuGem className="size-4" />, label: 'Upgrade Pro', href: '/pricing' },
  // { divider: true },
  {
    icon: <LogOut className="size-4" />,
    label: 'Sign Out',
    href: '/basic-logout',
  },
];

const Topbar = () => {
  const locale = useLocale();
  const currentFlag = locale === 'id' ? IdFlag : UsFlag; // You can add Indonesian flag here when available

  return (
    <div className="app-header min-h-topbar-height flex items-center sticky top-0 z-30 bg-(--topbar-background) border-b border-default-200">
      <div className="w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <SidenavToggle />

          {/* <div className="lg:flex hidden items-center relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <TbSearch className="text-base" />
            </div>
            <input
              type="search"
              id="topbar-search"
              className="form-input px-12 text-sm rounded border-transparent focus:border-transparent w-60"
              placeholder="Search something..."
            />
            <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-4">
              <span className="ms-auto font-medium">⌘ K</span>
            </button>
          </div> */}
        </div>

        <div className="flex items-center gap-3">
          <div className="topbar-item hs-dropdown [--placement:bottom-right] relative inline-flex">
            <button
              className="hs-dropdown-toggle btn btn-icon size-8 hover:bg-default-150 rounded-full relative"
              type="button"
            >
              <Image src={currentFlag} alt="language-flag" className="size-4.5 rounded" />
            </button>
            <div className="hs-dropdown-menu" role="menu">
              <LanguageSwitcher />
            </div>
          </div>

          <ThemeModeToggle />

          <div className="topbar-item hs-dropdown [--auto-close:inside] relative inline-flex">
            <button
              type="button"
              className="hs-dropdown-toggle btn btn-icon size-8 hover:bg-default-150 rounded-full relative"
            >
              <BellRing className="size-4.5" />
              <span className="absolute end-0 top-0 size-1.5 bg-primary/90 rounded-full"></span>
            </button>
            {/* <div className="hs-dropdown-menu max-w-100 p-0">
              <div className="p-4 border-b border-default-200 flex items-center gap-2">
                <h3 className="text-base text-default-800">Notifications</h3>
                <span className="size-5 font-semibold bg-orange-500 rounded text-white flex items-center justify-center text-xs">
                  15
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border-t border-default-200">
                <Link href="#!" className="text-sm font-medium text-default-900">
                  Manage Notification
                </Link>
                <button type="button" className="btn btn-sm text-white bg-primary">
                  View All <LuMoveRight className="size-4" />
                </button>
              </div>
            </div> */}
          </div>

          {/* <div className="topbar-item">
            <button
              className="btn btn-icon size-8 hover:bg-default-150 rounded-full"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="theme-customization"
              data-hs-overlay="#theme-customization"
            >
              <LuSettings className="size-4.5" />
            </button>
          </div> */}

          <div className="topbar-item hs-dropdown relative inline-flex">
            <button className="cursor-pointer bg-pink-100 rounded-full">
              {/* <Image
                src={avatar1}
                alt="user"
                className="hs-dropdown-toggle rounded-full size-9.5"
              /> */}
            </button>
            <div className="hs-dropdown-menu min-w-48">
              <div className="p-2">
                <h6 className="mb-2 text-default-500">Welcome to IMS</h6>
                <Link href="#!" className="flex gap-3">
                  <div className="relative inline-block">
                    {/* <Image src={avatar1} alt="user" className="size-12 rounded" /> */}
                    <span className="-top-1 -end-1 absolute w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h6 className="mb-1 text-sm font-semibold text-default-800">Paula Keenan</h6>
                    <p className="text-default-500">CEO & Founder</p>
                  </div>
                </Link>
              </div>

              <div className="border-t border-default-200 -mx-2 my-2"></div>

              <div className="flex flex-col gap-y-1">
                {profileMenu.map((item, i) =>
                  item.divider ? (
                    <div key={i} className="border-t border-default-200 -mx-2 my-1"></div>
                  ) : (
                    <Link
                      key={i}
                      href={item.href || '#!'}
                      className="flex items-center gap-x-3.5 py-1.5 px-3 text-default-600 hover:bg-default-150 rounded font-medium"
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="size-4.5 font-semibold bg-danger rounded text-white flex items-center justify-center text-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
