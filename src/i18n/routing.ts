import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'id'],
  defaultLocale: 'id',
  localeDetection: false,
  localePrefix: 'as-needed',
  localeCookie: {
    // Custom cookie name
    name: 'USER_LOCALE',
    // Expire in 2 years
    maxAge: 60 * 60 * 24 * (365 * 2)
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);