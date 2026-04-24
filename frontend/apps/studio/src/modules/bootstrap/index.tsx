import {CssBaseline} from '@mui/material';
import type {ReactNode} from 'react';

import FontLoader from '@code-dot-org/fonts/FontLoader';

import {AuthProvider} from '@/modules/auth';

/** Props for {@link Bootstrap}. */
interface BootstrapProps {
  /** BCP 47 locale string used for font selection. */
  locale: string;
  /** Application tree to render inside all providers. */
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
