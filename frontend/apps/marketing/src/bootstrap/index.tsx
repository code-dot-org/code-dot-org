'use client';
import {useEffect} from 'react';

import {injectFontAwesome} from '@code-dot-org/fonts';
import FontLoader from '@code-dot-org/fonts/FontLoader';

import {getDashboardLocale, SupportedLocale} from '@/config/locale';

interface BootstrapProps {
  locale: string;
}
const Bootstrap = ({locale}: BootstrapProps) => {
  useEffect(() => {
    injectFontAwesome();
  }, []);

  return (
    <>
      <FontLoader locale={getDashboardLocale(locale as SupportedLocale)} />
    </>
  );
};

export default Bootstrap;
