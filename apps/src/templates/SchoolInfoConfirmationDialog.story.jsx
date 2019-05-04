import React from 'react';
import SchoolInfoConfirmationDialog from './SchoolInfoConfirmationDialog';

export default storybook => {
  storybook
    .storiesOf('Dialogs/SchoolInfoConfirmationDialog', module)
    .addStoryTable([
      {
        name: 'Display school info confirmation dialog',
        description: 'Teacher can view prompt to update school information',
        story: () => <SchoolInfoConfirmationDialog isOpen={true} />
      }
    ]);
};
