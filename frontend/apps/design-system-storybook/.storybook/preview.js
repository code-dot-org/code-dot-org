import {default as RtlPreview} from 'storybook-addon-rtl/preview';
import './preview.module.scss';

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  const fontsToLoad = [
    '1rem Figtree',
    '1rem Noto Sans',
    '1rem Barlow Semi Condensed Semibold',
    '1rem Barlow Semi Condensed Medium',
  ];

  const fontLoaderPromise = await Promise.all(
    // Load individual fonts
    fontsToLoad.map(font => document.fonts.load(font)),
  ).then(() => {
    // Now, wait for the document to notate fonts are ready
    return document.fonts.ready;
  });

  return {
    fonts: await fontLoaderPromise,
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
