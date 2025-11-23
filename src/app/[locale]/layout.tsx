import type { Metadata } from 'next';
import { DM_Sans, Tourney } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { DEFAULT_PAGE_TITLE } from '~/helpers/constants';
import favicon from "~/assets/images/favicon.ico"

import { redirect, notFound } from 'next/navigation';
import ProvidersWrapper from '~/components/ProviderWrapper';
import LanguageSwitcher from '~/components/LanguageSwitcher';

import { getMessages } from 'next-intl/server';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { routing } from '~/i18n/routing';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //import MRT styles
import 'flatpickr/dist/flatpickr.css';
// import 'swiper/swiper-bundle.css';
// import '~/assets/css/style.css';

const getdmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const getTourney = Tourney({
  variable: '--font-tourney',
  subsets: ['vietnamese', 'latin-ext', 'latin'],
  style: ['normal', 'italic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: DEFAULT_PAGE_TITLE,
    template: '%s | Inventory Management System',
  },
  icons: {
    icon: favicon.src,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function RootLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
      <html lang={locale}>
        <body className={`${getdmSans.variable} ${getTourney.variable} antialiased`}>
          <NextIntlClientProvider messages={messages}>
            <NextTopLoader showSpinner={false} color="var(--color-primary)" />
            <ProvidersWrapper>
              {children}
            </ProvidersWrapper>
          </NextIntlClientProvider>
        </body>
      </html>
  );
}