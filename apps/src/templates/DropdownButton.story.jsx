import React from 'react';
import DropdownButton from './DropdownButton';
import Button from '@cdo/apps/templates/Button';

export default storybook => {
  storybook
    .storiesOf('Buttons/DropdownButton', module)
    .addStoryTable([
      {
        name: 'DropdownButton',
        story: () => (
          <DropdownButton
            text="Assign unit"
            color={Button.ButtonColor.orange}
          >
            <a href="asdf">
              Child with href
            </a>
            <a
              onClick={() => console.log('click')}
            >
              Child with onClick
            </a>
          </DropdownButton>
        )
      },
      {
        name: 'blue DropdownButton',
        story: () => (
          <DropdownButton
            text="Assign unit"
            color={Button.ButtonColor.blue}
          >
            <a href="asdf">
              Child with href
            </a>
            <a
              onClick={() => console.log('click')}
            >
              Child with onClick
            </a>
          </DropdownButton>
        )
      },
    ]);
};
