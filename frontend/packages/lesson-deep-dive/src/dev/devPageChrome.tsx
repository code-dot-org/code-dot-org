// The same families Studio's application.css serves through @font-face.
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

// Without the Font Awesome sheets, icon <i> elements collapse to zero width.
injectFontAwesome();

// 50px is Studio's header height, which each feature sizes itself under;
// #292f36 is the features' own background. GlobalStyles because CssBaseline
// writes body styles at render time, after any stylesheet.
const pageFrame = (
  <GlobalStyles styles={{body: {background: '#292f36', paddingTop: '50px'}}} />
);

export function DevPageChrome({children}: {children: ReactNode}) {
  return (
    <ThemeProvider theme={getMuiThemeForBrand('codeai-next')}>
      <CssBaseline />
      {pageFrame}
      {children}
    </ThemeProvider>
  );
}
