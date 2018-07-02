import React from 'react';
import SetUpSections from './SetUpSections';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('Homepages/Teachers/SetUpSections', module)
  .withReduxStore()
  .addStoryTable([
    {
      name: 'Set Up Message for Sections for Teachers',
      description: `Information box if the teacher doesn't have any sections yet`,
      story: () => (
        <SetUpSections
          beginEditingNewSection={action('beginEditingNewSection')}
        />
      )
    },
  ]);
