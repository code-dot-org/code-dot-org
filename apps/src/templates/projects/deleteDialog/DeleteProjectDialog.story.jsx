import React from 'react';
import {UnconnectedDeleteProjectDialog as DeleteProjectDialog} from './DeleteProjectDialog';
import { action } from '@storybook/addon-actions';

const PROJECT_ID = 'MY_PROJECT_ID';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/DeleteProjectDialog', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'dialog open',
        description: '',
        story: () => (
          <DeleteProjectDialog
            isOpen={true}
            isDeletePending={false}
            projectId={PROJECT_ID}
            onClose={action('close')}
            deleteProject={() => console.log("Delete project")}
          />
        )
      },
      {
        name: 'dialog open with delete pending',
        description: '',
        story: () => (
          <DeleteProjectDialog
            isOpen={true}
            isDeletePending={true}
            projectId={PROJECT_ID}
            onClose={action('close')}
            deleteProject={() => console.log("Delete project")}
          />
        )
      }
    ]);
};
