import React from 'react';
import TextButton from './TextButton';

export default storybook => {
  storybook.storiesOf('Buttons/TextButton', module).addStoryTable([
    {
      name: 'Text Button',
      story: () => <TextButton text="Click me!" onClick={() => {}} />
    }
  ]);
};
