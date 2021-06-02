import React from 'react';
import {UnconnectedFeedbackDownload} from './FeedbackDownload';

const exampleExportableFeedbackData = [
  {
    studentName: 'Mike',
    lessonNum: '4',
    stageName: 'Loops',
    levelNum: '7',
    keyConcept: 'You should be learning about loops',
    performanceLevelDetails: 'A loop is in the code',
    performance: 'performanceLevel1',
    comment: 'Nice job using loops!',
    timestamp: '03/21/19 at 12:17:17 PM'
  },
  {
    studentName: 'Anne',
    lessonNum: '8',
    stageName: 'Functions',
    levelNum: '10',
    keyConcept: '',
    performanceLevelDetails: '',
    performance: '',
    comment: '',
    timestamp: '05/08/18 at 6:21:11 AM'
  },
  {
    studentName: 'Mike',
    lessonNum: '3',
    stageName: 'Variables',
    levelNum: '3',
    keyConcept: 'Use variables to help and make coding better.',
    performanceLevelDetails:
      'You have some variables but are still missing out on their amazingness',
    performance: 'performanceLevel3',
    comment: 'There are at least 3 more variables you could be using.',
    timestamp: '03/21/19 at 12:17:17 PM'
  },
  {
    studentName: 'Anne',
    lessonNum: '3',
    stageName: 'Variables',
    levelNum: '3',
    keyConcept: 'Use variables to help and make coding better.',
    performanceLevelDetails: 'You uses no variables',
    performance: 'performanceLevel4',
    comment: "Why didn't you use variables?",
    timestamp: '03/21/19 at 12:21:17 PM'
  }
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FeedbackDownload', module)
    .addStoryTable([
      {
        name: 'Display feedback download',
        description: 'Ability to see feedback download',
        story: () => (
          <UnconnectedFeedbackDownload
            sectionName={'Test Section'}
            exportableFeedbackData={exampleExportableFeedbackData}
            isCurrentScriptCSD={true}
            scriptName={'csd8-2011'}
          />
        )
      }
    ]);
};
