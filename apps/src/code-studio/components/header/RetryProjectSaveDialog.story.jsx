import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from './RetryProjectSaveDialog';
import React from 'react';
import {projectUpdatedStatuses as statuses} from '../../headerRedux';
import {action} from '@storybook/addon-actions';

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
            onTryAgain={action('try again')}
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
            onTryAgain={action('try again')}
          />
        )
      }
    ]);
};
