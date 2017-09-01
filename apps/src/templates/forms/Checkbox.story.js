import React from 'react';
import Checkbox from './Checkbox';

export default storybook => {
  return storybook
    .storiesOf('Checkbox', module)
    .addStoryTable([
      {
        name: 'Checkbox',
        description: 'Generic form component that can be used to make checkboxes',
        story: () => (
          <Checkbox
            label="All schools should teacher Computer Science"
            handleCheckboxChange={() => console.log("checked the box!")}
          />
        )
      },
      {
        name: 'Checkbox - big',
        description: 'Checkbox with large, bold option',
        story: () => (
          <Checkbox
            label="All schools should teacher Computer Science"
            big={true}
            handleCheckboxChange={() => console.log("checked the box!")}
          />
        )
      }
    ]);
};
