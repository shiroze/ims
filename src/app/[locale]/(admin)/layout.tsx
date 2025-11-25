'use client';
import type { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react"

// import Footer from '~/components/layouts/Footer';
import Sidebar from '~/components/layouts/Sidebar';
import Topbar from '~/components/layouts/Topbar';
// import Customizer from '~/components/layouts/customizer';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 bg-gray-50 p-6">{children}</main>
          {/* <Footer /> */}
        </div>
      </div>
      {/* <Customizer /> */}
    </SessionProvider>
  );
};

export default Layout;
