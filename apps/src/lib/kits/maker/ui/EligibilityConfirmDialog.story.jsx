import React from 'react';
import EligibilityConfirmDialog from './EligibilityConfirmDialog';

export default storybook => {
  return storybook
    .storiesOf('EligibilityConfirmDialog', module)
    .addStoryTable([
      {
        name: 'Confirm Dialog',
        description: 'EligibilityConfirmDialog',
        story: () => (
          <EligibilityConfirmDialog
            onCancel={() => {}}
            onSuccess={() => {}}
          />
        )
      },
    ]);
};
