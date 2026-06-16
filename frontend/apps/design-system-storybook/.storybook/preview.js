import {default as RtlPreview} from 'storybook-addon-rtl/preview';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import './preview.module.scss';
import MuiDecorator from '../decorators/MuiDecorator';

// Import FontAwesome into the `base` layer (declared below `mui`) so MUI's
// layered styleOverrides win over FA's base icon rules. See MuiDecorator.
const fontAwesomeReady = injectFontAwesome({layer: 'base'});

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

/**
 * Gate story rendering on FontAwesome being injected. The layered FA is fetched
 * and inlined asynchronously, so without this Eyes could snapshot a story before
 * its icons are styled.
 */
const fontAwesomeLoader = async () => {
  await fontAwesomeReady;
  return {};
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
    a11y: {
      test: 'error',
    },
    docs: {
      codePanel: true,
    },
  },
};

export const tags = ['autodocs'];
export const decorators = [...RtlPreview.decorators, MuiDecorator];
export const loaders = [
  fontAwesomeLoader,
  ...(document.fonts ? [fontLoader] : []),
];

export default preview;
