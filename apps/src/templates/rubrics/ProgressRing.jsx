import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import style from './rubrics.module.scss';
import {learningGoalShape} from './rubricShapes';
import color from '@cdo/apps/util/color';

export default function ProgressRing({
  learningGoals,
  currentLearningGoal,
  understandingLevels,
  radius,
  stroke,
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const assessedLearningGoals = understandingLevels.filter(u => u >= 0).length;
  const currentLearningGoalOffset =
    circumference -
    ((currentLearningGoal + 1) / learningGoals.length) * circumference;
  const assessedLearningGoalOffset =
    circumference -
    (assessedLearningGoals / learningGoals.length) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
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
        {currentLearningGoal + 1} {i18n.of()} {learningGoals.length}
      </text>
    </svg>
  );
}

ProgressRing.propTypes = {
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  currentLearningGoal: PropTypes.number,
  understandingLevels: PropTypes.arrayOf(PropTypes.number),
  radius: PropTypes.number,
  stroke: PropTypes.number,
};
