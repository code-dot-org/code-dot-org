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
  const needsFeedbackTriangle = <div className={'needs-feedback corner-box'} />;
  const feedbackGivenTriangle = <div className={'feedback-given corner-box'} />;
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
