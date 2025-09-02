import {usePathname, useRouter} from 'next/navigation';

import {getLocalizeJsLocaleFromSupportedLocale} from '@/config/locale';

export const useFooterLocalization = () => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLanguageChange = (localeCode: string) => {
    const newPathName = pathname.replace(
      /^\/([a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*)(?=\/|$)/,
      `/${localeCode}`,
    );
    router.push(newPathName);
    Localize.setLanguage(getLocalizeJsLocaleFromSupportedLocale(localeCode));
  };
  return {handleLanguageChange};
};
