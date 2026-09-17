// Shared page chrome for every dev-shell entry: webfonts, the MUI theme, and
// Font Awesome, none of which Studio's own bundle provides in this shell.

// Studio serves Geist and Noto Sans from application.css @font-face; these are
// the same families, packaged.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {CssBaseline, GlobalStyles, ThemeProvider} from '@mui/material';
import {type ReactNode} from 'react';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {injectFontAwesome} from '@code-dot-org/fonts';

// Studio's page chrome links the Font Awesome Pro sheets; without them the
// FontAwesomeV6Icon <i> elements collapse to zero width and shift layout.
injectFontAwesome();

// Every entry's feature is height: calc(100vh - 50px), sizing itself to sit
// under Studio's 50px header. Reserve that band rather than letting the
// feature float in it, so its own arithmetic comes out right here too; paint
// it dark to match the dark UI both entries render, so the strip does not
// read as a gap.
//
// Through GlobalStyles because CssBaseline writes body styles at render time
// and beats a plain stylesheet.
const pageFrame = (
  <GlobalStyles styles={{body: {background: '#292f36', paddingTop: '50px'}}} />
);

// Wraps a dev entry's page in the theme/reset/font-band foundation every
// entry needs. See README.md's "Styling, and what it is not".
export function DevPageChrome({children}: {children: ReactNode}) {
  return (
    <ThemeProvider theme={getMuiThemeForBrand('codeai-next')}>
      <CssBaseline />
      {pageFrame}
      {children}
    </ThemeProvider>
  );
}
