import React from 'react';
import PropTypes from 'prop-types';
import './section-progress-refresh.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '../FontAwesome';
import ProgressBox from '../sectionProgress/ProgressBox';

export default function LegendItem({
  iconId,
  labelText,
  iconColor,
  progressBoxColor,
  needsFeedback,
  feedbackGiven,
}) {
  const iconColorStyle = iconColor ? iconColor : 'black';
  const needsFeedbackTriangle = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="viewed">
        <mask id="path-1-inside-1_2188_5788" fill="white">
          <path d="M0 0H20V20H0V0Z" />
        </mask>
        <path d="M0 0H20V20H0V0Z" fill="white" />
        <path
          d="M20 0H21V-1H20V0ZM0 1H20V-1H0V1ZM19 0V20H21V0H19Z"
          fill="#A9ACAF"
          mask="url(#path-1-inside-1_2188_5788)"
        />
        <path
          id="Polygon 1"
          d="M7.4152 1.99989L18.0029 2.00052L18.0028 12.5858L7.4152 1.99989Z"
          stroke="#8C52BA"
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
        <mask id="path-1-inside-1_2188_5792" fill="white">
          <path d="M0 0H20V20H0V0Z" />
        </mask>
        <path d="M0 0H20V20H0V0Z" fill="white" />
        <path
          d="M20 0H21V-1H20V0ZM0 1H20V-1H0V1ZM19 0V20H21V0H19Z"
          fill="#A9ACAF"
          mask="url(#path-1-inside-1_2188_5792)"
        />
        <path
          id="Polygon 1"
          d="M19.0032 0.999893L19.0032 15L5.00014 0.998773L19.0032 0.999893Z"
          fill="#292F36"
        />
      </g>
    </svg>
  );
  return (
    <div className="legend-item">
      {iconId && (
        <FontAwesome
          id={'uitest-' + iconId}
          icon={iconId}
          style={{color: iconColorStyle}}
          className="v-icon"
        />
      )}
      {progressBoxColor === 'white' && (
        <ProgressBox
          started={false}
          incomplete={20}
          imperfect={0}
          perfect={0}
          lessonIsAllAssessment={false}
        />
      )}
      {progressBoxColor === 'gray' && (
        <ProgressBox
          started={false}
          incomplete={20}
          imperfect={0}
          perfect={0}
          lessonIsAllAssessment={false}
          viewed={true}
        />
      )}
      {needsFeedback && needsFeedbackTriangle}
      {feedbackGiven && feedbackGivenTriangle}
      <BodyThreeText className="label-text">{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  iconId: PropTypes.string,
  labelText: PropTypes.string,
  iconColor: PropTypes.string,
  progressBoxColor: PropTypes.string,
  image: PropTypes.string,
  needsFeedback: PropTypes.bool,
  feedbackGiven: PropTypes.bool,
};
