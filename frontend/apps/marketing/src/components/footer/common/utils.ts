import {usePathname, useRouter} from 'next/navigation';

export const useFooterLocalization = () => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLanguageChange = (localeCode: string) => {
    const newPathName = pathname.replace(
      /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
      `/${localeCode}`,
    );
    router.push(newPathName);
    Localize.setLanguage(localeCode);
  };
  return {handleLanguageChange};
};
