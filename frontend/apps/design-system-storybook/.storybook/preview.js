import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import {default as RtlPreview} from 'storybook-addon-rtl/preview';

import {loadFonts} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/index.css';
import './preview.module.scss';

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

const customViewports = {
  largeDesktop: {
    name: 'Large desktop',
    styles: {
      width: '1268px',
      height: '720px',
    },
  },
  smallDesktop: {
    name: 'Small desktop',
    styles: {
      width: '1024px',
      height: '720px',
    },
  },
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
    viewport: {
      viewports: {
        ...MINIMAL_VIEWPORTS,
        ...customViewports,
      },
    },
  },
};

export const tags = ['autodocs'];
export const decorators = [...RtlPreview.decorators];
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
