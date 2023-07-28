import React from 'react';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {rubricShape} from './rubricShapes';
import {understandingLevelName} from './utils';

export default function RubricContainer({rubric}) {
  return (
    <div className={style.rubricContainer}>
      <div className={style.rubricHeader}>
        <Heading6>{i18n.rubrics()}</Heading6>
      </div>
      <div className={style.rubricContent}>
        {rubric.learningGoals.map(lg => (
          <div key={lg.key}>
            <p>{lg.learningGoal}</p>
            <ul>
              {lg.evidenceLevels.map(el => (
                <li
                  key={el.understanding}
                >{`Understanding level ${understandingLevelName(
                  el.understanding
                )}: ${el.teacherDescription}`}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
};
