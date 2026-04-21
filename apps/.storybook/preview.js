import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import {injectFontAwesome} from '@code-dot-org/fonts';
import $ from 'jquery';

import {MuiDecorator} from './decorators';

injectFontAwesome();

//Stub jquery fileupload library function
$.fn.fileupload = () => {};

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['DesignSystem', 'templates', 'code-studio'],
    },
  },
};
export const decorators = [MuiDecorator];
export const tags = ['autodocs'];
