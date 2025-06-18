import {BodyFourText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import style from './regionalWorkshopCatalog.module.scss';

const ALL_GRADES = [
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];

const GradeLevelsBarDisplay = ({supportedGradeLevels}) => {
  const getGradeBoxStyles = (grade, prevGrade) => {
    let styles = [style.gradeBox];

    if (supportedGradeLevels.includes(grade)) {
      styles.push(style.supportedGradeBox);
      if (!supportedGradeLevels.includes(prevGrade)) {
        styles.push(style.gradeLevelDivider);
      }
    } else {
      styles.push(style.unsupportedGradeBox);
      if (prevGrade) {
        styles.push(style.gradeLevelDivider);
      }
    }

    return classNames(...styles);
  };

  return (
    <div className={style.gradeBar}>
      {ALL_GRADES.map((grade, index, arr) => (
        <div
          key={`grade-${grade}`}
          className={getGradeBoxStyles(grade, arr[index - 1])}
        >
          <BodyFourText>{grade}</BodyFourText>
        </div>
      ))}
    </div>
  );
};

GradeLevelsBarDisplay.propTypes = {
  supportedGradeLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GradeLevelsBarDisplay;
