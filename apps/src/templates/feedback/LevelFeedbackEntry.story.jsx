import React from 'react';
import LevelFeedbackEntry from './LevelFeedbackEntry';

const defaultProps = {
  feedback: {
    lessonName: 'Creating Functions',
    levelNum: '8',
    linkToLevel: '/',
    unitName: 'CSP Unit 3 - Intro to Programming',
    linkToUnit: '/',
    lastUpdated: new Date().toLocaleString(),
    comment: 'Excellent work! You followed the directions closely.'
  }
};

const unseenFeedback = {
  feedback: {
    ...defaultProps.feedback,
    seenByStudent: false
  }
};

const seenFeedback = {
  feedback: {
    ...defaultProps.feedback,
    seenByStudent: true
  }
};

export default storybook => {
  return storybook
    .storiesOf('LevelFeedbackEntry', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'LevelFeedbackEntry - not yet seen',
        story: () => <LevelFeedbackEntry {...unseenFeedback} />
      },
      {
        name: 'LevelFeedbackEntry - seen by student',
        story: () => <LevelFeedbackEntry {...seenFeedback} />
      }
    ]);
};
