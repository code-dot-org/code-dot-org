import $ from 'jquery';

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
