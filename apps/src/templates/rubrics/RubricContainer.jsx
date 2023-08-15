import React from 'react';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  Heading2,
  Heading5,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import {rubricShape} from './rubricShapes';
import LearningGoal from './LearningGoal';
import FontAwesome from '../FontAwesome';

export default function RubricContainer({rubric}) {
  const {learningGoals, lesson} = rubric;
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>{i18n.rubrics()}</Heading6>
      </div>
      <div className={style.rubricContent}>
        <div className={style.studentInfo}>
          {/* TODO (AITT-107): use real data and only show if viewing student work  */}
          <Heading2>Harry Potter</Heading2>
          <div>
            <Heading5>
              {i18n.lessonNumbered({
                lessonNumber: lesson.position,
                lessonName: lesson.name,
              })}
            </Heading5>
            {/* TODO (AITT-107): use real data and only show if viewing student work  */}
            <div className={style.studentMetadata}>
              <div className={style.singleMetadata}>
                <FontAwesome icon="clock" />
                <span>time spent 7m 35s</span>
              </div>
              <div className={style.singleMetadata}>
                <FontAwesome icon="rocket" />
                <span>2 attempts</span>
              </div>
              <div className={style.singleMetadata}>
                <FontAwesome icon="calendar" />
                <span>last updated 5/26/23</span>
              </div>
            </div>
          </div>
        </div>
        <div className={style.learningGoalContainer}>
          {/* TODO: fetch teacher preferences and determine if feedback is available */}
          {learningGoals.map(lg => (
            <LearningGoal
              key={lg.key}
              learningGoal={lg}
              teacherHasEnabledAi
              canProvideFeedback={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
};
