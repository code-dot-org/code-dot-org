import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {learningGoalShape} from './rubricShapes';

export default function ProgressRing({
  learningGoals,
  currentLearningGoal,
  radius,
  stroke,
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference -
    ((currentLearningGoal + 1) / learningGoals.length) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        className={style.progressRing}
        stroke="#D4D5D7"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className={style.progressRing}
        stroke="#A9ACAF"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' '}
        style={{strokeDashoffset}}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text className={style.progressRingText} x="50%" y="50%" dy="0.3em">
        {currentLearningGoal + 1} {i18n.of()} {learningGoals.length}
      </text>
    </svg>
  );
}

ProgressRing.propTypes = {
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  currentLearningGoal: PropTypes.number,
  radius: PropTypes.number,
  stroke: PropTypes.number,
};
