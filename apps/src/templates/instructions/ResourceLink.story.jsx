import ResourceLink from './ResourceLink';
import React from 'react';

export default storybook => {
  return storybook
    .storiesOf('ResourceLink', module)
    .addStoryTable([
      {
        name: 'Map Reference',
        description: 'Resource link with a map icon',
        story: () => (
          <ResourceLink
            map
            reference="/docs/csd/maker_leds/index.html"
            text="First Item"
          />
        )
      },
      {
        name: 'Book Reference',
        description: 'Resource link with a book icon',
        story: () => (
          <ResourceLink
            reference="/docs/csd/maker_leds/index.html"
            text="Second Item"
          />
        )
      },
    ]);
};
