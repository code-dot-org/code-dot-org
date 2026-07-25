import {default as RtlPreview} from 'storybook-addon-rtl/preview';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';
import './preview.module.scss';
import BrandDecorator, {DEFAULT_BRAND} from '../decorators/BrandDecorator';

// Import FontAwesome into the `base` layer (declared below `mui`) so MUI's
// layered styleOverrides win over FA's base icon rules. See BrandDecorator,
// which declares the @layer order.
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

/**
 * "Brand" toolbar dropdown. Selecting a brand drives BrandDecorator, which
 * writes data-brand onto the story's <html> (switching the CSS token set from
 * component-library-styles/brandOverrides.css) and applies the matching MUI
 * theme. The codes are Cdo::Brand's brand enum (lib/cdo/brand.rb):
 *   code         legacy Code.org tokens (== :root default)
 *   codeai       current default CodeAI branding (== :root default)
 *   codeai-next  the CADS color ramp ([data-brand='codeai-next'])
 *   codeai-audit all-pink DSCO-coverage audit ([data-brand='codeai-audit'])
 */
export const globalTypes = {
  brand: {
    name: 'Brand',
    description: 'data-brand token set applied to each story',
    toolbar: {
      title: 'Brand',
      icon: 'paintbrush',
      items: [
        {value: 'code', title: 'code.org'},
        {value: 'codeai', title: 'CodeAI'},
        {value: 'codeai-next', title: 'CodeAI · CADS'},
        {value: 'codeai-audit', title: 'CodeAI · Audit (pink)'},
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = {
  brand: DEFAULT_BRAND,
};

export const tags = ['autodocs'];
export const decorators = [...RtlPreview.decorators, BrandDecorator];
export const loaders = [
  fontAwesomeLoader,
  ...(document.fonts ? [fontLoader] : []),
];

export default preview;
