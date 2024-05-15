import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {learningGoalShape} from './rubricShapes';

import style from './rubrics.module.scss';

export default function ProgressRing({
  className,
  learningGoals,
  currentLearningGoal,
  understandingLevels,
  radius,
  stroke,
  loaded,
}) {
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const assessedLearningGoals = understandingLevels.filter(u => u >= 0).length;
  const currentLearningGoalOffset =
    currentLearningGoal === learningGoals.length
      ? 0
      : circumference -
        ((currentLearningGoal + 1) / learningGoals.length) * circumference;
  const assessedLearningGoalOffset =
    circumference -
    (assessedLearningGoals / learningGoals.length) * circumference;

  return (
    <svg
      className={classnames(className)}
      height={radius * 2}
      width={radius * 2}
    >
      <circle
        className={style.progressRing}
        stroke={color.light_gray_200}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={style.progressRing}
        stroke={color.neutral_dark40}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' '}
        style={{strokeDashoffset: currentLearningGoalOffset}}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={style.progressRing}
        stroke={color.light_primary_500}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' '}
        style={{strokeDashoffset: assessedLearningGoalOffset}}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text className={style.progressRingText} x="50%" y="50%" dy="0.3em">
        {currentLearningGoal === learningGoals.length
          ? currentLearningGoal
          : currentLearningGoal + 1}{' '}
        {i18n.of()} {learningGoals.length}
      </text>
    </svg>
  );
}

ProgressRing.propTypes = {
  className: PropTypes.string,
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  currentLearningGoal: PropTypes.number,
  understandingLevels: PropTypes.arrayOf(PropTypes.number),
  radius: PropTypes.number,
  stroke: PropTypes.number,
  loaded: PropTypes.bool,
};
