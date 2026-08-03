import CssBaseline from '@mui/material/CssBaseline';
import type {ReactNode} from 'react';

import FontLoader from '@code-dot-org/fonts/FontLoader';

/** Props for {@link Bootstrap}. */
interface BootstrapProps {
  /** BCP 47 locale string used for font selection. */
  locale: string;
  /** Application tree to render inside all providers. */
  children: ReactNode;
}

/** Early bootstrap: fonts and CSS reset for all descendants. */
const Bootstrap = ({locale, children}: BootstrapProps) => (
  <>
    <FontLoader locale={locale} />
    {/* MUI CSS reset — normalizes browser defaults */}
    <CssBaseline />
    {children}
  </>
);

export default Bootstrap;
