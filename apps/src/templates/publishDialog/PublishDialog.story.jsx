import React from 'react';
import { UnconnectedPublishDialog as PublishDialog } from './PublishDialog';

const PROJECT_ID = 'MY_PROJECT_ID';
const PROJECT_TYPE = 'MY_PROJECT_TYPE';

export default storybook => {
  return storybook
    .storiesOf('PublishDialog', module)
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
            onConfirmPublish={storybook.action('publish')}
            onClose={storybook.action('close')}
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
            onConfirmPublish={storybook.action('publish')}
            onClose={storybook.action('close')}
          />
        )
      }
    ]);
};
