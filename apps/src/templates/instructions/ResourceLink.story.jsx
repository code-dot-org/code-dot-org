import ResourceLink from './ResourceLink';
import React from 'react';

export default storybook => {
  return storybook
    .storiesOf('ResourceLink', module)
    .addStoryTable([
      {
        name: 'Highlighted Reference',
        description: 'Resource link with a map icon',
        story: () => (
          <ResourceLink
            highlight
            icon="map"
            text="First Item"
            reference="/docs/csd/maker_leds/index.html"
          />
        )
      },
      {
        name: 'Not Highlighted Reference',
        description: 'Resource link with a book icon',
        story: () => (
          <ResourceLink
            icon="book"
            text="Second Item"
            reference="/docs/csd/maker_leds/index.html"
          />
        )
      },
    ]);
};
