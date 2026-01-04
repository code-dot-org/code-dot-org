import {default as RtlPreview} from 'storybook-addon-rtl/preview';
// Include the pre-packaged font-awesome 'free' version
import '@fortawesome/fontawesome-free/css/all.css';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/component-library-styles/colors.scss';
import '@code-dot-org/fonts/index.css';

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

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export const tags = ['autodocs'];
export const decorators = [...RtlPreview.decorators];
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
