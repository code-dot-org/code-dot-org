import React from 'react';
import ConfirmDeleteButton from './ConfirmDeleteButton';

export default storybook => {
  return storybook
    .storiesOf('ConfirmDeleteButton', module)
    .addStoryTable([
      {
        name: 'basic example',
        description: ``,
        story: () => (
          <ConfirmDeleteButton
            title="Delete table?"
            body="Are you sure you want to delete the table?"
            buttonText="Delete table"
            onConfirmDelete={storybook.action("delete table")}
          />
        )
      }]);
};
