import React from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  Heading2,
  Heading5,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import LearningGoal from './LearningGoal';

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  reportingData,
}) {
  const canProvideFeedback = !!studentLevelInfo;
  const {lesson} = rubric;
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>{i18n.rubrics()}</Heading6>
      </div>
      <div className={style.rubricContent}>
        {!!studentLevelInfo && (
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
              <div className={style.studentMetadata}>
                {studentLevelInfo.timeSpent && (
                  <div className={style.singleMetadata}>
                    <FontAwesome icon="clock" />
                    <span>
                      {i18n.timeSpent({timeSpent: studentLevelInfo.timeSpent})}
                    </span>
                  </div>
                )}
                <div className={style.singleMetadata}>
                  <FontAwesome icon="rocket" />
                  <span>
                    {i18n.numAttempts({
                      numAttempts: studentLevelInfo.attempts || 0,
                    })}
                  </span>
                </div>
                {studentLevelInfo.lastAttempt && (
                  <div className={style.singleMetadata}>
                    <FontAwesome icon="calendar" />
                    <span>
                      {i18n.levelLastUpdated({
                        lastUpdatedDate: studentLevelInfo.lastAttempt,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={style.learningGoalContainer}>
          {/* TODO: do not hardcode in AI setting or feedback availability */}
          {rubric.learningGoals.map(lg => (
            <LearningGoal
              key={lg.key}
              learningGoal={lg}
              teacherHasEnabledAi={teacherHasEnabledAi}
              canProvideFeedback={canProvideFeedback}
              reportingData={reportingData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
};
