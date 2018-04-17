import React from 'react';
import LoadMoreProgressButton from './LoadMoreProgressButton';

export default storybook => {
  return storybook
    .storiesOf('Progress/LoadMoreProgressButton', module)
    .addStoryTable([
      {
        name: 'Load more student progress',
        description: `Used on the teacher dashboard progress tab to load more student data`,
        story: () => (
          <LoadMoreProgressButton />
        )
      },

    ]);
};
