import React from 'react';
import ImagePicker from './ImagePicker';

export default storybook => {
  storybook
    .storiesOf('ImagePicker', module)
    .addStoryTable([
      {
        name: 'with warning',
        story: () => (
          <ImagePicker showUnderageWarning uploadsEnabled />
        )
      },
    ]);
};
