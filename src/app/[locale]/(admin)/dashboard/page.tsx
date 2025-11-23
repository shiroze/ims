"use client"
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
 
const Dashboard = () => {
  const {data: session} = useSession();
  const t = useTranslations('dashboard');

  console.log("My Session", session);

  return (
    <div className="flex flex-col items-center m-4">
      <h1>{t('title')}</h1>
        {session?.user?.name ? (
            <>
                <h1 className="text-3xl my-2">
                {t('welcome')}, {session?.user?.name}
                </h1>
            </>
        ) : (
            <h1 className="text-3xl my-2">
                {t('welcome')}, {session?.user?.email}
            </h1>
        )}
      <button type="button" onClick={() => signOut()}>{t('sign_out')}</button>
    </div>
  )
}

export default Dashboard;