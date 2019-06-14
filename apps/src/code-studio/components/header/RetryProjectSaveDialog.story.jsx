import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from './RetryProjectSaveDialog';
import React from 'react';
import {projectUpdatedStatuses as statuses} from '../../headerRedux';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/RetryProjectSaveDialog', module)
    .addStoryTable([
      {
        name: 'dialog open',
        description: '',
        story: () => (
          <RetryProjectSaveDialog
            isOpen={true}
            projectUpdatedStatus={statuses.error}
          />
        )
      },
      {
        name: 'dialog open with save pending',
        description: '',
        story: () => (
          <RetryProjectSaveDialog
            isOpen={true}
            projectUpdatedStatus={statuses.saving}
          />
        )
      }
    ]);
};
