import {CssBaseline} from '@mui/material';
import type {ReactNode} from 'react';

import FontLoader from '@code-dot-org/fonts/FontLoader';

import {AuthProvider} from '@/modules/auth';

interface BootstrapProps {
  locale: string;
  children: ReactNode;
}

/** Early bootstrap: fonts, CSS reset, and auth context for all descendants. */
const Bootstrap = ({locale, children}: BootstrapProps) => {
  return (
    <AuthProvider>
      <FontLoader locale={locale} />
      <CssBaseline />
      {children}
    </AuthProvider>
  );
};

export default Bootstrap;
