import React from 'react';
import {
  UnconnectedSetUpSections as SetUpSections,
} from './SetUpSections';

export default storybook => storybook
  .storiesOf('SetUpSections', module)
  .addStoryTable([
    {
      name: 'Set Up Message for Sections for Teachers',
      description: `Information box if the teacher doesn't have any sections yet`,
      story: () => (
        <SetUpSections
          isRtl={false}
          beginEditingNewSection={storybook.action('beginEditingNewSection')}
        />
      )
    },
  ]);
