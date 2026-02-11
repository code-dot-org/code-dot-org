import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import PropTypes from 'prop-types';
import React from 'react';

import LessonFeedbackContainer from '@cdo/apps/templates/feedback/LessonFeedbackContainer';
import LevelFeedbackContainer from '@cdo/apps/templates/feedback/LevelFeedbackContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {levelFeedbackShape} from './types';

import styles from './LessonFeedback.module.scss';
function AllFeedbacks({feedbacksByLevel}) {
  const [showLessonFeedback, setShowLessonFeedback] = React.useState(false);

  const selectedTab = showLessonFeedback ? 'lesson' : 'level';

  const studentId = useAppSelector(state => state.currentUser.userId);

  return (
    <div>
      <h1 className={styles.pageHeader}>{i18n.feedbackAll()}</h1>
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
        className={styles.segmentedButtons}
      />
      {!showLessonFeedback && (
        <LevelFeedbackContainer feedbacksByLevel={feedbacksByLevel} />
      )}
      {showLessonFeedback && <LessonFeedbackContainer studentId={studentId} />}
    </div>
  );
}

AllFeedbacks.propTypes = {
  feedbacksByLevel: PropTypes.arrayOf(levelFeedbackShape),
};

export default AllFeedbacks;
