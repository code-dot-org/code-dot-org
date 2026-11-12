import CssBaseline from '@mui/material/CssBaseline';
import type {ReactNode} from 'react';

/** Props for {@link Bootstrap}. */
interface BootstrapProps {
  /** Application tree to render inside all providers. */
  children: ReactNode;
}

/**
 * Early bootstrap: CSS reset for all descendants. Studio draws en-US only,
 * which needs no fallback font, so it has no @code-dot-org/fonts FontLoader:
 * its other languages' stylesheets name about 19MB of fonts that every build
 * would copy.
 */
const Bootstrap = ({children}: BootstrapProps) => (
  <>
    {/* MUI CSS reset — normalizes browser defaults */}
    <CssBaseline />
    {children}
  </>
);

export default Bootstrap;
