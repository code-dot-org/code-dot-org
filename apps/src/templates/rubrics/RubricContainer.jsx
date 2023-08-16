import React from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  Heading2,
  Heading5,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import {rubricShape} from './rubricShapes';
import LearningGoal from './LearningGoal';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
}) {
  const canProvideFeedback = !!studentLevelInfo;
  const {learningGoals, lesson} = rubric;
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>{i18n.rubrics()}</Heading6>
      </div>
      <div className={style.rubricContent}>
        {canProvideFeedback && (
          <div className={style.studentInfo}>
            {/* TODO (AITT-107): use real data and only show if viewing student work  */}
            <Heading2>{studentLevelInfo.name}</Heading2>
            <div>
              <Heading5>
                {i18n.lessonNumbered({
                  lessonNumber: lesson.position,
                  lessonName: lesson.name,
                })}
              </Heading5>
              {/* TODO (AITT-107): use real data and only show if viewing student work  */}
              <div className={style.studentMetadata}>
                {studentLevelInfo.timeSpent && (
                  <div className={style.singleMetadata}>
                    <FontAwesome icon="clock" />
                    <span>time spent 7m 35s</span>
                  </div>
                )}
                {studentLevelInfo.attempts && (
                  <div className={style.singleMetadata}>
                    <FontAwesome icon="rocket" />
                    <span>2 attempts</span>
                  </div>
                )}
                {studentLevelInfo.lastAttempt && (
                  <div className={style.singleMetadata}>
                    <FontAwesome icon="calendar" />
                    <span>last updated 5/26/23</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={style.learningGoalContainer}>
          {learningGoals.map(lg => (
            <LearningGoal
              key={lg.key}
              learningGoal={lg}
              teacherHasEnabledAi={teacherHasEnabledAi}
              canProvideFeedback={canProvideFeedback}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  teacherHasEnabledAi: PropTypes.bool,
  studentLevelInfo: PropTypes.object,
};
