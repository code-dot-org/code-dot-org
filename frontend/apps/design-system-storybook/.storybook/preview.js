import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';
import {default as RtlPreview} from 'storybook-addon-rtl/preview';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/fonts/brands/CSForAll/index.css';
import cdoTheme from '../../marketing/src/themes/code.org';
import csforallTheme from '../../marketing/src/themes/csforall';
import './preview.module.scss';

injectFontAwesome();

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

/** @type { import('@storybook/react-webpack5').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    docs: {
      codePanel: true,
    },
  },
};

export const tags = ['autodocs'];
export const decorators = [
  ...RtlPreview.decorators,
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
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
