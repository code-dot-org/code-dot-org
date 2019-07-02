import React from 'react';
import LevelFeedbackEntry from './LevelFeedbackEntry';

const defaultProps = {
  lessonName: 'name of lesson',
  levelName: 'name of level',
  courseName: 'name of course',
  unitName: 'name of unit',
  lastUpdated: '2/5/19 at 4:05pm',
  linkToLevel: '/'
};

export default storybook => {
  return storybook
    .storiesOf('LevelFeedbackEntry', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'LevelFeedbackEntry - not yet seen',
        story: () => (
          <LevelFeedbackEntry {...defaultProps} seenByStudent={false} />
        )
      },
      {
        name: 'LevelFeedbackEntry - seen by student',
        story: () => (
          <LevelFeedbackEntry {...defaultProps} seenByStudent={true} />
        )
      }
    ]);
};
