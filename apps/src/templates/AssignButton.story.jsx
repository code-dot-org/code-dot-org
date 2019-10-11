import React from 'react';
import AssignButton from './AssignButton';

export default storybook => {
  storybook.storiesOf('Buttons/AssignButton', module).addStoryTable([
    {
      name: 'Assign to section button',
      story: () => <AssignButton />
    }
  ]);
};
