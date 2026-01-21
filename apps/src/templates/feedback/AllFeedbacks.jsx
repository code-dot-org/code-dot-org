import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';

import LevelFeedbackContainer from '@cdo/apps/templates/feedback/LevelFeedbackContainer';
import i18n from '@cdo/locale';

import {levelFeedbackShape} from './types';
function AllFeedbacks({feedbacksByLevel}) {
  const [showLessonFeedback, setShowLessonFeedback] = React.useState(false);

  const selectedTab = showLessonFeedback ? 'lesson' : 'level';

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
      {showLessonFeedback && <div>{'Here is your lesson feedback'}</div>}
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
