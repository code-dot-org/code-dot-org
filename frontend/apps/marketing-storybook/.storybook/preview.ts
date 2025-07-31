import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/fonts/brands/CSForAll/index.css';
import cdoTheme from '../../marketing/src/themes/code.org';
import csforallTheme from '../../marketing/src/themes/csforall';

injectFontAwesome();

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      'code.org': cdoTheme,
      csforall: csforallTheme,
    },
    defaultTheme: 'code.org',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
];

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
