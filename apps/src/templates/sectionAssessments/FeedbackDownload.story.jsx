import React from 'react';
import {UnconnectedFeedbackDownload} from './FeedbackDownload';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FeedbackDownload', module)
    .addStoryTable([
      {
        name: 'Display feedback download',
        description: 'Ability to see feedback download',
        story: () => (
          <UnconnectedFeedbackDownload sectionName={'Test Section'} />
        )
      }
    ]);
};
