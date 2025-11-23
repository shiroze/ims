'use client';

import { usePathname, useRouter } from '~/i18n/routing';
import { useLocale } from 'next-intl';
import { setCookie } from 'cookies-next/client';
import Image from 'next/image';
import UsFlag from '~/assets/images/flags/us.jpg';
import IdFlag from '~/assets/images/flags/id.png';

type Language = {
  code: string;
  label: string;
  flag: typeof UsFlag;
};

const languages: Language[] = [
  { code: 'en', label: 'English', flag: UsFlag },
  { code: 'id', label: 'Indonesia', flag: IdFlag }, // Using US flag as placeholder - you can replace with Indonesian flag if available
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    setCookie("NEXT_LOCALE", newLocale, {
      path: "/",
      maxAge: 31536000 // 1 year
    });
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => handleChange(lang.code)}
          className={`flex items-center gap-x-3.5 py-1.5 px-3 text-default-600 hover:bg-default-150 rounded font-medium w-full text-left transition-colors ${
            locale === lang.code ? 'bg-default-100 text-primary' : ''
          }`}
          role="menuitem"
        >
          <Image 
            src={lang.flag} 
            alt={lang.label} 
            className="size-4 rounded" 
            width={16}
            height={16}
          />
          <span className="text-sm font-medium">{lang.label}</span>
          {locale === lang.code && (
            <span className="ml-auto size-1.5 bg-primary rounded-full"></span>
          )}
        </button>
      ))}
    </>
  );
}