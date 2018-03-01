import React from 'react';
import { UnconnectedPublishDialog as PublishDialog } from './PublishDialog';
import { action } from '@storybook/addon-actions';

const PROJECT_ID = 'MY_PROJECT_ID';
const PROJECT_TYPE = 'MY_PROJECT_TYPE';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/PublishDialog', module)
    .addStoryTable([
      {
        name: 'dialog open',
        description: '',
        story: () => (
          <PublishDialog
            isOpen={true}
            isPublishPending={false}
            projectId={PROJECT_ID}
            projectType={PROJECT_TYPE}
            onConfirmPublish={action('publish')}
            onClose={action('close')}
          />
        )
      },
      {
        name: 'dialog open with publish pending',
        description: '',
        story: () => (
          <PublishDialog
            isOpen={true}
            isPublishPending={true}
            projectId={PROJECT_ID}
            projectType={PROJECT_TYPE}
            onConfirmPublish={action('publish')}
            onClose={action('close')}
          />
        )
      }
    ]);
};
