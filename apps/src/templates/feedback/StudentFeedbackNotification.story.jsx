import React from 'react';
import StudentFeedbackNotification from './StudentFeedbackNotification';

export default storybook => {
  return storybook
    .storiesOf('StudentFeedbackNotification', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'StudentFeedbackNotification',
        story: () => (
          <StudentFeedbackNotification
            numFeedbackLevels="2"
            linkToFeedbackOverview="/"
            studentId={123}
          />
        )
      }
    ]);
};
