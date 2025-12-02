'use client';
import type { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react"

import LayoutProvider from '~/context/useLayoutContext';
import { MantineThemeWrapper } from '~/components/MantineThemeWrapper';
import Sidebar from '~/components/layouts/Sidebar';
import Topbar from '~/components/layouts/Topbar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <LayoutProvider>
        <MantineThemeWrapper>
          <div className="flex min-h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
              <Topbar />
              <main className="flex-1 p-6 overflow-auto app-content">
                {children}
              </main>
            </div>
          </div>
        </MantineThemeWrapper>
      </LayoutProvider>
    </SessionProvider>
  );
};

export default Layout;
