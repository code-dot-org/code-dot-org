import {default as RtlPreview} from "storybook-addon-rtl/preview";
import "./preview.module.scss"

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
export const decorators = [...RtlPreview.decorators]

export default preview;
