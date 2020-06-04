import React from 'react';
import LevelFeedbackEntry from './LevelFeedbackEntry';

const defaultProps = {
  feedback: {
    lessonName: 'Creating Functions',
    lessonNum: 5,
    levelNum: 8,
    linkToLevel: '/',
    unitName: 'CSP Unit 3 - Intro to Programming',
    created_at: new Date(),
    comment: 'Excellent work! You followed the directions closely.'
  }
};

const seenFeedback = {
  feedback: {
    ...defaultProps.feedback,
    seen_on_feedback_page_at: new Date().toLocaleString()
  }
};

export default storybook => {
  return storybook
    .storiesOf('LevelFeedbackEntry', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'LevelFeedbackEntry - not yet seen',
        story: () => <LevelFeedbackEntry {...defaultProps} />
      },
      {
        name: 'LevelFeedbackEntry - seen by student',
        story: () => <LevelFeedbackEntry {...seenFeedback} />
      }
    ]);
};
