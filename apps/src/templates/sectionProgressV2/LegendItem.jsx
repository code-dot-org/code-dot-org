import React from 'react';
import PropTypes from 'prop-types';
import './section-progress-refresh.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';
import {NOT_STARTED, VIEWED, NEEDS_FEEDBACK, FEEDBACK_GIVEN} from './IconKey';

export default function LegendItem({
  labelText,

  // Some of the legend items have a FontAwesome icon.
  // These props describe the FontAwesome icon connected to the labelText
  fontAwesomeId,
  fontAwesomeColor,

  // For legend items that do not have a FontAwesome icon,
  // the stateDescription is used to determine what icon
  // will be displayed with the labelText
  stateDescription,
}) {
  const iconColorStyle = fontAwesomeColor
    ? fontAwesomeColor
    : color.neutral_dark;
  const needsFeedbackTriangle = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="viewed">
        <mask id="path-1-inside-1_2188_5788" fill={color.neutral_white}>
          <path d="M0 0H20V20H0V0Z" />
        </mask>
        <path d="M0 0H20V20H0V0Z" fill={color.neutral_white} />
        <path
          d="M20 0H21V-1H20V0ZM0 1H20V-1H0V1ZM19 0V20H21V0H19Z"
          fill={color.neutral_dark40}
          mask="url(#path-1-inside-1_2188_5788)"
        />
        <path
          id="Polygon 1"
          d="M7.4152 1.99989L18.0029 2.00052L18.0028 12.5858L7.4152 1.99989Z"
          stroke={color.light_secondary_500}
          strokeWidth="2"
        />
      </g>
    </svg>
  );
  const feedbackGivenTriangle = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="viewed">
        <mask id="path-1-inside-1_2188_5792" fill={color.neutral_white}>
          <path d="M0 0H20V20H0V0Z" />
        </mask>
        <path d="M0 0H20V20H0V0Z" fill={color.neutral_white} />
        <path
          d="M20 0H21V-1H20V0ZM0 1H20V-1H0V1ZM19 0V20H21V0H19Z"
          fill={color.neutral_dark40}
          mask="url(#path-1-inside-1_2188_5792)"
        />
        <path
          id="Polygon 1"
          d="M19.0032 0.999893L19.0032 15L5.00014 0.998773L19.0032 0.999893Z"
          fill={color.neutral_dark}
        />
      </g>
    </svg>
  );
  const notStartedBox = (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
    />
  );

  const viewedBox = (
    <ProgressBox
      started={false}
      incomplete={20}
      imperfect={0}
      perfect={0}
      lessonIsAllAssessment={false}
      viewed={true}
    />
  );
  return (
    <div className="legend-item">
      {fontAwesomeId && (
        <FontAwesome
          id={'uitest-' + fontAwesomeId}
          icon={fontAwesomeId}
          style={{color: iconColorStyle}}
          className="font-awesome-icon"
        />
      )}
      {stateDescription === NOT_STARTED && notStartedBox}
      {stateDescription === VIEWED && viewedBox}
      {stateDescription === NEEDS_FEEDBACK && needsFeedbackTriangle}
      {stateDescription === FEEDBACK_GIVEN && feedbackGivenTriangle}
      <BodyThreeText className="label-text">{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  labelText: PropTypes.string,
  fontAwesomeId: PropTypes.string,
  fontAwesomeColor: PropTypes.string,
  stateDescription: PropTypes.string,
};
