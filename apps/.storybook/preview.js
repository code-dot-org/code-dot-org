import '@code-dot-org/component-library-styles/colors.scss';
import {injectFontAwesome} from '@code-dot-org/fonts';
import $ from 'jquery';

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
export const tags = ['autodocs'];
