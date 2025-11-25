import FontLoader from '@code-dot-org/fonts/FontLoader';
import {CssBaseline} from '@mui/material';

interface BootstrapProps {
  locale: string;
}

/**
 * Early bootstrap component for loading necessary fonts and styles.
 */
const Bootstrap = ({locale}: BootstrapProps) => {
  return (
    <>
      <FontLoader locale={locale} />
      {/* Resets browser CSS defaults (e.g. body margin) using MUI defaults */}
      <CssBaseline />
    </>
  );
};

export default Bootstrap;
