import React from 'react';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {rubricShape} from './rubricShapes';
import LearningGoal from './LearningGoal';

export default function RubricContainer({rubric}) {
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>{i18n.rubrics()}</Heading6>
      </div>
      <div className={style.rubricContent}>
        {rubric.learningGoals.map(lg => (
          <LearningGoal
            key={lg.learningGoal.key}
            learningGoal={lg}
            teacherHasEnabledAi
            canProvideFeedback={false}
          />
        ))}
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
};
