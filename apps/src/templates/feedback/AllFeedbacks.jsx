import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';

import LessonFeedbackContainer from '@cdo/apps/templates/feedback/LessonFeedbackContainer';
import LevelFeedbackContainer from '@cdo/apps/templates/feedback/LevelFeedbackContainer';
import i18n from '@cdo/locale';

import {levelFeedbackShape} from './types';

function AllFeedbacks({feedbacksByLevel}) {
  const [showLessonFeedback, setShowLessonFeedback] = React.useState(false);

  const selectedTab = showLessonFeedback ? 'lesson' : 'level';

  // Dummy lesson feedback data for testing
  const dummyLessonFeedbacks = [
    {
      lessonName: 'Introduction to Loops',
      lessonNum: 1,
      linkToLesson: 'https://studio.code.org/s/csp1/lessons/1',
      feedbacks: [
        {
          id: 1,
          lesson_id: 1,
          submitted_feedback:
            'Great work on understanding the concept of loops! You showed excellent problem-solving skills when working through the repeat block challenges. Keep practicing with nested loops to strengthen your understanding.',
          submitted_at: '2024-01-20T14:30:00Z',
        },
      ],
    },
    {
      lessonName: 'Conditionals and If Statements',
      lessonNum: 3,
      linkToLesson: 'https://studio.code.org/s/csp1/lessons/3',
      feedbacks: [
        {
          id: 2,
          lesson_id: 3,
          submitted_feedback:
            'You demonstrated a solid understanding of conditional logic. Your solution to the boolean expression problem was particularly creative. Consider exploring more complex conditional scenarios in the next lesson.',
          submitted_at: '2024-01-18T10:15:00Z',
        },
      ],
    },
    {
      lessonName: 'Variables and Data Types',
      lessonNum: 5,
      linkToLesson: 'https://studio.code.org/s/csp1/lessons/5',
      feedbacks: [
        {
          id: 3,
          lesson_id: 5,
          submitted_feedback:
            'Nice progress on working with variables! You correctly identified when to use different data types. Try to focus on variable naming conventions to make your code more readable.',
          submitted_at: '2024-01-15T16:45:00Z',
        },
      ],
    },
  ];

  return (
    <div>
      <h1 style={styles.header}>{i18n.feedbackAll()}</h1>
      <SegmentedButtons
        selectedButtonValue={selectedTab}
        size="s"
        buttons={[
          {
            id: 'assess-a-student-button',
            label: 'Level Feedback',
            value: 'level',
          },
          {
            id: 'class-data-button',
            label: 'Lesson Feedback',
            value: 'lesson',
          },
        ]}
        onChange={() => {
          setShowLessonFeedback(!showLessonFeedback);
        }}
      />
      {!showLessonFeedback && (
        <LevelFeedbackContainer feedbacksByLevel={feedbacksByLevel} />
      )}
      {showLessonFeedback && (
        <LessonFeedbackContainer feedbacksByLesson={dummyLessonFeedbacks} />
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 20,
  },
};

AllFeedbacks.propTypes = {
  feedbacksByLevel: PropTypes.arrayOf(levelFeedbackShape),
};

export default AllFeedbacks;
