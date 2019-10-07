import React from 'react';
import AssignedButton from './AssignedButton';

export default storybook => {
  storybook.storiesOf('Buttons/AssignedButton', module).addStoryTable([
    {
      name: 'Assigned',
      story: () => <AssignedButton />
    }
  ]);
};
