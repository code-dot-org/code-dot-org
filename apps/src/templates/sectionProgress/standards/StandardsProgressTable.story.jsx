import React from 'react';
import StandardsProgressTable from './StandardsProgressTable';
import {fakeStandards, lessonCompletedByStandard} from './standardsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('Standards/StandardsProgressTable', module)
    .addStoryTable([
      {
        name: 'Standards For Class',
        description: 'See standards completed by one class',
        story: () => (
          <StandardsProgressTable
            standards={fakeStandards}
            lessonsCompletedByStandard={lessonCompletedByStandard}
          />
        )
      }
    ]);
};
