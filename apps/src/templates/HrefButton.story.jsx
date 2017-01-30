import React from 'react';
import HrefButton from './HrefButton';

export default function (storybook) {
  storybook
    .storiesOf('HrefButton', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'Styling for button of type default (i.e. white button)',
        story: () => (
          <HrefButton
            href="/path/to/something"
            text="Click me"
            type="default"
          />
        )
      },
      {
        name: 'default',
        description: 'Styling for button of type primary (i.e. white button)',
        story: () => (
          <HrefButton
            href="/path/to/something"
            text="Click me"
            type="primary"
          />
        )
      },
    ]);
}
