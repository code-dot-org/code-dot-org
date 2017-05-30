import React from 'react';
import GallerySwitcher, {Galleries} from './GallerySwitcher';

export default storybook => {
  return storybook
    .storiesOf('GallerySwitcher', module)
    .addStoryTable([
      {
        name: 'Gallery Switcher with My Projects selected initially',
        description: '',
        story: () => {
          return (
            <GallerySwitcher
              initialGallery={Galleries.PRIVATE}
              showGallery={storybook.action('showGallery')}
            />
          );
        }
      },
      {
        name: 'Gallery Switcher with Public Gallery selected initially',
        description: '',
        story: () => {
          return (
            <GallerySwitcher
              initialGallery={Galleries.PUBLIC}
              showGallery={storybook.action('showGallery')}
            />
          );
        }
      },
    ]);
};
