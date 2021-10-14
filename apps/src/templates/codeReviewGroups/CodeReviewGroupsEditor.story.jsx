import React from 'react';
import CodeReviewGroupsEditor from './CodeReviewGroupsEditor';

export default storybook => {
  storybook
    .storiesOf('CodeReviewGroups/CodeReviewGroupsEditor', module)
    .addStoryTable([
      {
        name: 'Default Group Editor',
        story: () => <CodeReviewGroupsEditor />
      }
    ]);
};
